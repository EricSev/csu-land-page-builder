# CSU Landing Page Builder - UI Component Reference Guide

This guide maps UI sections to their code locations for precise reference in future enhancements.

---

## VISUAL LAYOUT OVERVIEW

```
+------------------+----------------------------------------+------------------+
|                  |                                        |                  |
|   LEFT SIDEBAR   |           CENTER PREVIEW               |   RIGHT PANEL    |
|   (Modules)      |           (Live Preview)               |   (Editor)       |
|                  |                                        |                  |
|   256px fixed    |           Flexible width               |   Collapsible    |
|                  |                                        |                  |
+------------------+----------------------------------------+------------------+
```

---

## 1. TOP TOOLBAR

| UI Element | Description | File Location |
|------------|-------------|---------------|
| **CSU Logo + "Landing Page Builder"** | App header/branding | `App.tsx` ~line 570 |
| **Progress Bar (60%)** | Shows module completion percentage | `App.tsx` - `calculateCompletionPercentage()` |
| **Settings Button** | Opens global settings panel | `App.tsx` - `showSettings` state |
| **Save Draft Button** | Saves current state to localStorage | `App.tsx` - `saveDraft()` |
| **Export Button** | Opens export modal (ZIP/Wufoo) | `App.tsx` - `showExportModal` state |
| **Scroll Sync Checkbox** | Syncs sidebar selection with preview scroll | `App.tsx` - `scrollSyncEnabled` state |

---

## 2. LEFT SIDEBAR - MODULES PANEL

**Component:** `ModuleSidebar.tsx`

### Category Structure (10 Categories, 29 Modules)

| Category | Module ID | Display Name | Config Location |
|----------|-----------|--------------|-----------------|
| **Header Elements** | `header` | Header | Locked |
| | `csu-global-menu` | CSU Global Menu | Optional - Fixed nav links |
| | `welcome-bar` | Welcome Bar | |
| **Hero Section** | `hero-banner` | Hero Banner | |
| | `stats-banner` | Stats Banner | |
| **Partner Identity** | `partner-headline` | Partner Headline | |
| | `partner-logo` | Partner Logo | |
| **Benefits & Value Proposition** | `partner-benefits-card` | Partner Benefits Card | |
| | `benefits-copy` | Benefits Copy | |
| | `tiered-pricing-display` | Tiered Pricing Display | |
| | `why-choose-csu` | Why Choose CSU | |
| | `value-proposition-cards` | Value Proposition Cards | |
| **Program Information** | `degree-programs-list` | Degree Programs List | |
| | `scholarship-highlight` | Scholarship Highlight | |
| **Lead Capture** | `lead-capture-form` | Lead Capture Form | |
| | `cta-buttons-only` | CTA Buttons Only | |
| | `contact-info-block` | Contact Info Block | |
| **Social Proof & Trust** | `faq-accordion` | FAQ Accordion | |
| | `video-testimonial` | Video Testimonial | |
| | `csu-by-the-numbers` | CSU by the Numbers | |
| | `accreditations-section` | Accreditations Section | |
| **Tuition & Cost** | `tuition-comparison-table` | Tuition Comparison Table | |
| | `tuition-comparison-banner` | Tuition Comparison Banner | |
| | `cost-calculator-widget` | Cost Calculator Widget | |
| **Secondary CTA & Navigation** | `more-info-card` | Looking For More Info | |
| | `secondary-cta-banner` | Secondary CTA Banner | |
| | `get-started-today-banner` | Get Started Today Banner | |
| **Footer & Compliance** | `footnotes-disclaimers` | Footnotes & Disclaimers | |
| | `footer` | Footer | Locked |

**Category Config:** `src/config/moduleCategories.ts`

### Sidebar UI Elements

| Element | Component | Description |
|---------|-----------|-------------|
| **Category Header** (collapsible) | `CollapsibleCategory` in ModuleSidebar.tsx | Click to expand/collapse |
| **Module Count Badge** (e.g., "1/2") | ModuleSidebar.tsx | Shows enabled/total modules |
| **Drag Handle** (6-dot icon) | `SortableModule.tsx` lines 54-63 | Reorder modules within category |
| **Module Checkbox** | `SortableModule.tsx` line 69 | Enable/disable module |
| **Module Name** (clickable) | `SortableModule.tsx` line 79 | Select for editing |
| **Lock Icon** | `SortableModule.tsx` line 88 | Header & Footer only |
| **Completion Badge** (checkmark/warning) | `SortableModule.tsx` lines 95-105 | Green=complete, Amber=incomplete |

---

## 3. CENTER PREVIEW PANEL

**Location:** `App.tsx` starting ~line 614

### Preview Sections (Top to Bottom)

