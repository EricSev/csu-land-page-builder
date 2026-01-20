# CSU Builder Prompt Package

This package contains everything needed to update a landing page builder to match Columbia Southern University's website styling and naming conventions.

## Contents

| File | Purpose |
|------|---------|
| `CLAUDE.md` | **Main prompt file** - Claude Code reads this first |
| `csu-design-system.css` | Complete CSS with all styles and variables |
| `component-map.md` | Class naming conventions and HTML structure |
| `markup-templates.html` | Example HTML for all components |
| `assets.md` | Fonts, colors, images, measurements |

## How to Use with Claude Code

### Option 1: Add to Project Root

1. Copy all files to your project's root directory
2. Claude Code will automatically read `CLAUDE.md` for context
3. Reference other files as needed during the conversation

### Option 2: Create a `docs/` or `reference/` folder

```
your-project/
├── src/
├── docs/
│   └── csu-style-guide/
│       ├── CLAUDE.md
│       ├── csu-design-system.css
│       ├── component-map.md
│       ├── markup-templates.html
│       └── assets.md
└── package.json
```

### Option 3: Paste into conversation

Copy the contents of `CLAUDE.md` directly into a Claude Code conversation, then reference other files as needed.

## Starting the Update

Begin your Claude Code session with:

```
Read the CSU style guide files and update the landing page builder to match 
the CSU website styling. Start by auditing the current codebase to identify:
1. Where colors are defined
2. Where button components are defined  
3. Where header templates are generated
```

## Key Issues to Fix

### Priority 1: Header Buttons
The phone number in the header should be a plain button (text only), not a ghost or solid button.

### Priority 2: Color Values
Replace all colors with CSU brand colors defined in `assets.md`.

### Priority 3: Class Names
Update all component class names to match CSU conventions in `component-map.md`.

## Validation

After updates, compare output to:
- https://www.columbiasouthern.edu/perkspot (original)
- Open DevTools and verify class names match

## Quick Reference

### Button Classes
```html
<a class="button">Plain (text only)</a>
<a class="button ghost">Ghost (border)</a>
<a class="button solid">Solid (filled)</a>
```

### Header Structure
```html
<header>
  <div class="dark utility-navigation">...</div>
  <div class="light">
    <nav class="navigation-wrapper">...</nav>
  </div>
</header>
```

### Colors
```
Navy:      #002855
Gold:      #C6AA76
Gold Lt:   #DFD1A7
Teal:      #207788
```
