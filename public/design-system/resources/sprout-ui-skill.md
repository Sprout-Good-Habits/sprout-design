---
name: sprout-ui
description: Build Sprout product screens using the design system. Use when creating prototypes, product screens, or any UI that should look and feel like the Sprout app. Covers component selection, tokens, layout patterns, and accessibility.
---

# Sprout UI — Build with the Design System

Use this skill when building product screens, prototypes, or features that should look like the real Sprout app. This is NOT for editing the design system docs — it's for **using** the design system to build things.

**IMPORTANT — Always use the design system.** Whether you are building a new screen from scratch, recreating an existing screen from a URL, or implementing from a Figma design — always build with the documented components, tokens, and patterns below. Never copy source code from an existing implementation and use it as-is. The existing implementation may predate the design system or use ad-hoc styles. Instead, treat any reference screen as a **visual spec**: understand *what* it shows (layout, content, interactions), then rebuild it using the design system.

## Setup

Every Sprout product page needs these in the `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://sprout-hub-preview.vercel.app/design-system/tokens.css">
<script src="https://unpkg.com/@rive-app/canvas@2.35.2"></script>
```

TossFace emoji font (used instead of system emoji everywhere):
```css
@font-face {
  font-family: 'TossFace';
  src: url('https://static.toss.im/tossface-font/TossFaceFontWeb.otf') format('opentype');
  font-display: swap;
}
.tf-icon {
  font-family: 'TossFace', sans-serif;
  font-size: 24px; line-height: 1;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
```

## Golden Rules

1. **Never hardcode colors.** Always use `var(--token-name)` from tokens.css.
2. **Always use TossFace** for emoji — never system emoji. Use `.tf-icon` class with unicode codepoints.
3. **One Primary button per screen.** If you need more actions, use Secondary or ButtonUtility.
4. **44px minimum touch target** on all interactive elements.
5. **Pair font size + line height tokens.** E.g. `font-size: var(--font-size-text-md)` with `line-height: var(--line-height-text-md)`.
6. **Always include the Sprout character** on screens with the branded background.
7. **Inside Sheets, only use documented components.** Never create custom or ad-hoc components (e.g. pills, chips, custom buttons). Always translate the design intent through the Component Lookup table — use Tile for selections, Button for actions, Input for text entry, etc.
8. **Always reference existing implementations first.** Before writing character positioning, canvas sizing, or Rive init code, search the codebase for a working example (e.g. `product-explorer/kid-home/timeline.html` for Sprout, `components/avatar.html` for Village Character). Copy the exact values — never guess.
9. **Characters are always grounded.** The bottom edge of the container always clips the character. It is never floating in empty space. This applies everywhere — avatars, profile banners, loading screens, home screens.

---

## Foundations

### Background (Main variant)

IMPORTANT: Every full-screen Sprout kid view uses the branded background. It is NOT a gradient — it is a flat `--bg-sky` fill with a CSS-only grass strip at the bottom.

**Structure:** sky fill → scrollable content (z-index:1) → grass (z-index:2) → Rive character (z-index:3)

```html
<div class="screen-sky">
  <!-- toolbar, scroll content, etc. go here -->

  <!-- Sprout character — always include on branded backgrounds -->
  <canvas id="sprout-rive" class="rive-canvas" width="780" height="780"></canvas>

  <!-- Grass — always at bottom -->
  <div class="grass-container">
    <div class="grass-edge"></div>
    <div class="grass-fill"></div>
  </div>
</div>
```

```css
/* Sky fill — flat color, NOT a gradient */
.screen-sky {
  background: var(--bg-sky, #e0f2fe);
  flex: 1; display: flex; flex-direction: column;
  position: relative; overflow: hidden; min-height: 0;
}

/* Grass — CSS rounded-top edge + solid fill */
.grass-container { flex-shrink: 0; position: relative; z-index: 2; }
.grass-edge {
  height: 24px;
  border-radius: var(--radius-4xl, 24px) var(--radius-4xl, 24px) 0 0;
  background: var(--bg-grass, #86cb3c);
}
.grass-fill {
  height: 48px;
  background: var(--bg-grass, #86cb3c);
}
```

**Alt variant** (auth, splash, onboarding): same structure but `.grass-fill { height: 375px; }` for taller grass.

**IMPORTANT — scroll behavior differs by variant:**

- **Main variant:** Content scrolls *behind* the grass and character (they stay pinned at the bottom). The scroll container needs large bottom padding (e.g. `padding-bottom: 360px`) so all content can be scrolled fully above the grass/character area. The character and grass remain visible at all times.
- **Alt variant:** Content sits *on top of* the tall grass area and scrolls normally — the entire page scrolls together. When the user scrolls down, the character and grass scroll away off-screen like regular content. No extra bottom padding needed.

**IMPORTANT — grass pinning:** The `.screen-sky` is `display:flex; flex-direction:column`. The grass stays at the bottom because a `flex:1` element (scroll area, spacer, or content) pushes it down. If there is no scroll content (e.g. a Sheet overlay covers the screen), you MUST add `<div style="flex:1"></div>` between the toolbar and the Rive canvas. Without this, the grass floats up to just below the toolbar.

### Character (Rive)

IMPORTANT: The Sprout character is a Rive animation that must appear on every screen with the branded background. It stands on the grass edge.

**Rive file:** `/sprout-character.riv` — must be the same file from the design system Resources.

**Canvas CSS — exact spec from the documentation:**
```css
.rive-canvas {
  position: absolute;
  left: 50%;
  bottom: -46px;
  width: SCREEN_WIDTH;   /* match phone frame width, e.g. 390px */
  height: SCREEN_WIDTH;  /* square — same as width */
  z-index: 3;
  pointer-events: none;
  transform: translateX(-50%) scale(1.25);
  transform-origin: bottom center;
}
```

- Canvas is always **square** to the screen width
- `scale(1.25)` from `bottom center` makes Sprout the right size
- `bottom: -46px` positions feet on the grass edge (shadow overlaps grass)
- `z-index: 3` — Sprout must be ABOVE the grass (`z-index: 2`) and above scrollable content (`z-index: 1`). Scrollable content passes BEHIND grass and Sprout.

**Rive initialization:**
```js
new rive.Rive({
  src: '/sprout-character.riv',
  canvas: document.getElementById('sprout-rive'),
  autoplay: true,
  stateMachines: 'State Machine 1',
  fit: rive.Fit.Contain,
  alignment: rive.Alignment.BottomCenter
});
```

**CORS note:** The Rive file must be served from the same origin. For local dev, copy it locally. For deployed prototypes, include it in the project's public assets.

### Village Character (Rive)

The Village Character represents family members. It uses a different Rive file from Sprout with deep customization (skin, hair, beard, clothing).

**Rive file:** `/character2.8.riv` — artboard: `Village-character`, state machine: `State Machine 1`.

**IMPORTANT — Reference implementations:**
- **Avatars (XS–XL):** See `components/avatar.html` for exact canvas sizes and top offsets per size
- **Profile banner:** See `components/avatar-profile.html` for the full-width hero placement
- **Customizer:** See `product-explorer/customize-avatar.html` for the full character view

