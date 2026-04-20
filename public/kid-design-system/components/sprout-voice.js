/* ============================================
   Sprout Voice Controller
   Orchestrates Sprout's Rive expression states
   (listening, thinking, talking) with optional
   ElevenLabs TTS and chime sound.

   Exposes window.SproutVoice with:
     - init(opts)  // configure and return controller
   Returns a controller with:
     - listen()         // Sprout enters listening state
     - stopListening()  // exit listening
     - think()          // fire thinking trigger + play chime
     - speak(text)      // Sprout speaks (TTS or fake-talk)
     - stop()           // force-stop everything
     - setApiKey(key)   // update ElevenLabs key at runtime
     - setRiveInstance(r)// update Rive instance
     - destroy()        // cleanup

   Usage:
     <script src="/kid-design-system/components/sprout-voice.js"></script>
     <script>
       var voice = SproutVoice.init({
         riveInstance: window._riveInstance,
         waveform: waveformInstance,
         chimeSrc: '/product-explorer/assets/sprout-chime.wav',
         elevenLabs: { apiKey: '', voiceId: 'XfNU2rGpBa01ckF309OY' },
         onSpeechStart: function(text) {},
         onSpeechEnd: function() {}
       });
     </script>
   ============================================ */
(function () {
  'use strict';

  function init(opts) {
    opts = opts || {};
    var riveInstance = opts.riveInstance || null;
    var stateMachine = opts.stateMachine || 'State Machine 1';
    var waveform = opts.waveform || null;
    var onSpeechStart = opts.onSpeechStart || function () {};
    var onSpeechEnd = opts.onSpeechEnd || function () {};

    // ElevenLabs config
    var elConfig = opts.elevenLabs || {};
    var apiKey = elConfig.apiKey || '';
    var voiceId = elConfig.voiceId || 'XfNU2rGpBa01ckF309OY';
    var modelId = elConfig.modelId || 'eleven_turbo_v2';
    var voiceSettings = elConfig.voiceSettings || {
      stability: 0.6, similarity_boost: 0.75, style: 0.3
    };

    // Chime
    var chimeSrc = opts.chimeSrc || '';
    var chimeVolume = opts.chimeVolume || 0.6;
    var chimeAudio = null;
    if (chimeSrc) {
      chimeAudio = document.createElement('audio');
      chimeAudio.src = chimeSrc;
      chimeAudio.volume = chimeVolume;
      chimeAudio.setAttribute('playsinline', '');
      document.body.appendChild(chimeAudio);
    }

    // TTS audio element (pre-created for Safari)
    var ttsAudio = document.createElement('audio');
    ttsAudio.setAttribute('playsinline', '');
    document.body.appendChild(ttsAudio);

    // Unlock audio on first user gesture (Safari)
    document.addEventListener('click', function unlock() {
      ttsAudio.play().then(function () { ttsAudio.pause(); }).catch(function () {});
      if (chimeAudio) {
        chimeAudio.play().then(function () { chimeAudio.pause(); chimeAudio.currentTime = 0; }).catch(function () {});
      }
      document.removeEventListener('click', unlock);
    });

    // State
    var isTalking = false;
    var mouthInterval = null;
    var lookInterval = null;
    var safetyTimer = null;
    var fakeTalkTimer = null;

    // ── Rive helpers ──
    function getInputs() {
      var ri = riveInstance;
      if (typeof ri === 'function') ri = ri();
      if (!ri) return null;
      try {
        var inputs = ri.stateMachineInputs(stateMachine);
        if (!inputs) return null;
        var map = {};
        inputs.forEach(function (inp) { map[inp.name] = inp; });
        return map;
      } catch (e) { return null; }
    }

    function fireTrigger(name) {
      var map = getInputs();
      if (map && map[name] && map[name].fire) map[name].fire();
    }

    function setRiveTalk(talking) {
      var map = getInputs();
      if (!map) return;

      if (talking) {
        if (map['looking']) map['looking'].value = 3;
        if (lookInterval) { clearInterval(lookInterval); lookInterval = null; }
        if (map['smile'] && map['smile'].fire) map['smile'].fire();
        if (map['talkinganimation']) map['talkinganimation'].value = true;
        if (map['talkingmouth toggle']) map['talkingmouth toggle'].value = true;
        mouthInterval = setInterval(function () {
          if (map['mouthselector']) {
            map['mouthselector'].value = 1 + Math.floor(Math.random() * 8);
          }
        }, 120);
      } else {
        if (map['talkinganimation']) map['talkinganimation'].value = false;
        if (map['talkingmouth toggle']) map['talkingmouth toggle'].value = false;
        if (map['mouthselector']) map['mouthselector'].value = 0;
        if (mouthInterval) { clearInterval(mouthInterval); mouthInterval = null; }
      }
    }

    // ── Public methods ──
    function listen() {
      var map = getInputs();
      if (!map) return;
      fireTrigger('smile');
      if (map['looking']) map['looking'].value = 1;
      lookInterval = setInterval(function () {
        if (map['looking']) {
          map['looking'].value = Math.floor(Math.random() * 3);
        }
      }, 1500);
    }

    function stopListening() {
      if (lookInterval) { clearInterval(lookInterval); lookInterval = null; }
      var map = getInputs();
      if (map && map['looking']) map['looking'].value = 3;
    }

    function think() {
      fireTrigger('thinking');
      playChime();
    }

    function playChime() {
      if (!chimeAudio) return;
      chimeAudio.currentTime = 0;
      chimeAudio.play().catch(function () {});
    }

    function speak(text) {
      isTalking = true;

      // Safety timeout
      safetyTimer = setTimeout(function () {
        if (isTalking) stop();
      }, 15000);

      if (apiKey) {
        speakTTS(text);
      } else {
        speakFake(text);
      }
    }

    function speakTTS(text) {
      fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: voiceSettings
        })
      })
      .then(function (res) {
        if (!res.ok) throw new Error('ElevenLabs error: ' + res.status);
        return res.blob();
      })
      .then(function (blob) {
        var url = URL.createObjectURL(blob);
        ttsAudio.src = url;

        ttsAudio.onplaying = function () {
          onSpeechStart(text);
          setRiveTalk(true);
          if (waveform) waveform.startSimulation();
        };

        ttsAudio.onended = function () {
          finishSpeaking();
        };

        ttsAudio.onerror = function () {
          finishSpeaking();
        };

        ttsAudio.play().catch(function () {
          // Fallback to fake talk if play blocked
          speakFake(text);
        });
      })
      .catch(function (err) {
        console.error('TTS error:', err);
        // Fallback to fake talk
        speakFake(text);
      });
    }

    function speakFake(text) {
      fakeTalkTimer = setTimeout(function () {
        onSpeechStart(text);
        setRiveTalk(true);
        if (waveform) waveform.startSimulation();

        fakeTalkTimer = setTimeout(function () {
          finishSpeaking();
        }, 3000);
      }, 2000);
    }

    function finishSpeaking() {
      isTalking = false;
      setRiveTalk(false);
      if (waveform) waveform.stopSimulation();
      if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
      onSpeechEnd();
    }

    function stop() {
      isTalking = false;
      setRiveTalk(false);
      stopListening();
      if (waveform) waveform.stopSimulation();
      if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
      if (fakeTalkTimer) { clearTimeout(fakeTalkTimer); fakeTalkTimer = null; }
      ttsAudio.pause();
      ttsAudio.currentTime = 0;
    }

    function destroy() {
      stop();
      if (chimeAudio && chimeAudio.parentNode) chimeAudio.parentNode.removeChild(chimeAudio);
      if (ttsAudio && ttsAudio.parentNode) ttsAudio.parentNode.removeChild(ttsAudio);
    }

    return {
      listen: listen,
      stopListening: stopListening,
      think: think,
      speak: speak,
      stop: stop,
      isTalking: function () { return isTalking; },
      setApiKey: function (key) { apiKey = key; },
      setRiveInstance: function (r) { riveInstance = r; },
      destroy: destroy
    };
  }

  window.SproutVoice = { init: init };
})();
