---
name: sprout-ui
description: Build Sprout product screens using the design system. Use when creating prototypes, product screens, or any UI that should look and feel like the Sprout app. Covers component selection, tokens, layout patterns, and accessibility.
---

# Sprout UI -- Build with the Design System

Use this skill when building product screens, prototypes, or features that should look like the real Sprout app. This is NOT for editing the design system docs -- it's for **using** the design system to build things.

**IMPORTANT -- Always use the design system.** Whether you are building a new screen from scratch, recreating an existing screen from a URL, or implementing from a Figma design -- always build with the documented components, tokens, and patterns below. Never copy source code from an existing implementation and use it as-is. The existing implementation may predate the design system or use ad-hoc styles. Instead, treat any reference screen as a **visual spec**: understand *what* it shows (layout, content, interactions), then rebuild it using the design system.

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
  font-size: var(--font-size-display-xs, 24px); line-height: 1;
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
```

## Golden Rules

1. **Never hardcode colors.** Always use `var(--token-name)` from tokens.css.
2. **Always use TossFace** for emoji -- never system emoji. Use `.tf-icon` class with unicode codepoints.
3. **One Primary button per screen.** If you need more actions, use Secondary or ButtonUtility.
4. **44px minimum touch target** on all interactive elements.
5. **Pair font size + line height tokens.** E.g. `font-size: var(--font-size-text-md)` with `line-height: var(--line-height-text-md)`.
6. **Always include the Sprout character** on screens with the branded background.
7. **Inside Sheets, only use documented components.** Never create custom or ad-hoc components (e.g. pills, chips, custom buttons). Always translate the design intent through the Component Lookup table.
8. **Always reference existing implementations first.** Before writing character positioning, canvas sizing, or Rive init code, search the codebase for a working example.
9. **Characters are always grounded.** The bottom edge of the container always clips the character. It is never floating in empty space.
10. **Use patterns for common screen types.** Result screens, empty states, quest exercises, and camera/video flows all have documented patterns. Use them instead of inventing layouts.
11. **Transition timing: 0.1s easeInOut for feedback, spring for enter, easeIn for exit.** See Animation Timing for details.
12. **Phone screen is 402x874px.** All prototypes use this device frame. iPad is 640x960px. Design for phone first.
13. **Use Screen Recipes for full-page layouts.** The recipes section documents exact layout skeletons, Rive positioning, and JS behaviors for common screen types (home, chat, customizer, etc.).

---

## Foundations

### Background (Main variant)

IMPORTANT: Every full-screen Sprout kid view uses the branded background. It is NOT a gradient -- it is a flat `--bg-sky` fill with a CSS-only grass strip at the bottom.

**Structure:** sky fill -> scrollable content (z-index:1) -> grass (z-index:2) -> Rive character (z-index:3)

```html
<div class="screen-sky">
  <!-- toolbar, scroll content, etc. go here -->

  <!-- Sprout character -- always include on branded backgrounds -->
  <canvas id="sprout-rive" class="rive-canvas" width="780" height="780"></canvas>

  <!-- Grass -- always at bottom -->
  <div class="grass-container">
    <div class="grass-edge"></div>
    <div class="grass-fill"></div>
  </div>