**Avatar circle positioning — exact spec:**
```css
/* Base rule */
.avatar canvas {
  position: absolute;
  left: 50%; transform: translateX(-50%);
  display: block; pointer-events: none;
}
/* Per-size (width, height, top offset) */
.avatar-xs canvas { width:35px;  height:50px;  top:-14px; }
.avatar-sm canvas { width:46px;  height:66px;  top:-19px; }
.avatar-md canvas { width:58px;  height:83px;  top:-23px; }
.avatar-lg canvas { width:69px;  height:99px;  top:-28px; }
.avatar-xl canvas { width:81px;  height:116px; top:-33px; }
```

**Rive initialization:**
```js
var r;
r = new rive.Rive({
  src: '/character2.8.riv',
  canvas: canvasElement,
  autoplay: true,
  artboard: 'Village-character',
  stateMachines: 'State Machine 1',
  fit: rive.Fit.Contain,
  alignment: rive.Alignment.Center,
  onLoad: function() {
    if (!r) return;
    r.resizeDrawingSurfaceToCanvas();
    var inputs = r.stateMachineInputs('State Machine 1');
    if (inputs) {
      inputs.forEach(function(inp) {
        if (state[inp.name] !== undefined) inp.value = state[inp.name];
      });
    }
  }
});
```

**Customization inputs:** `skinID` (0–15), `hairID` (0–6), `hairshadeID` (0–12), `beardID` (0–7), `beardshadeID` (0–12), `clothingcolourID` (0–10), `clothingID` (0–11).

**Presets (quick-start character combos):**
| Name | skinID | hairID | hairshadeID | beardID | clothingcolourID | clothingID |
|------|--------|--------|-------------|---------|-----------------|------------|
| Shane (Kid, 8) | 11 | 4 | 3 | 0 | 0 | 0 |
| Zeev (Dad) | 5 | 0 | 0 | 6 | 5 | 2 |
| Mali (Mom) | 8 | 5 | 5 | 0 | 7 | 1 |
| Grandpa | 14 | 3 | 11 | 7 | 1 | 5 |
| Coach Eli | 3 | 1 | 7 | 0 | 2 | 10 |
| Ms. Chen | 9 | 6 | 2 | 0 | 4 | 3 |
| Liam (Kid, 4) | 6 | 2 | 9 | 0 | 8 | 0 |

**Background colors (user-selected):** `--bg-sky` (default), `--brand-200`, `--blue-dark-200`, `--violet-200`, `--pink-200`, `--red-200`, `--green-200`, `--sprout-200`, `--yellow-200`, `--orange-200`.

---

## Component CSS

These are the actual CSS implementations. Copy them directly — don't improvise.

### ButtonUtility

Pill-shaped utility button. Used in Toolbar for navigation, stats, and actions.

```css
.btn-util {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 0;
  padding: var(--spacing-lg, 12px);
  background: var(--bg-primary, #ffffff);
  border: 2px solid var(--border-secondary, #e9eaeb);
  border-radius: var(--radius-full, 9999px);
  box-shadow: 0 3px 0 0 var(--gray-200, #e9eaeb);
  flex-shrink: 0; overflow: hidden; cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s, transform 0.1s, border-color 0.15s;
}
.btn-util:hover { background: var(--gray-50, #fafafa); }
.btn-util:active { box-shadow: none; transform: translateY(2px); }

/* With label (1 symbol + value variant) */
.btn-util-with-label { gap: var(--spacing-md, 8px); }
.btn-util-label {
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: var(--font-size-text-md, 16px);
  line-height: var(--line-height-text-md, 24px);
  font-weight: var(--font-weight-regular, 400);
  color: var(--text-secondary, #414651);
}

/* Small padding (user group variant) */
.btn-util-sm { padding: var(--spacing-md, 8px); }

/* Disabled */
.btn-util-disabled {
  background: var(--gray-300, #d5d7da);
  border-color: var(--gray-400, #a4a7ae);
  box-shadow: 0 4px 0 0 var(--gray-400, #a4a7ae);
  cursor: not-allowed; pointer-events: none;
}
```

**Markup:**
```html
<!-- 1 symbol -->
<button class="btn-util"><span class="tf-icon">&#x1F6E1;&#xFE0F;</span></button>

<!-- 1 symbol + value -->
<button class="btn-util btn-util-with-label">
  <span class="tf-icon">&#x1F525;</span>
  <span class="btn-util-label">5</span>
</button>
```

### Button

```css
.btn-sprout {
  display: flex; align-items: center; justify-content: center;
  box-sizing: border-box;
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-weight: var(--font-weight-bold, 700);
  border: none; cursor: pointer;
  gap: var(--spacing-md, 8px);
  padding: var(--spacing-lg, 12px);
  border-radius: var(--radius-2xl, 16px);
  transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
  user-select: none; white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  width: 320px;
}
.btn-lg { height: 48px; font-size: var(--font-size-text-lg, 18px); line-height: var(--line-height-text-lg, 28px); }
.btn-md { height: 44px; font-size: var(--font-size-text-md, 16px); line-height: var(--line-height-text-md, 24px); }

/* Primary */
.btn-primary {
  background: var(--brand-500, #0ba5ec); color: #ffffff;
  border-bottom: 2px solid var(--brand-600, #0086c9);
  box-shadow: 0 4px 0 0 var(--brand-600, #0086c9);
}
.btn-primary:hover { background: var(--brand-400, #36bffa); }
.btn-primary:active {
  background: var(--brand-500, #0ba5ec); border-bottom: none;
  box-shadow: none; transform: translateY(4px);
}

/* Secondary */
.btn-secondary {
  background: var(--bg-primary, #ffffff); color: var(--brand-500, #0ba5ec);
  border: 2px solid var(--border-secondary, #e9eaeb);
  box-shadow: 0 3px 0 0 var(--gray-200, #e9eaeb);
}
.btn-secondary:hover { background: var(--bg-secondary, #fafafa); }
.btn-secondary:active { box-shadow: none; transform: translateY(3px); }

/* Destructive */
.btn-destructive {
  background: var(--fg-destructive-primary, #f04438); color: #ffffff;
  border-bottom: 2px solid var(--red-600, #d92d20);
  box-shadow: 0 4px 0 0 var(--red-600, #d92d20);
}
.btn-destructive:hover { background: var(--red-400, #f97066); }
.btn-destructive:active { background: var(--fg-destructive-primary, #f04438); border-bottom: none; box-shadow: none; transform: translateY(4px); }

/* Warning */
.btn-warning {
  background: var(--yellow-500, #eaaa08); color: #ffffff;
  border-bottom: 2px solid var(--yellow-600, #ca8504);
  box-shadow: 0 4px 0 0 var(--yellow-600, #ca8504);
}
.btn-warning:hover { background: var(--yellow-400, #fac515); }
.btn-warning:active { background: var(--yellow-500, #eaaa08); border-bottom: none; box-shadow: none; transform: translateY(4px); }

/* Success */
.btn-success {
  background: var(--green-500, #17b26a); color: #ffffff;
  border-bottom: 2px solid var(--green-600, #079455);
  box-shadow: 0 4px 0 0 var(--green-600, #079455);
}
.btn-success:hover { background: var(--green-400, #47cd89); }
.btn-success:active { background: var(--green-500, #17b26a); border-bottom: none; box-shadow: none; transform: translateY(4px); }

/* Disabled (applies to all) */
.btn-sprout.state-disabled {
  background: var(--gray-300, #d5d7da); color: var(--text-disabled, #717680);
  border-bottom: 2px solid var(--gray-400, #a4a7ae);
  box-shadow: 0 4px 0 0 var(--gray-400, #a4a7ae);
  cursor: not-allowed; pointer-events: none;
}
```

