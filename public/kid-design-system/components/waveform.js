/* ============================================
   Sprout Waveform
   Renders animated bars that visualize audio amplitude.
   Exposes window.SproutWaveform with:
     - create(opts)  // build bars in a container
   Returns a controller with:
     - setAmplitude(rms)   // drive bars from real mic RMS (0-1)
     - startSimulation()   // organic fake animation (for Sprout talking)
     - stopSimulation()    // stop fake animation
     - setIdle()           // reset all bars to idle height
     - destroy()           // remove bars from DOM

   Usage:
     <link rel="stylesheet" href="/kid-design-system/components/waveform.css">
     <script src="/kid-design-system/components/waveform.js"></script>
     <script>
       var wf = SproutWaveform.create({
         container: 'waveformContainer'
       });
       // Drive from mic amplitude:
       wf.setAmplitude(0.25);
       // Or simulate Sprout talking:
       wf.startSimulation();
     </script>
   ============================================ */
(function () {
  'use strict';

  // Default active heights (134 bars) from Figma design node 21035:66985
  var DEFAULT_ACTIVE_HEIGHTS = [
    13,14,16,16,16,17,18,20,20,18,17,16,14,13,13,14,16,18,18,18,
    20,20,20,20,18,17,16,14,13,14,16,17,18,20,21,22,24,25,26,27,
    29,30,31,33,34,34,34,33,31,30,29,27,26,25,24,22,21,20,18,17,
    16,14,16,17,18,20,20,20,20,20,18,16,14,13,14,16,17,18,20,20,
    20,20,20,18,16,14,13,13,13,14,16,17,18,20,21,22,24,25,26,27,
    29,30,31,33,34,34,34,34,33,31,30,29,27,26,25,24,22,21,20,18,
    17,16,14,16,17,18,20,20,20,20,20,18,16,14
  ];
  var DEFAULT_IDLE_HEIGHT = 16;
  var DEFAULT_SENSITIVITY = 8;

  function create(opts) {
    opts = opts || {};
    var containerId = opts.container;
    var container = typeof containerId === 'string'
      ? document.getElementById(containerId)
      : containerId;
    if (!container) return null;

    var activeHeights = opts.activeHeights || DEFAULT_ACTIVE_HEIGHTS;
    var idleHeight = opts.idleHeight || DEFAULT_IDLE_HEIGHT;
    var sensitivity = opts.sensitivity || DEFAULT_SENSITIVITY;
    var numBars = activeHeights.length;
    var bars = [];
    var simId = null;

    // Build bars
    for (var i = 0; i < numBars; i++) {
      var bar = document.createElement('div');
      bar.className = 'waveform-bar';
      bar.style.height = idleHeight + 'px';
      container.appendChild(bar);
      bars.push(bar);
    }

    function setIdle() {
      for (var i = 0; i < numBars; i++) {
        bars[i].style.height = idleHeight + 'px';
      }
    }

    function setAmplitude(rms) {
      var t = Math.min(1, rms * sensitivity);
      for (var i = 0; i < numBars; i++) {
        var h = Math.round(idleHeight + (activeHeights[i] - idleHeight) * t);
        bars[i].style.height = h + 'px';
      }
    }

    function startSimulation() {
      var startTime = performance.now();
      function draw() {
        simId = requestAnimationFrame(draw);
        var elapsed = (performance.now() - startTime) / 1000;
        for (var i = 0; i < numBars; i++) {
          var wave = Math.sin(elapsed * 4.5 + i * 0.15) * 0.3
                   + Math.sin(elapsed * 7.2 + i * 0.08) * 0.2
                   + Math.sin(elapsed * 2.1 + i * 0.25) * 0.15;
          var energy = 0.4 + 0.3 * Math.sin(elapsed * 1.8);
          var t = Math.max(0, Math.min(1, (wave + 0.5) * energy));
          var h = Math.round(idleHeight + (activeHeights[i] - idleHeight) * t);
          bars[i].style.height = h + 'px';
        }
      }
      draw();
    }

    function stopSimulation() {
      if (simId) { cancelAnimationFrame(simId); simId = null; }
      setIdle();
    }

    function destroy() {
      stopSimulation();
      for (var i = 0; i < bars.length; i++) {
        if (bars[i].parentNode) bars[i].parentNode.removeChild(bars[i]);
      }
      bars = [];
    }

    return {
      setAmplitude: setAmplitude,
      startSimulation: startSimulation,
      stopSimulation: stopSimulation,
      setIdle: setIdle,
      destroy: destroy
    };
  }

  window.SproutWaveform = { create: create };
})();
