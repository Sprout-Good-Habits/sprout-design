/* ═══════════════════════════════════════════════════
   Sprout Kid Design System — Shell
   Builds sidebar nav, breadcrumb, and "On this page" TOC.
   ═══════════════════════════════════════════════════ */

(function () {
  var nav = window.DS_NAV;
  if (!nav) return;

  // ── SVG Icons (matching home page cards) ──
  var ICONS = {
    Home: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 17.5v-5.833c0-.467 0-.7.09-.879a.833.833 0 0 1 .365-.364c.178-.091.412-.091.878-.091h2.334c.466 0 .7 0 .878.09.157.08.285.208.365.365.09.179.09.412.09.879V17.5M9.18 2.818l-5.25 4.2c-.263.21-.394.316-.49.447a1.25 1.25 0 0 0-.19.422c-.05.157-.05.327-.05.668v6.528c0 .7 0 1.05.136 1.318.12.235.311.426.546.546.268.136.618.136 1.318.136h9.6c.7 0 1.05 0 1.318-.136.235-.12.426-.311.546-.546.136-.268.136-.618.136-1.318V8.555c0-.34 0-.51-.05-.668a1.25 1.25 0 0 0-.19-.422c-.096-.131-.227-.236-.49-.448l-5.25-4.2c-.205-.163-.307-.245-.42-.276a.417.417 0 0 0-.226 0c-.113.031-.215.113-.42.276z"/></svg>',
    Foundations: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M3 10h14M10 3v14"/></svg>',
    Components: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg>',
    Patterns: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h12v12H4z"/><path d="M4 9h12M9 4v12"/></svg>',
    Resources: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5a2 2 0 012-2h8a2 2 0 012 2v14"/><path d="M2 19h16"/><path d="M8 7h4"/></svg>'
  };

  var CHEVRON_DOWN = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>';

  function currentPath() {
    var p = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
    if (p !== '/' && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  }

  function hrefToPath(href) {
    return href.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/\/$/, '') || '/';
  }

  function isActive(href) {
    return currentPath() === hrefToPath(href);
  }

  // Check if a section is expanded (current page matches section or any child)
  function isSectionActive(item) {
    if (isActive(item.href)) return true;
    if (item.children) {
      for (var i = 0; i < item.children.length; i++) {
        if (isActive(item.children[i].href)) return true;
      }
    }
    return false;
  }

  // Find current page info for breadcrumb
  function findCurrentPage() {
    for (var i = 0; i < nav.length; i++) {
      var item = nav[i];
      if (isActive(item.href)) {
        return { section: null, label: item.label, sectionHref: null };
      }
      if (item.children) {
        for (var j = 0; j < item.children.length; j++) {
          if (isActive(item.children[j].href)) {
            return { section: item.label, label: item.children[j].label, sectionHref: item.href };
          }
        }
      }
    }
    return null;
  }

  // ── Build nav list HTML (shared by sidebar + mobile drawer) ──
  function buildNavHTML() {
    var html = '';
    for (var i = 0; i < nav.length; i++) {
      var item = nav[i];
      var active = isActive(item.href) ? ' active' : '';
      var sectionActive = isSectionActive(item);
      var cls = item.children ? 'nav-section' : 'nav-item';
      var icon = ICONS[item.label] || '';

      html += '<a class="' + cls + active + '" href="' + item.href + '">';
      if (icon) html += '<span class="nav-icon">' + icon + '</span>';
      html += item.label;
      if (item.children) html += '<span class="nav-chevron' + (sectionActive ? ' open' : '') + '">' + CHEVRON_DOWN + '</span>';
      html += '</a>';

      // Always render children; start expanded if section is active
      if (item.children) {
        html += '<div class="nav-children' + (sectionActive ? '' : ' collapsed') + '">';
        for (var j = 0; j < item.children.length; j++) {
          var child = item.children[j];
          var childActive = isActive(child.href) ? ' active' : '';
          html += '<a class="nav-child' + childActive + '" href="' + child.href + '">' + child.label + '</a>';
        }
        html += '</div>';
      }
    }
    return html;
  }

  // ── Attach section toggle handlers to a nav container ──
  function attachSectionToggles(container) {
    var sections = container.querySelectorAll('.nav-section');
    for (var i = 0; i < sections.length; i++) {
      (function (sectionLink) {
        sectionLink.addEventListener('click', function (e) {
          e.preventDefault();
          var children = sectionLink.nextElementSibling;
          if (!children || !children.classList.contains('nav-children')) return;
          var chevron = sectionLink.querySelector('.nav-chevron');
          var isCollapsed = children.classList.contains('collapsed');

          if (isCollapsed) {
            children.classList.remove('collapsed');
            if (chevron) chevron.classList.add('open');
          } else {
            children.classList.add('collapsed');
            if (chevron) chevron.classList.remove('open');
          }
        });
      })(sections[i]);
    }
  }

  // ── Sidebar ──
  function buildSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = '<div class="sidebar-inner">' +
      '<div class="sidebar-logo"><img src="/brand/assets/Landscape%20Lockup.svg" alt="Sprout — Good Habits" width="140" height="44"></div>' +
      '<div class="nav-list">' + buildNavHTML() + '</div></div>';

    attachSectionToggles(sidebar);
  }

  // ── Breadcrumb ──
  function buildBreadcrumb() {
    var bc = document.getElementById('breadcrumb');
    if (!bc) return;

    var page = findCurrentPage();
    if (!page) return;

    var html = '<a href="/">Kid Design System</a>';

    if (page.section) {
      html += '<span class="breadcrumb-sep">/</span>' +
        '<a href="' + page.sectionHref + '">' + page.section + '</a>' +
        '<span class="breadcrumb-sep">/</span>' +
        '<span class="breadcrumb-current">' + page.label + '</span>';
    } else if (page.label !== 'Home') {
      html += '<span class="breadcrumb-sep">/</span>' +
        '<span class="breadcrumb-current">' + page.label + '</span>';
    }

    bc.innerHTML = html;
  }

  // ── Table of Contents ──
  function buildTOC() {
    var tocEl = document.getElementById('toc');
    if (!tocEl) return;

    var headings = document.querySelectorAll('.doc-section h2');
    if (headings.length === 0) { tocEl.style.display = 'none'; return; }

    var html = '<div class="toc-title">On this page</div><ul class="toc-list">';
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      var id = h.id || 'section-' + i;
      h.id = id;
      html += '<li><a href="#' + id + '">' + h.textContent + '</a></li>';
    }
    html += '</ul>';
    tocEl.innerHTML = html;

    // Scroll spy
    var tocLinks = tocEl.querySelectorAll('.toc-list a');
    function updateActive() {
      var scrollTop = document.querySelector('.main').scrollTop;
      var current = 0;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].offsetTop - 100 <= scrollTop) current = i;
      }
      for (var j = 0; j < tocLinks.length; j++) {
        tocLinks[j].classList.toggle('active', j === current);
      }
    }
    document.querySelector('.main').addEventListener('scroll', updateActive);
    updateActive();
  }

  // ── Mobile Nav ──
  var HAMBURGER = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
  var CLOSE_X = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  function buildMobileNav() {
    // Top bar
    var topbar = document.createElement('div');
    topbar.className = 'mobile-topbar';
    topbar.innerHTML = '<img src="/brand/assets/Landscape%20Lockup.svg" alt="Sprout — Good Habits" width="140" height="44">' +
      '<button class="mobile-menu-btn" aria-label="Open menu">' + HAMBURGER + '</button>';
    document.body.insertBefore(topbar, document.body.firstChild);

    // Overlay
    var overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.innerHTML = '<div class="mobile-overlay-scrim"></div>' +
      '<div class="mobile-drawer">' +
        '<div class="mobile-drawer-header">' +
          '<img src="/brand/assets/Landscape%20Lockup.svg" alt="Sprout — Good Habits" width="140" height="44">' +
        '</div>' +
        '<div class="nav-list"></div>' +
      '</div>' +
      '<button class="mobile-close-btn" aria-label="Close menu">' + CLOSE_X + '</button>';
    document.body.appendChild(overlay);

    // Populate nav items (same structure as sidebar)
    overlay.querySelector('.nav-list').innerHTML = buildNavHTML();
    attachSectionToggles(overlay);

    // Toggle logic
    var menuBtn = topbar.querySelector('.mobile-menu-btn');
    var closeBtn = overlay.querySelector('.mobile-close-btn');
    var scrim = overlay.querySelector('.mobile-overlay-scrim');

    function openMenu() {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    scrim.addEventListener('click', closeMenu);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeMenu();
    });
  }

  buildSidebar();
  buildMobileNav();
  buildBreadcrumb();

  // Build TOC after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildTOC);
  } else {
    buildTOC();
  }
})();