### Toolbar

```css
.toolbar {
  display: flex; align-items: center;
  padding: 0 var(--spacing-xl, 16px) var(--spacing-md, 8px);
  position: relative; width: 100%; box-sizing: border-box;
}

/* Kid Home variant: shield left, stat pills right */
.toolbar-kid-home { align-items: center; justify-content: space-between; }
.toolbar-trailing { display: flex; align-items: center; gap: var(--spacing-md, 8px); }

/* Default variant: back button left, title center, action right */
.toolbar-default { align-items: flex-start; justify-content: space-between; }
.toolbar-default .leading,
.toolbar-default .trailing { flex: 1; display: flex; align-items: center; }
.toolbar-default .trailing { justify-content: flex-end; }
.toolbar-default .toolbar-abs-title {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-text-lg, 18px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary, #181d27);
}
```

**Markup (Kid Home):**
```html
<nav class="toolbar toolbar-kid-home" aria-label="Home toolbar">
  <button class="btn-util"><span class="tf-icon">&#x1F6E1;&#xFE0F;</span></button>
  <div class="toolbar-trailing">
    <button class="btn-util btn-util-with-label"><span class="tf-icon">&#x1F525;</span><span class="btn-util-label">5</span></button>
    <button class="btn-util btn-util-with-label"><span class="tf-icon">&#x1F48E;</span><span class="btn-util-label">42</span></button>
    <button class="btn-util"><span class="tf-icon">&#x1F3EA;</span></button>
  </div>
</nav>
```

### Input

```css
.input-field {
  width: 100%; height: 56px;
  padding: 0 var(--spacing-xl, 16px);
  border: 2px solid var(--border-secondary, #e9eaeb);
  border-radius: var(--radius-2xl, 16px);
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-size: var(--font-size-text-md, 16px);
  color: var(--text-primary, #181d27);
  background: var(--bg-primary, #ffffff);
  outline: none;
  transition: border-color 0.15s;
}
.input-field::placeholder { color: var(--text-placeholder, #717680); }
.input-field:focus { border-color: var(--border-brand, #0ba5ec); }
.input-field.state-error { border-color: var(--border-error, #f04438); }
.input-field:disabled { background: var(--bg-disabled, #f5f5f5); }

.input-label {
  font-size: var(--font-size-text-md, 16px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--text-primary, #181d27);
  margin-bottom: var(--spacing-sm, 6px);
}
.input-error-msg {
  font-size: var(--font-size-text-sm, 14px);
  color: var(--text-error-primary, #d92d20);
  margin-top: var(--spacing-sm, 6px);
}
```

### Tile

56px rows with optional icon, description, and trailing indicator (radio, checkbox, or chevron). Used inside Sheets for selection lists.

```css
.tile {
  display: flex; align-items: center; gap: var(--spacing-xl, 16px);
  box-sizing: border-box;
  width: 100%;
  padding: var(--spacing-xl, 16px) var(--spacing-2xl, 20px);
  background: var(--bg-primary, #ffffff);
  border: 2px solid var(--border-secondary, #e9eaeb);
  border-radius: var(--radius-xl, 12px);
  box-shadow: 0 3px 0 0 var(--gray-200, #e9eaeb);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.tile:hover { border-color: var(--gray-300, #d5d7da); }
.tile.checked {
  background: var(--bg-brand-secondary, #e0f2fe);
  border-color: var(--brand-300, #7cd4fd);
  box-shadow: 0 3px 0 0 var(--brand-300, #7cd4fd);
}

/* Icon (TossFace emoji) */
.tile-icon {
  width: 44px; height: 44px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'TossFace', sans-serif;
  font-size: 36px; line-height: 1;
}

/* Content */
.tile-content { flex: 1; min-width: 0; }
.tile-label {
  font-size: var(--font-size-text-md, 16px);
  line-height: var(--line-height-text-md, 24px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--text-primary, #181d27);
}
.tile-desc {
  font-size: var(--font-size-text-sm, 14px);
  line-height: var(--line-height-text-sm, 20px);
  font-weight: var(--font-weight-regular, 400);
  color: var(--text-secondary, #414651);
}

/* Radio indicator */
.tile-radio {
  width: 24px; height: 24px; flex-shrink: 0;
  border: 2px solid var(--border-secondary, #e9eaeb);
  border-radius: var(--radius-full, 9999px);
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-primary, #ffffff);
  transition: background 0.15s, border-color 0.15s;
}
.checked .tile-radio {
  background: var(--brand-500, #0ba5ec);
  border-color: var(--brand-500, #0ba5ec);
}
.tile-radio-dot {
  display: none; width: 8px; height: 8px;
  border-radius: var(--radius-full, 9999px);
  background: #ffffff;
}
.checked .tile-radio-dot { display: block; }

/* Checkbox indicator */
.tile-checkbox {
  width: 24px; height: 24px; flex-shrink: 0;
  border: 2px solid var(--border-secondary, #e9eaeb);
  border-radius: var(--radius-sm, 6px);
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-primary, #ffffff);
  transition: background 0.15s, border-color 0.15s;
}
.checked .tile-checkbox {
  background: var(--brand-500, #0ba5ec);
  border-color: var(--brand-500, #0ba5ec);
}
.tile-check-icon {
  display: none; width: 14px; height: 14px;
  stroke: #ffffff; stroke-width: 2.5; fill: none;
}
.checked .tile-check-icon { display: block; }
```

**Markup (Radio inside Sheet):**
```html
<div class="tile-group" role="radiogroup" aria-label="Options">
  <div class="tile" role="radio" aria-checked="false" onclick="selectRadio(this)">
    <div class="tile-content">
      <div class="tile-label">Option A</div>
      <div class="tile-desc">Description text</div>
    </div>
    <div class="tile-radio"><div class="tile-radio-dot"></div></div>
  </div>
  <div class="tile checked" role="radio" aria-checked="true" onclick="selectRadio(this)">
    <div class="tile-content">
      <div class="tile-label">Option B</div>
      <div class="tile-desc">Description text</div>
    </div>
    <div class="tile-radio"><div class="tile-radio-dot"></div></div>
  </div>
</div>
```

**Radio selection JS:**
```js
function selectRadio(el) {
  el.parentElement.querySelectorAll('.tile').forEach(function(item) {
    item.classList.remove('checked');
    item.setAttribute('aria-checked', 'false');
  });
  el.classList.add('checked');
  el.setAttribute('aria-checked', 'true');
}
```

### Sheet

Bottom-sliding overlay for focused content or actions. Max 90% viewport height.