</div>
```

```css
/* Sky fill -- flat color, NOT a gradient */
.screen-sky {
  background: var(--bg-sky, #e0f2fe);
  flex: 1; display: flex; flex-direction: column;
  position: relative; overflow: hidden; min-height: 0;
}

/* Grass -- CSS rounded-top edge + solid fill */
.grass-container { flex-shrink: 0; position: relative; z-index: 2; }
.grass-edge {
  height: 24px;
  border-radius: var(--radius-4xl, 24px) var(--radius-4xl, 24px) 0 0;
  background: var(--bg-grass, #86cb3c);
}
.grass-fill {
  height: 43px;
  background: var(--bg-grass, #86cb3c);
}
```

**Alt variant** (auth, splash, onboarding): same structure but `.grass-fill { height: 500px; }` for taller grass.

**IMPORTANT -- scroll behavior differs by variant:**

- **Main variant:** Content scrolls *behind* the grass and character (they stay pinned at the bottom). The scroll container needs large bottom padding (e.g. `padding-bottom: 360px`) so all content can be scrolled fully above the grass/character area. The character and grass remain visible at all times.
- **Alt variant:** Content sits *on top of* the tall grass area and scrolls normally -- the entire page scrolls together. When the user scrolls down, the character and grass scroll away off-screen like regular content. No extra bottom padding needed.

**IMPORTANT -- grass pinning:** The `.screen-sky` is `display:flex; flex-direction:column`. The grass stays at the bottom because a `flex:1` element (scroll area, spacer, or content) pushes it down. If there is no scroll content (e.g. a Sheet overlay covers the screen), you MUST add `<div style="flex:1"></div>` between the toolbar and the Rive canvas. Without this, the grass floats up to just below the toolbar.

**Kid Home variant** (`screen-sky-alt`): Used for home screens where content lives ON the grass. Different from Main/Alt:
```css
.screen-sky-alt {
  background: var(--bg-sky, #e0f2fe);
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; /* locks vertical scroll -- carousel/list scrolls internally */
}
```
- `sky-spacer` (172px height, relative) holds the Rive character above the grass
- Grass container has `flex:1` so it fills remaining space, with content scrolling inside `.grass-fill`
- Rive canvas: 402x402px CSS (804x804 retina), `transform: translateX(-50%) scale(0.92)`, `transform-origin: bottom center`, `bottom: -94px`
- See Screen Recipes for full layout skeletons

### Character (Rive)

IMPORTANT: The Sprout character is a Rive animation that must appear on every screen with the branded background. It stands on the grass edge.

**Rive file:** `/sprot2.97_.riv` -- must be the same file from the design system Resources.

**Canvas CSS -- exact spec from the documentation:**
```css
.rive-canvas {
  position: absolute;
  left: 50%;
  bottom: -46px;
  width: SCREEN_WIDTH;   /* match phone frame width, e.g. 390px */
  height: SCREEN_WIDTH;  /* square -- same as width */
  z-index: 3;
  pointer-events: none;
  transform: translateX(-50%) scale(1.25);
  transform-origin: bottom center;
}
```

- Canvas is always **square** to the screen width
- `scale(1.25)` from `bottom center` makes Sprout the right size
- `bottom: -46px` positions feet on the grass edge (shadow overlaps grass)
- `z-index: 3` -- Sprout must be ABOVE the grass (`z-index: 2`) and above scrollable content (`z-index: 1`)

**Rive initialization:**
```js
new rive.Rive({
  src: '/sprot2.97_.riv',
  canvas: document.getElementById('sprout-rive'),
  autoplay: true,
  stateMachines: 'State Machine 1',
  fit: rive.Fit.Contain,
  alignment: rive.Alignment.BottomCenter
});
```

**Inputs:** `skinID` (0-9), `hairID` (0-8), `mouthselector` (0-6), `looking` (0=center, 2=up).

**Kid Home positioning** (smaller Sprout on sky-spacer):
```css
.rive-wrap {
  position: absolute; left: 50%; bottom: -94px;
  width: 402px; height: 402px;
  z-index: 2; pointer-events: none;
  transform: translateX(-50%) scale(0.92);
  transform-origin: bottom center;
}
```
Canvas element: `width="804" height="804"` (2x for retina). Character appears ~370px wide due to scale(0.92).

**Chat screen positioning** (large Sprout behind chat):
```css
.rive-wrap {
  position: absolute; left: 50%; bottom: -196px;
  width: 690px; height: 690px;
  z-index: 2; pointer-events: none;
  transform: translateX(-50%);
}
```
Only upper body visible above grass. Chat thread bottom set to ~330px to sit above grass/character.

### Village Character (Rive)

The Village Character represents family members. It uses a different Rive file from Sprout with deep customization (skin, hair, beard, clothing).

**Rive file:** `/character2.8.riv` -- artboard: `Village-character`, state machine: `State Machine 1`.

**IMPORTANT -- Reference implementations:**
- **Avatars (XS-XL):** See `components/avatar.html` for exact canvas sizes and top offsets per size
- **Profile banner:** See `components/avatar-profile.html` for the full-width hero placement
- **Customizer:** See `product-explorer/customize-avatar.html` for the full character view

**Avatar circle positioning -- exact spec:**
```css
.avatar canvas.rive-user {
  position: absolute;
  left: 50%; transform: translateX(-50%);
  display: block; pointer-events: none;
}
.avatar-xs canvas.rive-user { width:35px;  height:50px;  top:-14px; }
.avatar-sm canvas.rive-user { width:46px;  height:66px;  top:-19px; }
.avatar-md canvas.rive-user { width:58px;  height:83px;  top:-23px; }
.avatar-lg canvas.rive-user { width:69px;  height:99px;  top:-28px; }
.avatar-xl canvas.rive-user { width:81px;  height:116px; top:-33px; }
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

**Customization inputs:** `skinID` (0-15), `hairID` (0-6), `hairshadeID` (0-12), `beardID` (0-7), `beardshadeID` (0-12), `clothingcolourID` (0-10), `clothingID` (0-11), `mouthselector` (0-20), `talkingmouth` (bool), plus `glassID`, `glassshadeID`, `eyeshadeID`, `earringID`, `facedetailID`, `headwearID`, `headwearshadeID`.

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

## Component CSS -- Tier 1

These are the actual CSS implementations. Copy them directly -- don't improvise.

### Button

```css
.btn-sprout {
  display:flex; align-items:center; justify-content:center;
  box-sizing:border-box;
  font-family:var(--font-family-body, 'Inter', sans-serif);
  font-weight:var(--font-weight-bold, 700);
  letter-spacing:0; border:none; cursor:pointer;
  gap:var(--spacing-md, 8px);
  padding:var(--spacing-lg, 12px);
  border-radius:var(--radius-2xl, 16px);
  transition:background 0.1s cubic-bezier(0.25,0.1,0.25,1), box-shadow 0.1s cubic-bezier(0.25,0.1,0.25,1), transform 0.1s cubic-bezier(0.25,0.1,0.25,1);
  user-select:none; white-space:nowrap;
  -webkit-tap-highlight-color:transparent;
  width:320px;
}

/* Sizes */
.btn-lg { height:48px; font-size:var(--font-size-text-lg, 18px); line-height:var(--line-height-text-lg, 28px); }
.btn-md { height:44px; font-size:var(--font-size-text-md, 16px); line-height:var(--line-height-text-md, 24px); padding:var(--spacing-md, 8px); }
.btn-sm { height:36px; font-size:var(--font-size-text-sm, 14px); line-height:var(--line-height-text-sm, 20px); padding:var(--spacing-sm, 6px); border-radius:var(--radius-xl, 12px); }
.btn-xs { height:28px; font-size:var(--font-size-text-sm, 14px); line-height:var(--line-height-text-sm, 20px); width:auto; padding:var(--spacing-xs, 4px); border-radius:var(--radius-md, 8px); }

/* Primary */
.btn-primary {
  background:var(--brand-500, #0ba5ec); color:var(--text-white, #ffffff);
  border-bottom:2px solid var(--brand-600, #0086c9);
  box-shadow:0 4px 0 0 var(--brand-600, #0086c9);
}
.btn-primary.btn-lg { height:50px; }
.btn-primary.btn-md { height:46px; }
.btn-primary.btn-sm { height:38px; }
.btn-primary.btn-xs { height:30px; }
.btn-primary:hover { background:var(--brand-400, #36bffa); }
.btn-primary:active, .btn-primary.state-active {
  background:var(--brand-500, #0ba5ec); border-bottom:none;
  box-shadow:none; transform:translateY(4px);
}
.btn-primary.state-disabled {
  background:var(--gray-300, #d5d7da); color:var(--text-disabled, #717680);
  border-bottom:2px solid var(--gray-400, #a4a7ae);
  box-shadow:0 4px 0 0 var(--gray-400, #a4a7ae); cursor:not-allowed; pointer-events:none;
}
.btn-primary.state-loading {
  background:var(--brand-500, #0ba5ec);
  border-bottom:2px solid var(--brand-600, #0086c9);
  box-shadow:0 4px 0 0 var(--brand-600, #0086c9); cursor:wait;
}

/* Secondary */
.btn-secondary {
  background:var(--bg-primary, #ffffff); color:var(--text-secondary, #414651);
  font-weight:var(--font-weight-semibold, 600);
  border:2px solid var(--border-secondary, #e9eaeb);
  box-shadow:0 4px 0 0 var(--gray-200, #e9eaeb);
}
.btn-secondary.btn-lg { height:54px; }
.btn-secondary.btn-md { height:50px; }
.btn-secondary.btn-sm { height:42px; }
.btn-secondary.btn-xs { height:34px; }
.btn-secondary:hover { background:var(--bg-secondary, #fafafa); }
.btn-secondary:active, .btn-secondary.state-active {
  background:var(--bg-primary, #ffffff); box-shadow:none;
  border:2px solid var(--border-secondary, #e9eaeb); transform:translateY(4px);
}
.btn-secondary.state-disabled {
  background:var(--gray-300, #d5d7da); color:var(--text-disabled, #717680);
  border:none; border-bottom:2px solid var(--gray-400, #a4a7ae);
  box-shadow:0 4px 0 0 var(--gray-400, #a4a7ae); cursor:not-allowed; pointer-events:none;
}

/* Destructive */
.btn-destructive {
  background:var(--fg-destructive-primary, #f04438); color:var(--text-white, #ffffff);
  border-bottom:2px solid var(--red-600, #d92d20);
  box-shadow:0 4px 0 0 var(--red-600, #d92d20);
}
.btn-destructive:hover { background:var(--red-400, #f97066); }
.btn-destructive:active, .btn-destructive.state-active {
  background:var(--fg-destructive-primary, #f04438); border-bottom:none;
  box-shadow:none; transform:translateY(4px);
}

/* Warning */
.btn-warning {
  background:var(--yellow-500, #eaaa08); color:var(--text-white, #ffffff);
  border-bottom:2px solid var(--yellow-600, #ca8504);
  box-shadow:0 4px 0 0 var(--yellow-600, #ca8504);
}
.btn-warning:hover { background:var(--yellow-400, #fac515); }
.btn-warning:active, .btn-warning.state-active {
  background:var(--yellow-500, #eaaa08); border-bottom:none;
  box-shadow:none; transform:translateY(4px);
}

/* Success */
.btn-success {
  background:var(--green-500, #17b26a); color:var(--text-white, #ffffff);
  border-bottom:2px solid var(--green-600, #079455);
  box-shadow:0 4px 0 0 var(--green-600, #079455);
}
.btn-success:hover { background:var(--green-400, #47cd89); }
.btn-success:active, .btn-success.state-active {
  background:var(--green-500, #17b26a); border-bottom:none;
  box-shadow:none; transform:translateY(4px);
}

/* Disabled (all solid variants) */
.btn-sprout.state-disabled {
  background:var(--gray-300, #d5d7da); color:var(--text-disabled, #717680);
  border-bottom:2px solid var(--gray-400, #a4a7ae);
  box-shadow:0 4px 0 0 var(--gray-400, #a4a7ae); cursor:not-allowed; pointer-events:none;
}

/* Loading spinner */
.spinner { display:inline-block; border-radius:50%; animation:spin 1.0s linear infinite; }
.btn-lg .spinner { width:18px; height:18px; }
.btn-md .spinner { width:16px; height:16px; }
.btn-sm .spinner, .btn-xs .spinner { width:14px; height:14px; }
.btn-primary .spinner { border:2px solid rgba(255,255,255,0.3); border-top-color:#ffffff; }
.btn-secondary .spinner { border:2px solid rgba(11,165,236,0.2); border-top-color:var(--brand-500, #0ba5ec); }
.btn-destructive .spinner, .btn-warning .spinner, .btn-success .spinner { border:2px solid rgba(255,255,255,0.3); border-top-color:#ffffff; }
@keyframes spin { to { transform:rotate(360deg); } }
```

**Markup:**
```html
<button class="btn-sprout btn-primary btn-lg">Continue</button>
<button class="btn-sprout btn-secondary btn-md">Cancel</button>
<button class="btn-sprout btn-primary btn-lg state-loading"><span class="spinner"></span></button>
```

### ButtonUtility

Pill-shaped utility button. Used in Toolbar for navigation, stats, and actions.

```css
.btn-util {
  display:inline-flex; align-items:center; justify-content:center;
  gap:0; padding:var(--spacing-lg, 12px);
  background:var(--bg-primary, #ffffff);
  border:2px solid var(--border-secondary, #e9eaeb);
  border-radius:var(--radius-full, 9999px);
  box-shadow:0 3px 0 0 var(--gray-200, #e9eaeb);
  overflow:hidden; cursor:pointer; box-sizing:border-box; flex-shrink:0;
  transition:background 0.1s cubic-bezier(0.25,0.1,0.25,1), box-shadow 0.1s cubic-bezier(0.25,0.1,0.25,1), border-color 0.1s cubic-bezier(0.25,0.1,0.25,1), transform 0.1s cubic-bezier(0.25,0.1,0.25,1);
}
.btn-util:hover { background:var(--gray-50, #fafafa); }
.btn-util:active { box-shadow:none; transform:translateY(2px); }
.btn-util-gap, .btn-util-with-label { gap:var(--spacing-md, 8px); }
.btn-util-sm { padding:var(--spacing-md, 8px); }
.btn-util-disabled { background:var(--gray-300, #d5d7da); border-color:var(--gray-400, #a4a7ae); box-shadow:0 4px 0 0 var(--gray-400, #a4a7ae); cursor:not-allowed; pointer-events:none; }

/* Primary variant */
.btn-util-primary { background:var(--brand-500, #0ba5ec); border-color:var(--brand-600, #0086c9); box-shadow:0 4px 0 0 var(--brand-600, #0086c9); }
.btn-util-primary:hover { background:var(--brand-400, #36bffa); }
.btn-util-primary:active { background:var(--brand-500, #0ba5ec); box-shadow:none; transform:translateY(2px); }

/* Value label */
.btn-util-label {
  font-family:var(--font-family-body, 'Inter', sans-serif);
  font-size:var(--font-size-text-md, 16px); font-weight:var(--font-weight-regular, 400);
  line-height:var(--line-height-text-md, 24px); color:var(--text-secondary, #414651); white-space:nowrap;
}
```

**Markup:**
```html
<button class="btn-util"><span class="tf-icon">&#x1F6E1;&#xFE0F;</span></button>
<button class="btn-util btn-util-with-label"><span class="tf-icon">&#x1F525;</span><span class="btn-util-label">5</span></button>
```

### Toolbar

```css
.toolbar {
  display:flex; align-items:center;
  padding:0 var(--spacing-xl, 16px) var(--spacing-md, 8px);
  position:relative; width:100%; box-sizing:border-box;
}

/* Kid Home variant */
.toolbar-kid-home { align-items:center; justify-content:space-between; }
.toolbar-trailing { display:flex; align-items:center; gap:var(--spacing-md, 8px); }

/* Default variant */
.toolbar-default { align-items:flex-start; justify-content:space-between; }
.toolbar-default .leading, .toolbar-default .trailing { flex:1; display:flex; align-items:center; }
.toolbar-default .trailing { justify-content:flex-end; }
.toolbar-default .toolbar-abs-title {
  position:absolute; left:50%; top:50%; transform:translate(-50%, -50%);
  font-size:var(--font-size-text-lg, 18px); font-weight:var(--font-weight-semibold, 600);
  color:var(--text-primary, #181d27); white-space:nowrap;
}

/* Compact Large variant */
.toolbar-compact-large { gap:5px; align-items:flex-start; justify-content:center; }
.toolbar-compact-large .toolbar-title-display {
  flex:1; font-family:var(--font-family-display, 'Inter', sans-serif);
  font-size:var(--font-size-display-md, 36px); line-height:var(--line-height-display-md, 44px);
  font-weight:var(--font-weight-bold, 700); color:var(--text-primary, #181d27); letter-spacing:-0.72px;
}

/* Quest variant */
.toolbar-quest {
  align-items:center; background:var(--bg-sky, #e0f2fe);
  border-bottom:1px solid var(--blue-light-200, #b9e6fe);
  gap:var(--spacing-md, 8px); height:56px;
}
.toolbar-quest .progress-bar { flex:1; }
.quest-close { display:flex; align-items:center; padding:var(--spacing-sm, 6px) var(--spacing-xs, 4px); flex-shrink:0; cursor:pointer; }
.quest-close svg { width:32px; height:32px; }

/* Quest Overlay (transparent) variant */
.toolbar-quest-transparent { align-items:center; gap:var(--spacing-md, 8px); }
.toolbar-quest-transparent .progress-bar { flex:1; }
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
.text-input-wrapper { display:flex; flex-direction:column; gap:var(--spacing-md, 8px); width:370px; }
.text-input-label {
  font-family:var(--font-family-body, 'Inter', sans-serif);
  font-size:var(--font-size-text-md, 16px); line-height:var(--line-height-text-md, 24px);
  font-weight:var(--font-weight-bold, 700); color:var(--text-primary, #181d27);
}
.text-input {
  display:flex; align-items:center; gap:var(--spacing-md, 8px);
  box-sizing:border-box; width:370px; height:56px;
  padding:var(--spacing-xxs, 2px) 18px;
  background:var(--bg-primary, #ffffff);
  border:2px solid var(--border-secondary, #e9eaeb);
  border-radius:var(--radius-2xl, 16px);
  font-family:var(--font-family-body, 'Inter', sans-serif);
  font-size:var(--font-size-text-md, 16px); color:var(--text-primary, #181d27);
  transition:border-color 0.1s cubic-bezier(0.25,0.1,0.25,1);
}
.text-input .input-placeholder { flex:1; min-width:0; color:var(--text-placeholder, #717680); }
.text-input.state-focused { border-color:var(--border-brand, #0ba5ec); }
.text-input.state-error { border-color:var(--border-error, #f04438); }
.text-input:disabled, .text-input.state-disabled { background:var(--bg-disabled, #f5f5f5); }
```

### Tile

```css
.tile {
  display:flex; align-items:center; gap:var(--spacing-xl, 16px);
  box-sizing:border-box; width:100%;
  padding:var(--spacing-xl, 16px) var(--spacing-2xl, 20px);
  background:var(--bg-primary, #ffffff);
  border:2px solid var(--border-secondary, #e9eaeb);
  border-radius:var(--radius-xl, 12px);
  box-shadow:0 3px 0 0 var(--gray-200, #e9eaeb);
  cursor:pointer;
  transition:background 0.1s cubic-bezier(0.25,0.1,0.25,1), border-color 0.1s cubic-bezier(0.25,0.1,0.25,1), box-shadow 0.1s cubic-bezier(0.25,0.1,0.25,1);
  user-select:none; -webkit-tap-highlight-color:transparent;
}
.tile:hover { background:var(--bg-secondary, #fafafa); }
.tile.checked, .tile.selected {
  background:var(--bg-brand-secondary, #e0f2fe);
  border-color:var(--brand-300, #7cd4fd); box-shadow:0 3px 0 0 var(--brand-300, #7cd4fd);
}
.tile:active { box-shadow:none; transform:translateY(2px); }

/* Validation states */
.tile.success { background:var(--green-100, #dcfae6); border-color:var(--green-300, #75e0a7); box-shadow:0 4px 0 0 var(--green-300, #75e0a7); pointer-events:none; }
.tile.error { background:var(--red-100, #fee4e2); border-color:var(--red-300, #fda29b); box-shadow:0 4px 0 0 var(--red-300, #fda29b); pointer-events:none; }
.tile.disabled { box-shadow:none; pointer-events:none; cursor:default; }
.tile.disabled .tile-label { color:var(--gray-400, #a4a7ae); }

/* Leading */
.tile-leading { width:40px; height:40px; flex-shrink:0; position:relative; }
.tile-leading-icon { display:flex; align-items:center; justify-content:center; font-family:'TossFace', sans-serif; font-size:32px; line-height:1; }

/* Content */
.tile-content { flex:1; min-width:0; }
.tile-label { font-size:var(--font-size-text-md, 16px); line-height:var(--line-height-text-md, 24px); font-weight:var(--font-weight-bold, 700); color:var(--text-primary, #181d27); }
.tile-desc { font-size:var(--font-size-text-sm, 14px); line-height:var(--line-height-text-sm, 20px); color:var(--text-secondary, #414651); }

/* Trailing: Radio */
.tile-radio { width:24px; height:24px; flex-shrink:0; border:2px solid var(--border-secondary, #e9eaeb); border-radius:var(--radius-full, 9999px); display:flex; align-items:center; justify-content:center; background:var(--bg-primary, #ffffff); transition:background 0.1s, border-color 0.1s; }
.checked .tile-radio, .selected .tile-radio { background:var(--brand-500, #0ba5ec); border-color:var(--brand-500, #0ba5ec); }
.tile-radio-dot { display:none; width:8px; height:8px; border-radius:var(--radius-full, 9999px); background:var(--fg-white, #ffffff); }
.checked .tile-radio-dot, .selected .tile-radio-dot { display:block; }

/* Trailing: Checkbox */
.tile-checkbox { width:24px; height:24px; flex-shrink:0; border:2px solid var(--border-secondary, #e9eaeb); border-radius:var(--radius-sm, 6px); display:flex; align-items:center; justify-content:center; background:var(--bg-primary, #ffffff); }
.checked .tile-checkbox, .selected .tile-checkbox { background:var(--brand-500, #0ba5ec); border-color:var(--brand-500, #0ba5ec); }
.tile-check-icon { display:none; width:14px; height:14px; stroke:var(--fg-white, #ffffff); stroke-width:2.5; fill:none; }
.checked .tile-check-icon, .selected .tile-check-icon { display:block; }

/* Trailing: Chevron */
.tile-chevron { width:24px; height:24px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:var(--text-tertiary, #535862); }
.tile-chevron svg { width:12px; height:12px; stroke:currentColor; stroke-width:2; fill:none; }

/* Compact size (sm) */
.tile.tile-sm { gap:var(--spacing-lg, 12px); padding:var(--spacing-lg, 12px) var(--spacing-xl, 14px); }

/* Swatch variant */
.tile.tile-swatch { width:auto; padding:var(--spacing-md, 8px); gap:0; overflow:clip; }
.tile-swatch-color { width:40px; height:40px; border-radius:var(--radius-md, 8px); flex-shrink:0; }

/* Image variant */
.tile.tile-image { width:112px; height:112px; padding:var(--spacing-md, 8px); gap:0; overflow:clip; position:relative; }

/* Sortable variant */
.tile.tile-sortable { gap:var(--spacing-md, 8px); padding:var(--spacing-xl, 16px); cursor:grab; touch-action:none; }
.tile.tile-sortable.dragging { background:var(--bg-brand-secondary, #e0f2fe); border-color:var(--brand-300, #7cd4fd); box-shadow:0 8px 16px -4px rgba(10,13,18,0.12); z-index:10; transform:scale(1.02); cursor:grabbing; }
```

### Sheet

```css
.sheet-scrim { position:absolute; inset:0; background:var(--bg-overlay, rgba(10,13,18,0.2)); display:flex; align-items:flex-end; }

.sheet {
  background:var(--bg-primary, #ffffff);
  border-radius:var(--radius-4xl, 24px) var(--radius-4xl, 24px) 0 0;
  width:100%; display:flex; flex-direction:column; max-height:90%;
}

.sheet-top { padding:var(--spacing-xl, 16px); flex-shrink:0; display:flex; flex-direction:column; gap:var(--spacing-xl, 16px); align-items:center; }
.sheet-handle { width:36px; height:4px; background:var(--gray-300, #d5d7da); border-radius:2px; }
.sheet-header { display:flex; align-items:center; gap:var(--spacing-md, 8px); width:100%; }
.sheet-header-content { flex:1; min-width:0; display:flex; flex-direction:column; gap:var(--spacing-xxs, 2px); }
.sheet-title {
  font-family:var(--font-family-display, 'Inter', sans-serif);
  font-size:var(--font-size-display-md, 36px); line-height:var(--line-height-display-md, 44px);
  font-weight:var(--font-weight-bold, 700); letter-spacing:var(--letter-spacing-display, -0.02em);
  color:var(--text-primary, #181d27); margin:0;
}
.sheet-description { font-size:var(--font-size-text-sm, 14px); line-height:var(--line-height-text-sm, 20px); color:var(--text-quaternary, #717680); }
.sheet-close { width:44px; height:44px; flex-shrink:0; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-400, #a4a7ae); background:none; border:none; }
.sheet-close svg { width:24px; height:24px; }

.sheet-body { flex:1; min-height:0; overflow-y:auto; padding:0 var(--spacing-xl, 16px); -webkit-overflow-scrolling:touch; }

.sheet-footer { flex-shrink:0; padding:var(--spacing-xl, 16px); padding-bottom:var(--spacing-2xl, 20px); border-top:1px solid var(--border-secondary, #e9eaeb); background:var(--bg-primary, #ffffff); }
.sheet-footer.no-border { border-top:none; }
.sheet-footer .btn-sprout, .sheet-body .btn-sprout { width:100%; }

/* Compact title */
.sheet-title-compact { font-size:var(--font-size-text-md, 16px); line-height:var(--line-height-text-md, 24px); font-weight:var(--font-weight-bold, 700); letter-spacing:0; color:var(--text-primary, #181d27); margin:0; }

/* Navigation header */
.sheet-header-nav { display:flex; align-items:center; gap:var(--spacing-md, 8px); width:100%; }
.sheet-nav-btn { width:44px; height:44px; flex-shrink:0; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-400, #a4a7ae); background:none; border:none; }
.sheet-nav-title { flex:1; font-size:var(--font-size-text-md, 16px); font-weight:var(--font-weight-bold, 700); color:var(--text-primary, #181d27); }

/* Empty state */
.sheet-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:var(--spacing-lg, 12px); padding:var(--spacing-5xl, 40px) 0; text-align:center; }
.sheet-empty-icon { font-family:'TossFace', sans-serif; font-size:var(--font-size-display-lg, 48px); }
.sheet-empty-text { font-size:var(--font-size-text-sm, 14px); color:var(--text-quaternary, #717680); }
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

White card with shadow for confirmations and permission requests. 370px width.

```css
.action-prompt {
  display:flex; flex-direction:column; gap:var(--spacing-xl, 16px);
  background:var(--bg-primary, #ffffff); border-radius:var(--radius-xl, 12px);
  padding:var(--spacing-xl, 16px); width:370px;
  box-shadow: 0 2px 2px -1px rgba(10,13,18,0.04), 0 4px 6px -2px rgba(10,13,18,0.03), 0 12px 16px -4px rgba(10,13,18,0.08);
}
.ap-content { display:flex; align-items:flex-start; gap:var(--spacing-md, 8px); }
.ap-leading { flex-shrink:0; width:46px; height:46px; display:flex; align-items:center; justify-content:center; }
.ap-leading-emoji { font-family:'TossFace', sans-serif; font-size:36px; line-height:1; }
.ap-leading-avatar { width:46px; height:46px; border-radius:var(--radius-full, 9999px); overflow:hidden; position:relative; }
.ap-text { flex:1; min-width:0; display:flex; flex-direction:column; gap:var(--spacing-xxs, 2px); justify-content:center; }
.ap-label { font-size:var(--font-size-text-md, 16px); font-weight:var(--font-weight-bold, 700); line-height:var(--line-height-text-md, 24px); color:var(--text-primary, #181d27); }
.ap-desc { font-size:var(--font-size-text-sm, 14px); line-height:var(--line-height-text-sm, 20px); color:var(--text-secondary, #414651); }
.ap-close { width:24px; height:24px; flex-shrink:0; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--gray-500, #717680); }
.ap-actions { display:flex; gap:var(--spacing-xl, 16px); width:100%; }
.ap-actions .btn-sprout { flex:1; }
```

### Alert

Centered modal card for confirmations. 370px width with stacked or side-by-side buttons.

```css
.alert {
  display:flex; flex-direction:column; align-items:center;
  box-sizing:border-box; width:370px;
  padding:var(--spacing-xl, 16px); gap:var(--spacing-xl, 16px);
  background:var(--bg-primary, #ffffff);
  border:2px solid var(--border-secondary, #e9eaeb);
  border-radius:var(--radius-xl, 12px);
  box-shadow: 0 12px 16px -4px rgba(10,13,18,0.08), 0 4px 6px -2px rgba(10,13,18,0.03), 0 2px 2px -1px rgba(10,13,18,0.04);
  overflow:hidden;
}
.alert-icon { width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-family:'TossFace', sans-serif; font-size:32px; line-height:1; }
.alert-content { display:flex; flex-direction:column; width:100%; gap:0; text-align:center; }
.alert-label { font-size:var(--font-size-text-md, 16px); font-weight:var(--font-weight-bold, 700); color:var(--text-primary, #181d27); }
.alert-desc { font-size:var(--font-size-text-md, 16px); color:var(--text-secondary, #414651); }
.alert-actions { display:flex; flex-direction:column; width:100%; gap:10px; }
.alert-actions .btn-sprout { width:100%; }
.alert-actions.alert-actions-row { flex-direction:row; }
.alert-actions.alert-actions-row .btn-sprout { flex:1; width:auto; }
```

**Markup:**
```html
<div class="alert">
  <div class="alert-icon">&#x1F512;</div>
  <div class="alert-content">
    <div class="alert-label">Are you sure?</div>
    <div class="alert-desc">This action cannot be undone.</div>
  </div>
  <div class="alert-actions alert-actions-row">
    <button class="btn-sprout btn-secondary btn-md">Cancel</button>
    <button class="btn-sprout btn-destructive btn-md">Delete</button>
  </div>
</div>
```

### Toast

Non-blocking feedback. 370px width. 4 variants: success, error, warning, info.

```css
.toast {
  display:flex; align-items:flex-start; gap:var(--spacing-md, 8px);
  border-radius:var(--radius-xl, 12px);
  padding:var(--spacing-lg, 12px) var(--spacing-xl, 16px); width:370px;
  background:var(--bg-primary, #ffffff);
  border:2px solid var(--border-secondary, #e9eaeb);
  box-shadow: 0 12px 16px -4px rgba(10,13,18,0.08), 0 4px 6px -2px rgba(10,13,18,0.03);
  position:relative; overflow:hidden;
}
.toast-icon { font-family:'TossFace', sans-serif; font-size:20px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.toast-content { flex:1; min-width:0; display:flex; flex-direction:column; gap:var(--spacing-xxs, 2px); }
.toast-title { font-size:var(--font-size-text-md, 16px); font-weight:var(--font-weight-bold, 700); color:var(--text-primary, #181d27); }
.toast-desc { font-size:var(--font-size-text-sm, 14px); color:var(--text-secondary, #414651); }
.toast-action { font-size:var(--font-size-text-sm, 14px); font-weight:var(--font-weight-bold, 700); color:var(--brand-700, #026aa2); cursor:pointer; }
.toast-close { width:24px; height:24px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:var(--text-quaternary, #717680); cursor:pointer; }

/* Progress bar */
.toast-progress { position:absolute; bottom:0; left:0; right:0; height:4px; background:var(--bg-secondary, #fafafa); }
.toast-progress-fill { height:100%; border-radius:var(--radius-full, 9999px); }
.toast-success .toast-progress-fill { background:var(--green-500, #17b26a); }
.toast-error .toast-progress-fill { background:var(--red-500, #f04438); }
.toast-warning .toast-progress-fill { background:var(--yellow-500, #eaaa08); }
.toast-info .toast-progress-fill { background:var(--brand-500, #0ba5ec); }

/* Animations */
@keyframes toast-enter { 0% { transform:translateY(100%); opacity:0; } 100% { transform:translateY(0); opacity:1; } }
@keyframes toast-exit { 0% { transform:translateY(0); opacity:1; } 100% { transform:translateY(100%); opacity:0; } }
@keyframes toast-countdown { 0% { width:100%; } 100% { width:0%; } }
.toast-anim-enter { animation:toast-enter 0.5s cubic-bezier(0.5,1.8,0.3,0.8) forwards; }
.toast-anim-exit { animation:toast-exit 0.35s ease-in forwards; }
.toast-anim-enter .toast-progress-fill, .toast-anim-idle .toast-progress-fill { animation:toast-countdown var(--toast-duration, 4s) linear forwards; }
```

### FeedbackBanner

Pinned-bottom feedback banner for quiz results. 4 variants: default, success, warning, error. Uses `buttons.css` for CTAs.

```css
.fb {
  display:flex; flex-direction:column; gap:var(--spacing-xl, 16px);
  padding:var(--spacing-3xl, 24px) var(--spacing-xl, 16px);
  width:358px; font-family:var(--font-family-body, 'Inter', sans-serif);
}
.fb-default { background:var(--bg-primary, #ffffff); }
.fb-success { background:var(--bg-success-secondary, #dcfae6); }
.fb-warning { background:var(--bg-warning-secondary, #fef7c3); }
.fb-error   { background:var(--bg-error-secondary, #fee4e2); }
.fb-bordered { border-top:1px solid var(--border-primary, #d5d7da); }

.fb-header { display:flex; align-items:center; gap:var(--spacing-lg, 12px); }
.fb-icon { width:32px; height:32px; flex-shrink:0; font-family:'TossFace', sans-serif; font-size:28px; line-height:32px; }
.fb-title { flex:1; font-size:var(--font-size-display-xs, 24px); font-weight:var(--font-weight-bold, 700); line-height:var(--line-height-display-xs, 32px); }
.fb-default .fb-title { color:var(--text-primary, #181d27); }
.fb-success .fb-title { color:var(--text-success-primary, #079455); }
.fb-warning .fb-title { color:var(--text-warning-primary, #ca8504); }
.fb-error   .fb-title { color:var(--text-error-primary, #d92d20); }

.fb-content { display:flex; flex-direction:column; gap:var(--spacing-xxs, 2px); font-size:var(--font-size-text-md, 16px); }
.fb-subtitle { font-weight:var(--font-weight-bold, 700); }
.fb-desc { font-weight:var(--font-weight-regular, 400); }

.fb .btn-sprout { width:100%; }
.fb-btn-row { display:flex; gap:10px; width:100%; }
.fb-btn-row .btn-sprout { flex:1; }
```

### Avatar

```css
.avatar {
  border-radius:var(--radius-full, 9999px); background:var(--bg-sky, #e0f2fe);
  flex-shrink:0; display:flex; align-items:center; justify-content:center;
  font-weight:var(--font-weight-regular, 400); color:var(--text-brand-secondary, #026aa2);
  line-height:1; overflow:hidden; position:relative;
}
.avatar-xs { width:24px; height:24px; font-size:var(--font-size-text-xs, 12px); }
.avatar-sm { width:32px; height:32px; font-size:var(--font-size-text-sm, 14px); }
.avatar-md { width:40px; height:40px; font-size:var(--font-size-text-md, 16px); }
.avatar-lg { width:48px; height:48px; font-size:var(--font-size-text-lg, 18px); }
.avatar-xl { width:56px; height:56px; font-size:var(--font-size-text-xl, 20px); }

/* Rive canvas per size -- user variant */
.avatar canvas.rive-user { position:absolute; left:50%; transform:translateX(-50%); display:block; pointer-events:none; }
.avatar-xs canvas.rive-user { width:35px; height:50px; top:-14px; }
.avatar-sm canvas.rive-user { width:46px; height:66px; top:-19px; }
.avatar-md canvas.rive-user { width:58px; height:83px; top:-23px; }
.avatar-lg canvas.rive-user { width:69px; height:99px; top:-28px; }
.avatar-xl canvas.rive-user { width:81px; height:116px; top:-33px; }

/* Rive canvas per size -- sprout variant */
.avatar-xs canvas.rive-sprout { width:64px; height:92px; top:-27px; }
.avatar-sm canvas.rive-sprout { width:86px; height:124px; top:-36px; }
.avatar-md canvas.rive-sprout { width:108px; height:155px; top:-45px; }
.avatar-lg canvas.rive-sprout { width:130px; height:186px; top:-54px; }
.avatar-xl canvas.rive-sprout { width:150px; height:217px; top:-63px; }

.avatar-bordered { border:2px solid var(--fg-white, #ffffff); }

/* Background colors */
.avatar-bg-blue { background:#b9e6fe; }
.avatar-bg-violet { background:#ddd6fe; }
.avatar-bg-pink { background:#fcceee; }
.avatar-bg-red { background:#fecdca; }
.avatar-bg-green { background:#abefc6; }
.avatar-bg-sprout { background:#ceeab0; }
.avatar-bg-yellow { background:#feee95; }
.avatar-bg-orange { background:#f9dbaf; }
```

### AvatarGroup

```css
.avatar-count { background:var(--bg-sky, #e0f2fe); color:var(--text-brand-secondary, #026aa2); font-weight:var(--font-weight-semibold, 600); }
.user-group { display:flex; align-items:center; }
.user-group-xs { padding-right:6px; }
.user-group-xs .avatar { margin-right:-6px; }
.user-group-sm { padding-right:8px; }
.user-group-sm .avatar { margin-right:-8px; }
.user-group-md { padding-right:10px; }
.user-group-md .avatar { margin-right:-10px; }
```

### Switch

```css
.switch {
  display:flex; align-items:center; width:44px; height:24px;
  padding:var(--spacing-xxs, 2px); border-radius:var(--radius-full, 9999px);
  background:var(--bg-secondary, #fafafa); cursor:pointer;
  transition:background 0.25s cubic-bezier(0.5,1.8,0.3,0.8), justify-content 0.25s cubic-bezier(0.5,1.8,0.3,0.8);
  box-sizing:border-box; flex-shrink:0;
}
.switch .switch-thumb { width:20px; height:20px; border-radius:var(--radius-full, 9999px); background:var(--fg-white, #ffffff); transition:transform 0.25s cubic-bezier(0.5,1.8,0.3,0.8); }
.switch.checked { background:var(--brand-500, #0ba5ec); justify-content:flex-end; }
.switch.checked:hover { background:var(--fg-brand-primary-hover, #36bffa); }
.switch.disabled { background:var(--bg-disabled, #f5f5f5); cursor:not-allowed; }
.switch.disabled .switch-thumb { background:var(--bg-secondary, #fafafa); }

.switch-row { display:flex; gap:var(--spacing-md, 8px); align-items:flex-start; max-width:370px; width:100%; }
.switch-row .switch-content { flex:1; min-width:0; display:flex; flex-direction:column; gap:var(--spacing-xxs, 2px); }
.switch-row .switch-label { font-size:var(--font-size-text-md, 16px); color:var(--text-primary, #181d27); }
.switch-row .switch-desc { font-size:var(--font-size-text-sm, 14px); color:var(--text-secondary, #414651); }
```

### Checkbox

```css
.checkbox {
  display:flex; align-items:center; justify-content:center;
  width:24px; height:24px; border-radius:var(--radius-sm, 6px);
  border:2px solid var(--border-secondary, #e9eaeb);
  background:var(--bg-primary, #ffffff); cursor:pointer; flex-shrink:0;
  transition:background 0.1s cubic-bezier(0.25,0.1,0.25,1), border-color 0.1s cubic-bezier(0.25,0.1,0.25,1);
}
.checkbox.checked { background:var(--brand-500, #0ba5ec); border-color:var(--brand-500, #0ba5ec); }
.checkbox .check-icon { display:none; width:16px; height:16px; }
.checkbox.checked .check-icon { display:block; }
.checkbox .check-icon svg { width:16px; height:16px; fill:none; stroke:var(--fg-white, #ffffff); stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; }

.checkbox-row { display:flex; gap:var(--spacing-md, 8px); align-items:flex-start; max-width:370px; width:100%; }
.checkbox-row .checkbox-label { font-size:var(--font-size-text-md, 16px); color:var(--text-primary, #181d27); }
.checkbox-row .checkbox-desc { font-size:var(--font-size-text-sm, 14px); color:var(--text-secondary, #414651); }
```

### Radio

```css
.radio {
  display:flex; align-items:center; justify-content:center;
  width:24px; height:24px; border-radius:var(--radius-full, 9999px);
  border:2px solid var(--border-secondary, #e9eaeb);
  background:var(--bg-primary, #ffffff); cursor:pointer; flex-shrink:0;
  transition:background 0.1s cubic-bezier(0.25,0.1,0.25,1), border-color 0.1s cubic-bezier(0.25,0.1,0.25,1);
}
.radio.checked { background:var(--brand-500, #0ba5ec); border-color:var(--brand-500, #0ba5ec); }
.radio .radio-dot { display:none; width:8px; height:8px; border-radius:var(--radius-full, 9999px); background:var(--fg-white, #ffffff); }
.radio.checked .radio-dot { display:block; }
.radio-group { display:flex; flex-direction:column; gap:var(--spacing-lg, 12px); }
```

### ProgressBar

```css
.progress-bar {
  display:flex; flex-direction:column; gap:0; height:42px; width:100%;
  align-items:flex-start; justify-content:flex-end; position:relative; overflow:visible;
}
.progress-message {
  font-size:var(--font-size-text-xs, 12px); font-weight:var(--font-weight-bold, 700);
  color:var(--brand-500, #0ba5ec); text-transform:uppercase; letter-spacing:0.5px; width:100%;
}
.progress-message:empty, .progress-message.hidden { display:none; }
.progress-track {
  width:100%; height:24px; background:var(--bg-secondary, #fafafa);
  border-radius:var(--radius-full, 9999px); position:relative; display:flex; flex-direction:column; align-items:flex-start;
}
.progress-bar.stepper .progress-track { height:16px; }
.progress-fill {
  flex:1 0 0; height:auto; background:var(--brand-500, #0ba5ec);
  border-radius:var(--radius-full, 9999px); min-width:24px;
  padding:var(--spacing-xs, 4px) var(--spacing-md, 8px);
  transition:width 0.35s cubic-bezier(0.5,1.8,0.3,0.8);
  display:flex; flex-direction:column; align-items:flex-start;
}
.progress-fill::after {
  content:''; display:block; width:100%; height:4px;
  background:var(--utility-brand-300, #7cd4fd); border-radius:var(--radius-full, 9999px);
}

/* Counter */
.progress-counter {
  position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);
  font-size:var(--font-size-text-xs, 12px); font-weight:var(--font-weight-semibold, 600);
  color:var(--text-quaternary, #717680); mix-blend-mode:multiply; pointer-events:none; z-index:1;
}

/* Checkpoints */
.progress-checkpoint {
  position:absolute; top:50%; transform:translate(-50%, -50%);
  width:24px; height:24px; border-radius:var(--radius-full, 9999px);
  background:var(--bg-secondary, #fafafa); display:flex; align-items:center; justify-content:center;
}
.progress-checkpoint.reached { background:var(--fg-brand-primary, #0ba5ec); }
```

### LoadingIndicator

```css
.spinner-circle { display:inline-block; flex-shrink:0; animation:spinner-rotate 1.0s linear infinite; }
@keyframes spinner-rotate { to { transform:rotate(360deg); } }
.spinner-lg { width:28px; height:28px; }
.spinner-md { width:24px; height:24px; }
.spinner-sm { width:20px; height:20px; }
.loading-inline { display:flex; flex-direction:column; align-items:center; gap:var(--spacing-xl, 16px); }
.loading-inline .loading-text { font-size:var(--font-size-text-lg, 18px); color:var(--text-secondary, #414651); text-align:center; }
```

**Markup (Primary):**
```html
<svg class="spinner-circle spinner-lg" viewBox="0 0 28 28" fill="none">
  <circle cx="14" cy="14" r="12" stroke="var(--border-primary, #d5d7da)" stroke-width="3"/>
  <path d="M26 14c0-6.627-5.373-12-12-12" stroke="var(--fg-brand-primary, #0ba5ec)" stroke-width="3" stroke-linecap="round"/>
</svg>
```

**Markup (Muted -- use on colored/dark backgrounds):**
```html
<svg class="spinner-circle spinner-lg" viewBox="0 0 28 28" fill="none">
  <circle cx="14" cy="14" r="12" stroke="rgba(255,255,255,0.5)" stroke-width="3"/>
  <path d="M26 14c0-6.627-5.373-12-12-12" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
</svg>
```

### PasscodeInput

```css
.passcode { display:flex; flex-direction:column; align-items:center; gap:var(--spacing-md, 8px); max-width:378px; width:100%; }
.passcode-label { font-size:var(--font-size-text-md, 16px); font-weight:var(--font-weight-bold, 700); color:var(--text-primary, #181d27); text-align:center; }
.passcode-row { display:flex; gap:var(--spacing-xl, 16px); justify-content:center; }
.passcode-cell {
  width:48px; height:56px; border:2px solid var(--border-secondary, #e9eaeb);
  border-radius:var(--radius-2xl, 16px); background:var(--bg-primary, #ffffff);
  display:flex; align-items:center; justify-content:center;
  font-size:var(--font-size-text-md, 16px); color:var(--text-primary, #181d27); text-align:center;
}
.passcode-cell.focus { border-color:var(--border-brand, #0ba5ec); }
.passcode.error .passcode-cell { border-color:var(--border-error, #f04438); }
.passcode-error { font-size:var(--font-size-text-sm, 14px); color:var(--text-error-primary, #d92d20); text-align:center; }
```

### Social Buttons

```css
.btn-social {
  display:flex; align-items:center; justify-content:center; gap:var(--spacing-md, 8px);
  font-family:var(--font-family-body, 'Inter', sans-serif);
  font-weight:var(--font-weight-bold, 700);
  font-size:var(--font-size-text-md, 16px); width:320px; height:48px;
  padding:var(--spacing-lg, 12px) var(--spacing-3xl, 24px);
  border-radius:var(--radius-2xl, 16px); cursor:pointer;
  transition:background 0.1s cubic-bezier(0.25,0.1,0.25,1), box-shadow 0.1s cubic-bezier(0.25,0.1,0.25,1);
  background:var(--bg-primary, #ffffff); color:var(--text-secondary, #414651);
  border:2px solid var(--border-secondary, #e9eaeb);
  box-shadow:0 3px 0 0 var(--gray-200, #e9eaeb);
}
.btn-social:hover { background:var(--bg-secondary, #fafafa); }
.btn-social:active { box-shadow:none; transform:translateY(3px); }
.btn-social.state-disabled { background:var(--fg-disabled-subtle, #d5d7da); color:var(--text-disabled, #717680); border:none; box-shadow:0 4px 0 0 var(--gray-400, #a4a7ae); cursor:not-allowed; pointer-events:none; }
.social-icon { width:24px; height:24px; flex-shrink:0; }
```

### Badges

```css
.badge-pill {
  display:inline-flex; align-items:center; gap:var(--spacing-xxs, 2px);
  padding:var(--spacing-xs, 4px) var(--spacing-sm, 6px);
  border-radius:var(--radius-full, 9999px);
  font-size:var(--font-size-text-xs, 12px); line-height:var(--line-height-text-xs, 16px);
}
.pill-brand { background:var(--brand-200, #b9e6fe); color:var(--brand-700, #026aa2); }
.pill-violet { background:var(--violet-200, #ddd6fe); color:var(--violet-700, #5925dc); }
.pill-pink { background:var(--pink-200, #fcceee); color:var(--pink-700, #c11574); }
.pill-red { background:var(--red-200, #fecdca); color:var(--red-700, #b42318); }
.pill-orange { background:var(--orange-200, #f9dbaf); color:var(--orange-700, #b93815); }
.pill-yellow { background:var(--yellow-200, #feee95); color:var(--yellow-700, #a15c07); }
.pill-green { background:var(--green-200, #abefc6); color:var(--green-700, #067647); }

.badge-inline { display:inline-flex; align-items:center; gap:var(--spacing-xs, 4px); font-size:var(--font-size-text-xs, 12px); color:var(--text-secondary, #414651); }
.badge-status { display:flex; align-items:center; justify-content:center; padding:var(--spacing-xxs, 2px); background:var(--bg-primary, #ffffff); border-radius:var(--radius-xs, 4px); font-family:'TossFace', sans-serif; font-size:12px; }
```

### TabBar

Bottom navigation bar with emoji icon tabs.

```css
.tab-bar {
  display:flex; align-items:center; gap:var(--spacing-xs, 4px);
  padding:var(--spacing-xl, 16px) var(--spacing-xl, 16px) var(--spacing-4xl, 32px);
  background:var(--bg-grass-secondary, #ceeab0);
  border-radius:var(--radius-4xl, 24px) var(--radius-4xl, 24px) 0 0;
  width:100%; box-sizing:border-box;
}
.tab-bar-item {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  flex:1 0 0; gap:var(--spacing-xs, 4px);
  padding:var(--spacing-xs, 4px) var(--spacing-md, 8px);
  border-radius:var(--radius-xl, 12px); cursor:pointer;
  transition:background 0.15s ease;
}
.tab-bar-item.active { background:var(--bg-grass-tertiary, #e6f4d7); box-shadow:0 1px 3px 0 rgba(10,13,18,0.1); }
.tab-bar-icon .tf { font-family:'TossFace', sans-serif; font-size:28px; line-height:1; }
.tab-bar-label { font-size:var(--font-size-text-xs, 12px); color:var(--text-primary, #181d27); text-align:center; }
```

### SegmentedControl

```css
.segmented-control {
  display:flex; gap:var(--spacing-xs, 4px); padding:var(--spacing-xs, 4px);
  background:var(--bg-secondary, #fafafa); border:1px solid var(--border-secondary, #e9eaeb);
  border-radius:var(--radius-lg, 10px); align-items:center;
}
.segmented-control-equal .segment { flex:1; }
.segment {
  display:flex; align-items:center; justify-content:center; gap:var(--spacing-md, 8px);
  height:44px; padding:var(--spacing-md, 8px) var(--spacing-lg, 12px);
  border-radius:var(--radius-sm, 6px); border:none; background:transparent; cursor:pointer;
  transition:background 0.2s cubic-bezier(0.25,0.1,0.25,1), box-shadow 0.2s cubic-bezier(0.25,0.1,0.25,1);
}
.segment .tf-icon { mix-blend-mode:luminosity; transition:mix-blend-mode 0.2s; }
.segment .segment-label { font-size:var(--font-size-text-md, 16px); font-weight:var(--font-weight-semibold, 600); color:var(--text-quaternary, #717680); }
.segment.current, .segment.active { background:var(--bg-primary, #ffffff); box-shadow:0 1px 3px 0 rgba(10,13,18,0.1); }
.segment.current .tf-icon, .segment.active .tf-icon { mix-blend-mode:normal; }
.segment.current .segment-label, .segment.active .segment-label { color:var(--text-secondary, #414651); }
```

### ListItem

Flat row for content lists. No card chrome.

```css
.list-item {
  display:flex; align-items:center; gap:var(--spacing-lg, 12px);
  width:100%; padding:var(--spacing-lg, 12px) var(--spacing-xl, 16px); background:transparent;
}
.list-item-leading { width:40px; height:40px; flex-shrink:0; position:relative; }
.list-item-leading-icon { display:flex; align-items:center; justify-content:center; font-family:'TossFace', sans-serif; font-size:32px; }
.list-item-content { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
.list-item-label { font-size:var(--font-size-text-md, 16px); font-weight:var(--font-weight-bold, 700); color:var(--text-primary, #181d27); }
.list-item-desc { font-size:var(--font-size-text-sm, 14px); color:var(--text-tertiary, #535862); }
.list-item-chevron { width:24px; height:24px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:var(--text-tertiary, #535862); }
.list-item-meta { font-size:var(--font-size-text-sm, 14px); font-weight:var(--font-weight-semibold, 600); color:var(--text-secondary, #414651); }
```

### StatCard

```css
.stat-card {
  display:flex; flex-direction:column; max-width:181px;
  padding:var(--spacing-xxs, 2px); border-radius:var(--radius-2xl, 16px);
}
.stat-card-label {
  display:flex; align-items:center; justify-content:center;
  padding:var(--spacing-xxs, 2px) var(--spacing-md, 8px);
  border-radius:var(--radius-2xl, 16px);
  font-weight:var(--font-weight-bold, 700); font-size:var(--font-size-text-xs, 12px);
  color:var(--text-white, #ffffff); text-transform:uppercase;
}
.stat-card-value {
  display:flex; align-items:center; justify-content:center; gap:var(--spacing-md, 8px);
  padding:var(--spacing-lg, 12px); background:var(--bg-primary, #ffffff);
  border-radius:var(--radius-2xl, 16px);
}
.stat-card--target { background:var(--yellow-400, #fac515); }
.stat-card--duration { background:var(--green-400, #47cd89); }
.stat-card-row { display:flex; align-items:stretch; gap:var(--spacing-md, 8px); width:100%; }
.stat-card-row .stat-card { flex:1 1 0; min-width:0; max-width:none; }
```

### MessageBubble

```css
.msg-row { display:flex; width:370px; position:relative; }
.msg-row.msg-incoming { align-items:flex-end; gap:var(--spacing-md, 8px); }
.msg-row.msg-outgoing { justify-content:flex-end; }
.msg-avatar { width:32px; height:32px; border-radius:var(--radius-full, 9999px); background:var(--bg-sky, #e0f2fe); flex-shrink:0; overflow:hidden; position:relative; }
.msg-col { display:flex; flex-direction:column; gap:var(--spacing-xs, 4px); }
.msg-col-in { align-items:flex-start; }
.msg-col-out { align-items:flex-end; }
.msg-sender { font-size:var(--font-size-text-xs, 12px); color:var(--text-secondary, #414651); padding:0 var(--spacing-xl, 16px); }
.msg-bubble {
  border-radius:var(--radius-4xl, 24px);
  padding:var(--spacing-lg, 12px) var(--spacing-xl, 16px);
  max-width:256px; min-width:90px;
  font-size:var(--font-size-text-md, 16px); color:var(--text-primary, #181d27);
  word-wrap:break-word;
}
.msg-bubble-in { background:var(--bg-primary, #ffffff); }
.msg-bubble-out { background:var(--brand-200, #b9e6fe); }

/* Typing indicator */
@keyframes typingDot { 0%, 60%, 100% { opacity:0.3; } 30% { opacity:1; } }
.msg-typing-dots { display:flex; gap:var(--spacing-xs, 4px); align-items:center; padding:var(--spacing-xl, 16px) var(--spacing-2xl, 20px); }
.typing-dot { width:8px; height:8px; border-radius:50%; background:var(--gray-400, #a4a7ae); animation:typingDot 1.4s ease-in-out infinite; }
.typing-dot:nth-child(2) { animation-delay:0.2s; }
.typing-dot:nth-child(3) { animation-delay:0.4s; }
```

### SafetyOverlay

```css
.safety-overlay {
  position:absolute; inset:0; background:rgba(0,0,0,0.85); z-index:40;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center; padding:var(--spacing-5xl, 40px);
  backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
}
.safety-overlay-icon { font-size:56px; line-height:1; margin-bottom:var(--spacing-xl, 16px); }
.safety-overlay-heading { font-size:var(--font-size-text-lg, 18px); font-weight:var(--font-weight-bold, 700); color:#fff; margin:0 0 var(--spacing-md, 8px); }
.safety-overlay-desc { font-size:var(--font-size-text-sm, 14px); color:rgba(255,255,255,0.7); max-width:260px; }
.safety-overlay-fine-print { margin-top:var(--spacing-3xl, 24px); font-size:var(--font-size-text-xs, 12px); color:rgba(255,255,255,0.4); }
```

---

## Component CSS -- Tier 2

Specialized components. Key classes and one markup example included. Reference the CSS file for full implementation.

### ButtonRecording
**CSS file:** `components/button-recording.css`
72px circular start/stop recording control. Two types (Primary blue, Secondary white) and two actions (Start, Stop).
```css
.btn-record { width:72px; height:72px; border-radius:var(--radius-full, 9999px); /* ... */ }
.btn-record-primary.btn-record-start { background:var(--brand-500); border:2px solid var(--brand-600); box-shadow:0 4px 0 0 var(--brand-600); }
.btn-record-secondary.btn-record-start { background:var(--bg-primary); border:2px solid var(--border-secondary); box-shadow:0 4px 0 0 var(--gray-200); }
/* Stop (both types) */ .btn-record-primary.btn-record-stop, .btn-record-secondary.btn-record-stop { background:var(--red-500); }
```

### AvatarPortrait
**CSS file:** `components/avatar-portrait.css`
120x176px rectangular avatar showing character at large scale.
```html
<div class="avatar-portrait"><canvas class="rive-user" width="394" height="564"></canvas></div>
```

### AvatarProfile
**CSS file:** `components/avatar-profile.css`
Full-width 264px-tall profile banner. Canvas 209x299, margin-bottom:-60px.

### AvatarRow
**CSS file:** `components/avatar-row.css`
Horizontal row of labeled avatars. `.avatar-item` = avatar + label. Sizes: xs/sm/md. `.avatar-row-scroll` for overflow.

### AvatarGroupCard
**CSS file:** `components/avatar-group-card.css`
Full-width 120px card with overlapping character avatars. `.agc` container with `.agc-avatars` row.

### ChecklistItem
**CSS file:** `components/checklist-item.css`
Two formats: Tier 2 card (`.cl-card`, 370px) and Tier 3 row (`.cl-row`). Status flags (`.cl-flag--warning`, `.cl-flag--done`).

### ConversationalFeedback
**CSS file:** `components/conversational-feedback.css`
Composes Avatar Portrait + Subtitles into a directional conversational moment. Just a flex row wrapper.

### Subtitles
**CSS file:** `components/subtitles.css`
Text bubble for conversational messages. Contexts: `.subtitles-default` (gray bg), `.subtitles-overlay` (dark bg). Layouts: centered, left, left-icon.

### MessageComposer
Text input bar at the bottom of chat. Composes Input + ButtonRecording. See `components/message-composer.html`.

### ScreenTimeCard
**CSS file:** `components/screen-time-card.css`
Green (sprout-500) card with progress ring + emoji icon + text content. `.st-card` container.

### SectionMetric
**CSS file:** `components/section-metric.css`
Horizontal row of 3 evaluation metrics (consistency, effort, mastery). `.section-metric` container.

### TaskCard
See `components/task-card.html`. Card for displaying task assignments with emoji, title, and action button.

---

## Patterns

Patterns compose foundations and components into reusable screen layouts.

### Result Screen (Success/Completion)
**CSS file:** `patterns/success-screen.css`
Full-screen outcome for quest completion. Sky blue bg, large Sprout with grass, centered title/description, optional stat cards, Continue button.

**Composes:** Background (sky + grass), Character (Rive), Button (Primary), StatCard (optional).

```html
<div class="result-screen">
  <div class="result-content">
    <div class="result-title">Quest Complete!</div>
    <div class="result-desc">You answered 8 out of 10 correctly.</div>
    <div class="stat-card-row"><!-- optional stat cards --></div>
  </div>
  <canvas id="sprout-rive" width="690" height="690"></canvas>
  <div class="grass-container"><div class="grass-edge"></div><div class="grass-fill"></div></div>
  <button class="btn-sprout btn-primary btn-lg" style="position:absolute; bottom:45px; left:16px; right:16px; width:auto; z-index:10;">Continue</button>
</div>
```

**Rive behavior:** Full/Partial = `celebration` trigger + mouth after 1700ms. Sent to Parents = `smile` trigger + mouth after 200ms.

### Empty States
Full-screen, sheet, or card variants for "no content" situations.
```css
.empty-state { display:flex; flex-direction:column; align-items:center; gap:var(--spacing-lg, 12px); width:370px; text-align:center; }
.empty-state-icon { font-family:'TossFace', sans-serif; font-size:56px; }
.empty-state-title { font-size:var(--font-size-text-md, 16px); font-weight:var(--font-weight-bold, 700); color:var(--text-primary, #181d27); }
.empty-state-desc { font-size:var(--font-size-text-sm, 14px); color:var(--text-secondary, #414651); }
.empty-state-actions { display:flex; flex-direction:column; gap:var(--spacing-md, 8px); width:100%; }
```

### Response Tiles (Single-Select)
Chat-thread suggested responses. DS Tile (None variant) with leading emoji + label. Tiles slide in with 50ms stagger. One tap selects, group fades out after 400ms, choice appears as outgoing bubble. 2-4 tiles per group.

### Response Tiles (Multi-Select)
DS Tile (Checkbox variant) with confirm button. `.tile-group-confirm` with count badge. Activates when >=1 selected.

### Match Pairs
Two-column matching exercise. `.match-group > .match-columns > .match-col`. States: default, selected (blue), success (green), warning (yellow), disabled.

### Sort Tiles
Drag-to-reorder exercise. DS Tile Sortable variant with `.sort-number` badge. Drag handle, dragging state, success/warning validation.

### Camera
Full-screen photo capture. Layer stack: viewfinder -> status bar -> toolbar (quest overlay) -> conversational feedback -> bottom bar (72px shutter). States: Ready and Review.

### Video
Full-screen video recording. Same layer stack as Camera. ButtonRecording Secondary Start (ready) / Secondary Stop (recording).

### Nudge Sheet
Bottom sheet for sending quick positive reactions. Composes Sheet + emoji Tiles (4 square tiles, single-select) + Primary Button. Reaction vocab: Fire (consistency), Heart (support), Clap (effort), Star (mastery).

### Habitat Expand
Morphing transition from small tile (120x176, 24px radius) to full-screen habitat. One class toggle: `.habitat-stage.is-tile`. 500ms `cubic-bezier(.32,.72,0,1)` transition on all properties.

---

## Screen Recipes

Full-page layout skeletons derived from production prototypes. Each recipe shows the exact structure, positioning, and behaviors needed to compose DS components into complete screens.

### Recipe: Kid Home (Carousel) -- Tier 2

Horizontal card carousel on grass, with toolbar scroll tinting and tab bar.

**Layout skeleton:**
```html
<div class="screen-sky-alt">
  <!-- Toolbar: sticky, tints on scroll -->
  <div class="toolbar-wrap" style="position:sticky; top:0; z-index:4;">
    <nav class="toolbar toolbar-kid-home" aria-label="Home toolbar">
      <button class="btn-util">...</button>
      <div class="toolbar-trailing"><!-- stat pills --></div>
    </nav>
  </div>

  <!-- Conversational subtitle -->
  <div style="padding:0 16px; text-align:center; z-index:1;">
    <div class="subtitles subtitles-default subtitles-centered">
      <div class="subtitles-text">Hey there! Ready to play?</div>
    </div>
  </div>

  <!-- Sky spacer with Sprout -->
  <div class="sky-spacer" style="height:172px; position:relative; flex-shrink:0;">
    <div class="rive-wrap" style="position:absolute; left:50%; bottom:-94px; width:402px; height:402px; z-index:2; pointer-events:none; transform:translateX(-50%) scale(0.92); transform-origin:bottom center;">
      <canvas id="sprout-rive" width="804" height="804" style="width:100%; height:100%;"></canvas>
    </div>
  </div>

  <!-- Grass with carousel -->
  <div class="grass-container" style="flex:1; display:flex; flex-direction:column;">
    <div class="grass-edge" style="height:18px; border-radius:18px 18px 0 0; background:var(--bg-grass);"></div>
    <div class="grass-fill" style="flex:1; background:var(--bg-grass); padding:32px 0 16px; overflow:hidden;">
      <!-- Goal card (optional) -->
      <div style="padding:0 16px 12px;"><!-- progress card --></div>
      <!-- Carousel -->
      <div class="carousel" style="display:flex; gap:12px; overflow-x:auto; scroll-snap-type:x mandatory; scroll-padding-left:16px; padding:0 16px 24px; scrollbar-width:none;">
        <!-- Cards: 370x220px, scroll-snap-align:start -->
      </div>
    </div>
  </div>

  <!-- Tab bar -->
  <div class="tab-bar" style="flex-shrink:0;"><!-- tab items --></div>
</div>
```

**Toolbar scroll tinting (JS):**
```js
screen.addEventListener('scroll', function() {
  var y = screen.scrollTop;
  toolbar.classList.remove('toolbar-sky', 'toolbar-grass');
  if (y > 8 && y < 240) toolbar.classList.add('toolbar-sky');
  else if (y >= 240) toolbar.classList.add('toolbar-grass');
}, { passive: true });
```
```css
.toolbar-wrap { transition: background 0.35s cubic-bezier(0.5,1.8,0.3,0.8); }
.toolbar-sky { backdrop-filter: blur(16px); background: rgba(224,242,254,0.8); }
.toolbar-grass { background: rgba(134,203,60,0.8); }
```

**Carousel auto-scroll to 2nd card:**
```js
var second = carousel.children[1];
carousel.scrollTo({ left: second.offsetLeft - 16, behavior: 'instant' });
```

### Recipe: Kid Home (Task List) -- Tier 3

Vertical scrolling task list on grass with sticky segmented control tabs.

**Layout skeleton:** Same as Carousel recipe above, but replace the carousel with:
```html
<div class="grass-fill" style="flex:1; background:var(--bg-grass); overflow:hidden; display:flex; flex-direction:column;">
  <div class="task-scroll" style="flex:1; min-height:0; overflow-y:auto; padding:16px 16px 0;">
    <!-- Sticky segmented control -->
    <div class="segmented-control segmented-control-equal segmented-control-sliding" style="position:sticky; top:0; z-index:2; margin-bottom:12px;">
      <div class="slide-pill" id="slide-pill"></div>
      <button class="segment active" data-panel="today">Today</button>
      <button class="segment" data-panel="anytime">Anytime</button>
      <button class="segment" data-panel="scheduled">Scheduled</button>
    </div>
    <!-- Tab panels: use display:contents when active -->
    <div class="tab-panel active" id="panel-today" style="display:contents;">
      <div class="section-label" style="font-size:12px; font-weight:700; color:#fff; text-transform:uppercase; letter-spacing:0.8px;">Required</div>
      <!-- task list cards (80px rows) -->
    </div>
  </div>
</div>
```

**Tab switching JS:** See SegmentedControl component. Add `requestAnimationFrame` for pill animation and scroll-to-top on tab change.

### Recipe: Chat Screen

Sprout coaching chat with message thread, audio composer, and character at bottom.

**Layer stack (z-index order):**
```
z:1  -- grass + character (absolute bottom)
z:5  -- chat thread (positioned between toolbar and grass)
z:10 -- toolbar (absolute top)
z:15 -- composer bar (absolute bottom:45px)
```

**Layout skeleton:**
```html
<div class="device-screen" style="position:relative; width:402px; height:874px; overflow:hidden;">
  <!-- Toolbar -->
  <nav class="toolbar toolbar-quest" style="position:absolute; top:62px; left:0; right:0; z-index:10;">
    <div class="quest-close"><!-- X icon --></div>
    <div class="progress-bar"><!-- progress --></div>
  </nav>

  <!-- Chat thread -->
  <div class="chat-thread" style="position:absolute; top:118px; bottom:330px; left:0; right:0; overflow-y:auto; padding:16px; z-index:5;">
    <!-- Messages: .msg-row.msg-incoming / .msg-row.msg-outgoing -->
  </div>

  <!-- Sprout character -->
  <div class="rive-wrap" style="position:absolute; left:50%; bottom:-196px; width:690px; height:690px; z-index:1; pointer-events:none; transform:translateX(-50%);">
    <canvas id="sprout-rive" width="1380" height="1380" style="width:100%; height:100%;"></canvas>
  </div>

  <!-- Grass -->
  <div style="position:absolute; bottom:0; left:0; right:0; z-index:1;">
    <div class="grass-edge" style="height:24px;"></div>
    <div class="grass-fill" style="height:89px;"></div>
  </div>

  <!-- Composer bar -->
  <div class="composer-bar" style="position:absolute; bottom:45px; left:0; right:0; z-index:15; display:flex; align-items:center; justify-content:center; gap:8px; padding:0 16px;">
    <button class="btn-util btn-util-sm"><!-- plus icon --></button>
    <button class="btn-record btn-record-secondary btn-record-start"><!-- mic icon --></button>
  </div>
</div>
```

**Word-by-word message streaming:**
```js
function streamMessage(bubble, words) {
  var i = 0;
  var interval = setInterval(function() {
    if (i >= words.length) { clearInterval(interval); return; }
    bubble.textContent += (i > 0 ? ' ' : '') + words[i];
    chatThread.scrollTop = chatThread.scrollHeight;
    i++;
  }, 120);
}
```

### Recipe: Chat with Tiles

Extends Chat Screen with interactive tile exercises injected into the thread.

**Single-select tiles (suggestions):**
```js
// After incoming message streams, inject tile group
function addTileGroup(tiles, onSelect) {
  var group = document.createElement('div');
  group.className = 'tile-group';
  group.style.cssText = 'display:flex; flex-direction:column; gap:8px; padding:8px 0;';
  tiles.forEach(function(t, i) {
    var tile = document.createElement('div');
    tile.className = 'tile';
    tile.innerHTML = '<div class="tile-leading tile-leading-icon">' + t.emoji + '</div><div class="tile-content"><div class="tile-label">' + t.label + '</div></div>';
    tile.style.animationDelay = (i * 0.05) + 's'; // stagger entrance
    tile.addEventListener('click', function() {
      tile.classList.add('checked');
      setTimeout(function() {
        group.style.transition = 'opacity 0.3s, max-height 0.3s';
        group.style.opacity = '0';
        group.style.maxHeight = '0';
        group.style.overflow = 'hidden';
        setTimeout(function() { group.remove(); }, 350);
      }, 400);
      onSelect(t.label);
    });
    group.appendChild(tile);
  });
  chatThread.appendChild(group);
  chatThread.scrollTop = chatThread.scrollHeight;
}
```

**Multi-select tiles (with confirm):**
- Hide composer bar (add class `hidden-for-tiles`)
- Show confirm bar at bottom with count badge: `.tile-group-confirm` with `.tile-group-count` span
- Button disabled (`.state-disabled`) until >=1 selected
- On confirm: restore composer, remove tiles, send selections as outgoing bubble

**Match pairs:** Two-column `.match-columns` layout. Auto-check 300ms after cross-column pair. Correct = green 800ms then disabled. Wrong = yellow 300ms then reset.

### Recipe: Customizer

Bottom panel for character customization with Rive preview thumbnails.

**Layout skeleton:**
```html
<div class="screen-sky" style="display:flex; flex-direction:column;">
  <!-- Toolbar -->
  <nav class="toolbar toolbar-default">
    <div class="leading"><button class="btn-util"><!-- back --></button></div>
    <span class="toolbar-abs-title">Customize</span>
    <div class="trailing"><button class="btn-util btn-util-primary"><!-- save --></button></div>
  </nav>

  <!-- Sky area with character -->
  <div style="flex:1; position:relative;">
    <canvas id="sprout-rive" width="804" height="804"
      style="position:absolute; left:50%; bottom:0; width:402px; height:402px; transform:translateX(-50%); pointer-events:none;"></canvas>
    <div class="grass-container"><!-- grass edge + fill --></div>
  </div>

  <!-- Customizer panel (460px, white, rounded top) -->
  <div style="height:460px; background:var(--bg-primary); border-radius:24px 24px 0 0; box-shadow:0 -4px 16px rgba(0,0,0,0.06); display:flex; flex-direction:column; z-index:4;">
    <!-- Segmented control tabs -->
    <div style="padding:16px 16px 0;">
      <div class="segmented-control segmented-control-equal segmented-control-sliding">
        <div class="slide-pill" id="slide-pill"></div>
        <button class="segment active" data-panel="skin"><span class="tf-icon">...</span></button>
        <button class="segment" data-panel="hair"><span class="tf-icon">...</span></button>
        <!-- more tabs -->
      </div>
    </div>
    <!-- Scrollable panel content -->
    <div style="flex:1; overflow-y:auto; padding:16px 16px 32px;">
      <div class="panel-section active" id="panel-skin">
        <div class="swatch-grid" style="display:grid; grid-template-columns:repeat(5, auto); gap:12px; justify-content:space-between;">
          <!-- .tile.tile-swatch buttons -->
        </div>
      </div>
    </div>
  </div>
</div>
```

**Rive state management pattern:**
```js
var state = { skinID: 0, hairID: 1, clothingID: 0 /* ... */ };
var riveInputs = []; // populated in onLoad

function setRiveInput(name, value) {
  riveInputs.forEach(function(inp) { if (inp.name === name) inp.value = value; });
}

// Swatch click handler
tile.addEventListener('click', function() {
  state[stateKey] = riveId;
  setRiveInput(stateKey, riveId);
  container.querySelectorAll('.tile-swatch').forEach(function(s) { s.classList.remove('selected'); });
  tile.classList.add('selected');
  syncPreviews();
});
```

**Rive preview thumbnails** (for style cards like hairstyles):
Each `.tile.tile-image` gets its own Rive instance. All previews show the current state except they override their own property to show that variant:
```js
function syncPreviews() {
  previews.forEach(function(p) {
    p.inputs.forEach(function(inp) {
      inp.value = (inp.name === p.stateKey) ? p.value : (state[inp.name] || 0);
    });
  });
}
```

### Recipe: Video Verification

Multi-screen flow with hero card morphing between full-screen and portrait tile.

**Screen stack pattern:**
```html
<div class="screen-stack" style="flex:1; overflow:hidden; position:relative;">
  <div class="screen active" id="screen-idle" style="position:absolute; inset:0; display:flex; flex-direction:column;">
    <!-- Task detail screen -->
  </div>
  <div class="screen" id="screen-active" style="position:absolute; inset:0; display:none; flex-direction:column;">
    <!-- Camera view with hero card morph -->
  </div>
</div>
```
```js
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); s.style.display = 'none'; });
  var target = document.getElementById('screen-' + id);
  target.classList.add('active'); target.style.display = 'flex';
}
```

**Hero card morphing** (full-screen to portrait tile):
```css
.hero-card {
  position: absolute; top: 0; left: 0; width: 402px; height: 874px;
  background: var(--bg-sky); border-radius: 0; z-index: 3;
  transition: top 0.5s cubic-bezier(0.32,0.72,0,1), left 0.5s cubic-bezier(0.32,0.72,0,1),
              width 0.5s cubic-bezier(0.32,0.72,0,1), height 0.5s cubic-bezier(0.32,0.72,0,1),
              border-radius 0.5s cubic-bezier(0.32,0.72,0,1);
}
.is-portrait .hero-card {
  top: 128px; left: 16px; width: 120px; height: 176px;
  background: #b9e6fe; border-radius: 24px;
}
/* Canvas uses fixed left (not %) to preserve portrait crop math */
.hero-card canvas { left: -144px; top: 380px; width: 690px; height: 690px; }
.is-portrait .hero-card canvas { transform: translate(-141px, -596px) scale(0.515); }
```

### Recipe: Checklist Lobby

Carousel (tier 2) or list (tier 3) of checklist tasks with status flags.

**Tier 2 (carousel):** Uses same horizontal carousel pattern as Kid Home Carousel, but cards are `.cl-card` (370px wide) with emoji avatar, task name, and proof action button. Status flags (`.cl-flag--done`, `.cl-flag--warning`) are bookmark ribbons positioned `top:-2px; right:14px`.

**Tier 3 (list):** Vertical scrolling list of `.cl-row` items (compact rows). Rejected tasks expand to show action area:
```css
.cl-row--warning-expanded {
  background: var(--bg-secondary); padding: 0;
  flex-direction: column; align-items: stretch;
}
.cl-row-action { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.cl-row-action .btn-sprout { width: 100%; }
```

---

## Component Lookup

Pick components by **what the user needs to do**, not by what it looks like.

### Triggering Actions

| Need | Component | Key detail |
|------|-----------|------------|
| Main action on the screen | **Button (Primary)** | One per screen. 4px shadow press. Sizes: lg/md/sm/xs. |
| Cancel / dismiss / alternative | **Button (Secondary)** | White bg, semibold 600 weight. Pair with Primary. |
| Delete / irreversible | **Button (Destructive)** | Red fill. Always confirm with Alert or Sheet first. |
| Caution / acknowledge | **Button (Warning)** | Yellow fill. |
| Positive confirmation | **Button (Success)** | Green fill. |
| Sign in with Google/Apple | **Social Button** | Provider logo + label. Never customize the logo. |
| Toolbar action (back, stats) | **ButtonUtility** | Pill shape. Has Primary variant (blue fill). |
| Start/stop recording | **ButtonRecording** | 72px circle. Primary (blue) or Secondary (white). |

### Collecting Input

| Need | Component | Key detail |
|------|-----------|------------|
| Free text (name, email, search) | **Input** | 56px height, 16px radius. |
| 4-digit PIN | **PasscodeInput** | 4 cells, auto-advance. |
| Pick one (in a Sheet) | **Tile (Radio)** | 56px rows with radio indicator. |
| Pick one (standalone) | **Radio** | Mutually exclusive circles. |
| Pick multiple | **Checkbox** | Independent toggles. |
| On/off toggle | **Switch** | Instant effect. Spring animation. |
| Pick from segment options | **SegmentedControl** | Equal or content-width. Sliding pill option. |

### Showing Feedback

| Need | Component | Key detail |
|------|-----------|------------|
| Quick success/error | **Toast** | Non-blocking, auto-dismiss. 4 variants. |
| Quiz/exercise result with CTA | **FeedbackBanner** | Pinned bottom. 4 variants. |
| Needs user decision | **ActionPrompt** | White card, dual CTAs. |
| Centered confirmation | **Alert** | Bordered card, stacked or row buttons. |
| Focused task / selection | **Sheet** | Slides up, max 90%. Compact/nav title variants. |
| Nothing here yet | **EmptyStates** | TossFace emoji + title + optional CTA. |
| Something is loading | **LoadingIndicator** | Spinner. Primary or Muted. lg/md/sm. |
| Progress through exercises | **ProgressBar** | Continuous (24px) or Stepper (16px). Sparkle confetti. Checkpoints. |
| SFW content blocked | **SafetyOverlay** | Dark blur overlay with icon + heading. |

### Navigation & Layout

| Need | Component | Key detail |
|------|-----------|------------|
| Top bar | **Toolbar** | Variants: Kid Home, Default, Compact Large, Quest, Quest Overlay. |
| Bottom tab nav | **TabBar** | Green bg, TossFace emoji icons. |
| Show participants | **AvatarGroup** | Overlapping circles in a ButtonUtility. |
| Show a person | **Avatar** | XS-XL sizes. Rive user or sprout canvas. |
| Profile hero | **AvatarProfile** | Full-width 264px banner. |
| Content row | **ListItem** | Flat row: leading + content + trailing. |
| Stat display | **StatCard** | Target (yellow) or Duration (green). |
| Metric row | **SectionMetric** | 3 metrics: emoji + number + label. |
| Status/achievement | **Badge** | Pill (colored), Inline (text), or Status (emoji box). |
| Conversational moment | **ConversationalFeedback** | Avatar Portrait + Subtitles. |
| Chat message | **MessageBubble** | Incoming (white) or Outgoing (blue). Typing dots. Voice. |

## Component Relationships

- **Button (Destructive)** always escalates to **Alert** or **Sheet** for confirmation
- **Toast** escalates to **ActionPrompt** when the user needs to decide
- **ActionPrompt** escalates to **Sheet** when more content/options are needed
- **Sheet** degrades to **Alert** when content is minimal
- **EmptyStates** pairs with **Background** (full-screen) or **Sheet** (compact)
- **ProgressBar** always lives inside **Toolbar** (quest variant)
- **ButtonUtility** always lives inside **Toolbar** (leading or trailing)
- **Tile** groups with **Sheet** for overlay selection lists
- **TabBar** replaces grass at the bottom of parent-facing screens
- **ConversationalFeedback** composes **AvatarPortrait** + **Subtitles**
- **MessageBubble** lives inside chat thread, **MessageComposer** at bottom

## Composition Rules

| Component | Requires | Allows | Forbids |
|-----------|----------|--------|---------|
| Button | label | icon-left, spinner | image, badge, nested-button |
| ButtonUtility | icon-or-content | value-label, avatar-group | nested-button, image |
| Input | input-field | label, leading-icon, trailing-icon, error-message | nested-input |
| Sheet | handle, title (plain text only) | description, close, nav-header, body, footer, empty-state | nested-sheet, icon-in-title |
| Alert | label, primary-button | icon, description, secondary-button, row-layout | nested-alert |
| ActionPrompt | label, primary-button | description, close, secondary-button, leading-emoji, leading-avatar | nested-prompt |
| Toast | title | icon, description, action-link, close, progress-bar | nested-toast, button |
| Toolbar | leading-slot | center-slot, trailing-slot, progress-bar, title, subtitle | nested-toolbar |
| Tile | label | leading-icon/swatch/image, description, chevron, radio, checkbox, drag-handle | button, nested-tile |
| TabBar | 2+ tab-items | icon, label, active state | nested-tab-bar |
| SegmentedControl | 2+ segments | icon, label, sliding-pill | nested-control |
| EmptyStates | icon, title | description, primary-button, secondary-button | image |

## Tokens Quick Reference

### Colors (use these, not hex)

**Backgrounds:** `--bg-sky` (#e0f2fe), `--bg-primary` (#fff), `--bg-secondary` (#fafafa), `--bg-tertiary` (#f5f5f5), `--bg-grass` (#86cb3c), `--bg-brand-solid` (#0086c9), `--bg-brand-secondary` (#e0f2fe), `--bg-brand-primary` (#f0f9ff), `--bg-overlay` (rgba(10,13,18,0.2))

**Status backgrounds:** `--bg-error-primary` (#fef3f2), `--bg-error-secondary` (#fee4e2), `--bg-success-primary` (#ecfdf3), `--bg-success-secondary` (#dcfae6), `--bg-warning-primary` (#fefbe8), `--bg-warning-secondary` (#fef7c3)

**Text:** `--text-primary` (#181d27), `--text-secondary` (#414651), `--text-tertiary` (#535862), `--text-quaternary` (#717680), `--text-white` (#fff), `--text-disabled` (#717680), `--text-brand-primary` (#0b4a6f), `--text-brand-secondary` (#026aa2)

**Status text:** `--text-error-primary` (#d92d20), `--text-success-primary` (#079455), `--text-warning-primary` (#ca8504)

**Borders:** `--border-primary` (#d5d7da), `--border-secondary` (#e9eaeb), `--border-brand` (#0ba5ec), `--border-error` (#f04438)

**Foreground:** `--fg-primary` (#181d27), `--fg-brand-primary` (#0ba5ec), `--fg-error` (#f04438), `--fg-success` (#17b26a), `--fg-warning` (#eaaa08)

### Typography

```css
/* Headings */
font-family: var(--font-family-display, 'Inter', sans-serif);
letter-spacing: var(--letter-spacing-display, -0.02em);

/* Body */
font-family: var(--font-family-body, 'Inter', sans-serif);
```

**Display scale** (letter-spacing -0.02em): 2xl(72/90), xl(60/72), lg(48/60), md(36/44), sm(30/38), xs(24/32).
**Text scale** (letter-spacing 0): xl(20/30), lg(18/28), md(16/24), sm(14/20), xs(12/16).
**Weights:** Regular(400), Medium(500), Semibold(600), Bold(700).

### Spacing

```
xxs:2 | xs:4 | sm:6 | md:8 | lg:12 | xl:16 | 2xl:20 | 3xl:24 | 4xl:32 | 5xl:40 | 6xl:48 | 7xl:64 | 8xl:80
```

### Radius

```
xs:4 | sm:6 | md:8 | lg:10 | xl:12 | 2xl:16 | 4xl:24 | full:9999
```

### Shadows

- Button Primary/Destructive/Warning/Success: `0 4px 0 0 var(--[variant]-600)`
- Button Secondary/Utility: `0 3px 0 0 var(--gray-200)` or `0 4px 0 0 var(--gray-200)`
- Cards: `0 4px 24px rgba(0,0,0,0.08)`
- Elevation (dragging): `0 8px 16px -4px rgba(10,13,18,0.12)`
- Pressed state: `box-shadow: none; transform: translateY(Npx)` (N = shadow offset)

## Animation Timing

| What | Duration | Easing |
|------|----------|--------|
| Fast feedback (borders, colors, hover, active) | 0.1s | `cubic-bezier(0.25, 0.1, 0.25, 1)` (easeInOut) |
| Switch toggle | 0.25s | `cubic-bezier(0.5, 1.8, 0.3, 0.8)` (spring) |
| Sheet enter | 0.5s | `cubic-bezier(0.5, 1.8, 0.3, 0.8)` (spring) |
| Sheet exit | 0.35s | `ease-in` |
| Toast enter | 0.5s | `cubic-bezier(0.5, 1.8, 0.3, 0.8)` (spring) |
| Toast exit | 0.35s | `ease-in` |
| Nav push/pop | 0.35s | spring |
| Progress bar fill | 0.35s | `cubic-bezier(0.5, 1.8, 0.3, 0.8)` (spring) |
| Segmented control | 0.2s-0.25s | `cubic-bezier(0.25, 0.1, 0.25, 1)` (easeInOut) |
| Spinner | 1.0s | linear infinite |
| Delight | 0.5s | spring |
| Habitat morph | 0.5s | `cubic-bezier(.32, .72, 0, 1)` |
| Toolbar scroll tint | 0.35s | `cubic-bezier(0.5, 1.8, 0.3, 0.8)` (spring) |
| Tile dismiss (chat) | 0.3s | ease (opacity + max-height) |
| Tile entrance stagger | 0.05s per item | ease |
| Message word stream | 120ms per word | linear interval |
| Hero card morph | 0.5s | `cubic-bezier(.32, .72, 0, 1)` |

**Easing curves:**
- **spring:** `cubic-bezier(0.5, 1.8, 0.3, 0.8)` -- default for enter animations
- **easeInOut:** `cubic-bezier(0.25, 0.1, 0.25, 1)` -- default for feedback
- **easeOut:** `cubic-bezier(0, 0, 0.58, 1)`
- **easeIn:** `cubic-bezier(0.42, 0, 1, 1)` -- use for exit animations

**Rules:** Enter with spring, exit with easeIn. Respect `prefers-reduced-motion`. Active press = `box-shadow:none; transform:translateY(Npx)` at 0.1s easeInOut.

## Accessibility Checklist

- All interactive elements: 44x44px minimum touch target
- Inputs: `aria-invalid` + `aria-describedby` for errors
- Sheets: `aria-modal="true"` + `aria-labelledby` + trap focus + Escape to close
- Alerts: `role="alertdialog"` + `aria-labelledby`
- Toasts: `role="status"` + `aria-live="polite"`
- Loading: `aria-busy="true"` + `aria-label` describing what's loading
- Buttons: never disable without explanation -- show a Toast or error message
- Color contrast: WCAG AA minimum (4.5:1 text, 3:1 UI elements)
- Toolbar: use `<nav>` with `aria-label`
- TabBar: use `role="tablist"` with `role="tab"` on items
- SegmentedControl: use `role="radiogroup"` with `role="radio"` on segments
- Reduced motion: all animations should respect `@media (prefers-reduced-motion: reduce)`

## Figma Integration

When implementing from a Figma design:

1. Run `get_design_context` on the node
2. Run `get_screenshot` for visual reference
3. Run `get_variable_defs` to verify exact token names -- don't guess from screenshots
4. Translate the Figma MCP output (React + Tailwind) into vanilla HTML + CSS variables
5. Match the design 1:1, but use Sprout tokens instead of raw hex values
