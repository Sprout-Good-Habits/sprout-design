/* ═══════════════════════════════════════════════════
   Sprout Design System / Chat Composer
   Reusable composer interactivity. Handles:
   - typing in .composer-input (contenteditable)
   - btn-mic ↔ btn-send toggle based on input content
   - plus-pill inline expand/collapse (+ rotates to X)
   - attach-panel open/close
   - voice recording state machine (idle → recording → transcribing → text inserted)

   Pair with /kid-design-system/components/chat-composer.css.
   The DOM structure expected matches parent-chat-3.html.

   Usage:
     <script src="/kid-design-system/components/chat-composer.js"></script>
     <script>
       initChatComposer({
         input: 'composerInput',
         btnMic: 'btnMic',
         btnPlus: 'btnPlus',
         plusPill: 'plusPill',
         attachPanel: 'attachPanel',          // optional
         iosKeyboard: 'iosKeyboard',          // optional
         voiceRecordingToolbar: 'voiceRecordingToolbar',     // optional
         voiceTranscribingRow: 'voiceTranscribingRow',       // optional
         voiceTranscribingToolbar: 'voiceTranscribingToolbar', // optional
         voiceWaveform: 'voiceWaveform',      // optional
         voiceBtnStop: 'voiceBtnStop',        // optional
         voiceBtnDone: 'voiceBtnDone',        // optional
         voiceBtnStopTranscribing: 'voiceBtnStopTranscribing', // optional
         inlineCloseBtn: 'inlineCloseBtn',    // optional
         attachMode: 'inline',                // 'inline' or 'panel'
         dictationPhrases: ['How is...', 'What about...'],  // optional
         onSend: function(text) { ... }       // called on Enter or send-button click
       });
     </script>
   ═══════════════════════════════════════════════════ */

