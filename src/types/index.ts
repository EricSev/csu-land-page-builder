// Template Types
export type TemplateType = 'learning-partner' | 'channel-partner'

// Header/Footer Styles
export type HeaderStyle = 'minimal' | 'full'
export type FooterStyle = 'minimal' | 'full'

// Discount Options
export type DiscountOption = '10%' | '15%' | '20%' | 'custom'

// Approval Options
export type ApprovalOption = 'yes' | 'no' | 'not-applicable'

// Viewport Options
export type ViewportSize = 'desktop' | 'tablet' | 'mobile'

// Module Definitions
export interface ModuleDefinition {
  id: string
  name: string
  description: string
  locked: boolean
  defaultEnabled: boolean
  requiredFields: string[]
}

// Module Content Types
export interface PartnerHeadlineContent {
  partnerName: string
  headlineStyle: 'style1' | 'style2' | 'style3'
}

export interface PartnerLogoContent {
  imageUrl: string
  imageFile?: File
  altText: string
}

export interface PartnerBenefitsCardContent {
  discountType: DiscountOption
  customDiscountText: string
  benefitLines: [string, string, string, string]
  includeLogo: boolean
}

export interface BenefitsCopyContent {
  eligibilityStatement: string
  tuitionParagraph: string
  flexibilityParagraph: string
}

