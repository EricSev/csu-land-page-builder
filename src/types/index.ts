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
  HEADER: 'header',
  PARTNER_HEADLINE: 'partner-headline',
  PARTNER_LOGO: 'partner-logo',
  PARTNER_BENEFITS_CARD: 'partner-benefits-card',
  BENEFITS_COPY: 'benefits-copy',
  LEAD_CAPTURE_FORM: 'lead-capture-form',
  FAQ_ACCORDION: 'faq-accordion',
  VALUE_PROPOSITION_CARDS: 'value-proposition-cards',
  CSU_BY_THE_NUMBERS: 'csu-by-the-numbers',
  ACCREDITATIONS_SECTION: 'accreditations-section',
  TUITION_COMPARISON_BANNER: 'tuition-comparison-banner',
  DEGREE_PROGRAMS_LIST: 'degree-programs-list',
  SCHOLARSHIP_HIGHLIGHT: 'scholarship-highlight',
  VIDEO_TESTIMONIAL: 'video-testimonial',
  HERO_BANNER: 'hero-banner',
  SECONDARY_CTA_BANNER: 'secondary-cta-banner',
  LOOKING_FOR_MORE_INFO: 'looking-for-more-info',
  FOOTNOTES_DISCLAIMERS: 'footnotes-disclaimers',
  FOOTER: 'footer',
  CONSENT_DISCLOSURE: 'consent-disclosure',
} as const

export type ModuleId = (typeof MODULE_IDS)[keyof typeof MODULE_IDS]
