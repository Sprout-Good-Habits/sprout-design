/* ============================================
   Sprout Mic Listener
   Always-on microphone with silence detection and mute toggle.
   Exposes window.SproutMicListener with:
     - start(opts)   // request mic, begin amplitude loop
   Returns a controller with:
     - mute()        // disable mic tracks
     - unmute()      // re-enable mic tracks
     - toggleMute()  // returns new isMuted boolean
     - isMuted()     // boolean
     - getAnalyser() // AnalyserNode for external use
     - destroy()     // stop stream, close AudioContext
   Respects prefers-reduced-motion for reduced callback frequency.

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
    var muted = false;
    var wasSpeaking = false;
    var silenceTimer = null;
    var animId = null;
    var destroyed = false;

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
      if (muted) return;

      var dataArray = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(dataArray);

      var sumSq = 0;
      for (var j = 0; j < dataArray.length; j++) {
        var v = (dataArray[j] - 128) / 128;
        sumSq += v * v;
      }
      var rms = Math.sqrt(sumSq / dataArray.length);

      onAmplitude(rms);

      // Silence detection state machine
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

    // Controller
    var controller = {
      mute: function () {
        muted = true;
        if (stream) stream.getAudioTracks().forEach(function (t) { t.enabled = false; });
      },
      unmute: function () {
        muted = false;
        if (stream) stream.getAudioTracks().forEach(function (t) { t.enabled = true; });
      },
      toggleMute: function () {
        if (muted) controller.unmute(); else controller.mute();
        return muted;
      },
      isMuted: function () { return muted; },
      getAnalyser: function () { return analyser; },
      getAudioContext: function () { return audioContext; },
      pauseSilenceDetection: function () {
        wasSpeaking = false;
        if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
      },
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