```css
/* Scrim / backdrop */
.sheet-scrim {
  position: absolute; inset: 0;
  background: var(--bg-overlay, rgba(10,13,18,0.2));
  display: flex; align-items: flex-end;
}

/* Sheet container */
.sheet {
  background: var(--bg-primary, #ffffff);
  border-radius: var(--radius-4xl, 24px) var(--radius-4xl, 24px) 0 0;
  width: 100%; display: flex; flex-direction: column;
  max-height: 90%;
  animation: sheet-enter 300ms ease-out;
}
@keyframes sheet-enter {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Top area: handle + header */
.sheet-top {
  padding: var(--spacing-xl, 16px);
  flex-shrink: 0;
  display: flex; flex-direction: column;
  gap: 16px; align-items: center;
}
.sheet-handle {
  width: 36px; height: 4px;
  background: var(--gray-300, #d5d7da);
  border-radius: 2px;
}
.sheet-header {
  display: flex; align-items: center;
  gap: var(--spacing-md, 8px); width: 100%;
}
.sheet-header-content {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
  gap: var(--spacing-xxs, 2px);
}
.sheet-title {
  font-family: var(--font-family-display, 'Inter', sans-serif);
  font-size: var(--font-size-display-md, 36px);
  line-height: var(--line-height-display-md, 44px);
  font-weight: var(--font-weight-bold, 700);
  letter-spacing: var(--letter-spacing-display, -0.02em);
  color: var(--text-primary, #181d27);
}
.sheet-description {
  font-size: var(--font-size-text-sm, 14px);
  line-height: var(--line-height-text-sm, 20px);
  color: var(--text-quaternary, #717680);
}

/* Close button — 44px tap target */
.sheet-close {
  width: 44px; height: 44px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--gray-400, #a4a7ae);
  background: none; border: none;
}
.sheet-close svg { width: 24px; height: 24px; }

/* Scrollable body */
.sheet-body {
  flex: 1; min-height: 0;
  overflow-y: auto;
  padding: 0 var(--spacing-xl, 16px);
  -webkit-overflow-scrolling: touch;
}

/* Sticky footer */
.sheet-footer {
  flex-shrink: 0;
  padding: var(--spacing-xl, 16px);
  padding-bottom: var(--spacing-2xl, 20px);
  border-top: 1px solid var(--border-secondary, #e9eaeb);
  background: var(--bg-primary, #ffffff);
}
.sheet-footer.no-border { border-top: none; }
.sheet-footer .btn-sprout,
.sheet-body .btn-sprout { width: 100%; }
```

**Markup:**
```html
<div class="sheet-scrim" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
  <div class="sheet">
    <div class="sheet-top">
      <div class="sheet-handle"></div>
      <div class="sheet-header">
        <div class="sheet-header-content">
          <div class="sheet-title" id="sheet-title">Title</div>
          <div class="sheet-description">Optional description</div>
        </div>
        <button class="sheet-close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="sheet-body"><!-- content --></div>
    <div class="sheet-footer">
      <button class="btn-sprout btn-primary btn-lg">Confirm</button>
    </div>
  </div>
</div>
```

### ActionPrompt

White card with shadow for confirmations and permission requests. 370px width. Dual CTAs: secondary left, primary right.

```css
.action-prompt {
  display: flex; flex-direction: column;
  gap: var(--spacing-xl, 16px);
  background: var(--bg-primary, #ffffff);
  border-radius: var(--radius-xl, 12px);
  padding: var(--spacing-xl, 16px);
  box-shadow:
    0 2px 2px -1px rgba(10,13,18,0.04),
    0 4px 6px -2px rgba(10,13,18,0.03),
    0 12px 16px -4px rgba(10,13,18,0.08);
  width: 370px;
}

/* Content row: leading + text + close */
.ap-content {
  display: flex; align-items: flex-start; gap: var(--spacing-md, 8px);
}
.ap-leading {
  flex-shrink: 0; width: 46px; height: 46px;
  display: flex; align-items: center; justify-content: center;
}
.ap-leading-emoji {
  font-family: 'TossFace', sans-serif;
  font-size: 36px; line-height: 1;
}
.ap-leading-avatar {
  width: 46px; height: 46px;
  border-radius: var(--radius-full, 9999px);
  overflow: hidden; position: relative;
}
.ap-leading-avatar img { width: 100%; height: 100%; object-fit: cover; }
.ap-text {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column;
  gap: var(--spacing-xxs, 2px); justify-content: center;
}
.ap-label {
  font-size: var(--font-size-text-md, 16px);
  font-weight: var(--font-weight-bold, 700);
  line-height: var(--line-height-text-md, 24px);
  color: var(--text-primary, #181d27);
}
.ap-desc {
  font-size: var(--font-size-text-sm, 14px);
  line-height: var(--line-height-text-sm, 20px);
  color: var(--text-secondary, #414651);
}
.ap-close {
  width: 24px; height: 24px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--gray-500, #717680);
}
.ap-close svg { width: 12px; height: 12px; }

/* Actions row */
.ap-actions { display: flex; gap: var(--spacing-xl, 16px); width: 100%; }
.ap-btn-primary {
  display: flex; align-items: center; justify-content: center;
  flex: 1; height: 50px;
  background: var(--fg-brand-primary, #0ba5ec); color: #ffffff;
  border: none; border-bottom: 2px solid var(--brand-600, #0086c9);
  border-radius: var(--radius-2xl, 16px);
  box-shadow: 0 4px 0 0 var(--brand-600, #0086c9);
  font-size: var(--font-size-text-md, 16px);
  font-weight: var(--font-weight-bold, 700);
  cursor: pointer; transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
}
.ap-btn-primary:active { box-shadow: none; transform: translateY(4px); border-bottom: none; }
.ap-btn-destructive {
  display: flex; align-items: center; justify-content: center;
  flex: 1; height: 50px;
  background: var(--fg-destructive-primary, #f04438); color: #ffffff;
  border: none; border-bottom: 2px solid var(--red-600, #d92d20);
  border-radius: var(--radius-2xl, 16px);
  box-shadow: 0 4px 0 0 var(--red-600, #d92d20);
  font-size: var(--font-size-text-md, 16px);
  font-weight: var(--font-weight-bold, 700);
  cursor: pointer; transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
}
.ap-btn-destructive:active { box-shadow: none; transform: translateY(4px); border-bottom: none; }
.ap-btn-secondary {
  display: flex; align-items: center; justify-content: center;
  flex: 1; height: 50px;
  background: var(--bg-primary, #ffffff); color: var(--brand-500, #0ba5ec);
  border: 2px solid var(--border-secondary, #e9eaeb);
  border-radius: var(--radius-2xl, 16px);
  box-shadow: 0 3px 0 0 var(--gray-200, #e9eaeb);
  font-size: var(--font-size-text-md, 16px);
  font-weight: var(--font-weight-bold, 700);
  cursor: pointer; transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
}
.ap-btn-secondary:active { box-shadow: none; transform: translateY(3px); }
```

### Toast

Non-blocking feedback. 370px width. 4 variants: success, error, warning, info.

