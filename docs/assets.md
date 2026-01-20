# CSU Assets Reference

## Fonts

### Required Font Imports

Add BOTH of these imports to the builder's CSS output:

```css
/* Adobe Typekit - cronos-pro */
@import url("https://use.typekit.net/yxt5svl.css");

/* Google Fonts - Nunito Sans */
@import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&display=swap");
```

### Font Family Assignments

| Element | Font Family |
|---------|-------------|
| Body text | `"cronos-pro", sans-serif` |
| h1, h2, h4 | `"Nunito Sans", sans-serif` |
| h3, h5, h6 | `"cronos-pro", sans-serif` |
| Buttons | `"Nunito Sans", sans-serif` |
| Navigation | `"Nunito Sans", sans-serif` |

### CSS Variables

```css
:root {
  --font-display: "Nunito Sans", sans-serif;
  --font-body: "cronos-pro", sans-serif;
}
```

---

## Logos

### White Logo (for dark backgrounds)

```
URL: https://www.columbiasouthern.edu/media/vhgldcbo/csu-logo-horizontal-white.png
Use: Dark utility navigation bar
Alt: "Columbia Southern University logo"
```

### Dark Logo (for light backgrounds)

```
URL: https://www.columbiasouthern.edu/media/campm3vj/csu-logo-horizontal.png
Use: Light navigation bar, mobile menu
Alt: "Columbia Southern University logo"
```

### Logo Container

```html
<div class="site-logo">
  <a href="/">
    <img src="[logo-url]" alt="Columbia Southern University logo">
  </a>
</div>
```

Max width: `200px`

---

## Colors

### Brand Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Navy | `#002855` | `--color-navy` | Dark backgrounds, headings |
| Gold | `#C6AA76` | `--color-gold` | Solid buttons, accents |
| Gold Light | `#DFD1A7` | `--color-gold-light` | Ghost buttons, borders |
| Teal | `#207788` | `--color-teal` | Links, hover states |
| Teal Light | `#77C5D5` | `--color-teal-light` | Secondary accents |

### Text Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Text Dark | `#1D252D` | `--color-text-primary` | Body text (light bg) |
| Text Gray | `#5B6770` | `--color-text-secondary` | Secondary text |
| Text Muted | `#A2AAAD` | `--color-text-muted` | Disabled, hints |
| Text Inverse | `#fff` | `--color-text-inverse` | Text on dark bg |

### State Colors

| Name | Hex | CSS Variable | Usage |
|------|-----|--------------|-------|
| Error | `#bb2403` | `--color-error` | Errors, hover links |
| Success | `#C5E86C` | `--color-success` | Success states |

---

## Icon Font

CSU uses a custom icon font called "icomoon":

```css
@font-face {
  font-family: "icomoon";
  src: url("/media/xzmjmipx/csu-icons.eot");
  src: url("/media/xzmjmipx/csu-icons.eot") format("embedded-opentype"),
       url("/media/dj4hd4uw/csu-icons.ttf") format("truetype"),
       url("/media/qbppwbf2/csu-icons.woff") format("woff"),
       url("/media/ocelyupr/csu-icons.svg") format("svg");
}
```

### Icon Classes

```css
[class*=csu-icon] {
  font-family: "icomoon" !important;
  font-style: normal;
  font-weight: normal;
}
```

### Common Icons

| Icon | Class |
|------|-------|
| Search | `csu-icon-search` |
| Phone | `csu-icon-telephone` |
| Email | `csu-icon-at-symbol` |
| Checkmark | `csu-icon-checkmark` |
| Arrow right | `csu-icon-arrow-line-right` |
| Download | `csu-icon-download-arrow` |
| Calendar | `csu-icon-calendar` |
| Graduate | `csu-icon-mortarboard` |

---

## Measurements

### Layout

| Property | Value |
|----------|-------|
| Site max-width | `1200px` |
| Wide max-width | `1600px` |
| Narrow max-width | `800px` |

### Spacing

| Name | Desktop | Mobile |
|------|---------|--------|
| Site padding | `0` | `15px` |
| Section padding | `7.5vh 0 5vh` | `50px 0 35px` |
| Grid gap | `50px` | `30px` |

### Header

| Property | Value |
|----------|-------|
| Utility bar padding | `10px` |
| Logo margin | `15px 0` |
| Logo max-width | `200px` |
| Nav padding | `1rem` |

### Buttons

| Property | Value |
|----------|-------|
| Padding | `1em 1.25em` |
| Font size | `0.9375rem` |
| Border radius (header) | `5px` |
| Border width | `2px` |
| Group margin | `0.75em` |

---

## Background Images

### Title Banner Pattern

```css
.title-banner {
  background: rgba(0, 40, 85, 0.975) url(/media/klgnfpou/stripes-pattern.png) center repeat;
}
```

### Wireframe Decoration

```css
[class*=wireframe]::after {
  background: url(/media/hfjdcxls/gold-wireframe.png) no-repeat;
}
```

---

## Transitions

| Type | Value |
|------|-------|
| Fast | `0.15s ease-in-out` |
| Normal | `0.25s ease-in-out` |
| Slow | `0.35s ease-in-out` |

```css
:root {
  --transition-fast: 0.15s ease-in-out;
  --transition-normal: 0.25s ease-in-out;
  --transition-slow: 0.35s ease-in-out;
}
```

---

## Z-Index Scale

| Layer | Value |
|-------|-------|
| Header | `20` |
| Dropdown | `5` |
| Modal | `100` |
| Fixed CTA | `12` |

---

## Breakpoints

| Name | Width |
|------|-------|
| Small | `max-width: 767px` |
| Medium | `768px - 1023px` |
| Large | `1024px - 1199px` |
| XL | `min-width: 1200px` |

```css
/* Mobile */
@media (max-width: 767px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1200px) { }
```