| Preview Section | Module ID | HTML Generation |
|-----------------|-----------|-----------------|
| **University Header Bar** | `header` | Navy bar with CSU logo, phone, Login Options, Apply Now, Request Info buttons |
| **CSU Global Menu** | `csu-global-menu` | Optional navigation bar: Academics, Admissions, Student Support, etc. + search |
| **Welcome Bar** | `welcome-bar` | Optional gold/blue banner above hero |
| **Partner Headline** | `partner-headline` | "{Partner} - Work in {Industry}" + subheadline |
| **Hero Banner** | `hero-banner` | Full-width image with overlay text |
| **Stats Banner** | `stats-banner` | 3 statistics in horizontal row or cards |
| **Partner Logo** | `partner-logo` | Centered partner organization logo |
| **Partner Benefits Card** | `partner-benefits-card` | "Your Benefits" box with discount & bullet points |
| **Benefits Copy** | `benefits-copy` | Eligibility, tuition, flexibility paragraphs |
| **Tiered Pricing** | `tiered-pricing-display` | 3-column pricing tiers |
| **Why Choose CSU** | `why-choose-csu` | Heading + benefit list |
| **Value Proposition Cards** | `value-proposition-cards` | 3 feature cards with icons |
| **Degree Programs List** | `degree-programs-list` | Linked program names |
| **Scholarship Highlight** | `scholarship-highlight` | Featured scholarship box |
| **Lead Capture Form** | `lead-capture-form` | "Request Information" form fields |
| **CTA Buttons** | `cta-buttons-only` | Apply Now / Request Info buttons |
| **Contact Info Block** | `contact-info-block` | Phone, email, chat links |
| **Video Testimonial** | `video-testimonial` | Embedded YouTube player |
| **FAQ Accordion** | `faq-accordion` | Expandable Q&A sections |
| **CSU by the Numbers** | `csu-by-the-numbers` | 4 statistics grid |
| **Accreditations** | `accreditations-section` | SACSCOC, ACBSP, etc. badges |
| **Tuition Comparison Table** | `tuition-comparison-table` | Institution vs CSU costs |
| **Tuition Comparison Banner** | `tuition-comparison-banner` | CTA banner with pricing points |
| **Cost Calculator** | `cost-calculator-widget` | Embedded iframe calculator |
| **More Info Card** | `more-info-card` | "Looking for More Info?" section |
| **Secondary CTA Banner** | `secondary-cta-banner` | Additional Apply/Request Info |
| **Get Started Today** | `get-started-today-banner` | Final CTA with colored background |
| **Footnotes/Disclaimers** | `footnotes-disclaimers` | Legal text array |
| **Footer** | `footer` | Copyright + CSU address |

---

## 4. RIGHT EDITOR PANEL

**Location:** `App.tsx` starting ~line 1200

Editor forms are rendered conditionally based on `selectedModuleId`:

```typescript
switch(selectedModuleId) {
  case 'partner-headline': // Render headline editor
  case 'partner-logo': // Render logo uploader
  case 'lead-capture-form': // Render form field toggles
  // ... etc
}
```

---

## 5. KEY STATE VARIABLES

| State Variable | Type | Purpose |
|----------------|------|---------|
| `modules` | `Module[]` | All 28 modules with id, name, enabled, locked, order |
| `moduleContent` | `ModuleContent` | Content data for all modules |
| `selectedModuleId` | `string \| null` | Currently selected module for editing |
| `appMode` | `'selection' \| 'setup' \| 'builder'` | Current app mode |
| `templateType` | `'learning-partner' \| 'channel-partner'` | Template determines defaults |
| `darkMode` | `boolean` | UI theme toggle |
| `scrollSyncEnabled` | `boolean` | Sync sidebar with preview scroll |

---

## 6. FILE STRUCTURE QUICK REFERENCE

```
src/
├── App.tsx                    # Main app (5135 lines) - all rendering logic
├── main.tsx                   # React entry point
├── components/
│   ├── ModuleSidebar.tsx     # Left panel with categories
│   └── SortableModule.tsx    # Individual module row
├── config/
│   └── moduleCategories.ts   # Category definitions
├── types/
│   └── index.ts              # TypeScript interfaces
└── utils/
    └── urlParser.ts          # URL extraction logic
```

---

## 7. REFERENCING CONVENTIONS

When requesting changes, use these patterns:

- **By Module ID:** "Update the `partner-benefits-card` module..."
- **By Category:** "Add a new module to the `Social Proof & Trust` category..."
- **By UI Area:** "In the left sidebar..." / "In the preview panel..." / "In the editor form..."
- **By File:** "In `ModuleSidebar.tsx`..." / "In `App.tsx` around line 600..."

---

## 8. MODULE COMPLETION CRITERIA

Each module has specific validation in `isModuleComplete()` (App.tsx lines 360-470):

| Module | Required Fields |
|--------|-----------------|
| `partner-headline` | partnerName set |
| `partner-logo` | logoUrl or logoFileName (no errors) |
| `hero-banner` | backgroundImageUrl or backgroundImageFile |
| `lead-capture-form` | formTitle set |
| `faq-accordion` | At least one complete Q&A |
| `accreditations-section` | At least one checkbox selected |
| `partner-benefits-card` | discountPercentage and at least one benefit |