export interface LeadCaptureFormContent {
  formHeading: string
  submitButtonText: string
  fieldToggles: {
    firstName: boolean
    lastName: boolean
    email: boolean
    phone: boolean
    zipCode: boolean
    programInterest: boolean
  }
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQAccordionContent {
  heading: string
  items: FAQItem[]
}

export interface ValuePropCard {
  heading: string
  body: string
  imageUrl: string
  imageFile?: File
}

export interface ValuePropositionCardsContent {
  cards: [ValuePropCard, ValuePropCard, ValuePropCard]
}

export interface StatItem {
  number: string
  label: string
}

export interface CSUByTheNumbersContent {
  stats: [StatItem, StatItem, StatItem, StatItem]
}

export interface AccreditationsSectionContent {
  heading: string
  subheading: string
  selectedAccreditations: {
    sacscoc: boolean
    qualityMatters: boolean
    acbsp: boolean
    blackboard: boolean
    military: boolean
  }
}

export interface TuitionComparisonBannerContent {
  heading: string
  body: string
  bulletPoints: [string, string, string]
  showCTAButton: boolean
}

export interface DegreeProgram {
  name: string
  url: string
}

export interface DegreeProgramsListContent {
  heading: string
  programs: DegreeProgram[]
}

export interface ScholarshipHighlightContent {
  name: string
  description: string
  eligibilityUrl: string
  ctaText: string
}

export interface VideoTestimonialContent {
  youtubeUrl: string
  videoTitle: string
  caption: string
  urlError?: string
}

export interface HeroBannerContent {
  backgroundImageUrl: string
  backgroundImageFile?: File
  overlayOpacity: number
  headline: string
  subheadline: string
}

export interface SecondaryCTABannerContent {
  heading: string
  showApplyButton: boolean
  showRequestInfoButton: boolean
}

export interface LookingForMoreInfoContent {
  heading: string
  body: string
  linkUrl: string
  imageUrl: string
  imageFile?: File
}

export interface FootnotesDisclaimersContent {
  disclaimers: string[]
}

// New Module Content Types (9 new modules)

export interface WelcomeBarContent {
  greeting: string
  ctaText: string
  ctaUrl: string
}

export interface StatsBannerContent {
  stats: [StatItem, StatItem, StatItem]
  style: 'horizontal' | 'cards'
}

export interface TieredPricingDisplayContent {
  heading: string
  tiers: [
    { level: string; discount: string; originalPrice?: string },
    { level: string; discount: string; originalPrice?: string },
    { level: string; discount: string; originalPrice?: string }
  ]
  footnote?: string
}

export interface WhyChooseCSUContent {
  heading: string
  benefits: string[]
}

export interface CTAButtonsOnlyContent {
  showApplyButton: boolean
  applyButtonText: string
  showRequestInfoButton: boolean
  requestInfoButtonText: string
  alignment: 'left' | 'center' | 'right'
  style: 'side-by-side' | 'stacked'
}

export interface ContactInfoBlockContent {
  heading: string
  email: string
  phone: string
  showLiveChat: boolean
  liveChatUrl?: string
  additionalInfo?: string
}

export interface TuitionComparisonTableContent {
  heading: string
  subheading?: string
  rows: Array<{
    institution: string
    tuitionPerCredit: string
    isCSU: boolean
  }>
}

export interface CostCalculatorWidgetContent {
  heading: string
  iframeUrl: string
  height: number
  fallbackText: string
}

export interface GetStartedTodayBannerContent {
  heading: string
  subheading?: string
  showApplyButton: boolean
  showRequestInfoButton: boolean
  backgroundColor: 'navy' | 'gold' | 'gradient'
}

// Module State
export interface ModuleState {
  enabled: boolean
  order: number
  content: Record<string, unknown>
}

// Settings State
export interface SettingsState {
  headerStyle: HeaderStyle
  footerStyle: FooterStyle
  autoSaveEnabled: boolean
  darkMode: boolean
}

// Requester Information
export interface RequesterInfo {
  firstName: string
  lastName: string
  email: string
  dateNeeded: string
  approvedByAdmin: ApprovalOption
  additionalNotes: string
}

// Draft Metadata
export interface DraftMetadata {
  partnerName: string
  templateType: TemplateType
  sourceUrl?: string
}

// Full Draft Schema
export interface DraftSchema {
  version: string
  created: string
  modified: string
  metadata: DraftMetadata
  settings: SettingsState
  modules: Record<string, ModuleState>
}

// Module Names (for type safety)
export const MODULE_IDS = {
  // Header Elements
  HEADER: 'header',
  WELCOME_BAR: 'welcome-bar',
  // Hero Section
  HERO_BANNER: 'hero-banner',
  STATS_BANNER: 'stats-banner',
  // Partner Identity
  PARTNER_HEADLINE: 'partner-headline',
  PARTNER_LOGO: 'partner-logo',
  // Benefits & Value Proposition
  PARTNER_BENEFITS_CARD: 'partner-benefits-card',
  BENEFITS_COPY: 'benefits-copy',
  TIERED_PRICING_DISPLAY: 'tiered-pricing-display',
  WHY_CHOOSE_CSU: 'why-choose-csu',
  VALUE_PROPOSITION_CARDS: 'value-proposition-cards',
  // Program Information
  DEGREE_PROGRAMS_LIST: 'degree-programs-list',
  SCHOLARSHIP_HIGHLIGHT: 'scholarship-highlight',
  // Lead Capture
  LEAD_CAPTURE_FORM: 'lead-capture-form',
  CTA_BUTTONS_ONLY: 'cta-buttons-only',
  CONTACT_INFO_BLOCK: 'contact-info-block',
  // Social Proof & Trust
  VIDEO_TESTIMONIAL: 'video-testimonial',
  FAQ_ACCORDION: 'faq-accordion',
  CSU_BY_THE_NUMBERS: 'csu-by-the-numbers',
  ACCREDITATIONS_SECTION: 'accreditations-section',
  // Tuition & Cost
  TUITION_COMPARISON_TABLE: 'tuition-comparison-table',
  TUITION_COMPARISON_BANNER: 'tuition-comparison-banner',
  COST_CALCULATOR_WIDGET: 'cost-calculator-widget',
  // Secondary CTA & Navigation
  LOOKING_FOR_MORE_INFO: 'looking-for-more-info',
  SECONDARY_CTA_BANNER: 'secondary-cta-banner',
  GET_STARTED_TODAY_BANNER: 'get-started-today-banner',
  // Footer & Compliance
  FOOTNOTES_DISCLAIMERS: 'footnotes-disclaimers',
  FOOTER: 'footer',
  // Legacy
  CONSENT_DISCLOSURE: 'consent-disclosure',
} as const

export type ModuleId = (typeof MODULE_IDS)[keyof typeof MODULE_IDS]

// Module Categories
export type ModuleCategory =
  | 'header-elements'
  | 'hero-section'
  | 'partner-identity'
  | 'benefits-value-proposition'
  | 'program-information'
  | 'lead-capture'
  | 'social-proof-trust'
  | 'tuition-cost'
  | 'secondary-cta-navigation'
  | 'footer-compliance'

export interface CategoryDefinition {
  id: ModuleCategory
  name: string
  description: string
  defaultExpanded: boolean
}

export const MODULE_CATEGORIES: CategoryDefinition[] = [
  { id: 'header-elements', name: 'Header Elements', description: 'Header and welcome elements', defaultExpanded: true },
  { id: 'hero-section', name: 'Hero Section', description: 'Hero banners and key stats', defaultExpanded: true },
  { id: 'partner-identity', name: 'Partner Identity', description: 'Partner branding elements', defaultExpanded: true },
  { id: 'benefits-value-proposition', name: 'Benefits & Value Proposition', description: 'Benefits and value messaging', defaultExpanded: true },
  { id: 'program-information', name: 'Program Information', description: 'Degree programs and scholarships', defaultExpanded: false },
  { id: 'lead-capture', name: 'Lead Capture', description: 'Forms and contact methods', defaultExpanded: true },
  { id: 'social-proof-trust', name: 'Social Proof & Trust', description: 'Testimonials and accreditations', defaultExpanded: false },
  { id: 'tuition-cost', name: 'Tuition & Cost', description: 'Pricing and cost tools', defaultExpanded: false },
  { id: 'secondary-cta-navigation', name: 'Secondary CTA & Navigation', description: 'Additional calls to action', defaultExpanded: false },
  { id: 'footer-compliance', name: 'Footer & Compliance', description: 'Footer and legal disclaimers', defaultExpanded: true },
]
