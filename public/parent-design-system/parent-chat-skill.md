# Parent Chat Implementation Skill

> Reference prototype: https://sprout-design.vercel.app/product-explorer/parent-chat-3
> Component docs: https://sprout-design.vercel.app/parent-design-system/components.html

## What this is

Parent Chat is a text-first AI chat interface for parents in the Sprout app. Parents communicate with Sprout (the AI assistant) and co-parents in a shared conversation. Sprout helps manage children's habits, quests, schedules, and routines.

## Screen anatomy

The chat screen is composed of these layers, stacked inside a full-screen container:

```
┌─────────────────────────────────┐
│ Status Bar (z:10, pointer:none) │
├─────────────────────────────────┤
│ Header Frost (z:9, gradient)    │
│ Chat Toolbar (z:10, absolute)   │
├─────────────────────────────────┤
│                                 │
│ Chat Thread (z:5, scrollable)   │
│  - System messages              │
│  - Incoming messages (Sprout)   │
│  - Outgoing messages (parent)   │
│  - Co-parent messages           │
│  - Typing indicator             │
│  - Tool usage                   │
│                                 │
├─────────────────────────────────┤
│ Composer Area (z:10, absolute)  │
│  - Suggestion chips (optional)  │
│  - Composer pill                │
│  - Keyboard / Attach panel      │
├─────────────────────────────────┤
│ Home Indicator (z:20)           │
└─────────────────────────────────┘
```

Overlays (z:15+): Sheet scrim, context menu, thought sheet, artifact sheet, banners.

## CSS component files

Import these from `/kid-design-system/components/`:

| File | What it provides |
|------|-----------------|
| `avatar.css` | Circular avatars (Rive character, initials, Sprout) |
| `device-frame.css` | iPhone/iPad mockup wrapper (prototyping only) |
| `status-bar.css` | iOS status bar |
| `chat-toolbar.css` | Header frost, toolbar pills, back/edit, stacked avatars |
| `chat-messages.css` | Thread, bubbles, sender labels, actions, quotes, typing, attachments |
| `chat-composer.css` | Composer pill, input, toolbar, mic/send, reply pill, voice states, mentions |
| `chat-banner.css` | Reconnect/delete/toast banners, `@keyframes rspin` |
| `chat-chips.css` | Option chips and suggestion chips |
| `chat-action-buttons.css` | Primary/secondary buttons with loading/done states (needs `chat-banner.css` for spinner) |
| `confirm-card.css` | Structured confirm/cancel card |
| `artifact.css` | Inline artifact card and detail sheet |
| `reasoning-transcript.css` | AI reasoning process timeline sheet |
| `tool-usage.css` | Collapsible tool activity indicator |
| `chat-context-menu.css` | Sheet base (scrim, handle, list) and context menu |
| `attach-panel.css` | Attachment panel, plus pill (inline expand), iOS keyboard |

## Design tokens

All components use CSS custom properties from `tokens.css`:

