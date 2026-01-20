# CSU Component Class Mapping

This document defines the exact class names and HTML structure the builder must output.

## Class Naming Pattern

CSU uses a **functional naming convention**:

```
[context].[component].[variant]
```

Examples:
- `dark` (context only)
- `button` (component only)
- `button ghost` (component + variant)
- Context determines styling: `.dark .button.ghost` vs `.light .button.ghost`

---

## Component Reference

### Layout Containers

| Purpose | Class Name(s) |
|---------|---------------|
| Max-width wrapper (1200px) | `site-wrap` |
| Wide wrapper (1600px) | `wide-wrap` |
| Narrow wrapper (800px) | `narrow-wrap` |
| CSS Grid container | `page-grid` |
| Flexbox container | `flex` |

### Grid Column Layouts

| Layout | Classes |
|--------|---------|
| Two column (2:1 ratio) | `page-grid columns-2-1` |
| Two column (1:2 ratio) | `page-grid columns-1-2` |
| Three column | `page-grid columns-3` |
| Four column | `page-grid columns-4` |

### Theme Contexts

| Context | Class | Background | Text |
|---------|-------|------------|------|
| Light | `light` | #fff | #5B6770 |
| Dark | `dark` | #002855 | #fff |
| Gray | `background-gray` | #f7f7f7 | inherit |

---

## Header Components

### Required Structure

```html
<header>
  <!-- SECTION 1: Dark bar with logo and CTAs -->
  <div class="dark utility-navigation">
    <div class="site-wrap flex">
      <div class="site-logo">...</div>
      <ul class="button-group flex">...</ul>
    </div>
  </div>
  
  <!-- SECTION 2: Light bar with navigation -->
  <div class="light">
    <nav class="navigation-wrapper site-wrap flex">
      <ul class="site-navigation">...</ul>
    </nav>
  </div>
</header>
```

### Header Element Classes

| Element | Classes |
|---------|---------|
| Header wrapper | `header` |
| Dark top bar | `div.dark.utility-navigation` |
| Light nav bar | `div.light` |
| Logo container | `div.site-logo` |
| Header buttons | `ul.button-group.flex` |
| Navigation wrapper | `nav.navigation-wrapper` |
| Navigation list | `ul.site-navigation` |
| Nav item | `li` (direct child of ul) |
| Nav link | `a` or `button.toggle` |
| Dropdown menu | `div.dropdown` |

---

## Button System

### Variant Classes

| Variant | Classes | Visual Result |
|---------|---------|---------------|
| Plain | `button` | Text only, no border/fill |
| Ghost (outlined) | `button ghost` | Border, no fill |
| Solid (filled) | `button solid` | Fill, no border |

### Context + Variant Combinations

**In `.dark` context:**
```css
.dark .button        → color: #DFD1A7 (gold text)
.dark .button.ghost  → border: #DFD1A7 (gold border)
.dark .button.solid  → background: #C6AA76, color: #002855
```

**In `.light` context:**
```css
.light .button        → color: #1D252D
.light .button.ghost  → border: #DFD1A7
.light .button.solid  → background: #DFD1A7, color: #1D252D
```

### Header Button Usage

| Button | Classes | Why |
|--------|---------|-----|
| Phone number | `button` | Plain text, no decoration |
| Login | `button` | Plain text, no decoration |
| Apply Now | `button ghost` | Secondary CTA, outlined |
| Request Info | `button solid` | Primary CTA, filled |

### Button Groups

```html
<!-- Flex layout (horizontal) -->
<ul class="button-group flex">
  <li><a class="button ghost" href="#">Action</a></li>
  <li><a class="button solid" href="#">Action</a></li>
</ul>

<!-- Centered -->
<div class="button-group flex center">
  <a class="button ghost" href="#">Action</a>
  <a class="button solid" href="#">Action</a>
</div>
```

---

## Navigation Components

### Structure

```html
<ul class="site-navigation">
  <!-- Link with dropdown -->
  <li>
    <button class="toggle" aria-expanded="false" type="button">
      Menu Item
    </button>
    <div class="dropdown">
      <!-- dropdown content -->
    </div>
  </li>
  
  <!-- Simple link -->
  <li>
    <a href="/page">Menu Item</a>
  </li>
</ul>
```

### Classes

| Element | Class |
|---------|-------|
| Nav list | `ul.site-navigation` |
| Toggle button | `button.toggle` |
| Dropdown panel | `div.dropdown` |
| Search wrapper | `div.site-search` |
| Mobile menu button | `button.mobile-menu` |

---

## Page Sections

| Section Type | Classes |
|--------------|---------|
| Title banner | `section.title-banner.dark` |
| Main content area | `section.page-content.light` |
| CTA banner | `section.cta-banner.dark` |
| Padded section | `section.padded` |
| Feature section | `section.feature` |

### Main Content Structure

```html
<main id="content-start">
  <section class="title-banner dark">
    <div class="site-wrap">
      <h1>Page Title</h1>
    </div>
  </section>
  
  <section class="page-content light">
    <div class="site-wrap page-grid columns-2-1">
      <article class="content">...</article>
      <aside class="sidebar">...</aside>
    </div>
  </section>
</main>
```

---

## Footer Components

### Structure

```html
<footer>
  <!-- CTA Banner -->
  <section class="cta-banner dark">
    <div class="site-wrap">
      <h1>Heading</h1>
      <div class="button-group flex center">
        <a class="button ghost" href="#">Secondary</a>
        <a class="button solid" href="#">Primary</a>
      </div>
    </div>
  </section>
  
  <!-- Footer content -->
  <section class="light padded">
    <div class="site-wrap page-grid columns-1-2">
      <div><!-- Left column --></div>
      <div class="grid columns-3"><!-- Link columns --></div>
    </div>
  </section>
  
  <!-- Bottom links -->
  <div class="light background-gray">
    <div class="site-wrap">
      <ul class="button-group flex center">
        <li><a class="button" href="#">Link</a></li>
      </ul>
    </div>
  </div>
</footer>
```

---

## Content Components

| Component | Classes |
|-----------|---------|
| Article content | `article.content` |
| Sidebar | `aside.sidebar` |
| Card | `div.card` |
| Feature block | `div.feature` |
| Intro text | `div.intro` |

---

## List Classes

| Type | Class |
|------|-------|
| Link list | `ul.link-list` |
| Checkmark list | `ul.check-list` |
| Number list | `ol.number-list` |
| Inline links | `ul.inline-link-list` |
| Social icons | `ul.logo-grid.flex` |

---

## Utility Classes

### Spacing

| Class | Effect |
|-------|--------|
| `padded` | Vertical padding |
| `top-padded` | Top padding only |
| `bottom-padded` | Bottom padding only |

### Alignment

| Class | Effect |
|-------|--------|
| `center` | Center text and content |
| `items-center` | Vertical center (flex) |
| `self-center` | Self vertical center |

### Visibility

| Class | Effect |
|-------|--------|
| `offscreen` | Visually hidden, accessible |

---

## Data Attributes

| Attribute | Purpose |
|-----------|---------|
| `aria-expanded` | Toggle state for dropdowns |
| `aria-haspopup` | Indicates dropdown presence |
| `data-breakpoints` | Responsive grid breakpoints |

---

## Builder Output Validation

Ensure generated HTML:

1. Uses `site-wrap` for all content containers
2. Has two-section header (`dark utility-navigation` + `light`)
3. Uses correct button variants (`button`, `button ghost`, `button solid`)
4. Wraps nav in `ul.site-navigation > li > a/button`
5. Uses `page-grid columns-X-Y` for layouts
6. Applies `light` or `dark` context to sections
