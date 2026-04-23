/* ═══════════════════════════════════════════════════
   Product Explorer — Shell
   Builds sidebar nav, breadcrumb, and "On this page" TOC.
   ═══════════════════════════════════════════════════ */

(function () {
  var nav = window.DS_NAV;
  if (!nav) return;

  // ── Material Symbols helper ──
  function msym(name, size) {
    return '<span class="material-symbols-outlined" style="font-size:' + (size || 20) + 'px;line-height:1;">' + name + '</span>';
  }

  // ── Icons (Material Symbols, 20px) ──
  var ICONS = {
    phone: msym('smartphone'),
    'message-chat': msym('forum'),
    'stars-01': msym('auto_awesome'),
    'stars-02': msym('auto_awesome'),
    home: msym('home'),
    grid: msym('grid_view'),
    menu: msym('menu'),
    'video-recorder': msym('videocam'),
    mic: msym('mic')
  };

  var CHEVRON_UP = msym('expand_less', 16);
  var CHEVRON_DOWN = msym('expand_more', 16);

  var CLOSE_X = msym('close', 24);

  // ── Inject sidebar styles ──
  var styleEl = document.createElement('style');
  styleEl.textContent = [
    /* Sidebar container */
    '.sidebar{width:242px;background:#fafafa;border-right:1px solid #e9eaeb;padding:16px 8px;display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto;position:fixed;top:0;left:0;bottom:0;z-index:200;transform:translateX(0);}',
    '.sidebar.animate{transition:transform .3s cubic-bezier(0.25,0.1,0.25,1);}',
    '.sidebar.collapsed{transform:translateX(-100%);}',
    '.main{margin-left:242px;}',
    '.main.animate{transition:margin-left .3s cubic-bezier(0.25,0.1,0.25,1);}',
    'body.sidebar-closed .main{margin-left:0;}',
    /* scrim removed */
    '@media(max-width:768px){.main{margin-left:0 !important;}}',
    '.sidebar-header{display:flex;align-items:center;gap:8px;padding:0 8px 12px;border-bottom:none;}',
    '.sidebar-header img{width:20px;height:20px;border-radius:4px;display:block;flex-shrink:0;}',
    '.sidebar-header span{font-size:14px;font-weight:500;color:#181d27;line-height:20px;}',
    /* Nav list */
    '.sidebar .nav-list{display:flex;flex-direction:column;gap:4px;padding:12px 0 0;}',
    /* Nav items (parent sections & leaf items) */
    '.nav-item,.nav-section{display:flex;align-items:center;gap:8px;height:28px;padding:4px 8px;border-radius:2px;font-size:14px;font-weight:500;color:#414651;text-decoration:none;cursor:pointer;transition:background .1s;line-height:20px;flex-shrink:0;}',
    '.nav-item:hover,.nav-section:hover{background:#f0f0f0;text-decoration:none;}',
    '.nav-item.active,.nav-section.active{background:#f0f0f0;font-weight:600;text-decoration:none;}',
    /* Icon wrapper */
    '.nav-icon{width:20px;height:20px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}',
    '.nav-icon .material-symbols-outlined{font-size:20px;line-height:1;}',
    /* Badge pill */
    '.nav-badge{margin-left:auto;background:#f0f9ff;border:1px solid #b9e6fe;color:#026aa2;font-size:12px;font-weight:500;line-height:1;border-radius:6px;padding:2px 6px;white-space:nowrap;flex-shrink:0;}',
    /* Chevron */
    '.nav-chevron{width:16px;height:16px;margin-left:auto;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#a4a7ae;}',
    '.nav-chevron .material-symbols-outlined{font-size:16px;line-height:1;}',
    /* When badge + chevron coexist, chevron after badge */
    '.nav-section .nav-chevron{margin-left:0;}',
    /* Section link (clickable label in collapsible header) */
    '.nav-section-link{flex:1;color:#414651;text-decoration:none;font-size:14px;font-weight:500;line-height:20px;}',
    '.nav-section-link:hover{text-decoration:none;}',
    '.nav-section-label{flex:1;}',
    /* Children container */
    '.nav-children{display:flex;flex-direction:column;gap:4px;}',
    '.nav-children.collapsed{display:none;}',
    /* Child items */
    '.nav-child{display:flex;align-items:center;gap:8px;height:28px;padding:4px 8px 4px 16px;border-radius:2px;font-size:14px;font-weight:500;color:#414651;text-decoration:none;transition:background .1s;line-height:20px;flex-shrink:0;}',
    '.nav-child:hover{background:#f0f0f0;text-decoration:none;}',
    '.nav-child.active{background:#f0f0f0;font-weight:600;text-decoration:none;}',
    /* Nested sub-section (level 2) */
    '.nav-sub-section{display:flex;align-items:center;gap:8px;height:28px;padding:4px 8px 4px 16px;border-radius:2px;font-size:14px;font-weight:500;color:#414651;text-decoration:none;cursor:pointer;transition:background .1s;line-height:20px;flex-shrink:0;}',
    '.nav-sub-section:hover{background:#f0f0f0;text-decoration:none;}',
    '.nav-sub-section .nav-section-label{flex:1;}',
    '.nav-sub-section .nav-chevron{margin-left:0;}',
    '.nav-sub-children{display:flex;flex-direction:column;gap:4px;}',
    '.nav-sub-children.collapsed{display:none;}',
    '.nav-sub-children .nav-child{padding-left:28px;}',
    /* Breadcrumb hamburger */
    '.breadcrumb-menu-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#535862;padding:0;flex-shrink:0;border-radius:6px;-webkit-tap-highlight-color:transparent;}',
    '.breadcrumb-menu-btn:hover{color:#181d27;background:#f5f5f5;}',
    '.breadcrumb-menu-btn .material-symbols-outlined{font-size:20px;line-height:1;}',
    /* Mobile sidebar overlay */
    '.sidebar-scrim{display:none;position:fixed;inset:0;background:rgba(10,13,18,0.4);z-index:199;-webkit-tap-highlight-color:transparent;}',
    '.sidebar-scrim.visible{display:block;}',
    /* Sidebar close button */
    '.sidebar-close{display:none;position:absolute;top:12px;right:12px;width:36px;height:36px;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#535862;padding:0;border-radius:6px;-webkit-tap-highlight-color:transparent;}',
    '.sidebar-close:hover{color:#181d27;background:#f0f0f0;}',
    '.sidebar-close .material-symbols-outlined{font-size:20px;line-height:1;}',
    /* Responsive: mobile sidebar as full-width overlay drawer */
    '@media(max-width:768px){.sidebar{transform:translateX(-100%);width:100%;position:fixed;top:0;left:0;right:0;bottom:0;z-index:200;}.sidebar.collapsed{transform:translateX(-100%);}.sidebar:not(.collapsed){transform:translateX(0);}body:not(.sidebar-closed) .sidebar{transform:translateX(0);}.sidebar-close{display:flex;}.nav-item,.nav-section{height:36px;padding:8px;}.nav-child{height:36px;padding:8px 8px 8px 16px;}.nav-sub-section{height:36px;padding:8px 8px 8px 16px;}}',
    /* Search */
    '.sidebar-search{padding:0 8px 8px;}',
    '.sidebar-search input{width:100%;height:32px;padding:0 8px 0 30px;border:1px solid #e9eaeb;border-radius:6px;font-size:13px;font-family:inherit;color:#181d27;background:#fff;outline:none;box-sizing:border-box;transition:border-color .15s;}',
    '.sidebar-search input:focus{border-color:#0ba5ec;}',
    '.sidebar-search input::placeholder{color:#a4a7ae;}',
    '.sidebar-search{position:relative;}',
    '.sidebar-search .sidebar-search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:14px;line-height:1;color:#a4a7ae;pointer-events:none;}',
    '.nav-item.search-hidden,.nav-section.search-hidden,.nav-children.search-hidden,.nav-child.search-hidden,.nav-sub-section.search-hidden,.nav-sub-children.search-hidden{display:none;}'
  ].join('\n');
  document.head.appendChild(styleEl);

  // ── Utility functions ──
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

  // Check if a section (or any descendant) contains the active page
  function isSectionActive(item) {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      for (var i = 0; i < item.children.length; i++) {
        if (isSectionActive(item.children[i])) return true;
      }
    }
    return false;
  }

  // Find current page info for breadcrumb
  function findCurrentPage() {
    for (var i = 0; i < nav.length; i++) {
      var item = nav[i];
      if (item.href && isActive(item.href)) {
        return { section: null, label: item.label, sectionHref: null };
      }
      if (item.children) {
        for (var j = 0; j < item.children.length; j++) {
          var child = item.children[j];
          if (child.href && isActive(child.href)) {
            return { section: item.label, label: child.label, sectionHref: item.href || null };
          }
          // Check grandchildren (level 2 nesting)
          if (child.children) {
            for (var k = 0; k < child.children.length; k++) {
              if (child.children[k].href && isActive(child.children[k].href)) {
                return { section: item.label, label: child.children[k].label, sectionHref: item.href || null };
              }
            }
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
      var sectionActive = isSectionActive(item);

      if (item.collapsible && item.children) {
        // Collapsible section header (not a link)
        var expanded = item.defaultOpen || sectionActive;
        var icon = item.icon && ICONS[item.icon] ? ICONS[item.icon] : '';
        var active = item.href && isActive(item.href) ? ' active' : '';

        html += '<div class="nav-section' + active + '" data-collapsible="true">';
        if (icon) html += '<span class="nav-icon">' + icon + '</span>';
        if (item.href) {
          html += '<a class="nav-section-link" href="' + item.href + '">' + item.label + '</a>';
        } else {
          html += '<span class="nav-section-label">' + item.label + '</span>';
        }
        html += '<span class="nav-chevron">' + (expanded ? CHEVRON_UP : CHEVRON_DOWN) + '</span>';
        html += '</div>';

        html += '<div class="nav-children' + (expanded ? '' : ' collapsed') + '">';
        for (var j = 0; j < item.children.length; j++) {
          var child = item.children[j];
          var childIcon = child.icon && ICONS[child.icon] ? ICONS[child.icon] : '';

          if (child.collapsible && child.children) {
            // Nested collapsible sub-section
            var subActive = isSectionActive(child);
            var subExpanded = child.defaultOpen || subActive;
            html += '<div class="nav-sub-section" data-collapsible="true">';
            if (childIcon) html += '<span class="nav-icon">' + childIcon + '</span>';
            if (child.href) {
              html += '<a class="nav-section-link" href="' + child.href + '">' + child.label + '</a>';
            } else {
              html += '<span class="nav-section-label">' + child.label + '</span>';
            }
            html += '<span class="nav-chevron">' + (subExpanded ? CHEVRON_UP : CHEVRON_DOWN) + '</span>';
            html += '</div>';
            html += '<div class="nav-sub-children' + (subExpanded ? '' : ' collapsed') + '">';
            for (var k = 0; k < child.children.length; k++) {
              var grandchild = child.children[k];
              var gcActive = grandchild.href && isActive(grandchild.href) ? ' active' : '';
              html += '<a class="nav-child' + gcActive + '" href="' + (grandchild.href || '#') + '">';
              html += '<span class="nav-child-label">' + grandchild.label + '</span>';
              if (grandchild.badge) html += '<span class="nav-badge">' + grandchild.badge + '</span>';
              html += '</a>';
            }
            html += '</div>';
          } else {
            // Regular leaf child
            var childActive = child.href && isActive(child.href) ? ' active' : '';
            html += '<a class="nav-child' + childActive + '" href="' + (child.href || '#') + '">';
            if (childIcon) html += '<span class="nav-icon">' + childIcon + '</span>';
            html += '<span class="nav-child-label">' + child.label + '</span>';
            if (child.badge) html += '<span class="nav-badge">' + child.badge + '</span>';
            html += '</a>';
          }
        }
        html += '</div>';
      } else if (item.children) {
        // Non-collapsible section with children (legacy format: parent is a link)
        var icon = item.icon && ICONS[item.icon] ? ICONS[item.icon] : '';
        var active = item.href && isActive(item.href) ? ' active' : '';

        html += '<a class="nav-section' + active + '" href="' + (item.href || '#') + '">';
        if (icon) html += '<span class="nav-icon">' + icon + '</span>';
        html += '<span class="nav-section-label">' + item.label + '</span>';
        html += '<span class="nav-chevron">' + (sectionActive ? CHEVRON_UP : CHEVRON_DOWN) + '</span>';
        html += '</a>';

        html += '<div class="nav-children' + (sectionActive ? '' : ' collapsed') + '">';
        for (var j = 0; j < item.children.length; j++) {
          var child = item.children[j];
          var childActive = child.href && isActive(child.href) ? ' active' : '';
          var childIcon = child.icon && ICONS[child.icon] ? ICONS[child.icon] : '';

          html += '<a class="nav-child' + childActive + '" href="' + (child.href || '#') + '">';
          if (childIcon) html += '<span class="nav-icon">' + childIcon + '</span>';
          html += '<span class="nav-child-label">' + child.label + '</span>';
          if (child.badge) html += '<span class="nav-badge">' + child.badge + '</span>';
          html += '</a>';
        }
        html += '</div>';
      } else {
        // Simple leaf item
        var icon = item.icon && ICONS[item.icon] ? ICONS[item.icon] : '';
        var active = item.href && isActive(item.href) ? ' active' : '';

        html += '<a class="nav-item' + active + '" href="' + (item.href || '#') + '">';
        if (icon) html += '<span class="nav-icon">' + icon + '</span>';
        html += '<span class="nav-item-label">' + item.label + '</span>';
        if (item.badge) html += '<span class="nav-badge">' + item.badge + '</span>';
        html += '</a>';
      }
    }
    return html;
  }

  // ── Attach section toggle handlers to a nav container ──
  function attachToggle(el, childrenClass) {
    el.addEventListener('click', function (e) {
      if (e.target.closest('.nav-section-link')) return;
      e.preventDefault();
      e.stopPropagation();
      var children = el.nextElementSibling;
      if (!children || !children.classList.contains(childrenClass)) return;
      var chevron = el.querySelector('.nav-chevron');
      var isCollapsed = children.classList.contains('collapsed');
      if (isCollapsed) {
        children.classList.remove('collapsed');
        if (chevron) chevron.innerHTML = CHEVRON_UP;
      } else {
        children.classList.add('collapsed');
        if (chevron) chevron.innerHTML = CHEVRON_DOWN;
      }
    });
  }

  function attachSectionToggles(container) {
    // Level 1 sections
    var sections = container.querySelectorAll('.nav-section');
    for (var i = 0; i < sections.length; i++) { attachToggle(sections[i], 'nav-children'); }
    // Level 2 sub-sections
    var subSections = container.querySelectorAll('.nav-sub-section');
    for (var i = 0; i < subSections.length; i++) { attachToggle(subSections[i], 'nav-sub-children'); }
  }

  // ── Sidebar search ──
  function attachSidebarSearch(container) {
    var input = container.querySelector('.sidebar-search input');
    if (!input) return;
    input.addEventListener('input', function() {
      var q = this.value.toLowerCase().trim();
      var navList = container.querySelector('.nav-list');
      if (!navList) return;

      // Get all top-level nav elements (sections and standalone items)
      var topEls = navList.children;
      for (var i = 0; i < topEls.length; i++) {
        var el = topEls[i];

        if (el.classList.contains('nav-item')) {
          // Standalone item: match its text
          var text = el.textContent.toLowerCase();
          el.classList.toggle('search-hidden', q !== '' && text.indexOf(q) === -1);
        } else if (el.classList.contains('nav-section')) {
          // Section header: check section label + all children in the next sibling
          var sectionText = el.textContent.toLowerCase();
          var childrenContainer = el.nextElementSibling;
          var sectionMatch = q === '' || sectionText.indexOf(q) !== -1;
          var anyChildMatch = false;

          if (childrenContainer && (childrenContainer.classList.contains('nav-children'))) {
            var children = childrenContainer.querySelectorAll('.nav-child, .nav-sub-section');
            for (var j = 0; j < children.length; j++) {
              var childText = children[j].textContent.toLowerCase();
              var childMatch = q === '' || childText.indexOf(q) !== -1 || sectionMatch;
              children[j].classList.toggle('search-hidden', !childMatch && q !== '');
              if (childMatch) anyChildMatch = true;

              // If this is a sub-section, also filter its sub-children
              if (children[j].classList.contains('nav-sub-section')) {
                var subChildren = children[j].nextElementSibling;
                if (subChildren && subChildren.classList.contains('nav-sub-children')) {
                  var subs = subChildren.querySelectorAll('.nav-child');
                  var anySubMatch = false;
                  for (var k = 0; k < subs.length; k++) {
                    var subText = subs[k].textContent.toLowerCase();
                    var subMatch = q === '' || subText.indexOf(q) !== -1 || childText.indexOf(q) !== -1 || sectionMatch;
                    subs[k].classList.toggle('search-hidden', !subMatch && q !== '');
                    if (subMatch) anySubMatch = true;
                  }
                  subChildren.classList.toggle('search-hidden', !anySubMatch && !sectionMatch && q !== '');
                  if (anySubMatch) anyChildMatch = true;
                }
              }
            }

            // Expand matching sections, hide empty ones
            childrenContainer.classList.toggle('search-hidden', !sectionMatch && !anyChildMatch && q !== '');
            if (q !== '' && (sectionMatch || anyChildMatch)) {
              childrenContainer.classList.remove('collapsed');
            }
          }

          el.classList.toggle('search-hidden', !sectionMatch && !anyChildMatch && q !== '');
        }
      }

      // If query is cleared, restore collapsed state
      if (q === '') {
        var allHidden = navList.querySelectorAll('.search-hidden');
        for (var h = 0; h < allHidden.length; h++) allHidden[h].classList.remove('search-hidden');
      }
    });
  }

  // ── Sidebar ──
  function buildSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML =
      '<button class="sidebar-close" aria-label="Close sidebar">' + CLOSE_X + '</button>' +
      '<div class="sidebar-header">' +
        '<img src="/kid-design-system/brand/assets/icon-primary.svg" alt="Sprout" />' +
        '<span>Sprout design</span>' +
      '</div>' +
      '<div class="sidebar-search">' +
        '<span class="material-symbols-outlined sidebar-search-icon">search</span>' +
        '<input type="text" placeholder="Search..." autocomplete="off" />' +
      '</div>' +
      '<div class="nav-list">' + buildNavHTML() + '</div>';

    attachSectionToggles(sidebar);
    attachSidebarSearch(sidebar);

    // Close button
    var closeBtn = sidebar.querySelector('.sidebar-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () { closeSidebar(); });
    }
  }

  // ── Sidebar toggle helpers ──
  var sidebarScrim = null;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getOrCreateScrim() {
    if (!sidebarScrim) {
      sidebarScrim = document.createElement('div');
      sidebarScrim.className = 'sidebar-scrim';
      document.body.appendChild(sidebarScrim);
      sidebarScrim.addEventListener('click', function () {
        closeSidebar();
      });
    }
    return sidebarScrim;
  }

  function enableTransitions() {
    var sidebar = document.getElementById('sidebar');
    var main = document.querySelector('.main');
    if (sidebar && !sidebar.classList.contains('animate')) sidebar.classList.add('animate');
    if (main && !main.classList.contains('animate')) main.classList.add('animate');
  }

  function openSidebar() {
    enableTransitions();
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.classList.remove('collapsed');
    document.body.classList.remove('sidebar-closed');
    if (isMobile()) {
      getOrCreateScrim().classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
    localStorage.setItem('sprout-sidebar', 'open');
  }

  function closeSidebar() {
    enableTransitions();
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.classList.add('collapsed');
    document.body.classList.add('sidebar-closed');
    getOrCreateScrim().classList.remove('visible');
    document.body.style.overflow = '';
    localStorage.setItem('sprout-sidebar', 'closed');
  }

  // ── Breadcrumb ──
  function buildBreadcrumb() {
    var bc = document.getElementById('breadcrumb');
    if (!bc) return;

    var page = findCurrentPage();

    // Hamburger menu button (always visible)
    var html = '<button class="breadcrumb-menu-btn" aria-label="Toggle sidebar">' + ICONS.menu + '</button>';

    if (page && page.section) {
      html += '<a href="/product-explorer/">' + page.section + '</a>';
      html += '<span class="breadcrumb-sep">/</span>' +
        '<span class="breadcrumb-current">' + page.label + '</span>';
    } else if (page) {
      html += '<span class="breadcrumb-current">' + page.label + '</span>';
    } else {
      html += '<span class="breadcrumb-current">Product explorer</span>';
    }

    bc.innerHTML = html;

    // Attach hamburger click — works on both desktop and mobile
    var menuBtn = bc.querySelector('.breadcrumb-menu-btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', function () {
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        if (sidebar.classList.contains('collapsed')) {
          openSidebar();
        } else {
          closeSidebar();
        }
      });
    }
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

  // Close sidebar on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  // Close sidebar when a nav link is clicked on mobile
  document.addEventListener('click', function (e) {
    var link = e.target.closest('.sidebar a[href]');
    if (link && isMobile()) {
      closeSidebar();
    }
  });

  buildSidebar();

  // Restore sidebar state after building — always start collapsed on mobile
  var savedState = localStorage.getItem('sprout-sidebar');
  if (savedState === 'closed' || isMobile()) {
    var sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.add('collapsed');
    document.body.classList.add('sidebar-closed');
  }

  buildBreadcrumb();

  // Build TOC after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildTOC);
  } else {
    buildTOC();
  }

  // ── Auto-scale device to fit col-left ──
  function scaleDevice() {
    var colLeft = document.querySelector('.col-left');
    var wrapper = document.querySelector('.col-left .device-wrapper');
    if (!colLeft || !wrapper) return;

    // Reset scale to measure natural size
    wrapper.style.transform = '';
    colLeft.style.height = '';

    var padding = parseFloat(getComputedStyle(colLeft).paddingLeft) * 2;
    var availW = colLeft.offsetWidth - padding;
    var availH = colLeft.offsetHeight - padding;

    // Get device natural dimensions
    var screen = wrapper.querySelector('.device-screen');
    if (!screen) return;
    var nativeW = screen.offsetWidth + 16; // + wrapper padding/borders
    var nativeH = screen.offsetHeight + 16;

    var scale = Math.min(availW / nativeW, availH / nativeH, 1);
    if (scale < 1) {
      wrapper.style.transform = 'scale(' + scale + ')';
      wrapper.style.transformOrigin = 'top center';
      colLeft.style.height = (nativeH * scale + padding) + 'px';
    }
  }

  // Run after page loads and on resize
  function initScaleDevice() {
    scaleDevice();
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(scaleDevice, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScaleDevice);
  } else {
    setTimeout(initScaleDevice, 100);
  }

  // ── Auto-size dropdowns to stretch to col-right edge ──
  document.addEventListener('click', function(e) {
    var badge = e.target.closest('.badge-device');
    if (!badge) return;
    var wrap = badge.closest('.device-dropdown-wrap');
    var dropdown = wrap ? wrap.querySelector('.device-dropdown') : null;
    var colRight = badge.closest('.col-right');
    if (!dropdown || !colRight) return;

    var colRect = colRight.getBoundingClientRect();
    var wrapRect = wrap.getBoundingClientRect();
    dropdown.style.width = (colRect.right - wrapRect.left) + 'px';
  });

  // ── Meta icons ──
  function metaIcon(name) {
    return '<span class="material-symbols-outlined" style="font-size:16px;line-height:1;color:#535862;">' + name + '</span>';
  }
  var META_ICONS = {
    owner: metaIcon('group'),
    status: metaIcon('info'),
    file: metaIcon('attach_file'),
    device: metaIcon('smartphone'),
    time: metaIcon('schedule'),
    screen: metaIcon('desktop_windows'),
    character: metaIcon('person'),
    download: '<span class="material-symbols-outlined" style="font-size:16px;line-height:1;color:#717680;">download</span>',
    chevron: '<span class="material-symbols-outlined" style="font-size:12px;line-height:1;color:#414651;">expand_more</span>'
  };

  // ── Build metadata from window.DS_META ──
  function buildMetadata() {
    var meta = window.DS_META;
    if (!meta) return;
    var colRight = document.querySelector('.col-right');
    if (!colRight) return;

    var html = '';

    // Title
    html += '<h1 class="page-title">' + meta.title + '</h1>';

    // Description
    if (meta.desc) {
      html += '<p class="page-desc">' + meta.desc + '</p>';
    }

    // Meta rows
    html += '<div class="meta-rows">';

    // Owner
    if (meta.owner) {
      html += '<div class="meta-row">';
      html += '<div class="meta-icon">' + META_ICONS.owner + '</div>';
      html += '<div class="meta-label">Owner</div>';
      html += '<div class="meta-value">' + meta.owner + '</div>';
      html += '</div>';
    }

    // Status
    if (meta.status) {
      html += '<div class="meta-row">';
      html += '<div class="meta-icon">' + META_ICONS.status + '</div>';
      html += '<div class="meta-label">Status</div>';
      html += '<div class="meta-value"><span class="badge badge-green">' + meta.status + '</span></div>';
      html += '</div>';
    }

    // Rive file
    if (meta.rive) {
      html += '<div class="meta-row">';
      html += '<div class="meta-icon">' + META_ICONS.file + '</div>';
      html += '<div class="meta-label">Rive file</div>';
      html += '<div class="meta-value">';
      html += '<span class="badge badge-gray">' + meta.rive + '</span>';
      html += '<a class="btn-download" href="/kid-design-system/' + meta.rive + '" download>' + META_ICONS.download + '</a>';
      html += '</div></div>';
    }

    // Skill
    if (meta.skill) {
      html += '<div class="meta-row">';
      html += '<div class="meta-icon">' + META_ICONS.file + '</div>';
      html += '<div class="meta-label">Skill</div>';
      html += '<div class="meta-value">';
      html += '<span class="badge badge-gray">' + meta.skill + '</span>';
      html += '<a class="btn-download" href="/kid-design-system/resources/' + meta.skill + '" download>' + META_ICONS.download + '</a>';
      html += '</div></div>';
    }

    // Sound
    if (meta.sound) {
      html += '<div class="meta-row">';
      html += '<div class="meta-icon">' + META_ICONS.file + '</div>';
      html += '<div class="meta-label">Sound</div>';
      html += '<div class="meta-value">';
      html += '<span class="badge badge-gray">' + meta.sound + '</span>';
      html += '<a class="btn-download" href="/product-explorer/assets/' + meta.sound + '" download>' + META_ICONS.download + '</a>';
      html += '</div></div>';
    }

    // Device
    if (meta.device) {
      html += '<div class="meta-row">';
      html += '<div class="meta-icon">' + META_ICONS.device + '</div>';
      html += '<div class="meta-label">Device</div>';
      html += '<div class="meta-value">';
      if (Array.isArray(meta.device)) {
        var devDefault = meta.deviceDefault || meta.device[0];
        html += '<div class="device-dropdown-wrap" id="device-dropdown-wrap">';
        html += '<span class="badge badge-gray badge-device" id="device-badge" onclick="toggleMetaDropdown(event,\'device-dropdown\')">';
        html += '<span id="device-badge-text">' + devDefault + '</span>' + META_ICONS.chevron;
        html += '</span>';
        html += '<div class="device-dropdown" id="device-dropdown">';
        html += '<div class="device-dropdown-header">Select an option</div>';
        for (var d = 0; d < meta.device.length; d++) {
          var dActive = meta.device[d] === devDefault ? ' active' : '';
          html += '<button class="device-dropdown-item' + dActive + '" data-device="' + meta.device[d].toLowerCase() + '" onclick="selectMetaOption(\'device\',' + d + ',this)">' + meta.device[d] + '</button>';
        }
        html += '</div></div>';
      } else {
        html += '<span class="badge badge-gray">' + meta.device + '</span>';
      }
      html += '</div></div>';
    }

    // Character
    if (meta.character) {
      html += '<div class="meta-row">';
      html += '<div class="meta-icon">' + META_ICONS.character + '</div>';
      html += '<div class="meta-label">Character</div>';
      html += '<div class="meta-value">';
      if (Array.isArray(meta.character)) {
        var charDefault = meta.characterDefault || meta.character[0];
        html += '<div class="device-dropdown-wrap" id="character-dropdown-wrap">';
        html += '<span class="badge badge-gray badge-device" id="character-badge" onclick="toggleMetaDropdown(event,\'character-dropdown\')">';
        html += '<span id="character-badge-text">' + charDefault + '</span>' + META_ICONS.chevron;
        html += '</span>';
        html += '<div class="device-dropdown" id="character-dropdown">';
        html += '<div class="device-dropdown-header">Select a character</div>';
        for (var c = 0; c < meta.character.length; c++) {
          var cActive = meta.character[c] === charDefault ? ' active' : '';
          html += '<button class="device-dropdown-item' + cActive + '" data-character="' + meta.character[c].toLowerCase() + '" onclick="selectMetaOption(\'character\',' + c + ',this)">' + meta.character[c] + '</button>';
        }
        html += '</div></div>';
      } else {
        html += '<span class="badge badge-gray">' + meta.character + '</span>';
      }
      html += '</div></div>';
    }

    // Time dropdown
    if (meta.time && Array.isArray(meta.time)) {
      var timeDefault = meta.timeDefault || meta.time[0];
      html += '<div class="meta-row">';
      html += '<div class="meta-icon">' + META_ICONS.time + '</div>';
      html += '<div class="meta-label">Time</div>';
      html += '<div class="meta-value">';
      html += '<div class="device-dropdown-wrap" id="time-dropdown-wrap">';
      html += '<span class="badge badge-gray badge-device" onclick="toggleMetaDropdown(event,\'time-dropdown\')">';
      html += '<span id="time-badge-text">' + timeDefault + '</span>' + META_ICONS.chevron;
      html += '</span>';
      html += '<div class="device-dropdown" id="time-dropdown">';
      html += '<div class="device-dropdown-header">Select an option</div>';
      for (var t = 0; t < meta.time.length; t++) {
        var tActive = meta.time[t] === timeDefault ? ' active' : '';
        html += '<button class="device-dropdown-item' + tActive + '" data-value="' + meta.time[t] + '" onclick="selectMetaOption(\'time\',' + t + ',this)">' + meta.time[t] + '</button>';
      }
      html += '</div></div></div></div>';
    }

    // Screen dropdown
    if (meta.screen && Array.isArray(meta.screen)) {
      var screenDefault = meta.screenDefault || 0;
      html += '<div class="meta-row">';
      html += '<div class="meta-icon">' + META_ICONS.screen + '</div>';
      html += '<div class="meta-label">Screen</div>';
      html += '<div class="meta-value">';
      html += '<div class="device-dropdown-wrap" id="screen-dropdown-wrap">';
      html += '<span class="badge badge-gray badge-device" onclick="toggleMetaDropdown(event,\'screen-dropdown\')">';
      html += '<span id="screen-badge-text">' + meta.screen[screenDefault] + '</span>' + META_ICONS.chevron;
      html += '</span>';
      html += '<div class="device-dropdown" id="screen-dropdown">';
      html += '<div class="device-dropdown-header">Select a screen</div>';
      for (var s = 0; s < meta.screen.length; s++) {
        var sActive = s === screenDefault ? ' active' : '';
        html += '<button class="device-dropdown-item' + sActive + '" data-index="' + s + '" onclick="selectMetaOption(\'screen\',' + s + ',this)">' + meta.screen[s] + '</button>';
      }
      html += '</div></div></div></div>';
    }

    html += '</div>'; // /meta-rows

    // Notes (free-form HTML below metadata)
    if (meta.notes) {
      html += '<div class="page-notes">' + meta.notes + '</div>';
    }

    colRight.innerHTML = html;
  }

  // ── Global dropdown toggle ──
  window.toggleMetaDropdown = function(e, dropdownId) {
    e.stopPropagation();
    // Close all other dropdowns first
    document.querySelectorAll('.device-dropdown.open').forEach(function(dd) {
      if (dd.id !== dropdownId) dd.classList.remove('open');
    });
    var dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    // Auto-size to stretch to col-right edge
    var wrap = dropdown.closest('.device-dropdown-wrap');
    var colRight = dropdown.closest('.col-right');
    if (wrap && colRight) {
      var colRect = colRight.getBoundingClientRect();
      var wrapRect = wrap.getBoundingClientRect();
      dropdown.style.width = (colRect.right - wrapRect.left) + 'px';
    }

    dropdown.classList.toggle('open');
  };

  // ── Global dropdown selection ──
  window.selectMetaOption = function(type, index, btn) {
    var dropdown = btn.closest('.device-dropdown');
    var wrap = btn.closest('.device-dropdown-wrap');
    var badgeText = wrap.querySelector('[id$="-badge-text"]');

    // Update badge text
    if (badgeText) badgeText.textContent = btn.textContent;

    // Update active state
    dropdown.querySelectorAll('.device-dropdown-item').forEach(function(item) {
      item.classList.remove('active');
    });
    btn.classList.add('active');
    dropdown.classList.remove('open');

    // Call page-specific handler if defined
    if (type === 'device' && window.onDeviceChange) {
      window.onDeviceChange(btn.getAttribute('data-device'));
    }
    if (type === 'time' && window.onTimeChange) {
      window.onTimeChange(btn.getAttribute('data-value'));
    }
    if (type === 'character' && window.onCharacterChange) {
      window.onCharacterChange(btn.getAttribute('data-character'));
    }
    if (type === 'screen' && window.onScreenChange) {
      window.onScreenChange(index);
    }
  };

  // Close dropdowns on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.device-dropdown-wrap')) {
      document.querySelectorAll('.device-dropdown.open').forEach(function(dd) {
        dd.classList.remove('open');
      });
    }
  });

  // Build metadata if config exists
  if (window.DS_META) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', buildMetadata);
    } else {
      buildMetadata();
    }
  }
})();