```css
.toast {
  display: flex; align-items: flex-start; gap: var(--spacing-md, 8px);
  border-radius: var(--radius-xl, 12px);
  padding: var(--spacing-lg, 12px) var(--spacing-xl, 16px);
  width: 370px;
  background: var(--bg-primary, #ffffff);
  border: 2px solid var(--border-secondary, #e9eaeb);
  box-shadow:
    0 12px 16px -4px rgba(10,13,18,0.08),
    0 4px 6px -2px rgba(10,13,18,0.03);
  position: relative; overflow: hidden;
}
.toast-icon {
  font-family: 'TossFace', sans-serif;
  font-size: 20px; line-height: 1;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.toast-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--spacing-xxs, 2px); }
.toast-title {
  font-size: var(--font-size-text-md, 16px);
  font-weight: var(--font-weight-bold, 700);
  line-height: var(--line-height-text-md, 24px);
  color: var(--text-primary, #181d27);
}
.toast-desc {
  font-size: var(--font-size-text-sm, 14px);
  line-height: var(--line-height-text-sm, 20px);
  color: var(--text-secondary, #414651);
}
.toast-action {
  font-size: var(--font-size-text-sm, 14px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--brand-700, #026aa2);
  cursor: pointer;
}
.toast-close {
  width: 24px; height: 24px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-quaternary, #717680); cursor: pointer;
  background: none; border: none;
}

/* Progress bar (auto-dismiss timer) */
.toast-progress {
  position: absolute; bottom: 0; left: 0; right: 0; height: 4px;
  background: var(--bg-secondary, #fafafa);
}
.toast-progress-fill { height: 100%; border-radius: var(--radius-full, 9999px); }
.toast-success .toast-progress-fill { background: var(--green-500, #17b26a); }
.toast-error .toast-progress-fill { background: var(--red-500, #f04438); }
.toast-warning .toast-progress-fill { background: var(--yellow-500, #eaaa08); }
.toast-info .toast-progress-fill { background: var(--brand-500, #0ba5ec); }

/* Animations */
@keyframes toast-enter {
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes toast-exit {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
}
@keyframes toast-countdown {
  0% { width: 100%; }
  100% { width: 0%; }
}
.toast-anim-enter { animation: toast-enter 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
.toast-anim-exit { animation: toast-exit 250ms ease-in forwards; }
.toast-anim-enter .toast-progress-fill,
.toast-anim-idle .toast-progress-fill {
  animation: toast-countdown var(--toast-duration, 4s) linear forwards;
}
```

### FeedbackBanner

Pinned-bottom feedback banner for quiz results, exercise outcomes, and action confirmations. Slides up after the user completes an action. 4 hierarchy variants: default (white), success (green tint), warning (yellow tint), error (red tint). Supports primary-only or primary + secondary CTA layouts.

**Recommended TossFace icons per variant:** ✨ default, ✅ success, ⚠️ warning, ❎ error.

```css
.fb {
  display: flex; flex-direction: column;
  gap: var(--spacing-xl, 16px);
  padding: var(--spacing-3xl, 24px) var(--spacing-xl, 16px);
  width: 100%;
  font-family: var(--font-family-body, 'Inter', sans-serif);
}

/* Hierarchy backgrounds */
.fb-default { background: var(--bg-primary, #ffffff); }
.fb-success { background: var(--bg-success-secondary, #dcfae6); }
.fb-warning { background: var(--bg-warning-secondary, #fef7c3); }
.fb-error   { background: var(--bg-error-secondary, #fee4e2); }

/* Top border (dual CTA variant only) */
.fb-bordered { border-top: 1px solid var(--border-primary, #d5d7da); }

/* Header: icon + title */
.fb-header { display: flex; align-items: center; gap: 12px; }
.fb-icon {
  width: 32px; height: 32px; flex-shrink: 0;
  font-family: 'TossFace', sans-serif;
  font-size: 28px; line-height: 32px; text-align: center;
}
.fb-title {
  flex: 1;
  font-size: var(--font-size-display-xs, 24px);
  font-weight: var(--font-weight-bold, 700);
  line-height: var(--line-height-display-xs, 32px);
}
.fb-default .fb-title { color: var(--text-primary, #181d27); }
.fb-success .fb-title { color: var(--text-success-primary, #079455); }
.fb-warning .fb-title { color: var(--text-warning-primary, #ca8504); }
.fb-error   .fb-title { color: var(--text-error-primary, #d92d20); }

/* Content: subtitle + description */
.fb-content {
  display: flex; flex-direction: column; gap: var(--spacing-xxs, 2px);
  font-size: var(--font-size-text-md, 16px);
  line-height: var(--line-height-text-md, 24px);
}
.fb-subtitle { font-weight: var(--font-weight-bold, 700); }
.fb-desc     { font-weight: var(--font-weight-regular, 400); }
.fb-default .fb-content { color: var(--text-primary, #181d27); }
.fb-success .fb-content { color: var(--text-success-primary, #079455); }
.fb-warning .fb-content { color: var(--text-warning-primary, #ca8504); }
.fb-error   .fb-content { color: var(--text-error-primary, #d92d20); }

/* Buttons */
.fb-btn {
  display: flex; align-items: center; justify-content: center;
  box-sizing: border-box;
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-weight: var(--font-weight-bold, 700);
  font-size: var(--font-size-text-md, 16px);
  line-height: var(--line-height-text-md, 24px);
  border: none; cursor: pointer;
  border-radius: var(--radius-2xl, 16px);
  padding: var(--spacing-lg, 12px);
  width: 100%; white-space: nowrap;
}
.fb-btn-primary { color: #ffffff; border-bottom: 2px solid transparent; }
.fb-default .fb-btn-primary { background: var(--fg-brand-primary, #0ba5ec); border-bottom-color: var(--brand-600, #0086c9); box-shadow: 0 4px 0 0 var(--brand-600, #0086c9); }
.fb-success .fb-btn-primary { background: var(--green-500, #17b26a); border-bottom-color: var(--green-600, #079455); box-shadow: 0 4px 0 0 var(--green-600, #079455); }
.fb-warning .fb-btn-primary { background: var(--yellow-500, #eaaa08); border-bottom-color: var(--yellow-600, #ca8504); box-shadow: 0 4px 0 0 var(--yellow-600, #ca8504); }
.fb-error   .fb-btn-primary { background: var(--red-500, #f04438); border-bottom-color: var(--red-600, #d92d20); box-shadow: 0 4px 0 0 var(--red-600, #d92d20); }

.fb-btn-secondary {
  background: var(--bg-primary, #ffffff); color: var(--text-secondary, #414651);
  border: 2px solid var(--border-secondary, #e9eaeb);
  box-shadow: 0 3px 0 0 var(--gray-200, #e9eaeb);
}

/* Dual CTA row */
.fb-btn-row { display: flex; gap: var(--spacing-lg, 12px); }
.fb-btn-row .fb-btn { flex: 1; }
```

**Markup (success, primary only):**
```html
<div class="fb fb-success">
  <div class="fb-header">
    <div class="fb-icon">&#9989;</div>
    <div class="fb-title">Great job!</div>
  </div>
  <div class="fb-content">
    <div class="fb-subtitle">You got it right</div>
    <div class="fb-desc">Keep up the great work.</div>
  </div>
  <button class="fb-btn fb-btn-primary">Continue</button>
</div>
```

**Markup (error, primary + secondary):**
```html
<div class="fb fb-error fb-bordered">
  <div class="fb-header">
    <div class="fb-icon">&#10062;</div>
    <div class="fb-title">Incorrect</div>
  </div>
  <div class="fb-content">
    <div class="fb-subtitle">Correct answer:</div>
    <div class="fb-desc">The capital of France is Paris.</div>
  </div>
  <div class="fb-btn-row">
    <button class="fb-btn fb-btn-secondary">Report</button>
    <button class="fb-btn fb-btn-primary">Got it</button>
  </div>
</div>
```

