# CSU Landing Page Builder

A landing page builder tool for Columbia Southern University's Business Development team to create detailed, structured mockups for partner landing pages.

## Overview

This tool enables the Business Development team to create Wufoo-ready text, HTML previews, and image assets for partner landing pages. It shifts Marketing's role from production to final review and publication, eliminating revision cycles by delivering near-complete specifications.

## Technology Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context or Zustand
- **Drag & Drop**: dnd-kit or react-beautiful-dnd
- **File Generation**: JSZip, FileSaver.js
- **URL Parsing**: DOMParser

## Prerequisites

- Node.js 18+
- npm
- Modern browser (Chrome, Firefox, Safari, Edge - latest)

## Quick Start

```bash
# Run setup script (installs dependencies)
./init.sh

# Or manually:
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Features

### Page Creation Modes
- **Create New Page**: Start from scratch with template selection
- **Edit Existing Page**: Parse content from existing CSU landing page URLs
- **Load Draft**: Resume work from a saved JSON draft file

### Module System
- Toggle modules on/off with checkboxes
- Drag-and-drop module reordering
- Real-time preview updates
- Locked modules (Header, Footer, Consent Disclosure)

### Available Modules
1. Partner Headline
2. Partner Logo
3. Partner Benefits Card
4. Benefits Copy
5. Lead Capture Form
6. FAQ Accordion
7. Value Proposition Cards
8. CSU by the Numbers
9. Accreditations Section
10. Tuition Comparison Banner
11. Degree Programs List
12. Scholarship Highlight
13. Video Testimonial
14. Hero Banner
15. Secondary CTA Banner
16. Looking for More Info Card
17. Footnotes/Disclaimers

### Export Options
- Wufoo form text with copy-to-clipboard
- Self-contained HTML file
- Image assets ZIP file
- JSON draft for future editing

### Design Features
- Three-panel layout (modules, preview, content)
- Desktop/tablet/mobile viewport preview
- Light/dark mode for builder UI
- CSU brand colors and styling
- Auto-save to localStorage

## Supported URL Patterns for Editing

```
https://www.columbiasouthern.edu/tuition-financing/partnerships/learning-partner-directory/*
https://www.columbiasouthern.edu/landing-pages/learning-partners/*
https://www.columbiasouthern.edu/benefithub
https://www.columbiasouthern.edu/delta
https://www.columbiasouthern.edu/perkspot
https://www.columbiasouthern.edu/iafc
https://www.columbiasouthern.edu/ebg-solutions
```

## Brand Guidelines

### Primary Colors
- Navy: #002855
- Gold: #C6AA76

### Typography
- Helvetica, Arial, sans-serif

## Project Structure

```
csu-land-page-builder/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript interfaces
│   ├── assets/         # Static assets
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Entry point
├── public/             # Public assets
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── README.md           # This file
```

## Hosting

This application is designed to be hosted as a static site on Render.com or similar platforms.

## License

Internal CSU Business Development Tool
