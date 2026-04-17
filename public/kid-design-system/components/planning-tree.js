/* ═══════════════════════════════════════════════════
   Sprout Design System — Planning Tree Component JS
   Builds the DOM for a multi-step planning card.
   Requires: planning-tree.css
   Figma 20971:59564
   ═══════════════════════════════════════════════════ */

// ── SVG icons ──
var PLAN_ICON_CLIPBOARD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>';
var PLAN_ICON_CIRCLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>';
var PLAN_ICON_SPINNER = '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#e9eaeb" stroke-width="2.5"/><path d="M10 2a8 8 0 0 1 8 8" stroke="#0ba5ec" stroke-width="2.5" stroke-linecap="round"/></svg>';
var PLAN_ICON_CHECK = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2.5 6 5 8.5 9.5 3.5"/></svg>';
var PLAN_ICON_X = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="3" x2="9" y2="9"/><line x1="9" y1="3" x2="3" y2="9"/></svg>';
var PLAN_ICON_DOT = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="4"/></svg>';

/**
 * Build a Planning Tree card (Figma 20971:59564).
 * @param {string} title - Header title text
 * @param {Array<{title:string, desc?:string, status?:string}>} steps
 *   status: 'pending' | 'active' | 'done' | 'revised' | 'fail'
 * @returns {HTMLElement}
 */
function createPlanningTree(title, steps) {
  var card = document.createElement('div');
  card.className = 'planning-tree';

  // Header
  var header = document.createElement('div');
  header.className = 'planning-tree-header';
  var headerIcon = document.createElement('div');
  headerIcon.className = 'planning-tree-header-icon';
  headerIcon.innerHTML = PLAN_ICON_CLIPBOARD;
  var headerTitle = document.createElement('div');
  headerTitle.className = 'planning-tree-title';
  headerTitle.textContent = title;
  header.appendChild(headerIcon);
  header.appendChild(headerTitle);
  card.appendChild(header);

  // Body
  var body = document.createElement('div');
  body.className = 'planning-tree-body';

  var iconMap = {
    pending: PLAN_ICON_CIRCLE,
    active: PLAN_ICON_SPINNER,
    done: PLAN_ICON_CHECK,
    revised: PLAN_ICON_DOT,
    fail: PLAN_ICON_X
  };

  steps.forEach(function(step) {
    var status = step.status || 'pending';
    var item = document.createElement('div');
    item.className = 'planning-item ' + status;

    var icon = document.createElement('div');
    icon.className = 'planning-item-icon';
    icon.innerHTML = iconMap[status] || iconMap.pending;
    item.appendChild(icon);

    var content = document.createElement('div');
    content.className = 'planning-item-content';
    var titleEl = document.createElement('div');
    titleEl.className = 'planning-item-title';
    titleEl.textContent = step.title;
    content.appendChild(titleEl);
    if (step.desc) {
      var descEl = document.createElement('div');
      descEl.className = 'planning-item-desc';
      descEl.textContent = step.desc;
      content.appendChild(descEl);
    }
    item.appendChild(content);
    body.appendChild(item);
  });

  card.appendChild(body);
  return card;
}