**Placement:** Always pinned to the bottom of the viewport, overlaying content. Animate sliding up on appearance.

### Switch

On/off toggle for instant-effect settings. 44x24px.

```css
.switch {
  display: flex; align-items: center;
  width: 44px; height: 24px;
  padding: var(--spacing-xxs, 2px);
  border-radius: var(--radius-full, 9999px);
  background: var(--bg-secondary, #fafafa);
  cursor: pointer;
  transition: background 0.2s, justify-content 0.2s;
  box-sizing: border-box; flex-shrink: 0;
}
.switch .switch-thumb {
  width: 20px; height: 20px;
  border-radius: var(--radius-full, 9999px);
  background: var(--fg-white, #ffffff);
  transition: transform 0.2s;
}
.switch.checked {
  background: var(--brand-500, #0ba5ec);
  justify-content: flex-end;
}
.switch.checked:hover { background: var(--fg-brand-primary-hover, #36bffa); }
.switch.disabled {
  background: var(--bg-disabled, #f5f5f5);
  cursor: not-allowed;
}
.switch.disabled .switch-thumb { background: #fafafa; }

/* Switch with label row */
.switch-row {
  display: flex; gap: var(--spacing-md, 8px); align-items: flex-start;
  max-width: 370px; width: 100%;
}
.switch-row .switch-content {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: var(--spacing-xxs, 2px);
}
.switch-row .switch-label {
  font-size: var(--font-size-text-md, 16px);
  line-height: var(--line-height-text-md, 24px);
  color: var(--text-primary, #181d27);
}
.switch-row .switch-desc {
  font-size: var(--font-size-text-sm, 14px);
  line-height: var(--line-height-text-sm, 20px);
  color: var(--text-secondary, #414651);
}
```

### Checkbox

24px rounded-square toggle. Use for multi-select or consent.

```css
.checkbox {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px;
  border-radius: var(--radius-sm, 6px);
  border: 2px solid var(--border-secondary, #e9eaeb);
  background: var(--bg-primary, #ffffff);
  cursor: pointer; flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
}
.checkbox.checked {
  background: var(--brand-500, #0ba5ec);
  border-color: var(--brand-500, #0ba5ec);
}
.checkbox .check-icon { display: none; width: 16px; height: 16px; }
.checkbox.checked .check-icon { display: block; }
.checkbox .check-icon svg {
  width: 16px; height: 16px; fill: none; stroke: #ffffff;
  stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;
}

/* Checkbox with label row */
.checkbox-row {
  display: flex; gap: var(--spacing-md, 8px); align-items: flex-start;
  max-width: 370px; width: 100%;
}
.checkbox-row .checkbox-content {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: var(--spacing-xxs, 2px);
}
.checkbox-row .checkbox-label {
  font-size: var(--font-size-text-md, 16px);
  line-height: var(--line-height-text-md, 24px);
  color: var(--text-primary, #181d27);
}
.checkbox-row .checkbox-desc {
  font-size: var(--font-size-text-sm, 14px);
  line-height: var(--line-height-text-sm, 20px);
  color: var(--text-secondary, #414651);
}
```

### Radio

24px circle toggle. Use for mutually exclusive standalone options.

```css
.radio {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px;
  border-radius: var(--radius-full, 9999px);
  border: 2px solid var(--border-secondary, #e9eaeb);
  background: var(--bg-primary, #ffffff);
  cursor: pointer; flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
}
.radio.checked {
  background: var(--brand-500, #0ba5ec);
  border-color: var(--brand-500, #0ba5ec);
}
.radio .radio-dot {
  display: none; width: 8px; height: 8px;
  border-radius: var(--radius-full, 9999px);
  background: #ffffff;
}
.radio.checked .radio-dot { display: block; }

/* Radio with label row */
.radio-row {
  display: flex; gap: var(--spacing-md, 8px); align-items: center;
  max-width: 370px; width: 100%;
}
.radio-row .radio-content {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: var(--spacing-xxs, 2px);
}
.radio-row .radio-label {
  font-size: var(--font-size-text-md, 16px);
  line-height: var(--line-height-text-md, 24px);
  color: var(--text-primary, #181d27);
}
.radio-row .radio-desc {
  font-size: var(--font-size-text-sm, 14px);
  line-height: var(--line-height-text-sm, 20px);
  color: var(--text-secondary, #414651);
}
.radio-group { display: flex; flex-direction: column; gap: 12px; }
```

### PasscodeInput

4-digit PIN entry. Auto-advance on input.

```css
.passcode {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--spacing-md, 8px);
  max-width: 378px; width: 100%;
}
.passcode-label {
  font-size: var(--font-size-text-md, 16px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--text-primary, #181d27);
  text-align: center; width: 100%;
}
.passcode-row {
  display: flex; gap: var(--spacing-xl, 16px); justify-content: center;
}
.passcode-cell {
  width: 48px; height: 56px;
  border: 2px solid var(--border-secondary, #e9eaeb);
  border-radius: var(--radius-2xl, 16px);
  background: var(--bg-primary, #ffffff);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--font-size-text-md, 16px);
  color: var(--text-primary, #181d27);
  text-align: center;
  transition: border-color 0.15s;
}
.passcode-cell.focus { border-color: var(--border-brand, #0ba5ec); }
.passcode-cell.filled { border-color: var(--border-secondary, #e9eaeb); }
.passcode-cell.filled.focus { border-color: var(--border-brand, #0ba5ec); }
.passcode.error .passcode-cell { border-color: var(--border-error, #f04438); }
.passcode-error {
  font-size: var(--font-size-text-sm, 14px);
  color: var(--text-error-primary, #d92d20);
  text-align: center; width: 100%;
}
.passcode.disabled .passcode-cell {
  background: var(--bg-disabled, #f5f5f5);
  cursor: not-allowed;
}
input.passcode-cell { outline: none; }
input.passcode-cell:focus { border-color: var(--border-brand, #0ba5ec); }
```

### ProgressBar

Animated fill bar. Lives inside Toolbar (quest variant).

```css
.progress-bar {
  display: flex; flex-direction: column;
  gap: 0; height: 34px; width: 100%;
  align-items: flex-start; justify-content: flex-end;
}
.progress-message {
  font-size: var(--font-size-text-xs, 12px);
  line-height: var(--line-height-text-xs, 16px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--brand-500, #0ba5ec);
  text-transform: uppercase; letter-spacing: 0.5px;
  width: 100%;
}
.progress-message:empty { display: none; }
.progress-track {
  width: 100%; height: 16px;
  background: var(--bg-secondary, #fafafa);
  border-radius: var(--radius-full, 9999px);
  display: flex; flex-direction: column; align-items: flex-start;
}
.progress-fill {
  flex: 1 0 0; height: auto;
  background: var(--brand-500, #0ba5ec);
  border-radius: var(--radius-full, 9999px);
  min-width: 32px;
  padding: var(--spacing-xs, 4px) var(--spacing-md, 8px);
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex; flex-direction: column; align-items: flex-start;
}
/* Inner highlight */
.progress-fill::after {
  content: ''; display: block;
  width: 100%; height: 4px;
  background: rgba(255,255,255,0.5);
  border-radius: var(--radius-full, 9999px);
}
```

