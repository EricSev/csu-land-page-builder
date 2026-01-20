# Landing Page Builder: CSU Style Compliance Update

## Project Context

You are updating a landing page builder tool to generate HTML/CSS that exactly matches the Columbia Southern University (CSU) website at https://www.columbiasouthern.edu/perkspot.

The builder currently outputs pages that look similar but use different class names, colors, and structure. After this update, all generated pages must be visually identical to the original CSU site and use the same CSS class names.

## Reference Files

Read these files before making changes:

| File | Contents |
|------|----------|
| `csu-design-system.css` | Complete CSS with variables, components, all styles |
| `component-map.md` | Class naming conventions and component structure |
| `markup-templates.html` | Exact HTML structure for header, nav, buttons, footer |
| `assets.md` | Font URLs, image paths, icon references |

## Priority Fixes (Do These First)

### 1. Header Button Styling Bug

**Current problem**: Phone number in header has wrong styling (missing or incorrect border)

**Root cause**: Builder outputs wrong button class variant

**Fix**: In the dark header context, buttons must use these exact classes:

```html
<!-- Phone number: plain button (text only, no border) -->
<a class="button" href="tel:+18009778449">800-977-8449</a>

<!-- Login: plain button -->  
<a class="button" href="/login">Login Options</a>

<!-- Apply Now: ghost button (gold border, no fill) -->
<a class="button ghost" href="/apply">Apply Now</a>

<!-- Request Info: solid button (gold fill) -->
<a class="button solid" href="/info">Request Info</a>
```

### 2. Header Structure

The header must have TWO distinct sections with different background colors:

```
┌─────────────────────────────────────────────────────────────┐
│ div.dark.utility-navigation     (background: #002855)       │
│   └─ div.site-wrap.flex                                     │
│        ├─ div.site-logo                                     │
│        └─ ul.button-group.flex                              │
├─────────────────────────────────────────────────────────────┤
│ div.light                       (background: #fff)          │
│   └─ nav.navigation-wrapper.site-wrap.flex                  │
│        └─ ul.site-navigation                                │
└─────────────────────────────────────────────────────────────┘
```

### 3. Color Values

Replace ALL existing color values with these exact hex codes:

```css
/* Primary */
--csu-navy: #002855;
--csu-gold: #C6AA76;
--csu-gold-light: #DFD1A7;
--csu-teal: #207788;

/* Text */
--csu-text-dark: #1D252D;
--csu-text-gray: #5B6770;

/* States */
--csu-hover: #207788;
--csu-error: #bb2403;
```

### 4. Font Loading

Add these font imports to the builder's CSS output:

```css
@import url("https://use.typekit.net/yxt5svl.css");
@import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&display=swap");
```

Font assignments:
- **"Nunito Sans"**: h1, h2, h4, buttons, navigation
- **"cronos-pro"**: body text, h3, h5, h6

## Component Class Mapping

Update the builder to output these exact class names:

| Builder Component | Required Output Classes |
|-------------------|------------------------|
| Page wrapper | `light` or `dark` |
| Content container | `site-wrap` |
| Header wrapper | `header` |
| Dark header bar | `div.dark.utility-navigation` |
| Light nav bar | `div.light` |
| Navigation | `nav.navigation-wrapper` |
| Nav list | `ul.site-navigation` |
| Button container | `ul.button-group.flex` or `div.button-group` |
| Plain button | `a.button` |
| Outlined button | `a.button.ghost` |
| Filled button | `a.button.solid` |
| Main content | `main#content-start` |
| Content section | `section.page-content.light` |
| Two-column layout | `page-grid columns-2-1` |
| CTA banner | `section.cta-banner.dark` |
| Footer | `footer` |

## Button Styling Rules

```css
/* In .dark context */
.dark .button {
  color: #DFD1A7;
  background: transparent;
  border: 2px solid transparent;
}

.dark .button.ghost {
  border-color: #DFD1A7;
}

.dark .button.solid {
  background-color: #C6AA76;
  color: #002855;
}

/* Hover state for all buttons */
.dark .button.solid:hover,
.dark .button.ghost:hover {
  background-color: #207788;
  border-color: #fff;
  color: #fff;
}

/* Button group spacing */
.button-group.flex .button {
  margin: 0 0.75em;
  border-radius: 5px;
}
```

## Implementation Steps

1. **Audit current codebase**
   - Find where colors are defined (CSS variables, SCSS, styled-components, etc.)
   - Find component templates that generate HTML
   - Find button component variants

2. **Update color system**
   - Replace all color values with CSU brand colors
   - Create/update CSS custom properties

3. **Update font loading**
   - Add Typekit and Google Fonts imports
   - Update font-family declarations

4. **Fix header structure**
   - Ensure two-section header (dark + light)
   - Update class names to match CSU conventions

5. **Fix button component**
   - Add/rename variants: plain, ghost, solid
   - Ensure correct hover states
   - Add border-radius: 5px to header buttons

6. **Update all component class names**
   - Rename to match CSU conventions (see component-map.md)

7. **Test output**
   - Generate a test page
   - Compare visually to https://www.columbiasouthern.edu/perkspot
   - Verify class names in browser DevTools match original

## Validation Checklist

After changes, verify:

- [ ] Header has navy background (#002855) on top section
- [ ] Phone number displays as plain text (no border)
- [ ] "Apply Now" has gold border but no fill
- [ ] "Request Info" has gold fill
- [ ] Buttons have 5px border-radius
- [ ] Navigation bar has white background
- [ ] Fonts render correctly (Nunito Sans for headings)
- [ ] Hover states show teal (#207788) background
- [ ] Class names in DevTools match CSU site exactly

## Files to Modify

Identify and update these areas in your codebase:

1. **Global CSS/SCSS** - Colors, fonts, variables
2. **Button component** - Variants and styling
3. **Header component** - Structure and classes
4. **Layout component** - Wrapper class names
5. **Theme/context provider** - Light/dark class application
