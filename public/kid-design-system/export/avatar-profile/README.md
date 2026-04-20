# avatar-profile - Sprout Design Component Bundle

## Quick start

```html
<link rel="stylesheet" href="avatar-profile.bundle.css">
```

## What's included

**CSS bundle** (`avatar-profile.bundle.css`):
- Design tokens (CSS custom properties)
- avatar-profile.css

**Rive assets:**
- character2.91.riv
- sprot2.97_.riv

**JS helpers:**
- rive-avatars.js

## Tokens

All CSS custom properties have inline fallback values, so the bundle renders
correctly as-is. To customize, override the variables in your own stylesheet:

```css
:root {
  --color-brand-500: #your-brand-color;
  --spacing-md: 12px;
}
```

## Rive characters

This component uses Rive for character animation. Include the Rive WASM runtime:

```html
<script src="https://unpkg.com/@rive-app/canvas@2.27.0"></script>
```