### LoadingIndicator

Spinner animation. Primary (light bg) or Muted (dark bg). 3 sizes.

```css
.spinner-circle {
  display: inline-block; flex-shrink: 0;
  animation: spinner-rotate 0.8s linear infinite;
}
@keyframes spinner-rotate { to { transform: rotate(360deg); } }

/* Sizes */
.spinner-lg { width: 28px; height: 28px; }
.spinner-md { width: 24px; height: 24px; }
.spinner-sm { width: 20px; height: 20px; }

/* Inline loading (spinner + text) */
.loading-inline {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--spacing-xl, 16px);
}
.loading-inline .loading-text {
  font-size: var(--font-size-text-lg, 18px);
  line-height: var(--line-height-text-lg, 28px);
  color: var(--text-secondary, #414651);
  text-align: center;
}
```

**Spinner markup (Primary variant — use on light backgrounds):**
```html
<svg class="spinner-circle spinner-lg" viewBox="0 0 28 28" fill="none">
  <circle cx="14" cy="14" r="12" stroke="var(--border-primary, #d5d7da)" stroke-width="3"/>
  <path d="M26 14c0-6.627-5.373-12-12-12" stroke="var(--fg-brand-primary, #0ba5ec)" stroke-width="3" stroke-linecap="round"/>
</svg>
```

**Spinner markup (Muted variant — use on colored/dark backgrounds):**
```html
<svg class="spinner-circle spinner-lg" viewBox="0 0 28 28" fill="none">
  <circle cx="14" cy="14" r="12" stroke="rgba(255,255,255,0.5)" stroke-width="3"/>
  <path d="M26 14c0-6.627-5.373-12-12-12" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
</svg>
```

### AvatarGroup

Overlapping 32px circles. Used inside ButtonUtility in the Toolbar.

```css
.avatar {
  width: 32px; height: 32px;
  border-radius: var(--radius-full, 9999px);
  background: var(--bg-sky, #e0f2fe);
  border: 2px solid white; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--font-size-text-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-brand-secondary, #026aa2);
  line-height: 1;
}
.avatar-sprout {
  background: var(--bg-sky, #e0f2fe);
  position: relative; overflow: hidden;
}
.avatar-sprout img {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
}

/* Stacked group — negative margin for overlap */
.user-group {
  display: flex; align-items: center;
  padding-right: var(--spacing-md, 8px);
}
.user-group .avatar {
  margin-right: calc(-1 * var(--spacing-md, 8px));
}
```

### Social Buttons

Google and Apple sign-in buttons. White bg, 2px border, 3px shadow — same visual style as Secondary button. Never customize the provider logos.

```css
.btn-social {
  display: flex; align-items: center; justify-content: center;
  gap: var(--spacing-md, 8px);
  font-family: var(--font-family-body, 'Inter', sans-serif);
  font-weight: var(--font-weight-bold, 700);
  font-size: var(--font-size-text-md, 16px);
  line-height: var(--line-height-text-md, 24px);
  width: 320px; height: 48px;
  padding: var(--spacing-lg, 12px) var(--spacing-3xl, 24px);
  border-radius: 16px; cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s;
  white-space: nowrap; box-sizing: border-box;
  background: var(--bg-primary, #ffffff);
  color: var(--text-secondary, #414651);
  border: 2px solid var(--border-secondary, #e9eaeb);
  box-shadow: 0 3px 0 0 var(--gray-200, #e9eaeb);
}
.btn-social:hover { background: var(--bg-secondary, #fafafa); }
.btn-social:active {
  box-shadow: none; transform: translateY(3px);
}
.btn-social.state-disabled {
  background: var(--fg-disabled-subtle, #d5d7da);
  color: var(--text-disabled, #717680);
  border: none;
  box-shadow: 0 4px 0 0 var(--gray-400, #a4a7ae);
  cursor: not-allowed; pointer-events: none;
}
.social-icon { width: 24px; height: 24px; flex-shrink: 0; }
```

**Markup (Google):**
```html
<button class="btn-social">
  <svg class="social-icon" viewBox="0 0 20 20" fill="none"><path d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.8h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.74 2.98-4.3 2.98-7.32Z" fill="#4285F4"/><path d="M10 20c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H1.08v2.58A9.99 9.99 0 0 0 10 20Z" fill="#34A853"/><path d="M4.42 11.92A6.02 6.02 0 0 1 4.1 10c0-.66.12-1.3.32-1.92V5.5H1.08A9.99 9.99 0 0 0 0 10c0 1.61.39 3.14 1.08 4.5l3.34-2.58Z" fill="#FBBC05"/><path d="M10 3.96c1.47 0 2.78.5 3.82 1.5l2.86-2.86C14.96.99 12.7 0 10 0A9.99 9.99 0 0 0 1.08 5.5l3.34 2.58C5.2 5.72 7.4 3.96 10 3.96Z" fill="#EA4335"/></svg>
  Sign in with Google
</button>
```

**Markup (Apple):**
```html
<button class="btn-social">
  <svg class="social-icon" viewBox="0 0 20 24" fill="var(--text-secondary)"><path d="M17.05 12.54c-.02-2.26 1.84-3.34 1.93-3.4-1.05-1.54-2.68-1.75-3.27-1.78-1.39-.14-2.72.82-3.43.82-.71 0-1.8-.8-2.96-.78-1.52.02-2.93.89-3.72 2.26-1.59 2.76-.41 6.84 1.14 9.08.76 1.1 1.66 2.33 2.85 2.28 1.14-.05 1.57-.74 2.95-.74s1.77.74 2.97.71c1.23-.02 2.01-1.12 2.76-2.22.87-1.27 1.23-2.5 1.25-2.57-.03-.01-2.4-.92-2.42-3.66h-.05ZM14.78 5.32c.63-.76 1.05-1.82.94-2.88-.91.04-2 .61-2.65 1.37-.58.67-1.09 1.74-.95 2.77 1.01.08 2.04-.52 2.66-1.26Z"/></svg>
  Sign in with Apple
</button>
```

---

## Component Lookup

Pick components by **what the user needs to do**, not by what it looks like.

### Triggering Actions

| Need | Component | Key detail |
|------|-----------|------------|
| Main action on the screen | **Button (Primary)** | One per screen. Tactile 4px shadow press. |
| Cancel / dismiss / alternative | **Button (Secondary)** | White bg, brand-colored text. Pair with Primary. |
| Delete / remove / irreversible | **Button (Destructive)** | Red fill. Always confirm with ActionPrompt or Sheet first. |
| Caution / acknowledge before proceeding | **Button (Warning)** | Yellow fill (`--yellow-500`). Use for "Got it" style acknowledgements. |
| Positive confirmation / correct answer | **Button (Success)** | Green fill (`--green-500`). Use for "Continue" after positive outcomes. |
| Sign in with Google/Apple | **Button (Social)** | Provider logo + label. Never customize the logo. |
| Toolbar action (back, settings, stats) | **ButtonUtility** | Pill shape, white bg, 3px shadow. Use `.tf-icon` for emoji at 24px. |

