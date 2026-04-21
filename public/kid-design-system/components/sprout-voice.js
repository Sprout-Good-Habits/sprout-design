/* ============================================
   Sprout Voice Controller
   Orchestrates Sprout's Rive expression states
   (greeting, listening, thinking, talking) with optional
   ElevenLabs TTS, chime, and filler audio.

   Exposes window.SproutVoice with:
     - init(opts)  // configure and return controller
   Returns a controller with:
     - greet()          // characterwave + greeting speech
     - listen()         // Sprout enters listening state
     - stopListening()  // exit listening
     - think()          // thinking trigger + chime
     - speak(text)      // Sprout speaks (TTS or fake-talk)
     - interrupt()      // kid interrupts Sprout mid-speech (barge-in)
     - stop()           // force-stop everything
     - isTalking()      // boolean
     - setApiKey(key)   // update ElevenLabs key at runtime
     - setRiveInstance(r)
     - destroy()

   Usage:
     <script src="/kid-design-system/components/sprout-voice.js"></script>
     <script>
       var voice = SproutVoice.init({
         riveInstance: r,
         waveform: waveformInstance,
         mic: micInstance,
         chimeSrc: '/product-explorer/assets/sprout-chime.wav',
         fillerSrc: '/product-explorer/assets/sprout-filler-hmm.wav',
         onSpeechStart: function(text) {},
         onSpeechEnd: function() {},
         onStateChange: function(state) {}
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
    var mic = opts.mic || null;
    var onSpeechStart = opts.onSpeechStart || function () {};
    var onSpeechEnd = opts.onSpeechEnd || function () {};
    var onStateChange = opts.onStateChange || function () {};

    // ElevenLabs config
    var elConfig = opts.elevenLabs || {};
    var apiKey = elConfig.apiKey || '';
    var voiceId = elConfig.voiceId || 'XfNU2rGpBa01ckF309OY';
    var modelId = elConfig.modelId || 'eleven_turbo_v2';
    var voiceSettings = elConfig.voiceSettings || {
      stability: 0.6, similarity_boost: 0.75, style: 0.3
    };

    // Post-speech buffer (echo prevention)
    var POST_SPEECH_BUFFER = opts.postSpeechBuffer || 1500;

    // Barge-in: kid can interrupt Sprout mid-speech
    var bargeIn = opts.bargeIn || false;
    var onInterrupt = opts.onInterrupt || function () {};

    // ── Audio elements ──
    // Chime
    var chimeSrc = opts.chimeSrc || '';
    var chimeAudio = null;
    if (chimeSrc) {
      chimeAudio = document.createElement('audio');
      chimeAudio.src = chimeSrc;
      chimeAudio.volume = opts.chimeVolume || 0.6;
      chimeAudio.setAttribute('playsinline', '');
      document.body.appendChild(chimeAudio);
    }

    // Filler audio ("Hmm, let me think...")
    var fillerSrc = opts.fillerSrc || '';
    var fillerAudio = null;
    if (fillerSrc) {
      fillerAudio = document.createElement('audio');
      fillerAudio.src = fillerSrc;
      fillerAudio.volume = 0.7;
      fillerAudio.setAttribute('playsinline', '');
      document.body.appendChild(fillerAudio);
    }

    // TTS audio (pre-created for Safari)
    var ttsAudio = document.createElement('audio');
    ttsAudio.setAttribute('playsinline', '');
    document.body.appendChild(ttsAudio);

    // Unlock all audio on first user gesture (Safari)
    document.addEventListener('click', function unlock() {
      [ttsAudio, chimeAudio, fillerAudio].forEach(function (a) {
        if (a) a.play().then(function () { a.pause(); a.currentTime = 0; }).catch(function () {});
      });
      document.removeEventListener('click', unlock);
    });

    // ── State ──
    var currentState = 'idle'; // idle, greeting, listening, thinking, talking
    var isTalkingFlag = false;
    var mouthInterval = null;
    var thinkInterval = null;
    var microReactionInterval = null;
    var safetyTimer = null;
    var fakeTalkTimer = null;
    var postSpeechTimer = null;

    function setState(s) {
      currentState = s;
      onStateChange(s);
    }

    // ── Rive helpers ──
    function getInputs() {
      var ri = riveInstance;
      if (typeof ri === 'function') ri = ri();
      if (!ri) return null;
      try {
        var inputs = ri.stateMachineInputs(stateMachine);
        if (!inputs) return null;
        var map = {};
        inputs.forEach(function (inp) { map[inp.name.trim()] = inp; });
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
        fireTrigger('smile'); // exit thinking pose
        if (map['talkinganimation']) map['talkinganimation'].value = true;
        if (map['talkingmouth toggle']) map['talkingmouth toggle'].value = true;
        mouthInterval = setInterval(function () {
          var m = getInputs();
          if (m && m['mouthselector']) {
            m['mouthselector'].value = 1 + Math.floor(Math.random() * 8);
          }
        }, 120);
      } else {
        if (map['talkinganimation']) map['talkinganimation'].value = false;
        if (map['talkingmouth toggle']) map['talkingmouth toggle'].value = false;
        if (map['mouthselector']) map['mouthselector'].value = 0;
        if (mouthInterval) { clearInterval(mouthInterval); mouthInterval = null; }
      }
    }

    // ── Micro-reactions while listening ──
    // Vocal micro-reaction phrases (short acknowledgments)
    var microPhrases = ['Mhm!', 'Aha!', 'Mm-hmm', 'Yeah!', 'Ooh!', 'Right!'];
    var microPhraseIdx = 0;
    var microVocalInterval = null;
    var microVocalTimeout = null;

    function startMicroReactions() {
      stopMicroReactions();
      // Gentle smile every ~8s (natural attentive reaction)
      microReactionInterval = setInterval(function () {
        if (currentState === 'listening') {
          fireTrigger('smile');
        }
      }, 8000);
      // Vocal "mhm" every ~15s: brief mouth movement + speech bubble
      microVocalInterval = setInterval(function () {
        if (currentState !== 'listening') return;
        var phrase = microPhrases[microPhraseIdx++ % microPhrases.length];
        onSpeechStart(phrase);
        // Quick mouth movement (~0.5s)
        setRiveTalk(true);
        microVocalTimeout = setTimeout(function () {
          setRiveTalk(false);
          // Hide bubble after a beat
          setTimeout(function () { onSpeechEnd(); }, 300);
        }, 500);
      }, 15000);
    }

    function stopMicroReactions() {
      if (microReactionInterval) { clearInterval(microReactionInterval); microReactionInterval = null; }
      if (microVocalInterval) { clearInterval(microVocalInterval); microVocalInterval = null; }
      if (microVocalTimeout) { clearTimeout(microVocalTimeout); microVocalTimeout = null; }
    }

    // ── Public methods ──

    // Greeting: wave + then speak
    function greet(text) {
      setState('greeting');
      fireTrigger('characterwave');
      // Wait for wave animation to play (~1.5s), then speak
      setTimeout(function () {
        speak(text || "Hi there! What should we do today?");
      }, 1500);
    }

    // Kid is speaking: Sprout listens
    function listen() {
      if (currentState === 'listening') return;
      setState('listening');
      fireTrigger('smile');
      startMicroReactions();
    }

    function stopListening() {
      stopMicroReactions();
    }

    // ── Progressive thinking fillers ──
    // Escalating phrases based on how long Sprout has been thinking.
    // Each tier fires once. No stacking.

    // Tier 1: Immediate acknowledgment (0-500ms) -- always fires
    var ackPhrases = ['Mm...', 'Okay...', "Let's see...", 'Hmm...', 'Alright...'];
    // Tier 2: Light thinking (3-6s)
    var lightPhrases = ['Hmm, let me think...', 'Interesting...', 'Let me think about that...', 'Good question...'];
    // Tier 3: Deep thinking (6-12s)
    var deepPhrases = ["That's a good question...", "If I understand correctly...", 'Let me figure this out...', 'Hmm, okay...'];
    // Tier 4: Long thinking (12-20s)
    var longPhrases = ["I'm thinking through the best way to explain this...", "There are a couple of ways to approach this...", 'Give me a second...', "Bear with me..."];
    // Tier 5: Very long thinking (20s+)
    var veryLongPhrases = ["I'm narrowing it down...", "I think the clearest way is to break this into parts...", "Almost there..."];
    // Tier 6: Very very long (30s+, rare, max once per session)
    var ultraLongPhrases = ["Okay, this is me thinking very hard right now...", "I promise I'm not buffering, just thinking!", "This one's making me work for it..."];
    var ultraLongUsed = false;

    var phraseCounters = { ack: 0, light: 0, deep: 0, long: 0, veryLong: 0 };
    function pickPhrase(arr, key) {
      var p = arr[phraseCounters[key] % arr.length];
      phraseCounters[key]++;
      return p;
    }

    var thinkTimers = [];

    function sayFiller(text, duration) {
      onSpeechStart(text);
      setRiveTalk(true);
      var t = setTimeout(function () {
        setRiveTalk(false);
        var map = getInputs();
        if (map && map['mouthselector']) map['mouthselector'].value = 0;
        // Go back to thinking pose
        fireTrigger('thinking');
      }, duration || 1200);
      thinkTimers.push(t);
    }

    // Processing: progressive fillers based on elapsed time
    function think() {
      stopThinking();
      stopMicroReactions();

      // Half-duplex: disable mic unless barge-in is enabled
      if (mic && !bargeIn) mic.disable();
      setState('thinking');

      // Play chime
      if (chimeAudio) {
        chimeAudio.currentTime = 0;
        chimeAudio.play().catch(function () {});
      }

      // Tier 1: Thinking pose first (immediate)
      fireTrigger('thinking');
      thinkInterval = setInterval(function () {
        if (currentState === 'thinking') fireTrigger('thinking');
      }, 1500);

      // Tier 2: Immediate acknowledgment (1.2s)
      var t1 = setTimeout(function () {
        if (currentState !== 'thinking') return;
        sayFiller(pickPhrase(ackPhrases, 'ack'), 800);
      }, 1200);
      thinkTimers.push(t1);

      // Tier 3: Light thinking (4s)
      var t2 = setTimeout(function () {
        if (currentState !== 'thinking') return;
        sayFiller(pickPhrase(lightPhrases, 'light'), 1500);
      }, 4000);
      thinkTimers.push(t2);

      // Tier 4: Deep thinking (8s)
      var t3 = setTimeout(function () {
        if (currentState !== 'thinking') return;
        sayFiller(pickPhrase(deepPhrases, 'deep'), 1800);
      }, 8000);
      thinkTimers.push(t3);

      // Tier 5: Long thinking (12s)
      var t4 = setTimeout(function () {
        if (currentState !== 'thinking') return;
        sayFiller(pickPhrase(longPhrases, 'long'), 2000);
      }, 12000);
      thinkTimers.push(t4);

      // Tier 6: Very long thinking (24s)
      var t5 = setTimeout(function () {
        if (currentState !== 'thinking') return;
        sayFiller(pickPhrase(veryLongPhrases, 'veryLong'), 2000);
      }, 24000);
      thinkTimers.push(t5);

      // Tier 7: Ultra long (32s, max once per session)
      var t6 = setTimeout(function () {
        if (currentState !== 'thinking' || ultraLongUsed) return;
        ultraLongUsed = true;
        sayFiller(ultraLongPhrases[Math.floor(Math.random() * ultraLongPhrases.length)], 2500);
      }, 32000);
      thinkTimers.push(t6);
    }

    function stopThinking() {
      if (thinkInterval) { clearInterval(thinkInterval); thinkInterval = null; }
      for (var i = 0; i < thinkTimers.length; i++) clearTimeout(thinkTimers[i]);
      thinkTimers = [];
    }

    // Sprout speaks
    function speak(text) {
      stopThinking();
      isTalkingFlag = true;

      // Half-duplex: disable mic unless barge-in is enabled
      if (mic && !bargeIn) mic.disable();
      setState('talking');

      // Safety timeout
      safetyTimer = setTimeout(function () {
        if (isTalkingFlag) stop();
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
        ttsAudio.onended = function () { finishSpeaking(); };
        ttsAudio.onerror = function () { finishSpeaking(); };
        ttsAudio.play().catch(function () { speakFake(text); });
      })
      .catch(function (err) {
        console.error('TTS error:', err);
        speakFake(text);
      });
    }

    function speakFake(text) {
      onSpeechStart(text);
      setRiveTalk(true);
      if (waveform) waveform.startSimulation();
      fakeTalkTimer = setTimeout(function () {
        finishSpeaking();
      }, 3000);
    }

    function finishSpeaking() {
      isTalkingFlag = false;
      setRiveTalk(false);
      if (waveform) waveform.stopSimulation();
      if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
      setState('idle');
      onSpeechEnd();

      // Post-speech buffer: wait before re-enabling mic (echo prevention)
      if (mic) {
        postSpeechTimer = setTimeout(function () {
          mic.enable();
          postSpeechTimer = null;
        }, POST_SPEECH_BUFFER);
      }
    }

    // Barge-in: kid interrupts Sprout mid-speech
    function interrupt() {
      if (!isTalkingFlag && currentState !== 'thinking') return;

      // Stop everything Sprout is doing
      stopThinking();
      isTalkingFlag = false;
      setRiveTalk(false);
      if (waveform) waveform.stopSimulation();
      if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
      if (fakeTalkTimer) { clearTimeout(fakeTalkTimer); fakeTalkTimer = null; }
      if (postSpeechTimer) { clearTimeout(postSpeechTimer); postSpeechTimer = null; }
      ttsAudio.pause();
      ttsAudio.currentTime = 0;

      // Warm yield: smile and transition to listening
      fireTrigger('smile');
      setState('listening');
      startMicroReactions();

      onInterrupt();
    }

    function stop() {
      isTalkingFlag = false;
      setRiveTalk(false);
      stopThinking();
      stopMicroReactions();
      if (waveform) waveform.stopSimulation();
      if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
      if (fakeTalkTimer) { clearTimeout(fakeTalkTimer); fakeTalkTimer = null; }
      if (postSpeechTimer) { clearTimeout(postSpeechTimer); postSpeechTimer = null; }
      ttsAudio.pause();
      ttsAudio.currentTime = 0;
      if (mic) mic.enable();
      setState('idle');
    }

    function destroy() {
      stop();
      [chimeAudio, fillerAudio, ttsAudio].forEach(function (a) {
        if (a && a.parentNode) a.parentNode.removeChild(a);
      });
    }

    return {
      greet: greet,
      listen: listen,
      stopListening: stopListening,
      think: think,
      speak: speak,
      interrupt: interrupt,
      stop: stop,
      isBargeInEnabled: function () { return bargeIn; },
      isTalking: function () { return isTalkingFlag; },
      getState: function () { return currentState; },
      setApiKey: function (key) { apiKey = key; },
      setMic: function (m) { mic = m; },
      setRiveInstance: function (r) { riveInstance = r; },
      destroy: destroy
    };
  }

  window.SproutVoice = { init: init };
})();
