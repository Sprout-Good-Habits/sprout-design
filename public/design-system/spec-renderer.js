/* ═══════════════════════════════════════════════════
   Sprout Design System — Spec Renderer
   Reorders hand-written doc-sections into a canonical
   structure and injects JSON-LD spec enrichments.
   ═══════════════════════════════════════════════════ */

(function () {
  var script = document.querySelector('script[type="application/ld+json"]');
  if (!script) return;

  var spec;
  try { spec = JSON.parse(script.textContent); } catch (e) { return; }
  if (spec['@type'] !== 'DesignComponent') return;

  /* ── Helpers ── */

  function humanize(slug) {
    var words = slug.replace(/-/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  var DISPLAY_OVERRIDES = {
    'PasscodeInput': 'Input Passcode'
  };

  function unCamel(name) {
    if (DISPLAY_OVERRIDES[name]) return DISPLAY_OVERRIDES[name];
    return name.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  function joinList(arr) {
    if (arr.length <= 1) return arr.join('');
    return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
  }

  function chip(text, cls) {
    return '<span class="spec-chip' + (cls ? ' ' + cls : '') + '">' + text + '</span>';
  }

  function sentimentClass(s) {
    if (s === 'positive' || s === 'encouraging') return 'spec-chip-green';
    if (s === 'destructive' || s === 'negative') return 'spec-chip-red';
    if (s === 'informational' || s === 'cautionary') return 'spec-chip-blue';
    return '';
  }

  // PascalCase → kebab-case slug, with overrides for irregular names
  var SLUG_OVERRIDES = {
    'Button': 'buttons',
    'Input': 'inputs',
    'Background': 'backgrounds',
    'LoadingIndicator': 'loading',
    'SocialButton': 'social-buttons'
  };

  function toSlug(name) {
    if (SLUG_OVERRIDES[name]) return SLUG_OVERRIDES[name];
    return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  // Insert enrichment HTML into a section after h2 (optionally after its <p>)
  function insertEnrichment(section, html, afterDesc) {
    var h2 = section.querySelector('h2');
    if (!h2) return;
    var ref = h2.nextElementSibling;
    if (afterDesc && ref && ref.tagName === 'P') {
      ref = ref.nextElementSibling;
    }
    var wrapper = document.createElement('div');
    wrapper.className = 'spec-enrichment';
    wrapper.innerHTML = html;
    section.insertBefore(wrapper, ref);
  }

  /* ── Section classification ── */

  var BUCKET_ORDER = ['PURPOSE', 'VARIANTS', 'ANATOMY', 'SUPPLEMENTARY', 'ACCESSIBILITY', 'REFERENCE', 'RELATIONSHIPS'];

  var EXACT_MAP = {
    'when to use': 'PURPOSE',
    'when not to use': 'PURPOSE',
    'types': 'VARIANTS', 'hierarchy': 'VARIANTS', 'variants': 'VARIANTS',
    'sizes': 'VARIANTS', 'icons': 'VARIANTS', 'inline variants': 'VARIANTS',
    'full-screen': 'VARIANTS', 'social buttons': 'VARIANTS',
    'toolbar styles': 'VARIANTS', 'leading elements': 'VARIANTS',
    'cta configurations': 'VARIANTS', 'action configurations': 'VARIANTS',
    'footer variations': 'VARIANTS',
    'anatomy': 'ANATOMY', 'states': 'ANATOMY', 'with description': 'ANATOMY',
    'with label': 'ANATOMY', 'radio group': 'ANATOMY', 'with message': 'ANATOMY',
    'progress states': 'ANATOMY', 'label': 'ANATOMY', 'title content': 'ANATOMY',
    'with supporting text': 'ANATOMY',
    'accessibility': 'ACCESSIBILITY', 'disabled states': 'ACCESSIBILITY',
    'token reference': 'REFERENCE', 'properties': 'REFERENCE',
    'color tokens': 'REFERENCE', 'usage context': 'REFERENCE',
    'style mapping': 'REFERENCE',
    'interaction': 'SUPPLEMENTARY', 'placement': 'SUPPLEMENTARY',
    'content': 'SUPPLEMENTARY', 'content guidelines': 'SUPPLEMENTARY',
    'stacking': 'SUPPLEMENTARY', 'empty state': 'SUPPLEMENTARY',
    'common examples': 'SUPPLEMENTARY', 'toolbar context': 'SUPPLEMENTARY',
    'preferred icons': 'SUPPLEMENTARY', 'scroll behavior': 'SUPPLEMENTARY',
    'layout rules': 'SUPPLEMENTARY', 'interactive demo': 'SUPPLEMENTARY',
    'examples': 'SUPPLEMENTARY', 'full interactive demo': 'SUPPLEMENTARY'
  };

  var SUPP_PREFIXES = ['animation', 'scrolling', 'dismissing', 'in context', 'sub-component:', 'future:'];

  function classify(h2Text) {
    var t = h2Text.toLowerCase().trim();
    if (EXACT_MAP[t]) return EXACT_MAP[t];
    for (var i = 0; i < SUPP_PREFIXES.length; i++) {
      if (t.indexOf(SUPP_PREFIXES[i]) === 0) return 'SUPPLEMENTARY';
    }
    return 'SUPPLEMENTARY';
  }

  /* ── Collect & classify all doc-sections ── */

  var allSections = document.querySelectorAll('.doc-section');
  if (!allSections.length) return;

  var container = allSections[0].parentNode;
  var lastUpdated = container.querySelector('.last-updated');

  var buckets = {};
  for (var i = 0; i < BUCKET_ORDER.length; i++) buckets[BUCKET_ORDER[i]] = [];

  for (var i = 0; i < allSections.length; i++) {
    var sec = allSections[i];
    var h2 = sec.querySelector('h2');
    if (!h2) { buckets.SUPPLEMENTARY.push(sec); continue; }
    buckets[classify(h2.textContent)].push(sec);
  }

  // Sort ACCESSIBILITY bucket: "Accessibility" before "Disabled states"
  if (buckets.ACCESSIBILITY.length > 1) {
    buckets.ACCESSIBILITY.sort(function (a, b) {
      var aH = a.querySelector('h2').textContent.toLowerCase().trim();
      var bH = b.querySelector('h2').textContent.toLowerCase().trim();
      if (aH === 'accessibility') return -1;
      if (bH === 'accessibility') return 1;
      return 0;
    });
  }

  /* ── Inject spec enrichments ── */

  // 1. Purpose — add only structured metadata not covered by hand-written prose
  //    (skip spec.intent.purpose — it restates the section intro)
  if (buckets.PURPOSE.length && spec.intent) {
    var html = '';
    if (spec.intent.sentiment && spec.intent.sentiment.length) {
      html += '<div class="spec-chips">';
      for (var i = 0; i < spec.intent.sentiment.length; i++) {
        var s = spec.intent.sentiment[i];
        html += chip(s.charAt(0).toUpperCase() + s.slice(1), sentimentClass(s));
      }
      html += '</div>';
    }
    if (spec.context) {
      var ctx = spec.context;
      var parts = [];
      if (ctx.modality && ctx.modality.length) {
        parts.push('Designed for <strong>' + joinList(ctx.modality) + '</strong>');
      }
      if (ctx.density && ctx.density.length) {
        var d = joinList(ctx.density);
        if (parts.length) parts[parts.length - 1] += ' at <strong>' + d + '</strong> density';
        else parts.push('Uses <strong>' + d + '</strong> density');
      }
      if (ctx.placement && ctx.placement.length) {
        parts.push('Place <strong>' + joinList(ctx.placement.map(humanize).map(function (s) { return s.toLowerCase(); })) + '</strong>');
      }
      if (parts.length) html += '<p class="spec-prose">' + parts.join('. ') + '.</p>';
    }
    if (html) insertEnrichment(buckets.PURPOSE[0], html, true);
  }

  // 2. Variants — h3 per variant with description, pair-with, limit
  //    Skip if variant sections already have h3 subsections (hand-written content is richer)
  if (buckets.VARIANTS.length) {
    var existingH3s = false;
    for (var i = 0; i < buckets.VARIANTS.length; i++) {
      if (buckets.VARIANTS[i].querySelector('h3')) { existingH3s = true; break; }
    }
    if (!existingH3s) {
      var html = '';
      if (spec.variants && spec.variants.length) {
        for (var i = 0; i < spec.variants.length; i++) {
          var v = spec.variants[i];
          html += '<div class="spec-variant-item">';
          html += '<h3>' + v.name;
          if (v.sentiment) html += ' ' + chip(v.sentiment.charAt(0).toUpperCase() + v.sentiment.slice(1), sentimentClass(v.sentiment));
          html += '</h3>';
          if (v.useWhen) html += '<p class="spec-variant-desc">' + v.useWhen + '</p>';
          if (v.pairWith && v.pairWith.length) html += '<p class="spec-variant-meta">Pair with: ' + v.pairWith.join(', ') + '</p>';
          if (v.limit) html += '<p class="spec-variant-meta">Limit: ' + v.limit + '</p>';
          html += '</div>';
        }
      }
      if (spec.sizes && spec.sizes.length && (spec.sizes.length > 1 || (spec.sizes[0] && spec.sizes[0].name !== 'Default'))) {
        for (var i = 0; i < spec.sizes.length; i++) {
          var sz = spec.sizes[i];
          html += '<div class="spec-variant-item">';
          html += '<h3>' + sz.name + '</h3>';
          if (sz.useWhen) html += '<p class="spec-variant-desc">' + sz.useWhen + '</p>';
          html += '</div>';
        }
      }
      if (html) insertEnrichment(buckets.VARIANTS[0], html, true);
    }
  }

  // 3. Anatomy — prepend composition list only (skip state chips — hand-written state grids cover this)
  if (buckets.ANATOMY.length && spec.composition) {
    var c = spec.composition;
    var html = '<div class="prose"><ul>';
    if (c.requires && c.requires.length) html += '<li><span style="color:var(--green-500,#17b26a)">&#10003;</span> <strong>Requires</strong> &mdash; ' + c.requires.map(humanize).join(', ') + '</li>';
    if (c.allows && c.allows.length) html += '<li><span style="color:var(--text-quaternary,#717680)">~</span> <strong>Allows</strong> &mdash; ' + c.allows.map(humanize).join(', ') + '</li>';
    if (c.forbids && c.forbids.length) html += '<li><span style="color:var(--red-500,#f04438)">&#10007;</span> <strong>Forbids</strong> &mdash; ' + c.forbids.map(humanize).join(', ') + '</li>';
    html += '</ul></div>';
    insertEnrichment(buckets.ANATOMY[0], html, true);
  }

  // 4. Accessibility — skip enrichment; hand-written sections are always more detailed

  // 5. Relationships — generate gallery cards matching overview page
  var COMPONENT_THUMBS = {
    'ActionPrompt': {
      desc: 'Contextual prompts with CTAs',
      thumb: '<div class="thumb-action-prompt"><div class="thumb-action-prompt-header"><span class="thumb-action-prompt-emoji">\u2B50</span><div class="thumb-action-prompt-text"><span></span><span></span></div></div><div class="thumb-action-prompt-btns"><span></span><span></span></div></div>'
    },
    'AvatarGroup': {
      desc: 'Stacked user avatars',
      thumb: '<div class="thumb-avatar-group"><span style="background:var(--brand-200,#b9e6fe)"></span><span style="background:var(--sprout-200,#ceeab0)"></span><span style="background:var(--violet-200,#ddd6fe)"></span></div>'
    },
    'Background': {
      desc: 'App canvas and branded surfaces',
      thumb: '<div class="thumb-backgrounds"><div class="thumb-bg-sky"></div><div class="thumb-bg-grass-edge"></div><div class="thumb-bg-grass-fill"></div></div>'
    },
    'ButtonUtility': {
      desc: 'Pill-shaped icon actions',
      thumb: '<div class="thumb-btn-util"><div class="thumb-btn-util-pill">\u2B50</div><div class="thumb-btn-util-pill">\uD83C\uDFAF</div></div>'
    },
    'Button': {
      desc: 'Primary, secondary, and destructive',
      thumb: '<div class="thumb-buttons"><span class="thumb-btn-primary"></span><span class="thumb-btn-secondary"></span><span class="thumb-btn-destructive"></span></div>'
    },
    'Checkbox': {
      desc: 'Multi-select toggle controls',
      thumb: '<div class="thumb-checkbox"><div class="thumb-checkbox-box thumb-checkbox-on"></div><div class="thumb-checkbox-box thumb-checkbox-on"></div><div class="thumb-checkbox-box thumb-checkbox-off"></div></div>'
    },
    'Input': {
      desc: 'Text fields and form controls',
      thumb: '<div class="thumb-input"><div class="thumb-input-label"></div><div class="thumb-input-field"><div class="thumb-input-cursor"></div></div></div>'
    },
    'ListItem': {
      desc: 'Rows with icons, labels, actions',
      thumb: '<div class="thumb-list-item"><div class="thumb-list-row"><div class="thumb-list-icon">\u2B50</div><div class="thumb-list-lines"><span></span><span></span></div><span class="thumb-list-chevron">\u203A</span></div><div class="thumb-list-row"><div class="thumb-list-icon">\uD83C\uDFAF</div><div class="thumb-list-lines"><span></span><span></span></div><span class="thumb-list-chevron">\u203A</span></div></div>'
    },
    'Loading': {
      desc: 'Spinners and progress indicators',
      thumb: '<div class="thumb-loading"><div class="thumb-spinner"></div><div class="thumb-spinner thumb-spinner-sm"></div></div>'
    },
    'LoadingIndicator': {
      desc: 'Spinners and progress indicators',
      thumb: '<div class="thumb-loading"><div class="thumb-spinner"></div><div class="thumb-spinner thumb-spinner-sm"></div></div>'
    },
    'PasscodeInput': {
      desc: 'PIN and code entry fields',
      thumb: '<div class="thumb-passcode"><div class="thumb-passcode-cell filled">3</div><div class="thumb-passcode-cell filled">7</div><div class="thumb-passcode-cell focus"></div><div class="thumb-passcode-cell"></div></div>'
    },
    'ProgressBar': {
      desc: 'Linear progress indicators',
      thumb: '<div class="thumb-progress"><div class="thumb-progress-track"><div class="thumb-progress-fill" style="width:72%"></div></div><div class="thumb-progress-track"><div class="thumb-progress-fill" style="width:40%;background:var(--sprout-400,#86cb3c)"></div></div></div>'
    },
    'Radio': {
      desc: 'Single-select option controls',
      thumb: '<div class="thumb-radio"><div class="thumb-radio-circle thumb-radio-on"></div><div class="thumb-radio-circle thumb-radio-off"></div><div class="thumb-radio-circle thumb-radio-off"></div></div>'
    },
    'Sheet': {
      desc: 'Bottom sheet overlays',
      thumb: '<div class="thumb-sheet"><div class="thumb-sheet-overlay"></div><div class="thumb-sheet-card"><div class="thumb-sheet-handle"></div><div class="thumb-sheet-lines"><span></span><span></span></div></div></div>'
    },
    'SocialButton': {
      desc: 'Third-party sign-in buttons',
      thumb: '<div class="thumb-social-btns"><span class="thumb-social-btn"><span class="thumb-social-icon">G</span></span><span class="thumb-social-btn thumb-social-apple"><span class="thumb-social-icon">\uF8FF</span></span></div>'
    },
    'Switch': {
      desc: 'On/off toggle controls',
      thumb: '<div class="thumb-switch"><div class="thumb-switch-track thumb-switch-on"><div class="thumb-switch-thumb"></div></div><div class="thumb-switch-track thumb-switch-off"><div class="thumb-switch-thumb"></div></div></div>'
    },
    'Toast': {
      desc: 'Temporary notifications',
      thumb: '<div class="thumb-toast"><div class="thumb-toast-icon"></div><div class="thumb-toast-content"><span></span><span></span></div></div>'
    },
    'Toolbar': {
      desc: 'Bottom action bars',
      thumb: '<div class="thumb-toolbar"><div class="thumb-toolbar-item"><div class="thumb-toolbar-dot"></div><div class="thumb-toolbar-line"></div></div><div class="thumb-toolbar-item"><div class="thumb-toolbar-dot active"></div><div class="thumb-toolbar-line active"></div></div><div class="thumb-toolbar-item"><div class="thumb-toolbar-dot"></div><div class="thumb-toolbar-line"></div></div></div>'
    }
  };

  if (spec.relationships) {
    var r = spec.relationships;
    var allItems = [];
    function collectItems(items, label) {
      if (!items || !items.length) return;
      for (var j = 0; j < items.length; j++) {
        allItems.push({ name: items[j], type: label });
      }
    }
    collectItems(r.related, 'Related');
    collectItems(r.escalatesTo, 'Escalates to');
    collectItems(r.degradesTo, 'Degrades to');
    collectItems(r.groupsWith, 'Groups with');

    if (allItems.length) {
      var relSection = document.createElement('div');
      relSection.className = 'doc-section';
      var relHtml = '<h2>Relationships</h2>';
      relHtml += '<div class="gallery-grid">';
      for (var j = 0; j < allItems.length; j++) {
        var item = allItems[j];
        var slug = toSlug(item.name);
        var info = COMPONENT_THUMBS[item.name] || { desc: '', thumb: '' };
        var displayName = unCamel(item.name);
        var href = '/components/' + slug + '.html';
        relHtml += '<a class="gallery-card" href="' + href + '">';
        relHtml += '<div class="gallery-thumb">' + info.thumb + '</div>';
        relHtml += '<div class="gallery-body">';
        relHtml += '<div class="gallery-title">' + displayName + '</div>';
        relHtml += '<div class="gallery-desc">' + info.desc + '</div>';
        relHtml += '</div></a>';
      }
      relHtml += '</div>';
      relSection.innerHTML = relHtml;
      buckets.RELATIONSHIPS.push(relSection);
    }
  }

  /* ── Reorder all sections by bucket order ── */
  for (var b = 0; b < BUCKET_ORDER.length; b++) {
    var secs = buckets[BUCKET_ORDER[b]];
    for (var i = 0; i < secs.length; i++) {
      container.insertBefore(secs[i], lastUpdated);
    }
  }
})();
