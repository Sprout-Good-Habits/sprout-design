/* ═══════════════════════════════════════════════════
   Sprout Kid Design System — CardAvatar Village runtime

   Auto-discovers every .card-avatar-canvas on the page and
   initialises it as a Rive village character from character2.91.riv
   (artboard "Village-character", state machine "State Machine 1").

   Each canvas can override the default "Shane" preset via
   data-* attributes on the canvas element itself:

     <canvas class="card-avatar-canvas"
             width="244" height="348"
             data-skin-id="8" data-hair-id="5"
             data-hairshade-id="5" data-beard-id="0"
             data-beardshade-id="0" data-clothingcolour-id="7"
             data-clothing-id="1"></canvas>

   Supported data attributes (all optional, all numbers):
     data-skin-id, data-hair-id, data-hairshade-id,
     data-beard-id, data-beardshade-id,
     data-clothingcolour-id, data-clothing-id

   Source reference: /kid-design-system/foundations/village-character.html
   ═══════════════════════════════════════════════════ */
(function() {
  'use strict';

  var RIVE_SRC = '/kid-design-system/character2.91.riv';
  var RIVE_RUNTIME = 'https://unpkg.com/@rive-app/canvas@2.35.2';
  var ARTBOARD = 'Village-character';
  var SM_NAME = 'State Machine 1';

  // Default preset: "Shane" from /foundations/village-character.html
  var DEFAULT_PRESET = {
    skinID: 11,
    hairID: 4,
    hairshadeID: 3,
    beardID: 0,
    beardshadeID: 0,
    clothingcolourID: 0,
    clothingID: 0
  };

  // Map data-* attribute names → Rive state machine input names.
  var DATA_ATTR_MAP = {
    'skinId': 'skinID',
    'hairId': 'hairID',
    'hairshadeId': 'hairshadeID',
    'beardId': 'beardID',
    'beardshadeId': 'beardshadeID',
    'clothingcolourId': 'clothingcolourID',
    'clothingId': 'clothingID'
  };

  function readPresetFromDataset(canvas) {
    var preset = {};
    for (var key in DEFAULT_PRESET) {
      if (DEFAULT_PRESET.hasOwnProperty(key)) preset[key] = DEFAULT_PRESET[key];
    }
    var ds = canvas.dataset || {};
    for (var dsKey in DATA_ATTR_MAP) {
      if (ds[dsKey] !== undefined && ds[dsKey] !== '') {
        var n = parseInt(ds[dsKey], 10);
        if (!isNaN(n)) preset[DATA_ATTR_MAP[dsKey]] = n;
      }
    }
    return preset;
  }

  function initOne(canvas) {
    if (!window.rive) return;
    if (canvas.dataset.cardAvatarInitialized === 'true') return;
    canvas.dataset.cardAvatarInitialized = 'true';

    // Normalize width/height attributes to the intrinsic canvas size.
    var w = parseInt(canvas.getAttribute('width'), 10);
    var h = parseInt(canvas.getAttribute('height'), 10);
    if (w) canvas.width = w;
    if (h) canvas.height = h;

    var preset = readPresetFromDataset(canvas);
    var r;
    try {
      r = new rive.Rive({
        src: RIVE_SRC,
        canvas: canvas,
        autoplay: true,
        artboard: ARTBOARD,
        stateMachines: SM_NAME,
        fit: rive.Fit.Contain,
        alignment: rive.Alignment.Center,
        onLoad: function() {
          if (!r) return;
          r.resizeDrawingSurfaceToCanvas();
          try {
            var inputs = r.stateMachineInputs(SM_NAME);
            if (inputs) {
              inputs.forEach(function(inp) {
                if (preset[inp.name] !== undefined) inp.value = preset[inp.name];
              });
            }
          } catch (e) {}
        }
      });
    } catch (e) {
      console.warn('[card-avatar] Rive init failed', canvas, e);
    }
  }

  function initAll() {
    var canvases = document.querySelectorAll('.card-avatar-canvas');
    if (!canvases.length) return;
    canvases.forEach(initOne);
  }

  function loadRiveRuntime(cb) {
    if (window.rive) { cb(); return; }

    // Dedupe: if another script already added the runtime tag, wait for it.
    var existing = document.querySelector('script[data-card-avatar-runtime]');
    if (existing) {
      existing.addEventListener('load', cb);
      return;
    }

    var s = document.createElement('script');
    s.src = RIVE_RUNTIME;
    s.async = true;
    s.setAttribute('data-card-avatar-runtime', '');
    s.addEventListener('load', cb);
    s.addEventListener('error', function() {
      console.warn('[card-avatar] Failed to load Rive runtime from', RIVE_RUNTIME);
    });
    document.head.appendChild(s);
  }

  function boot() {
    loadRiveRuntime(initAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose a manual init in case the page adds more canvases dynamically.
  window.SproutCardAvatar = {
    init: function(target) {
      if (!target) { initAll(); return; }
      if (target.classList && target.classList.contains('card-avatar-canvas')) {
        initOne(target);
      } else if (target.querySelectorAll) {
        target.querySelectorAll('.card-avatar-canvas').forEach(initOne);
      }
    }
  };
})();