- **Spacing**: `--spacing-xxs` (2px) through `--spacing-4xl` (40px)
- **Radius**: `--radius-xs` (4px) through `--radius-4xl` (24px), `--radius-full` (9999px)
- **Typography**: `--font-family-body` (Inter), `--font-size-text-xs` through `--font-size-display-md`
- **Colors**: `--text-primary` (#181d27), `--text-tertiary` (#535862), `--brand-25` (screen bg), `--brand-200` (outgoing bubble), `--bg-sky` (co-parent bubble, Sprout avatar bg)

## Message types

### Incoming (Sprout)
```html
<div class="msg-group msg-incoming">
  <div class="msg-sender">Sprout</div>
  <!-- Optional: thought toggle -->
  <div class="msg-thought">
    <span class="msg-thought-label">Thought for 4s</span>
    <span class="msg-thought-chevron">▶</span>
  </div>
  <!-- Optional: quoted reply -->
  <div class="msg-quoted">
    <span class="msg-quoted-icon">↳</span>
    <span class="msg-quoted-text">Original message...</span>
  </div>
  <div class="msg-row msg-incoming">
    <div class="msg-avatar">[Sprout avatar]</div>
    <div class="msg-bubble msg-bubble-in">Message text here</div>
  </div>
  <!-- Actions -->
  <div class="msg-actions">
    <button class="msg-actions-btn">[copy]</button>
    <button class="msg-actions-btn">[thumbs-up]</button>
    <button class="msg-actions-btn">[thumbs-down]</button>
  </div>
</div>
```

- White bubble (`--bg-primary`)
- 32px Sprout avatar on the left
- Sender label "Sprout" above first bubble
- Optional "Thought for Ns >" toggle opens thought sheet
- Copy/thumbs actions below

### Outgoing (parent)
```html
<div class="msg-group msg-outgoing">
  <div class="msg-row msg-outgoing">
    <div class="msg-bubble msg-bubble-out">Message text here</div>
  </div>
</div>
```

- Blue bubble (`--brand-200`)
- Right-aligned, no avatar, no sender label
- Supports `@mention` tags: `<span class="mention-tag">@Sprout</span>`

### Co-parent
```html
<div class="msg-group msg-incoming">
  <div class="msg-sender">Ze'ev Rosenstein</div>
  <div class="msg-row msg-incoming">
    <div class="msg-avatar">[co-parent avatar]</div>
    <div class="msg-bubble msg-bubble-coparent">Message text</div>
  </div>
</div>
```

- Sky-blue bubble (`--bg-sky`)
- Co-parent avatar with violet or custom background
- Sender name above bubble

### System message
```html
<div class="msg-system"><strong>Today</strong> at 5:52 pm</div>
```

Centered timestamp divider between conversation segments.

## Composer states

The composer has three visual states controlled by CSS classes and `data-mode`:

### Default (no focus)
- Single row: `[+ pill]` `[Ask anything]` `[mic icon]`
- The `+` is inside a gray pill (`.plus-pill` with `--bg-tertiary` background)

### Active (focused, text entered)
- Two rows: input on top, toolbar below
- Mic icon becomes send arrow: `.btn-mic[data-mode="send"]` (blue circle)
- Keyboard appears below with 16px gap

### Recording (voice)
- Normal toolbar hidden, recording toolbar shown
- Stop button + animated waveform + done checkmark
- `.composer-pill.voice-recording` hides the regular toolbar

### Transcribing
- Input and toolbar both hidden
- Spinner + "Transcribing..." text shown
- `.composer-pill.voice-transcribing` hides input + toolbar

## Attachment flows

Two attachment patterns are supported:

### Flow A: Inline pill expansion
1. User taps `+` button
2. The `+` icon rotates 45 degrees to become an X (`.plus-pill.expanded`)
3. Camera, image, and file icons slide in from the left
4. Tapping an icon adds an attachment to the preview strip
5. Tapping the X (rotated +) collapses back

CSS: `.plus-pill`, `.plus-pill.expanded`, `.plus-pill-extra`
Animation: `cubic-bezier(.2,.9,.3,1)` spring curve, 350ms

### Flow B: Attach panel
1. User taps `+` button (plain mode, no gray pill: `.plus-pill.plain`)
2. Icon swaps to keyboard icon (bounce animation)
3. Panel slides up below composer with staggered row reveal
4. Rows: Photos (blue icon), Camera (gray icon), Document (brand icon)
5. Tapping a row adds the attachment, stays on panel
6. Tapping keyboard icon swaps back instantly (no animation on swap)

CSS: `.attach-panel`, `.attach-panel.open`, `.attach-panel-row`
Animation: `max-height` + `opacity` transition, rows stagger at 0/50ms/100ms

### Attachment preview strip
When attachments are added, they appear in `.attach-strip` inside the composer pill:
- Photos: 120x120 colored thumbnails with X remove button
- Files: 120x120 bordered card showing file type and name

## Interactive features

### @Mentions
- Triggered by typing `@` in the composer
- `.mention-popup` appears above composer with filtered member list
- Members: Sprout (AI), co-parent, projects
- Selecting inserts `<span class="mention-tag">@Name</span>` (non-editable inline)

### Reply threading
- Swipe right on a message to trigger reply (`.swipe-reply-icon` reveals)
- Long press opens context menu with "Reply" option
- Reply shows `.reply-pill` inside composer (role-tinted: sprout/user/coparent)
- Quoted reply rendered above the bubble with corner-down-right icon

### Option chips
- Appear after an AI message with choices
- Horizontal scroll, tapping one adds `.selected`, others get `.faded`
- Example: "Every night", "Weekdays only", "3 times a week"

### Suggestion chips
- Pre-conversation prompts with title + subtitle
- Horizontal scroll, disappear after first message (`.suggestion-chips.faded`)

### Action buttons
- Primary (green, `.action-btn-primary`) and secondary (outlined, `.action-btn-secondary`)
- States: default, `.loading` (spinner), `.done` (green check), `.faded` (disabled)

### Confirmation card
- Structured card with key-value rows (activity, frequency, duration)
- Confirm (green) and Cancel (outlined) buttons
- States: `.done`, `.dismissed`

### Artifacts
- Inline card with emoji + name + version badge + "View" link
- Tapping opens `.artifact-sheet` (bottom sheet with content + "Assign to child" button)

### Thought process
- "Thought for Ns >" toggle on incoming messages
- Opens `.reasoning-transcript-sheet` with timeline: dot, line, step title, description, elapsed time

### Tool usage
- Inline indicator: "Sprout is loading family overview..."
- Collapsible chevron reveals detail text
- Label text cycles with fade animation during processing

### Context menu (long press)
- `.sheet` + `.sheet-scrim` slide up from bottom
- Items: Copy, Reply, Forward, Delete for me
- Delete uses `.ctx-menu-item.destructive` (red)

### Banners
- **Reconnect**: spinner + "Reconnecting..." (auto-dismiss after 3s)
- **Delete**: "Message deleted" + "Undo" link
- **Toast**: "Copied to clipboard" (auto-dismiss)
- All use `.banner.show` / `.banner.hiding` for enter/exit

## Rive characters

All avatars use Rive for animated characters. Load the Rive runtime first:
```html
<script src="https://unpkg.com/@rive-app/canvas@2.35.2"></script>
```

### Files and artboards

| Character | Rive file | Artboard | State Machine |
|-----------|----------|----------|---------------|
| Sprout (AI mascot) | `/kid-design-system/sprot2.97_.riv` | *(default, omit artboard)* | `State Machine 1` |
| User / Co-parent | `/kid-design-system/character2.91.riv` | `Village-character` | `State Machine 1` |

### Customization states

Each character is customized by setting number inputs on the state machine after load:

```javascript
// Sprout - just needs a hair style
var SPROUT_STATE = { hairID: 1 };

// Parent (user) - skin, hair, clothing, eyes
var USER_STATE = {
  skinID: 3,
  hairID: 2,
  hairshadeID: 4,
  clothingID: 1,
  clothingcolourID: 2,
  eyeshadeID: 1
};

// Co-parent - different appearance with beard
var COPARENT_STATE = {
  skinID: 5,
  hairID: 4,
  hairshadeID: 8,
  beardID: 2,
  beardshadeID: 8,
  clothingID: 3,
  clothingcolourID: 5,
  eyeshadeID: 3
};
```

### initRiveAvatar helper

```javascript
function initRiveAvatar(canvas, opts) {
  var w = parseInt(canvas.getAttribute('width'), 10) || 86;
  var h = parseInt(canvas.getAttribute('height'), 10) || 124;
  canvas.width = w;
  canvas.height = h;
  var config = {
    src: opts.src,
    canvas: canvas,
    autoplay: true,
    stateMachines: 'State Machine 1',
    fit: rive.Fit.Contain,
    alignment: rive.Alignment.Center,
    onLoad: function() {
      if (!r) return;
      r.resizeDrawingSurfaceToCanvas();
      try {
        var inputs = r.stateMachineInputs('State Machine 1');
        if (inputs && opts.state) {
          inputs.forEach(function(inp) {
            if (opts.state[inp.name] !== undefined) inp.value = opts.state[inp.name];
          });
        }
      } catch(e) {}
    }
  };
  if (opts.artboard) config.artboard = opts.artboard;
  var r;
  try { r = new rive.Rive(config); } catch(e) { console.warn('Rive init failed', e); }
  return r;
}
```

### Creating avatar elements

**Sprout avatar** (for incoming messages):
```javascript
function createSproutAvatar() {
  var wrap = document.createElement('div');
  wrap.className = 'msg-avatar';
  var av = document.createElement('div');
  av.className = 'avatar avatar-sm';
  var canvas = document.createElement('canvas');
  canvas.className = 'rive-sprout';
  canvas.setAttribute('width', '86');
  canvas.setAttribute('height', '124');
  av.appendChild(canvas);
  wrap.appendChild(av);
  setTimeout(function() {
    initRiveAvatar(canvas, { src: RIVE_SPROUT_SRC, state: SPROUT_STATE });
  }, 0);
  return wrap;
}
```

**User/co-parent avatar** (for co-parent messages):
```javascript
function createUserAvatar(bgClass, state) {
  var wrap = document.createElement('div');
  wrap.className = 'msg-avatar';
  var av = document.createElement('div');
  av.className = 'avatar avatar-sm' + (bgClass ? ' ' + bgClass : '');
  var canvas = document.createElement('canvas');
  canvas.className = 'rive-user';
  canvas.setAttribute('width', '46');
  canvas.setAttribute('height', '66');
  av.appendChild(canvas);
  wrap.appendChild(av);
  setTimeout(function() {
    initRiveAvatar(canvas, {
      src: RIVE_USER_SRC,
      artboard: 'Village-character',
      state: state || USER_STATE
    });
  }, 0);
  return wrap;
}
```

**Canvas sizes** (2x resolution for crisp rendering):
- Sprout: `86x124` (inside 32px `.avatar-sm`)
- Village character: `46x66` (inside 32px `.avatar-sm`)

### Header toolbar avatars

The toolbar shows 3 stacked avatars (user, co-parent, Sprout):
```html
<div class="chat-header-avatars">
  <div class="avatar avatar-sm avatar-bordered" id="headerAvatarUser">
    <canvas class="rive-user" width="46" height="66"></canvas>
  </div>
  <div class="avatar avatar-sm avatar-bg-violet avatar-bordered" id="headerAvatarCoparent">
    <canvas class="rive-user" width="46" height="66"></canvas>
  </div>
  <div class="avatar avatar-sm avatar-bordered" id="sproutAvatar">
    <canvas class="rive-sprout" width="86" height="124"></canvas>
  </div>
</div>
```

Initialize after DOM ready:
```javascript
var sproutCanvas = document.querySelector('#sproutAvatar canvas.rive-sprout');
initRiveAvatar(sproutCanvas, { src: RIVE_SPROUT_SRC, state: SPROUT_STATE });

var userCanvas = document.querySelector('#headerAvatarUser canvas.rive-user');
initRiveAvatar(userCanvas, { src: RIVE_USER_SRC, artboard: 'Village-character', state: USER_STATE });

var coparentCanvas = document.querySelector('#headerAvatarCoparent canvas.rive-user');
initRiveAvatar(coparentCanvas, { src: RIVE_USER_SRC, artboard: 'Village-character', state: COPARENT_STATE });
```

### Sprout character inputs (sprot2.97.riv)

| Input | Type | Range | Notes |
|-------|------|-------|-------|
| `skinID` | Number | 0-9 | Skin color (0=green, 1=coral, 2=pink...) |
| `hairID` | Number | 0-8 | Hair style (0=none, 1=short, 2=curly...) |
| `looking` | Number | 0-3 | Eye direction |
| `smile` | Trigger | - | Smiling expression |
| `laugh` | Trigger | - | Laughing expression |
| `surprise` | Trigger | - | Surprised expression |
| `thinking` | Trigger | - | Thinking expression (note: trailing space in name) |
| `celebration` | Trigger | - | Full celebration animation |
| `characterwave` | Trigger | - | Wave hand animation |

### Village character inputs (character2.91.riv)

| Input | Type | Range | Notes |
|-------|------|-------|-------|
| `skinID` | Number | 0-15 | Skin tone |
| `hairID` | Number | 0-15 | Hair style |
| `hairshadeID` | Number | 0-12 | Hair color |
| `clothingID` | Number | 0-11 | Clothing type |
| `clothingcolourID` | Number | 0-10 | Clothing color |
| `beardID` | Number | 0-7 | Beard type (0=none) |
| `beardshadeID` | Number | 0-12 | Beard color |
| `glassID` | Number | 0-5 | Glasses type (0=none) |
| `glassshadeID` | Number | 0-10 | Glasses color |
| `eyeshadeID` | Number | 0-7 | Eye color |
| `earringID` | Number | 0-6 | Earring type (0=none) |
| `facedetailID` | Number | 0-3 | Face detail (0=none, 1=blush, 2=wrinkle, 3=freckle) |
| `headwearID` | Number | 0-4 | Headwear type (0=none) |
| `laugh` | Trigger | - | Laughing expression |
| `surprise` | Trigger | - | Surprise expression |
| `sad` | Trigger | - | Sad expression |

## Layout rules

- **Screen width**: 402px (iPhone), 640px (iPad)
- **Chat thread**: `position:absolute; top:0; bottom:[dynamic]` - bottom is set by JS via `ResizeObserver` on composer area
- **Composer area**: `position:absolute; bottom:20px` - flex column containing chips, composer row, keyboard/panel
- **Thread bottom transition**: `cubic-bezier(.2,.9,.3,1)` for smooth resize when keyboard/panel opens
- **Keyboard/panel gap**: 16px between composer and keyboard/panel
- **Keyboard/panel swap**: instant (no animation) to prevent layout jump - use `transition:none` on the outgoing element

## Animation principles

All transitions follow iOS spring curves:
- **Spring curve**: `cubic-bezier(.2,.9,.3,1)` for sheets, panels, pill expansion
- **Duration**: 350ms for most transitions, 250ms for opacity fades
- **Stagger**: Panel rows enter at 0ms, 50ms, 100ms delays
- **Plus pill rotation**: + rotates 45deg to become X on expand
- **Icon swap**: scale bounce (0.7 to 1.08 to 1.0) when swapping +/keyboard icons
- **Reduced motion**: `@media(prefers-reduced-motion:reduce)` disables animations

## Data model

The prototype uses these data structures:

### Members (for @mentions)
```javascript
{ name: 'Sprout', sub: 'AI Assistant', type: 'ai', bg: 'avatar-bg-sky' }
{ name: 'Ze\'ev Rosenstein', sub: 'Co-parent', type: 'coparent', bg: 'avatar-bg-violet' }
{ name: 'Morning Routine', sub: 'Project', type: 'project' }
```

### AI replies
```javascript
{
  text: "Message content...",
  chips: ["Option 1", "Option 2"],  // optional
  tool: "Loading family overview..." // optional
}
```

### Attachments
```javascript
{ type: 'photo', color: '#f87171' }
{ type: 'file', name: 'document.pdf' }
```

## Device support

- **iPhone** (default): 402x874px screen
- **iPad**: 640x854px screen, toggle via `.device-wrapper.ipad`
- Both use the same component CSS, only `.device-screen` dimensions change

## Key interactions summary

| Feature | Trigger | CSS class toggle | Animation |
|---------|---------|-----------------|-----------|
| Send message | Enter or tap send | `.btn-mic[data-mode="send"]` | None |
| Voice record | Tap mic | `.voice-recording-toolbar.active` | Waveform bars |
| @Mention | Type `@` | `.mention-popup.open` | None (instant) |
| Reply | Swipe right / long press | `.reply-pill.visible` | Swipe icon fade |
| Attachment A | Tap + | `.plus-pill.expanded` | Spring 350ms |
| Attachment B | Tap + | `.attach-panel.open` | Stagger reveal |
| Context menu | Long press | `.sheet.open` + `.sheet-scrim.open` | Spring slide-up |
| Reasoning transcript | Tap "Thought for Ns" | `.reasoning-transcript-sheet.open` | Spring slide-up |
| Artifact sheet | Tap artifact card | `.artifact-sheet.open` | Spring slide-up |
| Delete message | Context menu > Delete | `.banner.show` | Fade in |
| Reconnection | Network loss | `.banner-reconnect` | Auto-dismiss 3s |
