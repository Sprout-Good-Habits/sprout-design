/* ═══════════════════════════════════════════════════
   Sprout Parent Design System / Rive Avatars
   Auto-mounts Rive runtimes onto avatar canvases on doc pages.
   Looks for canvas.rive-sprout and canvas.rive-user elements
   and inits each with the correct .riv source and state.

   Usage in a doc page:
     <script src="https://unpkg.com/@rive-app/canvas@2.35.2"></script>
     <script src="/parent-design-system/rive-avatars.js"></script>

     <div class="avatar avatar-sm">
       <canvas class="rive-sprout" width="86" height="124"></canvas>
     </div>

     <div class="avatar avatar-sm avatar-bg-violet">
       <canvas class="rive-user" width="46" height="66" data-rive-state="coparent"></canvas>
     </div>

   Available data-rive-state values:
     - sprout (default for .rive-sprout)
     - user (default for .rive-user)
     - coparent (alt for .rive-user, beard + different palette)
   ═══════════════════════════════════════════════════ */

(function () {
  if (typeof rive === 'undefined') {
    console.warn('[rive-avatars] Rive runtime not loaded. Add the @rive-app/canvas script before this one.');
    return;
  }

  var RIVE_SPROUT_SRC = '/kid-design-system/sprot2.97_.riv';
  var RIVE_USER_SRC = '/kid-design-system/character2.91.riv';
  var SM_NAME = 'State Machine 1';
  var ARTBOARD = 'Village-character';

  // Default character states copied from parent-chat-3.
  var STATES = {
    sprout:   { hairID: 1 },
    user:     { skinID: 3, hairID: 2, hairshadeID: 4, clothingID: 1, clothingcolourID: 2, eyeshadeID: 1 },
    coparent: { skinID: 5, hairID: 4, hairshadeID: 8, beardID: 2, beardshadeID: 8, clothingID: 3, clothingcolourID: 5, eyeshadeID: 3 }
  };

  function initRiveAvatar(canvas, opts) {
    var w = parseInt(canvas.getAttribute('width'), 10) || 86;
    var h = parseInt(canvas.getAttribute('height'), 10) || 124;
    canvas.width = w;
    canvas.height = h;

    var config = {
      src: opts.src,
      canvas: canvas,
      autoplay: true,
      stateMachines: SM_NAME,
      fit: rive.Fit.Contain,
      alignment: rive.Alignment.Center,
      onLoad: function () {
        if (!r) return;
        r.resizeDrawingSurfaceToCanvas();
        try {
          var inputs = r.stateMachineInputs(SM_NAME);
          if (inputs && opts.state) {
            inputs.forEach(function (inp) {
              if (opts.state[inp.name] !== undefined) inp.value = opts.state[inp.name];
            });
          }
        } catch (e) { /* swallow input errors, keep avatar visible */ }
      }
    };
    if (opts.artboard) config.artboard = opts.artboard;

    var r;
    try { r = new rive.Rive(config); } catch (e) { console.warn('[rive-avatars] init failed', e); }
    return r;
  }

  function autoMount() {
    document.querySelectorAll('canvas.rive-sprout').forEach(function (canvas) {
      var stateName = canvas.getAttribute('data-rive-state') || 'sprout';
      initRiveAvatar(canvas, { src: RIVE_SPROUT_SRC, state: STATES[stateName] || STATES.sprout });
    });
    document.querySelectorAll('canvas.rive-user').forEach(function (canvas) {
      var stateName = canvas.getAttribute('data-rive-state') || 'user';
      initRiveAvatar(canvas, { src: RIVE_USER_SRC, artboard: ARTBOARD, state: STATES[stateName] || STATES.user });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }
})();
