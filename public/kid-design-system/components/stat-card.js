/* ============================================
   Sprout Stat Card, counter animation helper
   Exposes window.SproutStatCard with:
     - animateCount(el, opts)   // tween a single .stat-card-number
     - animateRow(row, opts)    // walk a .stat-card-row and animate its numbers
   Respects prefers-reduced-motion and shows the final value instantly.
   ============================================ */
(function () {
  var formatters = {
    percent: function (v) { return Math.round(v) + '%'; },
    time:    function (v) {
      var s = Math.round(v);
      var mm = Math.floor(s / 60);
      var ss = String(s % 60);
      if (ss.length < 2) ss = '0' + ss;
      return mm + ':' + ss;
    }
  };

  function prefersReducedMotion() {
    return typeof matchMedia === 'function' &&
           matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function animateCount(el, opts) {
    if (!el || !el.dataset) return;
    opts = opts || {};
    var to = Number(el.dataset.countTo);
    if (isNaN(to)) return;
    var format = formatters[el.dataset.countFormat] || formatters.percent;
    var duration = opts.duration || 600;
    var delay = opts.delay || 0;

    if (prefersReducedMotion()) {
      el.textContent = format(to);
      return;
    }

    el.textContent = format(0);

    setTimeout(function () {
      var start = performance.now();
      function tick(now) {
        var p = Math.min((now - start) / duration, 1);
        // easeOutCubic, spring is intentionally avoided for numbers
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(to * eased);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);
  }

  function animateRow(row, opts) {
    if (!row || !row.querySelectorAll) return;
    opts = opts || {};
    var baseDelay = typeof opts.baseDelay === 'number' ? opts.baseDelay : 550;
    var stagger = typeof opts.stagger === 'number' ? opts.stagger : 100;
    var nums = row.querySelectorAll('.stat-card-number[data-count-to]');
    for (var i = 0; i < nums.length; i++) {
      animateCount(nums[i], { delay: baseDelay + i * stagger });
    }
  }

  window.SproutStatCard = {
    animateCount: animateCount,
    animateRow: animateRow
  };
})();