### Collecting Input

| Need | Component | Key detail |
|------|-----------|------------|
| Free text (name, email, search) | **Input** | 56px height, 16px radius. Focus = blue border. Error = red border + message below. |
| 4-digit PIN | **PasscodeInput** | 4 cells (48×56px), auto-advance on entry. Focus=blue border, error=red border. |
| Pick one from options (in a Sheet) | **Tile (Radio)** | 56px rows with radio indicator. ALWAYS use Tile inside Sheets — never custom chips/pills. |
| Pick one from options (standalone) | **Radio** | Mutually exclusive. Use when not inside a Sheet. |
| Pick multiple options | **Checkbox** | Independent toggles. Can include description text. |
| On/off toggle (instant effect) | **Switch** | For settings that take effect immediately. Don't use for form submissions. |
| Pick from a long list | **Tile (Radio/Checkbox)** | 56px rows with selection indicators. Put inside a Sheet if overlay needed. |

### Showing Feedback

| Need | Component | Key detail |
|------|-----------|------------|
| Quick success/error message | **Toast** | Non-blocking, auto-dismisses. Bottom-center. 4 types: success, error, warning, info. |
| Quiz/exercise result with CTA | **FeedbackBanner** | Pinned bottom banner. 4 variants: default, success, warning, error. Slides up after user action. |
| Needs user decision | **ActionPrompt** | White card, dual CTAs. Use for confirmations and permission requests. |
| Focused task / selection list | **Sheet** | Slides up from bottom. Max 90% viewport. Has sticky footer for long content. |
| Nothing here yet | **EmptyStates** | TossFace emoji icon + title + optional description and CTA. 3 sizes: full-screen, card, sheet. |
| Something is loading | **LoadingIndicator** | Spinner. Primary (light bg) or Muted (dark bg). 3 sizes: lg/md/sm. |
| Progress through exercises | **ProgressBar** | Animated fill with optional streak messages. Lives in Toolbar. |

### Navigation & Layout

| Need | Component | Key detail |
|------|-----------|------------|
| Top bar | **Toolbar** | 56px. Flexible slots: leading (back), center (title/progress), trailing (actions). |
| Show participants | **AvatarGroup** | Overlapping 32px circles. Usually inside a ButtonUtility in the Toolbar. |

## Component Relationships

- **Button (Destructive)** always escalates to **ActionPrompt** or **Sheet** for confirmation
- **Toast** escalates to **ActionPrompt** when the user needs to decide (not just be informed)
- **ActionPrompt** escalates to **Sheet** when more content/options are needed
- **Sheet** degrades to **ActionPrompt** when content is minimal (just a message + buttons)
- **EmptyStates** pairs with **Background** (full-screen) or **Sheet** (compact variant)
- **ProgressBar** always lives inside **Toolbar** (quest variant)
- **ButtonUtility** always lives inside **Toolbar** (leading or trailing slots)
- **Tile** groups with **Sheet** for overlay selection lists

## Composition Rules

Before putting something inside a component, check what's allowed:

| Component | Requires | Allows | Forbids |
|-----------|----------|--------|---------|
| Button | label | icon-left, spinner | image, badge, nested-button |
| ButtonUtility | icon-or-content | value-label, avatar-group | nested-button, image |
| Input | input-field | label, leading-icon, trailing-icon, error-message | nested-input, button-inside |
| Sheet | handle, title (plain text only — no icons/emoji) | description, close-button, body-content, footer, empty-state | nested-sheet, icon-in-title |
| ActionPrompt | label, primary-button | description, close-button, secondary-button, leading-emoji, leading-avatar | nested-prompt, image |
| Toast | title | icon, description, action-link, close-button, progress-bar | nested-toast, image, button |
| Toolbar | leading-slot | center-slot, trailing-slot, progress-bar, title, subtitle | nested-toolbar |
| EmptyStates | icon, title | description, primary-button, secondary-button | nested-empty-state, image |
| Tile | label | icon, description, chevron, radio-indicator, checkbox-indicator | button, nested-tile |

## Tokens Quick Reference

### Colors (use these, not hex)

**Backgrounds:** `--bg-sky` (page), `--bg-primary` (white cards), `--bg-secondary` (subtle), `--bg-grass` (accent green), `--bg-brand-solid` (blue fills)

**Text:** `--text-primary` (headings/body), `--text-secondary` (supporting), `--text-tertiary` (muted), `--text-quaternary` (placeholder), `--text-disabled`

**Borders:** `--border-primary` (default), `--border-secondary` (subtle), `--border-brand` (focus), `--border-error` (errors)

**Status:** `--fg-error` / `--fg-success` / `--fg-warning` for icons/indicators

### Typography

```css
/* Headings */
font-family: var(--font-family-display, 'Inter', sans-serif);
letter-spacing: var(--letter-spacing-display, -0.02em);

/* Body */
font-family: var(--font-family-body, 'Inter', sans-serif);
```

Sizes: `display-2xl` (72px) down to `display-xs` (24px) for big text. `text-xl` (20px) down to `text-xs` (12px) for body.

Weights: `--font-weight-regular` (400), `--font-weight-medium` (500), `--font-weight-semibold` (600), `--font-weight-bold` (700).

### Spacing

```
xxs: 2px | xs: 4px | sm: 6px | md: 8px | lg: 12px | xl: 16px
2xl: 20px | 3xl: 24px | 4xl: 32px | 5xl: 40px | 6xl: 48px
```

### Radius

```
xs: 4px | sm: 6px | md: 8px | xl: 12px | 2xl: 16px | 4xl: 24px | full: 9999px
```

### Shadows

- Button Primary/Destructive: `0 4px 0 0 var(--brand-600)` / `var(--red-600)`
- Button Secondary/Utility: `0 3px 0 0 var(--gray-200)`
- Cards: `0 4px 24px rgba(0,0,0,0.08)`
- Pressed state: `box-shadow: none; transform: translateY(Npx)` (N = shadow offset)

## Animation Timing

- Borders, colors, hover: `0.15s`
- Switch toggle: `0.2s`
- Sheet enter: `300ms ease-out` (slide up)
- Sheet exit: `250ms ease-in` (slide down)
- Progress bar: `0.4s cubic-bezier(0.22, 1, 0.36, 1)`
- Spinner: `0.8s linear infinite`

## Accessibility Checklist

- All interactive elements: 44x44px minimum touch target
- Inputs: `aria-invalid` + `aria-describedby` for errors
- Sheets: `aria-modal="true"` + `aria-labelledby` + trap focus + Escape to close
- Toasts: `role="status"` + `aria-live="polite"`
- Loading: `aria-busy="true"` + `aria-label` describing what's loading
- Buttons: never disable without explanation — show a Toast or error message
- Color contrast: WCAG AA minimum (4.5:1 text, 3:1 UI elements)
- Toolbar: use `<nav>` with `aria-label`

## Figma Integration

When implementing from a Figma design:

1. Run `get_design_context` on the node
2. Run `get_screenshot` for visual reference
3. Run `get_variable_defs` to verify exact token names — don't guess from screenshots
4. Translate the Figma MCP output (React + Tailwind) into vanilla HTML + CSS variables
5. Match the design 1:1, but use Sprout tokens instead of raw hex values