(function () {
  function $(id) { return id ? document.getElementById(id) : null; }

  window.initChatComposer = function (opts) {
    opts = opts || {};
    var input = $(opts.input);
    var btnMic = $(opts.btnMic);
    var btnPlus = $(opts.btnPlus);
    var plusPill = $(opts.plusPill);
    if (!input || !btnMic) {
      console.warn('[chat-composer] missing required input or btnMic');
      return;
    }

    var attachPanel = $(opts.attachPanel);
    var iosKeyboard = $(opts.iosKeyboard);
    var inlineCloseBtn = $(opts.inlineCloseBtn);

    var voiceRecordingToolbar = $(opts.voiceRecordingToolbar);
    var voiceTranscribingRow = $(opts.voiceTranscribingRow);
    var voiceTranscribingToolbar = $(opts.voiceTranscribingToolbar);
    var voiceWaveform = $(opts.voiceWaveform);
    var voiceBtnStop = $(opts.voiceBtnStop);
    var voiceBtnDone = $(opts.voiceBtnDone);
    var voiceBtnStopTranscribing = $(opts.voiceBtnStopTranscribing);

    var composerPill = input.closest('.composer-pill');
    var attachMode = opts.attachMode || (attachPanel ? 'panel' : 'inline');
    var listening = false;
    var voiceWaveInterval = null;
    var dictationTimer = null;
    var dictationIdx = 0;
    var dictationPhrases = opts.dictationPhrases || [
      "How is Emma doing this week",
      "Can you create a new quest for brushing teeth",
      "What habits should we focus on next"
    ];

    /* ── Input typing → mic/send toggle ── */
    function getInputText() {
      return (input.textContent || '').trim();
    }

    input.addEventListener('input', function () {
      if (!listening) {
        btnMic.setAttribute('data-mode', getInputText() ? 'send' : 'mic');
      }
    });

    /* ── Enter key sends ── */
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
      // Block rich-text formatting hotkeys
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'i' || e.key === 'u')) {
        e.preventDefault();
      }
    });

    function sendMessage() {
      var text = getInputText();
      if (!text) return;
      if (typeof opts.onSend === 'function') {
        try { opts.onSend(text); } catch (e) { console.warn('[chat-composer] onSend threw', e); }
      }
      input.innerHTML = '';
      btnMic.setAttribute('data-mode', 'mic');
    }

    /* ── Mic button: voice in mic mode, send in send mode ── */
    btnMic.addEventListener('click', function () {
      var mode = btnMic.getAttribute('data-mode');
      if (mode === 'send') {
        sendMessage();
      } else if (mode === 'mic') {
        if (voiceRecordingToolbar) startListening();
      }
    });

    /* ── Voice recording state machine ── */
    if (voiceWaveform) {
      // Generate waveform bars once
      var barCount = 58;
      for (var b = 0; b < barCount; b++) {
        var bar = document.createElement('div');
        bar.className = 'voice-waveform-bar';
        bar.style.height = '4px';
        voiceWaveform.appendChild(bar);
      }
    }
    var waveformBars = voiceWaveform ? voiceWaveform.querySelectorAll('.voice-waveform-bar') : [];

    function animateWaveform() {
      for (var i = 0; i < waveformBars.length; i++) {
        var h = Math.random() * 28 + 4;
        waveformBars[i].style.height = h + 'px';
      }
    }

    function enterRecordingState() {
      if (composerPill) {
        composerPill.classList.add('voice-recording');
        composerPill.classList.remove('voice-transcribing');
      }
      if (voiceRecordingToolbar) voiceRecordingToolbar.classList.add('active');
      if (voiceTranscribingRow) voiceTranscribingRow.classList.remove('active');
      if (voiceTranscribingToolbar) voiceTranscribingToolbar.classList.remove('active');
    }

    function exitVoiceStates() {
      if (composerPill) composerPill.classList.remove('voice-recording', 'voice-transcribing');
      if (voiceRecordingToolbar) voiceRecordingToolbar.classList.remove('active');
      if (voiceTranscribingRow) voiceTranscribingRow.classList.remove('active');
      if (voiceTranscribingToolbar) voiceTranscribingToolbar.classList.remove('active');
    }

    function startListening() {
      listening = true;
      input.innerHTML = '';
      enterRecordingState();
      animateWaveform();
      voiceWaveInterval = setInterval(animateWaveform, 150);
    }

    function enterProcessingState() {
      listening = false;
      clearInterval(voiceWaveInterval);

      var phrase = dictationPhrases[dictationIdx % dictationPhrases.length];
      dictationIdx++;

      if (composerPill) {
        composerPill.classList.remove('voice-recording');
        composerPill.classList.add('voice-transcribing');
      }
      if (voiceRecordingToolbar) voiceRecordingToolbar.classList.remove('active');
      if (voiceTranscribingRow) voiceTranscribingRow.classList.add('active');
      if (voiceTranscribingToolbar) voiceTranscribingToolbar.classList.add('active');

      setTimeout(function () {
        exitVoiceStates();
        input.innerHTML = '';
        input.focus();

        var words = phrase.split(' ');
        var i = 0;
        dictationTimer = setInterval(function () {
          if (i < words.length) {
            input.textContent += (i > 0 ? ' ' : '') + words[i];
            i++;
            btnMic.setAttribute('data-mode', 'send');
          } else {
            clearInterval(dictationTimer);
            dictationTimer = null;
          }
        }, 120);
      }, 1500);
    }

    function cancelVoice() {
      listening = false;
      clearInterval(voiceWaveInterval);
      clearInterval(dictationTimer);
      dictationTimer = null;
      input.innerHTML = '';
      exitVoiceStates();
      btnMic.setAttribute('data-mode', 'mic');
    }

    if (voiceBtnStop) voiceBtnStop.addEventListener('click', cancelVoice);
    if (voiceBtnStopTranscribing) voiceBtnStopTranscribing.addEventListener('click', cancelVoice);
    if (voiceBtnDone) voiceBtnDone.addEventListener('click', enterProcessingState);

    /* ── Plus pill / attach panel ── */
    if (btnPlus && plusPill) {
      var plusIconSvg = btnPlus.innerHTML;
      var keyboardIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="10" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="14" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/><line x1="8" y1="16" x2="16" y2="16"/></svg>';

      function hideInstant(el) {
        if (!el) return;
        el.style.transition = 'none';
        el.classList.remove('open');
        void el.offsetWidth;
        el.style.transition = '';
      }

      function swapPlusIcon(svg, label) {
        plusPill.classList.remove('swapping');
        void plusPill.offsetWidth;
        btnPlus.innerHTML = svg;
        btnPlus.setAttribute('aria-label', label);
        plusPill.classList.add('swapping');
      }

      function openAttachPanel() {
        if (iosKeyboard) hideInstant(iosKeyboard);
        if (attachPanel) attachPanel.classList.add('open');
        swapPlusIcon(keyboardIconSvg, 'Show keyboard');
      }
      function closeAttachPanel() {
        if (attachPanel) {
          hideInstant(attachPanel);
          attachPanel.querySelectorAll('.attach-panel-row').forEach(function (r) {
            r.style.transition = 'none'; void r.offsetWidth; r.style.transition = '';
          });
        }
        swapPlusIcon(plusIconSvg, 'Add attachment');
      }

      function expandPlusPill() { plusPill.classList.add('expanded'); }
      function collapsePlusPill() { plusPill.classList.remove('expanded'); }

      // Composer focus → show keyboard if present and panel not open
      if (iosKeyboard) {
        input.addEventListener('focus', function () {
          if (!attachPanel || !attachPanel.classList.contains('open')) {
            iosKeyboard.classList.add('open');
          }
        });
      }

      btnPlus.addEventListener('click', function (e) {
        e.stopPropagation();
        if (attachMode === 'panel') {
          if (attachPanel && attachPanel.classList.contains('open')) {
            hideInstant(attachPanel);
            attachPanel.querySelectorAll('.attach-panel-row').forEach(function (r) {
              r.style.transition = 'none'; void r.offsetWidth; r.style.transition = '';
            });
            if (iosKeyboard) {
              iosKeyboard.style.transition = 'none';
              iosKeyboard.classList.add('open');
              void iosKeyboard.offsetWidth;
              iosKeyboard.style.transition = '';
            }
            swapPlusIcon(plusIconSvg, 'Add attachment');
            input.focus();
          } else {
            openAttachPanel();
          }
        } else {
          if (plusPill.classList.contains('expanded')) collapsePlusPill();
          else expandPlusPill();
        }
      });

      if (inlineCloseBtn) {
        inlineCloseBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          collapsePlusPill();
        });
      }
    }
  };
})();
