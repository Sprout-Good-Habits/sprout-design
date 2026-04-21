/* ============================================
   Sprout Mic Listener
   Always-on microphone with silence detection, mute toggle,
   and half-duplex disable/enable for echo prevention.
   Exposes window.SproutMicListener with:
     - start(opts)   // request mic, begin amplitude loop
   Returns a controller with:
     - mute()        // user mute (disables tracks, stops amplitude)
     - unmute()      // user unmute
     - toggleMute()  // returns new isMuted boolean
     - isMuted()     // boolean
     - disable()     // half-duplex: disable mic tracks (Sprout speaking)
     - enable()      // half-duplex: re-enable mic tracks
     - isDisabled()  // boolean
     - pauseSilenceDetection()
     - resumeSilenceDetection()
     - getAnalyser() // AnalyserNode for external use
     - destroy()     // stop stream, close AudioContext

   Usage:
     <script src="/kid-design-system/components/mic-listener.js"></script>
     <script>
       var mic = SproutMicListener.start({
         silenceThreshold: 0.01,
         speechThreshold: 0.03,
         silenceDelay: 2000,
         onSpeechStart: function() {},
         onSilence: function() {},
         onAmplitude: function(rms) {},
         onError: function(err) {}
       });
     </script>
   ============================================ */
(function () {
  'use strict';

  function start(opts) {
    opts = opts || {};
    var silenceThreshold = opts.silenceThreshold || 0.01;
    var speechThreshold = opts.speechThreshold || 0.03;
    var silenceDelay = opts.silenceDelay || 2000;
    var onSpeechStart = opts.onSpeechStart || function () {};
    var onSilence = opts.onSilence || function () {};
    var onAmplitude = opts.onAmplitude || function () {};
    var onError = opts.onError || function () {};

    var audioContext = null;
    var analyser = null;
    var stream = null;
    var muted = false;       // user-initiated mute
    var disabled = false;    // half-duplex disable (Sprout speaking)
    var wasSpeaking = false;
    var silenceTimer = null;
    var animId = null;
    var destroyed = false;
    var paused = false;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function (s) {
        if (destroyed) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
        stream = s;
        var source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        loop();
      })
      .catch(function (err) {
        onError(err);
      });

    function loop() {
      if (destroyed) return;
      animId = requestAnimationFrame(loop);
      if (!analyser) return;
      if (muted || disabled) return;

      var dataArray = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(dataArray);

      var sumSq = 0;
      for (var j = 0; j < dataArray.length; j++) {
        var v = (dataArray[j] - 128) / 128;
        sumSq += v * v;
      }
      var rms = Math.sqrt(sumSq / dataArray.length);

      onAmplitude(rms);

      // Silence detection state machine (skip when paused)
      if (paused) return;
      if (rms > speechThreshold) {
        if (!wasSpeaking) {
          wasSpeaking = true;
          onSpeechStart();
        }
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          silenceTimer = null;
        }
      } else if (rms < silenceThreshold && wasSpeaking && !silenceTimer) {
        silenceTimer = setTimeout(function () {
          wasSpeaking = false;
          silenceTimer = null;
          onSilence();
        }, silenceDelay);
      }
    }

    function setTrackEnabled(val) {
      if (stream) stream.getAudioTracks().forEach(function (t) { t.enabled = val; });
    }

    var controller = {
      // User mute/unmute
      mute: function () {
        muted = true;
        setTrackEnabled(false);
      },
      unmute: function () {
        muted = false;
        if (!disabled) setTrackEnabled(true);
      },
      toggleMute: function () {
        if (muted) controller.unmute(); else controller.mute();
        return muted;
      },
      isMuted: function () { return muted; },

      // Half-duplex: disable mic while Sprout speaks (echo prevention)
      disable: function () {
        disabled = true;
        setTrackEnabled(false);
      },
      enable: function () {
        disabled = false;
        if (!muted) setTrackEnabled(true);
      },
      isDisabled: function () { return disabled; },

      // Silence detection control
      pauseSilenceDetection: function () {
        paused = true;
        wasSpeaking = false;
        if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
      },
      resumeSilenceDetection: function () {
        paused = false;
      },

      getAnalyser: function () { return analyser; },
      getAudioContext: function () { return audioContext; },
      destroy: function () {
        destroyed = true;
        if (animId) cancelAnimationFrame(animId);
        if (silenceTimer) clearTimeout(silenceTimer);
        if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
        if (audioContext && audioContext.state !== 'closed') {
          audioContext.close().catch(function () {});
        }
        analyser = null;
        stream = null;
      }
    };

    return controller;
  }

  window.SproutMicListener = { start: start };
})();
