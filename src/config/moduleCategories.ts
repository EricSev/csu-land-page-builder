import { ModuleCategory } from '../types'

// Module interface (matching App.tsx)
interface Module {
  id: string
  name: string
  enabled: boolean
  locked: boolean
  order: number
}

// Maps each module ID to its category
export const MODULE_CATEGORY_MAP: Record<string, ModuleCategory> = {
  // Header Elements
  'header': 'header-elements',
  'csu-global-menu': 'header-elements',
  'welcome-bar': 'header-elements',

  // Hero Section
  'hero-banner': 'hero-section',
  'stats-banner': 'hero-section',

  // Partner Identity
  'partner-headline': 'partner-identity',
  'partner-logo': 'partner-identity',

  // Benefits & Value Proposition
  'partner-benefits-card': 'benefits-value-proposition',
  'benefits-copy': 'benefits-value-proposition',
  'tiered-pricing-display': 'benefits-value-proposition',
  'why-choose-csu': 'benefits-value-proposition',
  'value-proposition-cards': 'benefits-value-proposition',

  // Program Information
  'degree-programs-list': 'program-information',
  'scholarship-highlight': 'program-information',

  // Lead Capture
  'lead-capture-form': 'lead-capture',
  'cta-buttons-only': 'lead-capture',
  'contact-info-block': 'lead-capture',

  // Social Proof & Trust
  'video-testimonial': 'social-proof-trust',
  'faq-accordion': 'social-proof-trust',
  'csu-by-the-numbers': 'social-proof-trust',
  'accreditations-section': 'social-proof-trust',

  // Tuition & Cost
  'tuition-comparison-table': 'tuition-cost',
  'tuition-comparison-banner': 'tuition-cost',
  'cost-calculator-widget': 'tuition-cost',

  // Secondary CTA & Navigation
  'more-info-card': 'secondary-cta-navigation',
  'secondary-cta-banner': 'secondary-cta-navigation',
  'get-started-today-banner': 'secondary-cta-navigation',

  // Footer & Compliance
  'footnotes-disclaimers': 'footer-compliance',
  'footer': 'footer-compliance',
}

// Helper to get modules by category
export function getModulesByCategory(modules: Module[], categoryId: ModuleCategory): Module[] {
  return modules.filter(m => MODULE_CATEGORY_MAP[m.id] === categoryId)
}

// Helper to get category for a module
export function getCategoryForModule(moduleId: string): ModuleCategory | undefined {
  return MODULE_CATEGORY_MAP[moduleId]
}
