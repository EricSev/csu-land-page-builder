import { useState, useEffect, useRef, useCallback } from 'react'
import {
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
} from '@dnd-kit/sortable'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { ExtractionWarningBanner, ExtractionWarning } from './components/ExtractionWarningBanner'
import { ModuleSidebar } from './components/ModuleSidebar'
import { Header } from './components/Header'

type AppMode = 'selection' | 'setup' | 'builder'
type StartMode = 'new' | 'edit' | 'load'
type TemplateType = 'learning-partner' | 'channel-partner'

// Module type definition
interface Module {
  id: string
  name: string
  enabled: boolean
  locked: boolean
  order: number
}

// Module content type for storing form data
interface ModuleContent {
  // Partner Headline
  headline?: string
  subheadline?: string
  headlineStyle?: 'centered' | 'left-aligned' | 'with-background'
  // Partner Logo
  logoUrl?: string
  logoAlt?: string
  logoError?: string
  logoFileName?: string
  logoDimensions?: string
  logoUrlError?: string
  // Partner Benefits Card
  benefitsTitle?: string
  benefits?: string[]
  discountPercentage?: '10%' | '15%' | '20%' | 'custom'
  customDiscount?: string
  includeLogo?: boolean
  // Benefits Copy
  benefitsCopy?: string
  eligibilityStatement?: string
  tuitionParagraph?: string
  flexibilityParagraph?: string
  // Lead Capture Form
  formTitle?: string
  formFields?: string[]
  submitButtonText?: string
  formFieldToggles?: {
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    phone?: boolean
    program?: boolean
    comments?: boolean
  }
  // FAQ Accordion
  faqs?: { question: string; answer: string }[]
  // Value Proposition Cards
  propositions?: { heading: string; body: string; imageUrl?: string }[]
  // Tuition Comparison Banner
  comparisonTitle?: string
  comparisonBody?: string
  comparisonBullets?: string[]
  comparisonShowCTA?: boolean
  // CSU by Numbers
  stats?: { number: string; label: string }[]
  // Accreditations
  accreditationHeading?: string
  accreditationSubheading?: string
  accreditations?: {
    sacscoc?: boolean
    qualityMatters?: boolean
    acbsp?: boolean
    blackboard?: boolean
    military?: boolean
  }
  // Degree Programs List
  programsHeading?: string
  programs?: { name: string; url: string }[]
  // Scholarship Highlight
  scholarshipName?: string
  scholarshipDescription?: string
  scholarshipEligibilityUrl?: string
  scholarshipCtaText?: string
  // Video Testimonial
  videoUrl?: string
  videoTitle?: string
  videoCaption?: string
  videoUrlError?: string
  // Hero Banner
  heroBackgroundUrl?: string
  heroOverlayOpacity?: number
  heroHeadline?: string
  heroSubheadline?: string
  // Secondary CTA Banner
  secondaryCtaHeading?: string
  secondaryCtaShowApply?: boolean
  secondaryCtaShowRequestInfo?: boolean
  // Looking for More Info Card
  moreInfoHeading?: string
  moreInfoBody?: string
  moreInfoLinkUrl?: string
  moreInfoImageUrl?: string
  // Footnotes/Disclaimers
  disclaimers?: string[]
  // Welcome Bar
  welcomeGreeting?: string
  welcomeCtaText?: string
  welcomeCtaUrl?: string
  // Stats Banner
  statsBannerStats?: { value: string; label: string }[]
  statsBannerStyle?: 'horizontal' | 'cards'
  // Tiered Pricing Display
  tieredPricingHeading?: string
  tieredPricingTiers?: { level: string; discount: string; originalPrice?: string }[]
  tieredPricingFootnote?: string
  // Why Choose CSU
  whyChooseHeading?: string
  whyChooseBenefits?: string[]
  // CTA Buttons Only
  ctaShowApply?: boolean
  ctaApplyText?: string
  ctaShowRequestInfo?: boolean
  ctaRequestInfoText?: string
  ctaAlignment?: 'left' | 'center' | 'right'
  ctaStyle?: 'side-by-side' | 'stacked'
  // Contact Info Block
  contactHeading?: string
  contactEmail?: string
  contactPhone?: string
  contactShowLiveChat?: boolean
  contactLiveChatUrl?: string
  contactAdditionalInfo?: string
  // Tuition Comparison Table
  tuitionTableHeading?: string
  tuitionTableSubheading?: string
  tuitionTableRows?: { institution: string; tuitionPerCredit: string; isCSU: boolean }[]
  // Cost Calculator Widget
  calculatorHeading?: string
  calculatorIframeUrl?: string
  calculatorHeight?: number
  calculatorFallbackText?: string
  // Get Started Today Banner
  getStartedHeading?: string
  getStartedSubheading?: string
  getStartedShowApply?: boolean
  getStartedShowRequestInfo?: boolean
  getStartedBgColor?: 'navy' | 'gold' | 'gradient'
}

// Default modules for Learning Partner template (all 29 modules, common ones enabled by default)
const LEARNING_PARTNER_MODULES: Module[] = [
  // Header Elements
  { id: 'header', name: 'Header', enabled: true, locked: true, order: 1 },
  { id: 'csu-global-menu', name: 'CSU Global Menu', enabled: false, locked: false, order: 2 },
  { id: 'welcome-bar', name: 'Welcome Bar', enabled: false, locked: false, order: 3 },
  // Hero Section
  { id: 'hero-banner', name: 'Hero Banner', enabled: false, locked: false, order: 4 },
  { id: 'stats-banner', name: 'Stats Banner', enabled: false, locked: false, order: 5 },
  // Partner Identity
  { id: 'partner-headline', name: 'Partner Headline', enabled: true, locked: false, order: 6 },
  { id: 'partner-logo', name: 'Partner Logo', enabled: true, locked: false, order: 7 },
  // Benefits & Value Proposition
  { id: 'partner-benefits-card', name: 'Partner Benefits Card', enabled: true, locked: false, order: 8 },
  { id: 'benefits-copy', name: 'Benefits Copy', enabled: true, locked: false, order: 9 },
  { id: 'tiered-pricing-display', name: 'Tiered Pricing Display', enabled: false, locked: false, order: 10 },
  { id: 'why-choose-csu', name: 'Why Choose CSU', enabled: false, locked: false, order: 11 },
  { id: 'value-proposition-cards', name: 'Value Proposition Cards', enabled: false, locked: false, order: 12 },
  // Program Information
  { id: 'degree-programs-list', name: 'Degree Programs List', enabled: false, locked: false, order: 13 },
  { id: 'scholarship-highlight', name: 'Scholarship Highlight', enabled: false, locked: false, order: 14 },
  // Lead Capture
  { id: 'lead-capture-form', name: 'Lead Capture Form', enabled: true, locked: false, order: 15 },
  { id: 'cta-buttons-only', name: 'CTA Buttons Only', enabled: false, locked: false, order: 16 },
  { id: 'contact-info-block', name: 'Contact Info Block', enabled: false, locked: false, order: 17 },
  // Social Proof & Trust
  { id: 'video-testimonial', name: 'Video Testimonial', enabled: false, locked: false, order: 18 },
  { id: 'faq-accordion', name: 'FAQ Accordion', enabled: true, locked: false, order: 19 },
  { id: 'csu-by-the-numbers', name: 'CSU by the Numbers', enabled: false, locked: false, order: 20 },
  { id: 'accreditations-section', name: 'Accreditations Section', enabled: true, locked: false, order: 21 },
  // Tuition & Cost
  { id: 'tuition-comparison-table', name: 'Tuition Comparison Table', enabled: false, locked: false, order: 22 },
  { id: 'tuition-comparison-banner', name: 'Tuition Comparison Banner', enabled: false, locked: false, order: 23 },
  { id: 'cost-calculator-widget', name: 'Cost Calculator Widget', enabled: false, locked: false, order: 24 },
  // Secondary CTA & Navigation
  { id: 'more-info-card', name: 'Looking for More Info', enabled: false, locked: false, order: 25 },
  { id: 'secondary-cta-banner', name: 'Secondary CTA Banner', enabled: false, locked: false, order: 26 },
  { id: 'get-started-today-banner', name: 'Get Started Today Banner', enabled: false, locked: false, order: 27 },
  // Footer & Compliance
  { id: 'footnotes-disclaimers', name: 'Footnotes/Disclaimers', enabled: false, locked: false, order: 28 },
  { id: 'footer', name: 'Footer', enabled: true, locked: true, order: 29 },
]

// Default modules for Channel Partner template (29 modules organized by category)
const CHANNEL_PARTNER_MODULES: Module[] = [
  // Header Elements
  { id: 'header', name: 'Header', enabled: true, locked: true, order: 1 },
  { id: 'csu-global-menu', name: 'CSU Global Menu', enabled: false, locked: false, order: 2 },
  { id: 'welcome-bar', name: 'Welcome Bar', enabled: false, locked: false, order: 3 },
  // Hero Section
  { id: 'hero-banner', name: 'Hero Banner', enabled: true, locked: false, order: 4 },
  { id: 'stats-banner', name: 'Stats Banner', enabled: false, locked: false, order: 5 },
  // Partner Identity
  { id: 'partner-headline', name: 'Partner Headline', enabled: true, locked: false, order: 6 },
  { id: 'partner-logo', name: 'Partner Logo', enabled: true, locked: false, order: 7 },
  // Benefits & Value Proposition
  { id: 'partner-benefits-card', name: 'Partner Benefits Card', enabled: true, locked: false, order: 8 },
  { id: 'benefits-copy', name: 'Benefits Copy', enabled: true, locked: false, order: 9 },
  { id: 'tiered-pricing-display', name: 'Tiered Pricing Display', enabled: false, locked: false, order: 10 },
  { id: 'why-choose-csu', name: 'Why Choose CSU', enabled: false, locked: false, order: 11 },
  { id: 'value-proposition-cards', name: 'Value Proposition Cards', enabled: true, locked: false, order: 12 },
  // Program Information
  { id: 'degree-programs-list', name: 'Degree Programs List', enabled: true, locked: false, order: 13 },
  { id: 'scholarship-highlight', name: 'Scholarship Highlight', enabled: true, locked: false, order: 14 },
  // Lead Capture
  { id: 'lead-capture-form', name: 'Lead Capture Form', enabled: true, locked: false, order: 15 },
  { id: 'cta-buttons-only', name: 'CTA Buttons Only', enabled: false, locked: false, order: 16 },
  { id: 'contact-info-block', name: 'Contact Info Block', enabled: false, locked: false, order: 17 },
  // Social Proof & Trust
  { id: 'video-testimonial', name: 'Video Testimonial', enabled: true, locked: false, order: 18 },
  { id: 'faq-accordion', name: 'FAQ Accordion', enabled: true, locked: false, order: 19 },
  { id: 'csu-by-the-numbers', name: 'CSU by the Numbers', enabled: true, locked: false, order: 20 },
  { id: 'accreditations-section', name: 'Accreditations Section', enabled: true, locked: false, order: 21 },
  // Tuition & Cost
  { id: 'tuition-comparison-table', name: 'Tuition Comparison Table', enabled: false, locked: false, order: 22 },
  { id: 'tuition-comparison-banner', name: 'Tuition Comparison Banner', enabled: true, locked: false, order: 23 },
  { id: 'cost-calculator-widget', name: 'Cost Calculator Widget', enabled: false, locked: false, order: 24 },
  // Secondary CTA & Navigation
  { id: 'more-info-card', name: 'Looking for More Info', enabled: true, locked: false, order: 25 },
  { id: 'secondary-cta-banner', name: 'Secondary CTA Banner', enabled: true, locked: false, order: 26 },
  { id: 'get-started-today-banner', name: 'Get Started Today Banner', enabled: false, locked: false, order: 27 },
  // Footer & Compliance
  { id: 'footnotes-disclaimers', name: 'Footnotes/Disclaimers', enabled: true, locked: false, order: 28 },
  { id: 'footer', name: 'Footer', enabled: true, locked: true, order: 29 },
]

// Supported URL patterns from spec
const SUPPORTED_URL_PATTERNS = [
  /^https?:\/\/(www\.)?columbiasouthern\.edu\/tuition-financing\/partnerships\/learning-partner-directory\/.+/i,
  /^https?:\/\/(www\.)?columbiasouthern\.edu\/landing-pages\/learning-partners\/.+/i,
  /^https?:\/\/(www\.)?columbiasouthern\.edu\/benefithub\/?$/i,
  /^https?:\/\/(www\.)?columbiasouthern\.edu\/delta\/?$/i,
  /^https?:\/\/(www\.)?columbiasouthern\.edu\/perkspot\/?$/i,
  /^https?:\/\/(www\.)?columbiasouthern\.edu\/iafc\/?$/i,
  /^https?:\/\/(www\.)?columbiasouthern\.edu\/ebg-solutions\/?$/i,
]

function isValidCsuUrl(url: string): boolean {
  return SUPPORTED_URL_PATTERNS.some(pattern => pattern.test(url))
}

function App() {
  const [mode, setMode] = useState<AppMode>('selection')
  const [startMode, setStartMode] = useState<StartMode | null>(null)
  const [partnerName, setPartnerName] = useState('')
  const [templateType, setTemplateType] = useState<TemplateType>('learning-partner')
  const [sourceUrl, setSourceUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [extractionWarnings, setExtractionWarnings] = useState<ExtractionWarning[]>([])
  const [showExtractionWarning, setShowExtractionWarning] = useState(false)
  const [draftError, setDraftError] = useState('')
  const [draftFileName, setDraftFileName] = useState('')
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [moduleContent, setModuleContent] = useState<Record<string, ModuleContent>>({})
  const [showSettings, setShowSettings] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [headerStyle, setHeaderStyle] = useState<'minimal' | 'full'>('minimal')
  const [footerStyle, setFooterStyle] = useState<'minimal' | 'full'>('minimal')
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [scrollSyncEnabled, setScrollSyncEnabled] = useState(false)
  const [contentPanelCollapsed, setContentPanelCollapsed] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [exportRequester, setExportRequester] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateNeeded: '',
    approvedBy: '' as '' | 'yes' | 'no' | 'pending',
    additionalNotes: '',
  })

  // Ref for the preview container to detect scroll position
  const previewContainerRef = useRef<HTMLDivElement>(null)

  // Scroll sync: update selected module based on scroll position in preview
  const handlePreviewScroll = useCallback(() => {
    if (!scrollSyncEnabled || !previewContainerRef.current) return

    const container = previewContainerRef.current
    const enabledModules = modules.filter(m => m.enabled).sort((a, b) => a.order - b.order)

    // Find which module is most visible in the viewport
    let bestMatch: string | null = null
    let bestVisibility = 0

    for (const module of enabledModules) {
      const element = container.querySelector(`[data-module-id="${module.id}"]`) as HTMLElement
      if (!element) continue

      const rect = element.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      // Calculate how much of the element is visible
      const visibleTop = Math.max(rect.top, containerRect.top)
      const visibleBottom = Math.min(rect.bottom, containerRect.bottom)
      const visibleHeight = Math.max(0, visibleBottom - visibleTop)

      // Favor elements that start near the top of the container
      const distanceFromTop = Math.abs(rect.top - containerRect.top)
      const visibility = visibleHeight > 0 ? visibleHeight - distanceFromTop * 0.1 : 0

      if (visibility > bestVisibility) {
        bestVisibility = visibility
        bestMatch = module.id
      }
    }

    if (bestMatch && bestMatch !== selectedModuleId) {
      setSelectedModuleId(bestMatch)
      // Also expand the content panel if it's collapsed
      if (contentPanelCollapsed) {
        setContentPanelCollapsed(false)
      }
    }
  }, [scrollSyncEnabled, modules, selectedModuleId, contentPanelCollapsed])

  // Check if export form is valid (required fields filled)
  const isExportFormValid = () => {
    return (
      exportRequester.firstName.trim() !== '' &&
      exportRequester.lastName.trim() !== '' &&
      exportRequester.email.trim() !== '' &&
      exportRequester.dateNeeded.trim() !== '' &&
      exportRequester.approvedBy !== ''
    )
  }

  // Calculate overall page completion percentage
  const calculateCompletionPercentage = (): number => {
    // Only count enabled, non-locked modules
    const enabledModules = modules.filter(m => m.enabled && !m.locked)
    if (enabledModules.length === 0) return 100

    const completeModules = enabledModules.filter(m => isModuleComplete(m.id))
    return Math.round((completeModules.length / enabledModules.length) * 100)
  }

  // Check if a module has all required fields complete (user has provided content)
  const isModuleComplete = (moduleId: string): boolean => {
    const content = moduleContent[moduleId]

    switch (moduleId) {
      case 'partner-headline':
        // Partner name is required (comes from partnerName state, not module content)
        return partnerName.trim() !== ''

      case 'partner-logo':
        // Logo should have URL or file, and no errors
        if (content?.logoUrlError || content?.logoError) return false
        return !!(content?.logoUrl || content?.logoFileName)

      case 'partner-benefits-card':
        // Consider complete if user has set any benefits or discount
        return !!(content?.benefits?.some(b => b?.trim()) || content?.discountPercentage || content?.customDiscount?.trim())

      case 'benefits-copy':
        // Consider complete if user has customized any of the copy fields
        return !!(content?.eligibilityStatement?.trim() || content?.tuitionParagraph?.trim() || content?.flexibilityParagraph?.trim())

      case 'lead-capture-form':
        // Consider complete if user has customized form heading or button text
        return !!(content?.formTitle?.trim() || content?.submitButtonText?.trim())

      case 'faq-accordion':
        // FAQ requires at least one Q&A with both question and answer
        const faqs = content?.faqs || []
        return faqs.length > 0 && faqs.some(faq => faq.question?.trim() && faq.answer?.trim())

      case 'value-proposition-cards':
        // Consider complete if at least one card has content
        const props = content?.propositions || []
        return props.length > 0 && props.some(p => p.heading?.trim() || p.body?.trim())

      case 'csu-by-the-numbers':
        // Consider complete if at least one stat has been entered
        const stats = content?.stats || []
        return stats.length > 0 && stats.some(s => s.number?.trim() && s.label?.trim())

      case 'accreditations-section':
        // Consider complete if at least one accreditation is selected
        const acc = content?.accreditations
        return !!(acc?.sacscoc || acc?.qualityMatters || acc?.acbsp || acc?.blackboard || acc?.military)

      case 'tuition-comparison-banner':
        // Consider complete if heading or bullets have content
        return !!(content?.comparisonTitle?.trim() || content?.comparisonBullets?.some(b => b?.trim()))

      case 'degree-programs-list':
        // Consider complete if at least one program has name and URL
        const programs = content?.programs || []
        return programs.length > 0 && programs.some(p => p.name?.trim() && p.url?.trim())

      case 'scholarship-highlight':
        // Scholarship requires name
        return !!(content?.scholarshipName?.trim())

      case 'video-testimonial':
        // Video needs valid YouTube URL
        if (content?.videoUrlError) return false
        return !!(content?.videoUrl?.trim())

      case 'hero-banner':
        // Hero banner needs background image or headline
        return !!(content?.heroBackgroundUrl?.trim() || content?.heroHeadline?.trim())

      case 'secondary-cta-banner':
        // Consider complete if heading is set or at least one button is enabled
        return !!(content?.secondaryCtaHeading?.trim() || content?.secondaryCtaShowApply || content?.secondaryCtaShowRequestInfo)

      case 'more-info-card':
        // Consider complete if heading or body is set
        return !!(content?.moreInfoHeading?.trim() || content?.moreInfoBody?.trim())

      case 'footnotes-disclaimers':
        // Consider complete if at least one disclaimer has content
        const disclaimers = content?.disclaimers || []
        return disclaimers.length > 0 && disclaimers.some(d => d?.trim())

      // New modules (9)
      case 'welcome-bar':
        // Consider complete if greeting or CTA text is set
        return !!(content?.welcomeGreeting?.trim() || content?.welcomeCtaText?.trim())

      case 'stats-banner':
        // Consider complete if at least one stat has value and label
        const bannerStats = content?.statsBannerStats || []
        return bannerStats.length > 0 && bannerStats.some(s => s?.value?.trim() && s?.label?.trim())

      case 'tiered-pricing-display':
        // Consider complete if at least one tier has discount
        const tiers = content?.tieredPricingTiers || []
        return tiers.length > 0 && tiers.some(t => t?.discount?.trim())

      case 'why-choose-csu':
        // Consider complete if at least one benefit is set
        const benefits = content?.whyChooseBenefits || []
        return benefits.length > 0 && benefits.some(b => b?.trim())

      case 'cta-buttons-only':
        // Consider complete if at least one button is enabled
        return !!(content?.ctaShowApply || content?.ctaShowRequestInfo)

      case 'contact-info-block':
        // Consider complete if email or phone is set
        return !!(content?.contactEmail?.trim() || content?.contactPhone?.trim())

      case 'tuition-comparison-table':
        // Consider complete if at least one row has institution and tuition
        const tableRows = content?.tuitionTableRows || []
        return tableRows.length > 0 && tableRows.some(r => r?.institution?.trim() && r?.tuitionPerCredit?.trim())

      case 'cost-calculator-widget':
        // Consider complete if iframe URL is set
        return !!(content?.calculatorIframeUrl?.trim())

      case 'get-started-today-banner':
        // Consider complete if heading is set or at least one button is enabled
        return !!(content?.getStartedHeading?.trim() || content?.getStartedShowApply || content?.getStartedShowRequestInfo)

      default:
        // Locked modules (header/footer) are always complete
        return true
    }
  }

  // Generate Wufoo form text
  const generateWufooText = () => {
    const enabledModules = modules.filter(m => m.enabled).sort((a, b) => a.order - b.order)

    // Build module summary
    const moduleSummary = enabledModules.map(m => `- ${m.name}`).join('\n')

    // Build WHO section
    const whoSection = `WHO: ${partnerName} Employees`

    // Build WHAT section
    const benefitsCard = moduleContent['partner-benefits-card']
    const whatItems = []
    if (benefitsCard?.discountPercentage) {
      const discount = benefitsCard.discountPercentage === 'custom'
        ? benefitsCard.customDiscount
        : benefitsCard.discountPercentage
      whatItems.push(`- Tuition discount: ${discount}`)
    }
    if (benefitsCard?.benefits) {
      benefitsCard.benefits.filter(b => b).forEach(b => whatItems.push(`- ${b}`))
    }
    const whatSection = whatItems.length > 0
      ? `WHAT: Partner Benefits\n${whatItems.join('\n')}`
      : 'WHAT: Partner Benefits (See configured modules)'

    // Build WHEN section
    const whenSection = `WHEN: Date Needed - ${exportRequester.dateNeeded}`

    // Build WHERE section (landing page URL)
    const whereSection = sourceUrl
      ? `WHERE: ${sourceUrl}`
      : `WHERE: New landing page for ${partnerName}`

    // Build WHY section
    const whySection = `WHY: Partner education benefits landing page to promote CSU programs to ${partnerName} employees`

    // Combine content
    const contentMessage = [
      whoSection,
      '',
      whatSection,
      '',
      whenSection,
      '',
      whereSection,
      '',
      whySection,
    ].join('\n')

    // Build full Wufoo text
    const wufooText = {
      Field2: 'Website',
      Field21: startMode === 'edit' ? 'Update existing page' : 'New landing page',
      Field22: sourceUrl || 'N/A - New landing page',
      Field23: `Landing page for ${partnerName}\n\nEnabled Modules:\n${moduleSummary}`,
      Field173: contentMessage,
      Field24: exportRequester.dateNeeded,
      Field25: exportRequester.firstName,
      Field26: exportRequester.lastName,
      Field100: exportRequester.email,
      Field169: exportRequester.approvedBy === 'yes' ? 'Yes' : exportRequester.approvedBy === 'no' ? 'No' : 'Not Applicable',
      Field98: exportRequester.additionalNotes || 'No additional notes',
      Field105: `csu-landing-${partnerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`,
      Field125: `csu-landing-${partnerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-assets.zip`,
    }

    return wufooText
  }

  // Format Wufoo text for display
  const formatWufooTextForDisplay = (wufooText: Record<string, string>) => {
    const lines = [
      '='.repeat(50),
      'WUFOO FORM SUBMISSION',
      '='.repeat(50),
      '',
      `[Field2 - Request Type]: ${wufooText.Field2}`,
      '',
      `[Field21 - Web Request Type]: ${wufooText.Field21}`,
      '',
      `[Field22 - URL for Website Update]: ${wufooText.Field22}`,
      '',
      `[Field23 - Update/New Page Information]:`,
      wufooText.Field23,
      '',
      `[Field173 - Content Message]:`,
      wufooText.Field173,
      '',
      `[Field24 - Date Needed]: ${wufooText.Field24}`,
      '',
      `[Field25 - Person Requesting (First)]: ${wufooText.Field25}`,
      '',
      `[Field26 - Person Requesting (Last)]: ${wufooText.Field26}`,
      '',
      `[Field100 - Email Address]: ${wufooText.Field100}`,
      '',
      `[Field169 - Approved by Administration]: ${wufooText.Field169}`,
      '',
      `[Field98 - Comments]:`,
      wufooText.Field98,
      '',
      `[Field105 - Document Attachment]: ${wufooText.Field105}`,
      '',
      `[Field125 - Additional Documents]: ${wufooText.Field125}`,
      '',
      '='.repeat(50),
    ]
    return lines.join('\n')
  }

  const [wufooOutput, setWufooOutput] = useState<string>('')
  const [wufooFields, setWufooFields] = useState<Record<string, string>>({})
  const [showExportResults, setShowExportResults] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Copy text to clipboard with feedback
  const copyToClipboard = async (text: string, fieldId?: string) => {
    await navigator.clipboard.writeText(text)
    if (fieldId) {
      setCopiedField(fieldId)
      setTimeout(() => setCopiedField(null), 2000)
    }
  }

  // Generate self-contained HTML file
  const generateHtmlFile = () => {
    const enabledModules = modules.filter(m => m.enabled).sort((a, b) => a.order - b.order)
    const partnerHeadline = moduleContent['partner-headline']
    const partnerLogo = moduleContent['partner-logo']
    const benefitsCard = moduleContent['partner-benefits-card']
    const benefitsCopy = moduleContent['benefits-copy']
    const leadForm = moduleContent['lead-capture-form']

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${partnerName} - Columbia Southern University</title>
  <!-- Adobe Typekit - cronos-pro font -->
  <link rel="stylesheet" href="https://use.typekit.net/yxt5svl.css">
  <!-- Google Fonts - Nunito Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&display=swap">
  <!-- jQuery (required for CSU navigation) -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
  <!-- CSU Global Scripts (for navigation menu functionality) -->
  <script src="https://www.columbiasouthern.edu/scripts/globals.js"></script>
  <style>
    /* ===========================================
       CSU Design System - CSS Custom Properties
       =========================================== */
    :root {
      /* Brand Colors */
      --color-navy: #002855;
      --color-gold: #C6AA76;
      --color-gold-light: #DFD1A7;
      --color-teal: #207788;
      --color-teal-light: #77C5D5;

      /* Text Colors */
      --color-text-primary: #1D252D;
      --color-text-secondary: #5B6770;
      --color-text-muted: #A2AAAD;
      --color-text-inverse: #fff;

      /* Background Colors */
      --color-bg-dark: #002855;
      --color-bg-light: #fff;
      --color-bg-gray: #f7f7f7;

      /* Semantic */
      --color-error: #bb2403;
      --color-success: #C5E86C;
      --color-link: #207788;
      --color-link-hover: #bb2403;

      /* Typography */
      --font-display: "Nunito Sans", sans-serif;
      --font-body: "cronos-pro", sans-serif;

      /* Spacing */
      --space-xs: 0.25em;
      --space-sm: 0.5em;
      --space-md: 1em;
      --space-lg: 1.5em;
      --space-xl: 2em;

      /* Layout */
      --site-max-width: 1200px;
      --button-radius: 5px;

      /* Transitions */
      --transition-fast: 0.15s ease-in-out;
      --transition-normal: 0.25s ease-in-out;
    }

    /* ===========================================
       RESET & BASE
       =========================================== */
    *, *::before, *::after { box-sizing: border-box; }
    html { font-family: sans-serif; line-height: 1.35; -webkit-text-size-adjust: 100%; }
    body { margin: 0; padding: 0; font-family: var(--font-body); background-color: var(--color-bg-light); color: var(--color-text-primary); overflow-x: hidden; }
    img { max-width: 100%; vertical-align: middle; border-style: none; }
    ul { margin: 0; padding: 0; list-style: none; }
    a { font-weight: 700; text-decoration: none; }

    /* ===========================================
       TYPOGRAPHY
       =========================================== */
    h1, h2, h3, h4, h5, h6 { margin: 0 0 0.15rem; line-height: 1.25; }
    h1, h2, h4 { font-family: var(--font-display); }
    h3, h5, h6 { font-family: var(--font-body); }
    h2, h3, h4, h5, h6 { font-weight: 700; }
    h3, h5 { font-style: italic; }
    h1 { font-size: 2rem; font-weight: 900; }
    h2 { font-size: 1.75rem; }
    h3 { font-size: 1.65rem; }
    h4 { font-size: 1.4rem; }
    h5 { font-size: 1.3rem; }
    h6 { font-size: 1.125rem; text-transform: uppercase; letter-spacing: 0.025em; }

    /* ===========================================
       LAYOUT CONTAINERS
       =========================================== */
    .site-wrap { margin: 0 auto; max-width: var(--site-max-width); position: relative; }
    @media (max-width: 767px) { .site-wrap { padding-left: 15px; padding-right: 15px; } }
    @media (min-width: 768px) and (max-width: 1199px) { .site-wrap { padding-left: 2.5vw; padding-right: 2.5vw; } }

    /* ===========================================
       THEME CONTEXTS
       =========================================== */
    .light { background-color: var(--color-bg-light); color: var(--color-text-secondary); }
    .light h1, .light h2, .light h4, .light h5 { color: var(--color-navy); }
    .light h3, .light h6 { color: var(--color-text-secondary); }
    .light a { color: var(--color-teal); }
    .light a:hover, .light a:focus { color: var(--color-error); }

    .dark { background-color: var(--color-navy); color: var(--color-text-inverse); }
    .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 { color: var(--color-text-inverse); }
    .dark a { color: var(--color-text-inverse); }
    .dark a:hover, .dark a:focus { color: var(--color-gold-light); }

    .background-gray { background-color: var(--color-bg-gray); }

    /* ===========================================
       HEADER
       =========================================== */
    header { position: relative; z-index: 20; }
    .utility-navigation { padding: 10px; }
    .utility-navigation .site-wrap { display: flex; justify-content: space-between; align-items: center; }
    .utility-navigation .site-logo { margin: 15px 0; }
    .site-logo, .mobile-site-logo { max-width: 200px; }
    .site-logo img, .mobile-site-logo img { display: block; max-width: 100%; height: auto; }
    .navigation-wrapper { padding-top: 1rem; padding-bottom: 1rem; }
    @media (min-width: 1024px) { .navigation-wrapper > .flex { position: relative; align-items: center; justify-content: center; margin: 20px auto; } }

    /* ===========================================
       NAVIGATION
       =========================================== */
    .site-navigation { display: flex; flex-wrap: wrap; align-items: center; margin: 0; padding: 0; list-style: none; }
    .site-navigation > li { position: relative; }
    .site-navigation > li > a, .site-navigation > li > button { position: relative; display: block; font-family: var(--font-display); font-weight: 700; font-size: 1rem; color: var(--color-navy); padding: 0.75em 1em; margin: 0; background: transparent; border: none; cursor: pointer; transition: all 0.3s ease; }
    .site-navigation > li > a:hover, .site-navigation > li > a:focus, .site-navigation > li > button:hover, .site-navigation > li > button:focus { color: var(--color-error); }
    .site-navigation > li .dropdown { border-top: var(--color-gold) 3px solid; }

    /* ===========================================
       BUTTONS
       =========================================== */
    button, .button { display: inline-block; margin: 0.5em 0; padding: 1em 1.25em; background-color: transparent; border: transparent 2px solid; border-radius: 0; font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; text-align: center; line-height: 1.15; cursor: pointer; transition: all var(--transition-fast); }

    /* Light Context Buttons */
    .light button, .light .button { color: var(--color-text-primary); }
    .light button.solid, .light .button.solid { background-color: var(--color-gold-light); color: var(--color-text-primary); }
    .light button.ghost, .light .button.ghost { border-color: var(--color-gold-light); color: var(--color-text-primary); }
    .light button.solid:hover, .light button.solid:focus, .light button.ghost:hover, .light button.ghost:focus,
    .light .button.solid:hover, .light .button.solid:focus, .light .button.ghost:hover, .light .button.ghost:focus { background-color: var(--color-teal); border-color: transparent; color: var(--color-text-inverse); }

    /* Dark Context Buttons */
    .dark button, .dark .button { color: var(--color-gold-light); }
    .dark button.solid, .dark .button.solid { background-color: var(--color-gold); color: var(--color-navy); }
    .dark button.ghost, .dark .button.ghost { border-color: var(--color-gold-light); color: var(--color-gold-light); }
    .dark button.solid:hover, .dark button.solid:focus, .dark button.ghost:hover, .dark button.ghost:focus,
    .dark .button.solid:hover, .dark .button.solid:focus, .dark .button.ghost:hover, .dark .button.ghost:focus { background-color: var(--color-teal); border-color: var(--color-text-inverse); color: var(--color-text-inverse); }

    /* ===========================================
       BUTTON GROUPS
       =========================================== */
    .button-group { display: flex; flex-wrap: wrap; align-items: center; list-style: none; margin: 0; padding: 0; }
    .button-group.flex .button.ghost, .button-group.flex .button.solid { margin-left: 0.75em; margin-right: 0.75em; margin-bottom: 0; border-radius: var(--button-radius); }
    .button-group.center { justify-content: center; }
    .button-group > li { margin: 0; list-style: none; }

    /* ===========================================
       FLEX UTILITIES
       =========================================== */
    .flex { display: flex; flex-wrap: wrap; }
    .center { text-align: center; justify-content: center; }
    .items-center { align-items: center; }

    /* ===========================================
       GRID SYSTEM
       =========================================== */
    .grid, .page-grid { display: grid; grid-template-rows: auto; }
    @media (max-width: 767px) { .page-grid { grid-template-columns: minmax(50px, 1fr); grid-gap: 30px; } }
    @media (min-width: 768px) and (max-width: 1199px) { .page-grid { grid-template-columns: repeat(6, minmax(50px, 1fr)); grid-gap: 30px; } }
    @media (min-width: 1200px) { .page-grid { grid-template-columns: repeat(12, minmax(50px, 1fr)); grid-gap: 50px; } }
    @media (min-width: 1200px) {
      .page-grid.columns-2-1 > *:nth-child(2n+1) { grid-column: auto/span 8; }
      .page-grid.columns-2-1 > *:nth-child(2n+2) { grid-column: auto/span 4; }
      .page-grid.columns-1-2 > *:nth-child(2n+1) { grid-column: auto/span 4; }
      .page-grid.columns-1-2 > *:nth-child(2n+2) { grid-column: auto/span 8; }
    }

    /* ===========================================
       PAGE SECTIONS
       =========================================== */
    .title-banner { background: rgba(0, 40, 85, 0.975); }
    .title-banner h1 { padding: 2.5em 0 0.5em; }
    .page-content { margin: 35px 0 80px; }
    @media (max-width: 767px) { .page-content { margin: 20px 0 50px; } }
    .padded { padding: 50px 0 35px; }
    @media (min-width: 1024px) { .padded { padding: 7.5vh 0 5vh; } }

    /* ===========================================
       CTA BANNER
       =========================================== */
    .cta-banner { padding: 35px 0; text-align: center; }
    .cta-banner.dark h1 { color: var(--color-gold-light); }
    .cta-banner h1 { font-size: 1.75rem; }
    .cta-banner .button-group { max-width: 600px; margin: 0 auto; justify-content: center; }
    .cta-banner .button-group .button { font-size: 1rem; padding: 1em; }

    /* ===========================================
       CONTENT
       =========================================== */
    .content { font-size: 1.125rem; }
    @media (max-width: 1023px) { .content { font-size: 1.25rem; } }
    .content p { max-width: 100ch; margin-bottom: 0.75em; line-height: 1.5; }

    /* ===========================================
       FOOTER
       =========================================== */
    footer .light h1, footer .light h2 { border-bottom: var(--color-gold-light) 1px solid; margin-bottom: 0.5em; }
    footer .button-group .button { padding: 0.75em; }
    footer .button-group .button:hover, footer .button-group .button:focus { background-color: var(--color-teal); border-color: transparent; color: var(--color-text-inverse); }
    footer .background-gray { padding: 15px 0; }

    /* ===========================================
       LISTS
       =========================================== */
    .link-list { margin: 0 0 1em; padding: 0; list-style: none; }
    .link-list li a { display: inline-block; position: relative; padding: 0.25em 0; }
    .dark .link-list li a { color: var(--color-text-inverse); font-weight: 600; }
    .dark .link-list li a:hover, .dark .link-list li a:focus { color: var(--color-gold-light); }

    /* ===========================================
       SOCIAL ICONS
       =========================================== */
    .logo-grid.flex { align-items: center; }
    .logo-grid a.social-link { margin: 0 1em 0 0; width: 3rem; height: 3rem; transition: transform var(--transition-normal); }
    .logo-grid a.social-link svg { fill: var(--color-teal); }
    .logo-grid a.social-link.circle { padding: 0.5em; background-color: var(--color-teal); border-radius: 50%; }
    .logo-grid a.social-link.circle svg { fill: var(--color-text-inverse); }
    .logo-grid a.social-link:hover, .logo-grid a.social-link:focus { transform: scale(1.1); }

    /* ===========================================
       UTILITIES
       =========================================== */
    .offscreen { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px); white-space: nowrap; }

    /* ===========================================
       BENEFITS CARD (Partner Pages)
       =========================================== */
    .benefits-card { background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 32px; margin: -40px auto 40px; max-width: 600px; position: relative; z-index: 10; }
    .benefits-card h3 { color: var(--color-navy); margin-bottom: 20px; font-size: 1.5rem; }
    .benefits-list { list-style: none; margin: 0; padding: 0; }
    .benefits-list li { padding: 8px 0; display: flex; align-items: center; gap: 12px; }
    .benefits-list li::before { content: "✓"; color: var(--color-gold); font-weight: bold; }

    /* ===========================================
       LEAD FORM
       =========================================== */
    .lead-form { background: #DDE5ED; padding: 40px 0; }
    .lead-form h3 { color: var(--color-navy); text-align: center; margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 600px; margin: 0 auto; padding: 0 15px; }
    .form-field { background: white; padding: 12px; border: 1px solid #D0D3D4; border-radius: 4px; }
    .form-field.full { grid-column: 1 / -1; }
    .submit-btn { background: var(--color-navy); color: white; padding: 14px 32px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 16px; font-family: var(--font-display); font-weight: 700; }
    .submit-btn:hover { background-color: var(--color-teal); }

    @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }

    /* ===========================================
       THREE COLUMN GRID (Footer)
       =========================================== */
    .grid.columns-3 { grid-template-columns: repeat(3, 1fr); }
    @media (max-width: 767px) { .grid.columns-3 { grid-template-columns: 1fr; } }
    .grid-gap-30 { grid-gap: 30px; }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <div class="dark mobile-cta">
      <ul class="button-group flex stretch">
        <li><a class="button ghost" href="https://mycsu.columbiasouthern.edu/prospect/application">Apply Now</a></li>
        <li><a class="button solid" href="https://www.columbiasouthern.edu/info-form">Request Info</a></li>
      </ul>
    </div>
    <div class="dark utility-navigation">
      <div class="site-wrap flex">
        <div class="site-logo"><a href="https://www.columbiasouthern.edu/"><img src="https://www.columbiasouthern.edu/media/vhgldcbo/csu-logo-horizontal-white.png" alt="Columbia Southern University logo, homepage"></a></div>
        <ul class="button-group flex">
          <li><a class="button" href="tel:+18009778449">800-977-8449</a></li>
          <li><a class="button" href="https://www.columbiasouthern.edu/login">Login Options</a></li>
          <li><a class="button ghost" href="https://mycsu.columbiasouthern.edu/prospect/application">Apply Now</a></li>
          <li><a class="button solid" href="https://www.columbiasouthern.edu/info-form">Request Info</a></li>
        </ul>
      </div>
    </div>
    \${enabledModules.some(m => m.id === 'csu-global-menu') ? \`
    <div class="light">
      <nav class="navigation-wrapper site-wrap flex">
        <div class="mobile-site-logo">
          <a href="https://www.columbiasouthern.edu/"><img src="https://www.columbiasouthern.edu/media/campm3vj/csu-logo-horizontal.png" alt="Columbia Southern University logo, homepage"></a>
        </div>
        <button id="mobileMenuToggle" class="mobile-menu" aria-expanded="false" aria-haspopup="true" type="button">
          <span class="offscreen">Menu</span>
          <i class="icon" role="presentation">
            <svg class="hamburger" xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 0 30 22">
              <title>Menu icon</title>
              <g fill="#fff">
                <path class="bar top" d="M27.93,8.93H2.07A2,2,0,0,0,0,11a2,2,0,0,0,2.07,2.07H27.93A2,2,0,0,0,30,11,2,2,0,0,0,27.93,8.93Z"></path>
                <path class="bar middle" d="M27.93,8.93H2.07A2,2,0,0,0,0,11a2,2,0,0,0,2.07,2.07H27.93A2,2,0,0,0,30,11,2,2,0,0,0,27.93,8.93Z"></path>
                <path class="bar bottom" d="M27.93,8.93H2.07A2,2,0,0,0,0,11a2,2,0,0,0,2.07,2.07H27.93A2,2,0,0,0,30,11,2,2,0,0,0,27.93,8.93Z"></path>
              </g>
            </svg>
          </i>
        </button>
        <div class="flex">
          <ul class="site-navigation">
            <li>
              <button class="toggle" aria-expanded="false" type="button">Academics</button>
              <div class="dropdown grid grid-gap-20 columns-1-2" data-breakpoints="650">
                <div class="column dark">
                  <div class="image fit-image">
                    <img alt="Young graduate smiles with fellow graduates in the background" src="https://www.columbiasouthern.edu/media/ljqikvoz/thumbnail-academics.jpg">
                  </div>
                  <div class="text-overlay gradient-bottom">
                    <div class="text"><strong class="h5">Academics</strong></div>
                  </div>
                </div>
                <ul class="self-center">
                  <li><a href="https://www.columbiasouthern.edu/online-degree/view-all-programs/" class="arrow-link reveal">View All Programs</a></li>
                  <li><a href="https://www.columbiasouthern.edu/online-degree/continuing-education/" class="arrow-link reveal">Continuing Education</a></li>
                  <li><a href="https://www.columbiasouthern.edu/online-degree/full-course-listing/" class="arrow-link reveal">Full Course Listing</a></li>
                  <li><a href="https://www.columbiasouthern.edu/online-degree/doctoral-overview/" class="arrow-link reveal">Doctoral Overview</a></li>
                  <li><a href="https://www.columbiasouthern.edu/online-degree/colleges-and-faculty/" class="arrow-link reveal">Colleges and Faculty</a></li>
                  <li><a href="https://www.columbiasouthern.edu/online-degree/transfer-credit-to-csu/" class="arrow-link reveal">Transfer Credit to CSU</a></li>
                  <li><a href="https://www.columbiasouthern.edu/online-degree/general-education/" class="arrow-link reveal">General Education</a></li>
                  <li><a href="https://www.columbiasouthern.edu/online-degree/certificates/" class="arrow-link reveal">Certificate Programs</a></li>
                  <li><a href="https://www.columbiasouthern.edu/online-degree/academic-calendar/" class="arrow-link reveal">Academic Calendar</a></li>
                  <li><a href="https://www.columbiasouthern.edu/online-degree/commencement/" class="arrow-link reveal">Commencement</a></li>
                  <li><a href="https://www.columbiasouthern.edu/online-degree/summer-college-credit-program/" class="arrow-link reveal">Summer College Credit Program</a></li>
                  <li><a href="https://www.columbiasouthern.edu/online-degree/accelerated-bachelor-to-masters/" class="arrow-link reveal">Accelerated Bachelor to Master's</a></li>
                </ul>
              </div>
            </li>
            <li>
              <button class="toggle" aria-expanded="false" type="button">Admissions</button>
              <div class="dropdown grid grid-gap-20 columns-1-2" data-breakpoints="650">
                <div class="column dark">
                  <div class="image fit-image">
                    <img alt="Student and admissions counselor look at a laptop together" src="https://www.columbiasouthern.edu/media/upff0sp2/thumbnail-admissions.jpg">
                  </div>
                  <div class="text-overlay gradient-bottom">
                    <div class="text"><strong class="h5">Admissions</strong></div>
                  </div>
                </div>
                <ul class="self-center">
                  <li><a href="https://www.columbiasouthern.edu/admissions/getting-started/" class="arrow-link reveal">Getting Started</a></li>
                  <li><a href="https://www.columbiasouthern.edu/admissions/online-learning-experience/" class="arrow-link reveal">Online Learning Experience</a></li>
                  <li><a href="https://www.columbiasouthern.edu/admissions/graduation-calculator/" class="arrow-link reveal">Graduation Calculator</a></li>
                  <li><a href="https://www.columbiasouthern.edu/admissions/requirements/" class="arrow-link reveal">Requirements</a></li>
                  <li><a href="https://www.columbiasouthern.edu/admissions/transfer-credit/" class="arrow-link reveal">Transfer Credit</a></li>
                  <li><a href="https://www.columbiasouthern.edu/admissions/international-transfer-credit/" class="arrow-link reveal">International Transfer Credit</a></li>
                  <li><a href="https://www.columbiasouthern.edu/admissions/admissions-faqs/" class="arrow-link reveal">Admissions FAQs</a></li>
                </ul>
              </div>
            </li>
            <li>
              <button class="toggle" aria-expanded="false" type="button">Student Support</button>
              <div class="dropdown grid grid-gap-20 columns-1-2" data-breakpoints="650">
                <div class="column dark">
                  <div class="image fit-image">
                    <img alt="Support representative smiling" src="https://www.columbiasouthern.edu/media/0xqf0leo/thumbnail-resources.jpg">
                  </div>
                  <div class="text-overlay gradient-bottom">
                    <div class="text"><strong class="h5">Student Support</strong></div>
                  </div>
                </div>
                <ul class="self-center">
                  <li><a href="https://www.columbiasouthern.edu/student-support/support-overview/" class="arrow-link reveal">Support Overview</a></li>
                  <li><a href="https://www.columbiasouthern.edu/student-support/registrar/" class="arrow-link reveal">Registrar</a></li>
                  <li><a href="https://www.columbiasouthern.edu/student-support/student-resolution/" class="arrow-link reveal">Student Resolution</a></li>
                  <li><a href="https://www.columbiasouthern.edu/student-support/career-services/" class="arrow-link reveal">Career Services</a></li>
                  <li><a href="https://www.columbiasouthern.edu/student-support/student-community/" class="arrow-link reveal">Student Community</a></li>
                  <li><a href="https://www.columbiasouthern.edu/student-support/disability-services/" class="arrow-link reveal">Disability Services</a></li>
                  <li><a href="https://www.columbiasouthern.edu/student-support/online-library/" class="arrow-link reveal">Online Library</a></li>
                  <li><a href="https://www.columbiasouthern.edu/student-support/student-faqs/" class="arrow-link reveal">Student FAQs</a></li>
                  <li><a href="https://www.columbiasouthern.edu/student-support/importance-of-advising/" class="arrow-link reveal">Importance of Advising</a></li>
                </ul>
              </div>
            </li>
            <li>
              <button class="toggle" aria-expanded="false" type="button">Tuition &amp; Financing</button>
              <div class="dropdown grid grid-gap-20 columns-1-2" data-breakpoints="650">
                <div class="column dark">
                  <div class="image fit-image">
                    <img alt="Jar of coins labelled Education with graduation cap resting against it" src="https://www.columbiasouthern.edu/media/zudbm5ev/thumbnail-tuition.jpg">
                  </div>
                  <div class="text-overlay gradient-bottom">
                    <div class="text"><strong class="h5">Tuition &amp; Financing</strong></div>
                  </div>
                </div>
                <ul class="self-center">
                  <li><a href="https://www.columbiasouthern.edu/tuition-financing/tuition-overview/" class="arrow-link reveal">Tuition Overview</a></li>
                  <li><a href="https://www.columbiasouthern.edu/tuition-financing/cost-comparison-calculator/" class="arrow-link reveal">Cost Comparison Calculator</a></li>
                  <li><a href="https://www.columbiasouthern.edu/tuition-financing/federal-student-aid/" class="arrow-link reveal">Federal Student Aid</a></li>
                  <li><a href="https://www.columbiasouthern.edu/tuition-financing/payment-options/" class="arrow-link reveal">Payment Options</a></li>
                  <li><a href="https://www.columbiasouthern.edu/tuition-financing/scholarships/" class="arrow-link reveal">Scholarships</a></li>
                  <li><a href="https://www.columbiasouthern.edu/tuition-financing/tuition-fees-payment-policy/" class="arrow-link reveal">Tuition &amp; Fees Payment Policy</a></li>
                  <li><a href="https://www.columbiasouthern.edu/tuition-financing/student-fees/" class="arrow-link reveal">Student Fees</a></li>
                  <li><a href="https://www.columbiasouthern.edu/tuition-financing/tuition-refund-policy/" class="arrow-link reveal">Tuition Refund Policy</a></li>
                  <li><a href="https://www.columbiasouthern.edu/tuition-financing/partnerships/" class="arrow-link reveal">Partnerships</a></li>
                  <li><a href="https://www.columbiasouthern.edu/tuition-financing/tuition-financing-faqs/" class="arrow-link reveal">Tuition &amp; Financing FAQs</a></li>
                  <li><a href="https://www.columbiasouthern.edu/tuition-financing/financial-literacy/" class="arrow-link reveal">Financial Literacy</a></li>
                </ul>
              </div>
            </li>
            <li>
              <button class="toggle" aria-expanded="false" type="button">About</button>
              <div class="dropdown grid grid-gap-20 columns-1-2" data-breakpoints="650">
                <div class="column dark">
                  <div class="image fit-image">
                    <img alt="Columbia Southern University facade against blue sky" src="https://www.columbiasouthern.edu/media/qimp2eni/thumbnail-about.jpg">
                  </div>
                  <div class="text-overlay gradient-bottom">
                    <div class="text"><strong class="h5">About</strong></div>
                  </div>
                </div>
                <ul class="self-center">
                  <li><a href="https://www.columbiasouthern.edu/about-csu/about-csu/" class="arrow-link reveal">About CSU</a></li>
                  <li><a href="https://www.columbiasouthern.edu/about-csu/accreditation-licensure/" class="arrow-link reveal">State Authorization and Accreditation</a></li>
                  <li><a href="https://www.columbiasouthern.edu/about-csu/leadership/" class="arrow-link reveal">Leadership</a></li>
                  <li><a href="https://www.columbiasouthern.edu/about-csu/board-of-trustees/" class="arrow-link reveal">Board of Trustees</a></li>
                  <li><a href="https://www.columbiasouthern.edu/about-csu/csu-cares/" class="arrow-link reveal">CSU Cares</a></li>
                  <li><a href="https://www.columbiasouthern.edu/about-csu/media/" class="arrow-link reveal">Press Room</a></li>
                  <li><a href="https://www.columbiasouthern.edu/about-csu/contact-us/" class="arrow-link reveal">Contact Us</a></li>
                  <li><a href="https://www.columbiasouthern.edu/about-csu/history/" class="arrow-link reveal">History</a></li>
                  <li><a href="https://www.columbiasouthern.edu/about-csu/the-link-blog/" class="arrow-link reveal">The Link Blog</a></li>
                </ul>
              </div>
            </li>
            <li>
              <button class="toggle" aria-expanded="false" type="button">Military</button>
              <div class="dropdown grid grid-gap-20 columns-1-2" data-breakpoints="650">
                <div class="column dark">
                  <div class="image fit-image">
                    <img alt="Military student greets advisor with handshake" src="https://www.columbiasouthern.edu/media/kokpc40q/thumbnail-military.jpg">
                  </div>
                  <div class="text-overlay gradient-bottom">
                    <div class="text"><strong class="h5">Military</strong></div>
                  </div>
                </div>
                <ul class="self-center">
                  <li><a href="https://www.columbiasouthern.edu/military/college-of-space-intelligence-and-military-operations/" class="arrow-link reveal">College of Space, Intelligence, and Military Operations</a></li>
                  <li><a href="https://www.columbiasouthern.edu/military/continuing-education/" class="arrow-link reveal">Continuing Education</a></li>
                  <li><a href="https://www.columbiasouthern.edu/military/military-tuition-information/" class="arrow-link reveal">Military Tuition Information</a></li>
                  <li><a href="https://www.columbiasouthern.edu/military/military-transfer-pathways/" class="arrow-link reveal">Military Transfer Pathways</a></li>
                  <li><a href="https://www.columbiasouthern.edu/military/veterans-center/" class="arrow-link reveal">Veterans Center</a></li>
                  <li><a href="https://www.columbiasouthern.edu/military/branch-resources/" class="arrow-link reveal">Branch Resources</a></li>
                  <li><a href="https://www.columbiasouthern.edu/military/military-spouses/" class="arrow-link reveal">Military Spouses</a></li>
                  <li><a href="https://www.columbiasouthern.edu/military/military-faqs/" class="arrow-link reveal">Military FAQs</a></li>
                </ul>
              </div>
            </li>
            <li>
              <button class="toggle" aria-expanded="false" type="button">Careers</button>
              <div class="dropdown grid grid-gap-20 columns-1-2" data-breakpoints="650">
                <div class="column dark">
                  <div class="image fit-image">
                    <img alt="smiling young women" src="https://www.columbiasouthern.edu/media/ayzf5hf1/careers-staff.jpg">
                  </div>
                  <div class="text-overlay gradient-bottom">
                    <div class="text"><strong class="h5">Careers</strong></div>
                  </div>
                </div>
                <ul class="self-center">
                  <li><a href="https://www.columbiasouthern.edu/careers/careers-overview/" class="arrow-link reveal">Careers Overview</a></li>
                  <li><a href="https://www.columbiasouthern.edu/careers/staff-careers/" class="arrow-link reveal">Staff Careers</a></li>
                  <li><a href="https://www.columbiasouthern.edu/careers/faculty-careers/" class="arrow-link reveal">Faculty Careers</a></li>
                </ul>
              </div>
            </li>
          </ul>
          <div class="mobile-utility-navigation">
            <ul>
              <li><a href="tel:+18009778449" class="arrow-link reveal">800-977-8449</a></li>
              <li><a href="https://www.columbiasouthern.edu/login" class="arrow-link reveal">Login Options</a></li>
            </ul>
          </div>
          <div class="site-search">
            <button id="desktopSearchToggle" class="toggle" data-selector="#siteNav" aria-expanded="false" type="button">
              <span class="offscreen">Open Search</span>
              <i class="icon" role="presentation">
                <svg class="search-open" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 20 20">
                  <title>Search icon</title>
                  <g><path class="cls-1" d="M19.51,17.15,15.17,12.8l-.08-.06a8.25,8.25,0,1,0-2.35,2.35l.06.08,4.35,4.34a1.67,1.67,0,0,0,2.36-2.36ZM8.22,13.59a5.37,5.37,0,1,1,5.37-5.37A5.37,5.37,0,0,1,8.22,13.59Z" transform="translate(0 0)"></path></g>
                </svg>
              </i>
              <i class="icon" role="presentation">
                <svg class="search-close" xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18">
                  <title>Close search</title>
                  <g><path class="cls-1" d="M15.17,12.8,12.36,10l6.15-6.15a1.67,1.67,0,0,0-2.36-2.36L12.8,4.83,10,7.64,3.85,1.49A1.67,1.67,0,0,0,1.49,3.85L4.83,7.2,7.64,10,1.49,16.15a1.67,1.67,0,0,0,2.36,2.36L7.2,15.17,10,12.36l6.15,6.15a1.67,1.67,0,0,0,2.36-2.36Z" transform="translate(-1 -1)"></path></g>
                </svg>
              </i>
            </button>
            <div class="search-box">
              <div class="nav-overlay"></div>
              <div class="search-query">
                <form role="search" action="https://www.columbiasouthern.edu/search/" method="get">
                  <label for="CSUSiteSearch"><span class="offscreen">What can we help you search for?</span></label>
                  <input id="CSUSiteSearch" name="query" maxlength="1000" class="form-control" type="search">
                  <button id="CSUSiteSearchButton" class="search-button" type="submit">
                    <i class="icon search-icon" role="presentation">
                      <svg class="search" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 20 20">
                        <title>Search icon</title>
                        <g><path class="cls-1" d="M19.51,17.15,15.17,12.8l-.08-.06a8.25,8.25,0,1,0-2.35,2.35l.06.08,4.35,4.34a1.67,1.67,0,0,0,2.36-2.36ZM8.22,13.59a5.37,5.37,0,1,1,5.37-5.37A5.37,5.37,0,0,1,8.22,13.59Z" transform="translate(0 0)"></path></g>
                      </svg>
                    </i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
    \` : ''}
  </header>
  \${enabledModules.some(m => m.id === 'csu-global-menu') ? \`
  <script>
    (function () {
      var input = document.getElementById("CSUSiteSearch");
      if (!input) return;
      input.addEventListener("keyup", function (event) {
        if (event.key === "Enter" || event.keyCode === 13) {
          event.preventDefault();
          var btn = document.getElementById("CSUSiteSearchButton");
          if (btn) btn.click();
        }
      });
    })();
  </script>
  \` : ''}

  <!-- Hero Section (Title Banner) -->
  <section class="title-banner dark">
    <div class="site-wrap">
      <h1>${partnerHeadline?.headline || partnerName + ' Employees'}</h1>
      <p>${partnerHeadline?.subheadline || 'Exclusive Education Benefits for You'}</p>
    </div>
  </section>

  <!-- Partner Logo -->
  ${enabledModules.some(m => m.id === 'partner-logo') && partnerLogo?.logoUrl ? `
  <section class="light" style="padding: 40px 0; text-align: center;">
    <div class="site-wrap">
      <img src="${partnerLogo.logoUrl}" alt="${partnerLogo?.logoAlt || partnerName + ' Logo'}" style="max-width: 200px; max-height: 80px; object-fit: contain;">
    </div>
  </section>
  ` : ''}

  <!-- Benefits Card -->
  ${enabledModules.some(m => m.id === 'partner-benefits-card') ? `
  <section class="light">
    <div class="site-wrap">
      <div class="benefits-card">
        <h3>${benefitsCard?.benefitsTitle || 'Your Benefits'}</h3>
        <ul class="benefits-list">
          ${(benefitsCard?.benefits || ['Tuition Discount', 'Flexible Online Learning', 'No Application Fee']).filter(b => b).map(benefit => `
          <li>${benefit}</li>
          `).join('')}
        </ul>
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Benefits Copy -->
  ${enabledModules.some(m => m.id === 'benefits-copy') ? `
  <section class="page-content light">
    <div class="site-wrap page-grid columns-2-1">
      <article class="content">
        <p>${benefitsCopy?.benefitsCopy || 'As a valued partner, you and your eligible family members can take advantage of exclusive benefits.'}</p>

        <h2>Tuition Benefits</h2>
        <p>${benefitsCopy?.tuitionParagraph || 'Enjoy exclusive tuition discounts at Columbia Southern University.'}</p>

        <h2>Flexible Learning</h2>
        <p>${benefitsCopy?.flexibilityParagraph || 'Our flexible online programs are designed to fit your busy schedule.'}</p>

        <div class="button-group">
          <a class="button solid" href="https://mycsu.columbiasouthern.edu/prospect/application">Apply Now</a>
          <a class="button ghost" href="https://www.columbiasouthern.edu/info-form">Request Info</a>
        </div>
      </article>
      <aside class="sidebar">
        <!-- Sidebar content if needed -->
      </aside>
    </div>
  </section>
  ` : ''}

  <!-- Lead Capture Form -->
  ${enabledModules.some(m => m.id === 'lead-capture-form') ? `
  <section class="lead-form">
    <div class="site-wrap">
      <h3>${leadForm?.formTitle || 'Request Information'}</h3>
      <div class="form-grid">
        ${leadForm?.formFieldToggles?.firstName !== false ? '<div class="form-field">First Name</div>' : ''}
        ${leadForm?.formFieldToggles?.lastName !== false ? '<div class="form-field">Last Name</div>' : ''}
        ${leadForm?.formFieldToggles?.email !== false ? '<div class="form-field">Email</div>' : ''}
        ${leadForm?.formFieldToggles?.phone !== false ? '<div class="form-field">Phone</div>' : ''}
        ${leadForm?.formFieldToggles?.program !== false ? '<div class="form-field full">Program Interest</div>' : ''}
        ${leadForm?.formFieldToggles?.comments !== false ? '<div class="form-field full">Comments</div>' : ''}
      </div>
      <div class="center">
        <button class="submit-btn">${leadForm?.submitButtonText || 'Submit'}</button>
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Footer -->
  <footer>
    <!-- CTA Banner -->
    <section class="cta-banner dark">
      <div class="site-wrap">
        <h1>Start Your Journey Today</h1>
        <div class="button-group flex center">
          <a class="button ghost" href="https://mycsu.columbiasouthern.edu/prospect/application">Apply Now</a>
          <a class="button solid" href="https://www.columbiasouthern.edu/info-form">Request Info</a>
        </div>
      </div>
    </section>

    <!-- Footer Content -->
    <section class="light padded">
      <div class="site-wrap page-grid columns-1-2">
        <!-- Left Column: Contact Info -->
        <div>
          <h2 class="h4">Columbia Southern University</h2>
          <p>
            21982 University Lane<br>
            Orange Beach, Alabama 36561
          </p>
          <p>
            Phone: <a href="tel:+12519813771">251-981-3771</a><br>
            Toll Free: <a href="tel:+18009778449">800-977-8449</a>
          </p>

          <!-- Social Links -->
          <ul class="logo-grid flex">
            <li>
              <a class="social-link circle" href="https://www.facebook.com/ColumbiaSouthernUniversity" title="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
                <span class="offscreen">Facebook</span>
              </a>
            </li>
            <li>
              <a class="social-link circle" href="https://twitter.com/ColumbiaSouth" title="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                <span class="offscreen">Twitter</span>
              </a>
            </li>
            <li>
              <a class="social-link circle" href="https://www.linkedin.com/school/columbia-southern-university/" title="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                </svg>
                <span class="offscreen">LinkedIn</span>
              </a>
            </li>
          </ul>

          <p><small>&copy; ${new Date().getFullYear()} Columbia Southern University</small></p>
        </div>

        <!-- Right Column: Link Columns -->
        <div class="grid columns-3 grid-gap-30">
          <div>
            <h3 class="h4">Admissions</h3>
            <ul class="link-list">
              <li><a href="https://www.columbiasouthern.edu/admissions/getting-started/">Getting Started</a></li>
              <li><a href="https://www.columbiasouthern.edu/request-catalog/">Download Catalog</a></li>
              <li><a href="https://www.columbiasouthern.edu/tuition-financing/tuition-overview/">Tuition</a></li>
            </ul>
          </div>
          <div>
            <h3 class="h4">Academics</h3>
            <ul class="link-list">
              <li><a href="https://www.columbiasouthern.edu/online-degree/view-all-programs/">Programs</a></li>
              <li><a href="https://www.columbiasouthern.edu/student-handbook/">Student Handbook</a></li>
              <li><a href="https://www.columbiasouthern.edu/alumni/">Alumni</a></li>
            </ul>
          </div>
          <div>
            <h3 class="h4">About</h3>
            <ul class="link-list">
              <li><a href="https://www.columbiasouthern.edu/about-csu/contact-us/">Contact</a></li>
              <li><a href="https://www.columbiasouthern.edu/about-csu/accreditation-licensure/">Accreditation</a></li>
              <li><a href="https://www.columbiasouthern.edu/careers/careers-overview/">Careers</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom Bar -->
    <div class="light background-gray">
      <div class="site-wrap">
        <ul class="button-group flex center">
          <li><a class="button" href="https://www.columbiasouthern.edu/privacy-policy">Privacy Policy</a></li>
          <li><a class="button" href="https://www.columbiasouthern.edu/accessibility/">Accessibility</a></li>
          <li><a class="button" href="https://www.columbiasouthern.edu/sitemap/">Site Map</a></li>
        </ul>
      </div>
    </div>
  </footer>
</body>
</html>`

    return html
  }

  const [htmlOutput, setHtmlOutput] = useState<string>('')

  // Handle export submission
  const handleExport = () => {
    // Prevent double-clicks
    if (!isExportFormValid() || isExporting) return

    setIsExporting(true)

    // Generate Wufoo text
    const wufooText = generateWufooText()
    const formattedWufoo = formatWufooTextForDisplay(wufooText)
    setWufooOutput(formattedWufoo)
    setWufooFields(wufooText)

    // Generate HTML file
    const html = generateHtmlFile()
    setHtmlOutput(html)

    // Show export results
    setShowExportModal(false)
    setShowExportResults(true)
    setIsExporting(false)
  }

  // Download HTML file
  const downloadHtmlFile = () => {
    const slug = partnerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'partner'
    const filename = `${slug}-landing-page.html`
    const blob = new Blob([htmlOutput], { type: 'text/html' })
    saveAs(blob, filename)
  }

  // State for uploaded images (stores base64 data)
  const [uploadedImages, _setUploadedImages] = useState<Record<string, { name: string; data: string; type: string }>>({})

  // Download assets ZIP file
  const downloadAssetsZip = async () => {
    const zip = new JSZip()
    const slug = partnerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'partner'

    // Create images folder
    const imagesFolder = zip.folder('images')

    // Add all uploaded images to the ZIP
    let imageCount = 0
    Object.entries(uploadedImages).forEach(([_id, image]) => {
      if (image.data && imagesFolder) {
        // Extract base64 data from data URL
        const base64Data = image.data.split(',')[1]
        if (base64Data) {
          imagesFolder.file(image.name, base64Data, { base64: true })
          imageCount++
        }
      }
    })

    // Also check moduleContent for logo image data
    const partnerLogo = moduleContent['partner-logo']
    if (partnerLogo?.logoUrl && partnerLogo.logoUrl.startsWith('data:')) {
      const base64Data = partnerLogo.logoUrl.split(',')[1]
      if (base64Data && imagesFolder) {
        const logoName = partnerLogo.logoFileName || 'partner-logo.png'
        imagesFolder.file(logoName, base64Data, { base64: true })
        imageCount++
      }
    }

    // Add a manifest file
    const manifest = {
      partner: partnerName,
      exportDate: new Date().toISOString(),
      imageCount: imageCount,
      images: Object.entries(uploadedImages).map(([id, img]) => ({
        id,
        name: img.name,
        type: img.type,
      })),
    }
    zip.file('manifest.json', JSON.stringify(manifest, null, 2))

    // Generate ZIP and download
    const content = await zip.generateAsync({ type: 'blob' })
    const filename = `${slug}-assets.zip`
    saveAs(content, filename)
  }

  // Update module content
  const updateModuleContent = (moduleId: string, updates: Partial<ModuleContent>) => {
    setModuleContent(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], ...updates }
    }))
  }

  // Save draft to JSON file
  const handleSaveDraft = () => {
    // Prevent double-clicks
    if (isSavingDraft) return

    setIsSavingDraft(true)
    const draft = {
      version: '1.0',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      metadata: {
        partnerName,
        templateType,
        sourceUrl,
      },
      settings: {
        headerStyle,
        footerStyle,
      },
      modules: modules.reduce((acc, module) => {
        acc[module.id] = {
          enabled: module.enabled,
          order: module.order,
          content: moduleContent[module.id] || {},
        }
        return acc
      }, {} as Record<string, { enabled: boolean; order: number; content: ModuleContent }>),
    }

    const slug = partnerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'draft'
    const date = new Date().toISOString().split('T')[0]
    const filename = `csu-landing-${slug}-${date}.json`

    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' })
    saveAs(blob, filename)
    setIsSavingDraft(false)
    setShowSaveSuccess(true)
    setTimeout(() => setShowSaveSuccess(false), 3000)
  }

  // Download JSON draft from export modal
  const downloadJsonDraft = () => {
    const draft = {
      version: '1.0',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      metadata: {
        partnerName,
        templateType,
        sourceUrl,
      },
      settings: {
        headerStyle,
        footerStyle,
      },
      modules: modules.reduce((acc, module) => {
        acc[module.id] = {
          enabled: module.enabled,
          order: module.order,
          content: moduleContent[module.id] || {},
        }
        return acc
      }, {} as Record<string, { enabled: boolean; order: number; content: ModuleContent }>),
      exportInfo: {
        requestedBy: `${exportRequester.firstName} ${exportRequester.lastName}`,
        email: exportRequester.email,
        dateNeeded: exportRequester.dateNeeded,
        approvedBy: exportRequester.approvedBy,
        notes: exportRequester.additionalNotes,
      },
    }

    const slug = partnerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'draft'
    const filename = `${slug}-draft.json`

    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' })
    saveAs(blob, filename)
  }


  // Handle drag end event for reordering modules
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setModules((items) => {
        const sortedItems = [...items].sort((a, b) => a.order - b.order)
        const oldIndex = sortedItems.findIndex((item) => item.id === active.id)
        const newIndex = sortedItems.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(sortedItems, oldIndex, newIndex)
        // Update order numbers
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        }))
      })
    }
  }

  // Initialize modules when entering builder mode based on template type
  useEffect(() => {
    if (mode === 'builder' && modules.length === 0) {
      const defaultModules = templateType === 'learning-partner'
        ? LEARNING_PARTNER_MODULES
        : CHANNEL_PARTNER_MODULES
      setModules(defaultModules.map(m => ({ ...m })))
    }
  }, [mode, templateType, modules.length])

  // Auto-save to localStorage when in builder mode (if enabled)
  useEffect(() => {
    if (mode !== 'builder' || !autoSaveEnabled) return

    const autoSaveData = {
      partnerName,
      templateType,
      sourceUrl,
      headerStyle,
      footerStyle,
      autoSaveEnabled,
      modules: modules.map(m => ({ id: m.id, enabled: m.enabled, order: m.order })),
      moduleContent,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem('csu-landing-autosave', JSON.stringify(autoSaveData))
  }, [mode, partnerName, templateType, sourceUrl, headerStyle, footerStyle, modules, moduleContent, autoSaveEnabled])

  // Restore from auto-save on initial load
  useEffect(() => {
    const autoSaveString = localStorage.getItem('csu-landing-autosave')
    if (!autoSaveString) return

    try {
      const autoSave = JSON.parse(autoSaveString)
      // Check if auto-save is recent (within 24 hours)
      const timestamp = new Date(autoSave.timestamp)
      const now = new Date()
      const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)

      if (hoursDiff < 24 && autoSave.partnerName) {
        // Restore state
        setPartnerName(autoSave.partnerName)
        setTemplateType(autoSave.templateType || 'learning-partner')
        setSourceUrl(autoSave.sourceUrl || '')
        setHeaderStyle(autoSave.headerStyle || 'minimal')
        setFooterStyle(autoSave.footerStyle || 'minimal')
        if (autoSave.autoSaveEnabled !== undefined) {
          setAutoSaveEnabled(autoSave.autoSaveEnabled)
        }
        if (autoSave.moduleContent) {
          setModuleContent(autoSave.moduleContent)
        }
        if (autoSave.modules) {
          const defaultModules = autoSave.templateType === 'learning-partner'
            ? LEARNING_PARTNER_MODULES
            : CHANNEL_PARTNER_MODULES
          const restoredModules = defaultModules.map(defaultMod => {
            const savedMod = autoSave.modules.find((m: { id: string }) => m.id === defaultMod.id)
            if (savedMod) {
              return { ...defaultMod, enabled: savedMod.enabled, order: savedMod.order }
            }
            return defaultMod
          })
          setModules(restoredModules.sort((a: Module, b: Module) => a.order - b.order))
        }
        // Jump straight to builder mode
        setMode('builder')
      }
    } catch {
      // Silently fail if auto-save is corrupted
      localStorage.removeItem('csu-landing-autosave')
    }
  }, []) // Only run on initial mount

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning when in builder mode with content
      if (mode === 'builder' && partnerName) {
        e.preventDefault()
        // Modern browsers ignore custom messages, but we still need to set returnValue
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [mode, partnerName])

  const handleModuleToggle = (moduleId: string) => {
    setModules(prev => prev.map(m =>
      m.id === moduleId && !m.locked
        ? { ...m, enabled: !m.enabled }
        : m
    ))
  }

  const handleModeSelect = (selectedMode: StartMode) => {
    setStartMode(selectedMode)
    // All modes now go through setup
    setMode('setup')
  }

  const handleSetupComplete = () => {
    if (partnerName.trim()) {
      setMode('builder')
    }
  }

  const handleUrlParse = async () => {
    setUrlError('')

    if (!sourceUrl.trim()) {
      setUrlError('Please enter a URL')
      return
    }

    if (!isValidCsuUrl(sourceUrl)) {
      setUrlError('Please enter a valid CSU landing page URL. Supported patterns include columbiasouthern.edu/tuition-financing/partnerships/learning-partner-directory/*, /landing-pages/learning-partners/*, /benefithub, /delta, /perkspot, /iafc, /ebg-solutions')
      return
    }

    setIsLoading(true)
    setParseStatus('idle')

    try {
      // Simulate URL parsing (in a real app, this would fetch and parse the page)
      // For now, we'll extract a partner name from the URL
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Extract partner name from URL path
      const urlParts = sourceUrl.split('/')
      const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2]
      const extractedName = lastPart
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())

      // Known partner discounts (based on URL patterns)
      // In a real implementation with backend, this would be extracted from the page
      const knownDiscounts: Record<string, string> = {
        'benefithub': '10%',
        'delta': '15%',
        'perkspot': '10%',
        'iafc': '15%',
        'ebg-solutions': '10%',
      };

      // Extract discount percentage for known partners
      const slug = lastPart.toLowerCase().replace(/[?#].*$/, '');
      const extractedDiscount = knownDiscounts[slug] || null;

      // Generate extraction warnings for fields that could not be extracted
      // Due to CORS restrictions, we can only extract limited info from the URL
      const warnings: ExtractionWarning[] = [
        {
          field: 'partnerLogo',
          message: 'Partner logo could not be extracted due to browser security restrictions. Please upload or enter URL.',
          module: 'Partner Logo'
        },
        {
          field: 'benefitsCopy',
          message: 'Benefits copy could not be extracted. Please enter eligibility and benefits text.',
          module: 'Benefits Copy'
        },
        {
          field: 'faqs',
          message: 'FAQ content could not be extracted. Please enter questions and answers.',
          module: 'FAQ Accordion'
        }
      ];

      // Only add discount warning if we could not extract it
      if (!extractedDiscount) {
        warnings.push({
          field: 'discountPercentage',
          message: 'Discount percentage could not be determined. Please select the correct value.',
          module: 'Partner Benefits Card'
        });
      }

      setExtractionWarnings(warnings);
      setShowExtractionWarning(true);
      setPartnerName(extractedName || 'Partner');

      // If discount was extracted, set it in module content
      if (extractedDiscount) {
        setModuleContent(prev => ({
          ...prev,
          'partner-benefits-card': {
            ...prev['partner-benefits-card'],
            discountPercentage: extractedDiscount as '10%' | '15%' | '20%' | 'custom'
          }
        }));
      }

      setParseStatus('success');
      setMode('builder')
    } catch {
      setUrlError('Failed to parse the URL. Please try again or enter details manually.')
      setParseStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDraftUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setDraftError('')
    setDraftFileName(file.name)
    setIsLoading(true)

    try {
      const text = await file.text()

      // Try to parse JSON
      let draft
      try {
        draft = JSON.parse(text)
      } catch {
        throw new Error('Invalid JSON format. The file may be corrupted or not a valid draft file.')
      }

      // Validate draft structure
      if (typeof draft !== 'object' || draft === null) {
        throw new Error('Invalid draft file: Expected a JSON object.')
      }
      if (!draft.version) {
        throw new Error('Invalid draft file: Missing required "version" field.')
      }
      if (!draft.metadata) {
        throw new Error('Invalid draft file: Missing required "metadata" field.')
      }
      if (!draft.metadata.partnerName) {
        throw new Error('Invalid draft file: Missing partner name in metadata.')
      }

      // Restore state from draft
      if (draft.metadata.partnerName) {
        setPartnerName(draft.metadata.partnerName)
      }
      if (draft.metadata.templateType) {
        setTemplateType(draft.metadata.templateType as TemplateType)
      }
      if (draft.metadata.sourceUrl) {
        setSourceUrl(draft.metadata.sourceUrl)
      }

      // Restore settings if present
      if (draft.settings) {
        if (draft.settings.headerStyle) {
          setHeaderStyle(draft.settings.headerStyle)
        }
        if (draft.settings.footerStyle) {
          setFooterStyle(draft.settings.footerStyle)
        }
      }

      // Restore module content if present
      if (draft.modules) {
        const restoredContent: Record<string, ModuleContent> = {}
        for (const [moduleId, moduleData] of Object.entries(draft.modules)) {
          const data = moduleData as { enabled?: boolean; order?: number; content?: ModuleContent }
          if (data.content) {
            restoredContent[moduleId] = data.content
          }
        }
        setModuleContent(restoredContent)
      }

      // Move to builder mode
      setMode('builder')
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : 'Failed to load draft file. Please ensure it is a valid JSON draft.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToSelection = () => {
    setMode('selection')
    setStartMode(null)
    setPartnerName('')
    setTemplateType('learning-partner')
    setSourceUrl('')
    setUrlError('')
    setParseStatus('idle')
    setDraftError('')
    setDraftFileName('')
    setModules([])
    setSelectedModuleId(null)
    setModuleContent({})
    setHeaderStyle('minimal')
    setFooterStyle('minimal')
    // Clear localStorage
    localStorage.removeItem('csu-landing-autosave')
  }

  const handleClearDraft = () => {
    setShowClearConfirm(true)
  }

  const confirmClearDraft = () => {
    setShowClearConfirm(false)
    handleBackToSelection()
  }

  if (mode === 'selection') {
    return (
      <div className="min-h-screen bg-csu-lightest-gray flex flex-col overflow-x-hidden">
        {/* Header */}
        <header className="bg-csu-navy text-white py-4 px-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                <span className="text-csu-navy font-bold text-xl">CSU</span>
              </div>
              <h1 className="text-xl font-semibold">Landing Page Builder</h1>
            </div>
          </div>
        </header>

        {/* Mode Selection */}
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-csu-near-black mb-4">
                Welcome to the CSU Landing Page Builder
              </h2>
              <p className="text-csu-dark-gray text-lg">
                Create detailed mockups for partner landing pages. Choose how you'd like to get started.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Create New Page */}
              <button
                onClick={() => handleModeSelect('new')}
                className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-csu-gold focus:border-csu-navy focus:outline-none text-left"
              >
                <div className="w-16 h-16 bg-csu-navy rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-csu-near-black mb-2">
                  Create New Page
                </h3>
                <p className="text-csu-dark-gray">
                  Start from scratch with a fresh landing page using one of our templates.
                </p>
              </button>

              {/* Edit Existing Page */}
              <button
                onClick={() => handleModeSelect('edit')}
                className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-csu-gold focus:border-csu-navy focus:outline-none text-left"
              >
                <div className="w-16 h-16 bg-csu-navy rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-csu-near-black mb-2">
                  Edit Existing Page
                </h3>
                <p className="text-csu-dark-gray">
                  Import content from an existing CSU landing page URL to modify.
                </p>
              </button>

              {/* Load Draft */}
              <button
                onClick={() => handleModeSelect('load')}
                className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-csu-gold focus:border-csu-navy focus:outline-none text-left"
              >
                <div className="w-16 h-16 bg-csu-navy rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-csu-near-black mb-2">
                  Load Draft
                </h3>
                <p className="text-csu-dark-gray">
                  Resume work on a previously saved draft by uploading a JSON file.
                </p>
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-csu-near-black text-white py-4 px-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Columbia Southern University. All rights reserved.</p>
        </footer>
      </div>
    )
  }

  // Setup mode - partner name and template selection OR URL input
  if (mode === 'setup') {
    return (
      <div className="min-h-screen bg-csu-lightest-gray flex flex-col overflow-x-hidden">
        {/* Header */}
        <header className="bg-csu-navy text-white py-4 px-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                <span className="text-csu-navy font-bold text-xl">CSU</span>
              </div>
              <h1 className="text-xl font-semibold">Landing Page Builder</h1>
            </div>
          </div>
        </header>

        {/* Setup Form */}
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg w-full">
            <button
              onClick={handleBackToSelection}
              className="mb-6 text-csu-navy hover:text-csu-dark-gray flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to options
            </button>

            {startMode === 'new' && (
              <div className="bg-white rounded-lg p-8 shadow-md">
                <h2 className="text-2xl font-bold text-csu-near-black mb-2">
                  Create New Landing Page
                </h2>
                <p className="text-csu-dark-gray mb-6">
                  Enter the partner details to get started with your new landing page.
                </p>

                <div className="space-y-6">
                  {/* Partner Name Input */}
                  <div>
                    <label htmlFor="partnerName" className="block text-sm font-medium text-csu-near-black mb-2">
                      Partner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="partnerName"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="e.g., Acme Corporation"
                      className="w-full px-4 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none transition-colors"
                    />
                  </div>

                  {/* Template Type Selector */}
                  <div>
                    <label htmlFor="templateType" className="block text-sm font-medium text-csu-near-black mb-2">
                      Template Type
                    </label>
                    <select
                      id="templateType"
                      value={templateType}
                      onChange={(e) => setTemplateType(e.target.value as TemplateType)}
                      className="w-full px-4 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none transition-colors bg-white"
                    >
                      <option value="learning-partner">Learning Partner</option>
                      <option value="channel-partner">Channel Partner</option>
                    </select>
                    <p className="mt-2 text-sm text-csu-medium-gray">
                      {templateType === 'learning-partner'
                        ? 'Basic template with essential modules for learning partners.'
                        : 'Extended template with additional sections for channel partners.'}
                    </p>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={handleSetupComplete}
                    disabled={!partnerName.trim()}
                    className="w-full px-6 py-3 bg-csu-navy text-white rounded-lg font-medium hover:bg-csu-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Builder
                  </button>
                </div>
              </div>
            )}

            {startMode === 'edit' && (
              <div className="bg-white rounded-lg p-8 shadow-md">
                <h2 className="text-2xl font-bold text-csu-near-black mb-2">
                  Edit Existing Landing Page
                </h2>
                <p className="text-csu-dark-gray mb-6">
                  Enter the URL of an existing CSU landing page to import its content.
                </p>

                <div className="space-y-6">
                  {/* URL Input */}
                  <div>
                    <label htmlFor="sourceUrl" className="block text-sm font-medium text-csu-near-black mb-2">
                      Landing Page URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      id="sourceUrl"
                      value={sourceUrl}
                      onChange={(e) => {
                        setSourceUrl(e.target.value)
                        setUrlError('')
                      }}
                      placeholder="https://www.columbiasouthern.edu/landing-pages/learning-partners/..."
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-1 outline-none transition-colors ${
                        urlError
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-csu-light-gray focus:border-csu-navy focus:ring-csu-navy'
                      }`}
                    />
                    {urlError && (
                      <p role="alert" className="mt-2 text-sm text-red-500">{urlError}</p>
                    )}
                    <p className="mt-2 text-sm text-csu-medium-gray">
                      Supported URLs: columbiasouthern.edu landing pages and partner directories
                    </p>
                  </div>

                  {/* Parse Button */}
                  <button
                    onClick={handleUrlParse}
                    disabled={!sourceUrl.trim() || isLoading}
                    className="w-full px-6 py-3 bg-csu-navy text-white rounded-lg font-medium hover:bg-csu-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Parsing...
                      </>
                    ) : (
                      'Parse & Load Content'
                    )}
                  </button>

                  {parseStatus === 'success' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                      Content parsed successfully! Loading builder...
                    </div>
                  )}

                  {/* Manual Entry Fallback */}
                  <div className="pt-4 border-t border-csu-light-gray">
                    <p className="text-sm text-csu-medium-gray text-center mb-3">
                      Or enter partner name manually
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="Enter partner name..."
                        className="flex-1 px-4 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                      />
                      <button
                        onClick={handleSetupComplete}
                        disabled={!partnerName.trim()}
                        className="px-4 py-2 bg-csu-gold text-csu-near-black rounded-lg font-medium hover:bg-csu-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {startMode === 'load' && (
              <div className="bg-white rounded-lg p-8 shadow-md">
                <h2 className="text-2xl font-bold text-csu-near-black mb-2">
                  Load Draft
                </h2>
                <p className="text-csu-dark-gray mb-6">
                  Upload a previously saved JSON draft file to resume your work.
                </p>

                <div className="space-y-6">
                  {/* File Upload Input */}
                  <div>
                    <label htmlFor="draftFile" className="block text-sm font-medium text-csu-near-black mb-2">
                      Draft File <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="draftFile"
                        accept=".json"
                        onChange={handleDraftUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className={`w-full px-4 py-8 border-2 border-dashed rounded-lg text-center transition-colors ${
                        draftError
                          ? 'border-red-500 bg-red-50'
                          : draftFileName
                          ? 'border-green-500 bg-green-50'
                          : 'border-csu-light-gray hover:border-csu-navy'
                      }`}>
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-csu-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-csu-dark-gray">Loading draft...</span>
                          </div>
                        ) : draftFileName ? (
                          <div className="flex items-center justify-center gap-2 text-green-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{draftFileName}</span>
                          </div>
                        ) : (
                          <>
                            <svg className="w-8 h-8 text-csu-medium-gray mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-csu-dark-gray">
                              <span className="font-medium text-csu-navy">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-sm text-csu-medium-gray mt-1">JSON files only</p>
                          </>
                        )}
                      </div>
                    </div>
                    {draftError && (
                      <p role="alert" className="mt-2 text-sm text-red-500">{draftError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-csu-near-black text-white py-4 px-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Columbia Southern University. All rights reserved.</p>
        </footer>
      </div>
    )
  }

  // Builder mode - placeholder for now
  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-csu-lightest-gray'}`}>
      {/* Header */}
      <header className={`py-3 px-6 shadow-lg flex-shrink-0 ${darkMode ? 'bg-gray-800' : 'bg-csu-navy'} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-csu-navy font-bold text-sm">CSU</span>
            </div>
            <h1 className="text-lg font-semibold">Landing Page Builder</h1>
            {/* Overall Completion Progress */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/30">
              <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    calculateCompletionPercentage() === 100 ? 'bg-green-400' : 'bg-csu-gold'
                  }`}
                  style={{ width: `${calculateCompletionPercentage()}%` }}
                />
              </div>
              <span className="text-sm text-white/80">{calculateCompletionPercentage()}%</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-1.5 text-sm bg-csu-navy border border-white/30 rounded hover:bg-white/10 transition-colors"
              aria-label="Settings"
            >
              Settings
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className={`px-3 py-1.5 text-sm bg-csu-navy border border-white/30 rounded transition-colors ${
                isSavingDraft ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
              }`}
            >
              {isSavingDraft ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Draft'
              )}
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-1.5 text-sm bg-csu-gold text-csu-near-black rounded font-medium hover:bg-csu-gold/90 transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Three Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Module Panel - Left Sidebar with Collapsible Categories */}
        <ModuleSidebar
          modules={modules}
          selectedModuleId={selectedModuleId}
          darkMode={darkMode}
          onToggle={handleModuleToggle}
          onSelect={setSelectedModuleId}
          onDragEnd={handleDragEnd}
          isModuleComplete={isModuleComplete}
          onBackToStart={handleClearDraft}
        />

        {/* Preview Panel - Right/Center */}
        <main className={`flex-1 overflow-hidden flex flex-col transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-csu-lightest-gray'}`}>
          {/* Preview Controls */}
          <div className={`border-b px-4 py-2 flex items-center justify-end flex-shrink-0 transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-csu-light-gray'}`}>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={scrollSyncEnabled}
                onChange={(e) => setScrollSyncEnabled(e.target.checked)}
                className="w-3 h-3"
                aria-label="Enable scroll sync"
              />
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-csu-dark-gray'}`}>Scroll Sync</span>
            </label>
          </div>

          {/* Extraction Warning Banner */}
          {showExtractionWarning && extractionWarnings.length > 0 && (
            <div className="px-4 pt-4">
              <ExtractionWarningBanner
                warnings={extractionWarnings}
                onDismiss={() => setShowExtractionWarning(false)}
                darkMode={darkMode}
              />
            </div>
          )}

          {/* Preview Content */}
          <div
            ref={previewContainerRef}
            onScroll={handlePreviewScroll}
            className="flex-1 overflow-auto p-4"
          >
            {/* Responsive Preview Container */}
            <div className="bg-white shadow-lg min-h-full border border-gray-300 rounded">
              {/* Render enabled modules in preview */}
              {modules.filter(m => m.enabled).sort((a, b) => a.order - b.order).map((module) => (
                <div
                  key={module.id}
                  data-module-id={module.id}
                  onClick={() => !module.locked && setSelectedModuleId(module.id)}
                  className={`border-b border-csu-light-gray cursor-pointer transition-all ${
                    module.id === 'header' ? 'bg-csu-navy text-white' :
                    module.id === 'footer' ? 'bg-csu-near-black text-white' :
                    'bg-white'
                  } ${selectedModuleId === module.id ? 'ring-2 ring-csu-gold ring-inset' : ''} ${!module.locked ? 'hover:ring-2 hover:ring-csu-gold/50 hover:ring-inset' : ''}`}
                  role="button"
                  aria-label={`Edit ${module.name} module`}
                  tabIndex={module.locked ? -1 : 0}
                >
                  {module.id === 'header' && (
                    <div className="preview-header">
                      <Header
                        showMobileCta={false}
                        showUtilityNav={true}
                        showGlobalMenu={false}
                        previewMode={true}
                      />
                    </div>
                  )}

                  {/* CSU Global Menu Preview */}
                  {module.id === 'csu-global-menu' && (
                    <div className="preview-header">
                      <Header
                        showMobileCta={false}
                        showUtilityNav={false}
                        showGlobalMenu={true}
                        previewMode={true}
                      />
                      <div className="bg-csu-pale-blue/30 px-4 py-1.5 text-center">
                        <span className="text-xs text-csu-dark-gray">Preview: Exported HTML includes full dropdown menus with images</span>
                      </div>
                    </div>
                  )}

                  {/* Welcome Bar Preview */}
                  {module.id === 'welcome-bar' && (
                    <div className="bg-csu-near-black text-white py-2 px-4">
                      <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <span className="text-sm">
                          {moduleContent['welcome-bar']?.welcomeGreeting || `Welcome, ${partnerName || 'Partner'} Employees!`}
                        </span>
                        <a
                          href={moduleContent['welcome-bar']?.welcomeCtaUrl || '#request-info'}
                          className="px-4 py-1 bg-csu-gold text-csu-navy text-sm font-medium rounded hover:bg-csu-gold/90"
                        >
                          {moduleContent['welcome-bar']?.welcomeCtaText || 'Get Started'}
                        </a>
                      </div>
                    </div>
                  )}

                  {module.id === 'partner-headline' && (
                    <div className={`p-8 ${
                      (moduleContent['partner-headline']?.headlineStyle || 'centered') === 'centered' ? 'text-center' :
                      (moduleContent['partner-headline']?.headlineStyle) === 'left-aligned' ? 'text-left' :
                      'text-center bg-csu-navy text-white'
                    }`}>
                      <h1 className={`text-3xl font-bold ${
                        (moduleContent['partner-headline']?.headlineStyle) === 'with-background' ? 'text-white' : 'text-csu-navy'
                      }`}>
                        {moduleContent['partner-headline']?.headline || `${partnerName || 'Partner Name'} Employees`}
                      </h1>
                      <p className={`text-lg mt-2 ${
                        (moduleContent['partner-headline']?.headlineStyle) === 'with-background' ? 'text-white/80' : 'text-csu-dark-gray'
                      }`}>
                        {moduleContent['partner-headline']?.subheadline || 'Exclusive Education Benefits for You'}
                      </p>
                    </div>
                  )}

                  {module.id === 'partner-logo' && (
                    <div className="p-6 flex justify-center">
                      {moduleContent['partner-logo']?.logoUrl ? (
                        <img
                          src={moduleContent['partner-logo'].logoUrl}
                          alt={moduleContent['partner-logo']?.logoAlt || `${partnerName} Logo`}
                          className="max-w-[200px] max-h-24 object-contain"
                        />
                      ) : (
                        <div className="w-48 h-24 bg-csu-lightest-gray rounded flex items-center justify-center text-csu-medium-gray">
                          Partner Logo
                        </div>
                      )}
                    </div>
                  )}

                  {module.id === 'partner-benefits-card' && (() => {
                    const hasUserContent = moduleContent['partner-benefits-card']?.benefits?.some((b: string) => b?.trim()) ||
                      moduleContent['partner-benefits-card']?.discountPercentage ||
                      moduleContent['partner-benefits-card']?.customDiscount?.trim()

                    return (
                      <div className="p-6">
                        <div className="bg-csu-gold/10 border border-csu-gold rounded-lg p-6 max-w-md mx-auto">
                          {moduleContent['partner-benefits-card']?.includeLogo && moduleContent['partner-logo']?.logoUrl && (
                            <div className="flex justify-center mb-4">
                              <img
                                src={moduleContent['partner-logo'].logoUrl}
                                alt={moduleContent['partner-logo']?.logoAlt || 'Partner Logo'}
                                className="max-w-[120px] max-h-12 object-contain"
                              />
                            </div>
                          )}
                          <h3 className="text-xl font-bold text-csu-navy mb-4">
                            {moduleContent['partner-benefits-card']?.benefitsTitle || 'Your Benefits'}
                          </h3>
                          {hasUserContent ? (
                            <ul className="space-y-2 text-csu-dark-gray">
                              {(moduleContent['partner-benefits-card']?.benefits || [])
                                .filter((b: string) => b && b.trim())
                                .map((benefit: string, index: number) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <span className="text-csu-gold">✓</span>
                                    {index === 0 && moduleContent['partner-benefits-card']?.discountPercentage
                                      ? (moduleContent['partner-benefits-card']?.discountPercentage === 'custom'
                                          ? (moduleContent['partner-benefits-card']?.customDiscount || 'Custom') + ' '
                                          : moduleContent['partner-benefits-card']?.discountPercentage + ' ') + benefit
                                      : benefit}
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <div className="text-csu-medium-gray italic text-center py-4 border-2 border-dashed border-csu-light-gray rounded">
                              <p>Add benefit lines and discount percentage</p>
                              <p className="text-xs mt-1">Click to edit this module</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {module.id === 'benefits-copy' && (() => {
                    const hasUserContent = moduleContent['benefits-copy']?.eligibilityStatement?.trim() ||
                      moduleContent['benefits-copy']?.tuitionParagraph?.trim() ||
                      moduleContent['benefits-copy']?.flexibilityParagraph?.trim()

                    return (
                      <div className="p-6 max-w-2xl mx-auto space-y-4">
                        {hasUserContent ? (
                          <>
                            <p className="text-csu-dark-gray leading-relaxed font-medium">
                              {moduleContent['benefits-copy']?.eligibilityStatement || ''}
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="bg-csu-lightest-gray rounded-lg p-4">
                                <h4 className="font-bold text-csu-navy mb-2">Tuition Benefits</h4>
                                <p className="text-csu-dark-gray text-sm leading-relaxed">
                                  {moduleContent['benefits-copy']?.tuitionParagraph || ''}
                                </p>
                              </div>
                              <div className="bg-csu-lightest-gray rounded-lg p-4">
                                <h4 className="font-bold text-csu-navy mb-2">Flexible Learning</h4>
                                <p className="text-csu-dark-gray text-sm leading-relaxed">
                                  {moduleContent['benefits-copy']?.flexibilityParagraph || ''}
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-csu-medium-gray italic text-center py-8 border-2 border-dashed border-csu-light-gray rounded">
                            <p>Add eligibility statement and benefit paragraphs</p>
                            <p className="text-xs mt-1">Click to edit this module</p>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {module.id === 'lead-capture-form' && (
                    <div className="p-6 bg-csu-lightest-gray">
                      <div className="max-w-md mx-auto bg-white rounded-lg p-6 shadow">
                        <h3 className="text-xl font-bold text-csu-navy mb-4">
                          {moduleContent['lead-capture-form']?.formTitle || 'Request Information'}
                        </h3>
                        <div className="space-y-3">
                          {(moduleContent['lead-capture-form']?.formFieldToggles?.firstName ?? true) && (
                            <div className="h-10 bg-gray-100 rounded border flex items-center px-3 text-sm text-csu-medium-gray">First Name</div>
                          )}
                          {(moduleContent['lead-capture-form']?.formFieldToggles?.lastName ?? true) && (
                            <div className="h-10 bg-gray-100 rounded border flex items-center px-3 text-sm text-csu-medium-gray">Last Name</div>
                          )}
                          {(moduleContent['lead-capture-form']?.formFieldToggles?.email ?? true) && (
                            <div className="h-10 bg-gray-100 rounded border flex items-center px-3 text-sm text-csu-medium-gray">Email</div>
                          )}
                          {(moduleContent['lead-capture-form']?.formFieldToggles?.phone ?? true) && (
                            <div className="h-10 bg-gray-100 rounded border flex items-center px-3 text-sm text-csu-medium-gray">Phone</div>
                          )}
                          {(moduleContent['lead-capture-form']?.formFieldToggles?.program ?? true) && (
                            <div className="h-10 bg-gray-100 rounded border flex items-center px-3 text-sm text-csu-medium-gray">Program Interest</div>
                          )}
                          {(moduleContent['lead-capture-form']?.formFieldToggles?.comments ?? true) && (
                            <div className="h-20 bg-gray-100 rounded border flex items-start p-3 text-sm text-csu-medium-gray">Comments</div>
                          )}
                          <button className="w-full py-2 bg-csu-navy text-white rounded font-medium">
                            {moduleContent['lead-capture-form']?.submitButtonText || 'Submit'}
                          </button>
                          {/* Consent Disclosure - Locked text, cannot be edited */}
                          <p className="text-xs text-csu-medium-gray mt-3 leading-relaxed">
                            By submitting this request, you consent to Columbia Southern University using automated technology and prerecorded/artificial voice messages to contact you via phone, email, and SMS/text messaging for marketing purposes. Communications may be monitored and/or recorded. Consent is not required to enroll, and you may still choose to enroll without providing consent. See <a href="https://www.columbiasouthern.edu/privacy-policy" className="text-csu-navy underline hover:no-underline">Privacy Policy</a>.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Buttons Only Preview */}
                  {module.id === 'cta-buttons-only' && (() => {
                    const showApply = moduleContent['cta-buttons-only']?.ctaShowApply ?? true
                    const showRequestInfo = moduleContent['cta-buttons-only']?.ctaShowRequestInfo ?? true
                    const alignment = moduleContent['cta-buttons-only']?.ctaAlignment || 'center'
                    const style = moduleContent['cta-buttons-only']?.ctaStyle || 'side-by-side'

                    const justifyClass = alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center'
                    const flexDirection = style === 'stacked' ? 'flex-col items-center' : 'flex-row'

                    return (
                      <div className="p-6">
                        <div className={`flex gap-4 ${justifyClass} ${flexDirection}`}>
                          {showApply && (
                            <a href="#" className="px-6 py-3 bg-csu-gold text-csu-navy font-semibold rounded hover:bg-csu-gold/90">
                              {moduleContent['cta-buttons-only']?.ctaApplyText || 'Apply Now'}
                            </a>
                          )}
                          {showRequestInfo && (
                            <a href="#" className="px-6 py-3 bg-csu-navy text-white font-semibold rounded hover:bg-csu-navy/90">
                              {moduleContent['cta-buttons-only']?.ctaRequestInfoText || 'Request Info'}
                            </a>
                          )}
                        </div>
                        {!showApply && !showRequestInfo && (
                          <p className="text-csu-medium-gray italic text-center">Enable at least one button to display</p>
                        )}
                      </div>
                    )
                  })()}

                  {/* Contact Info Block Preview */}
                  {module.id === 'contact-info-block' && (() => {
                    const heading = moduleContent['contact-info-block']?.contactHeading || 'Contact Us'
                    const email = moduleContent['contact-info-block']?.contactEmail || 'info@columbiasouthern.edu'
                    const phone = moduleContent['contact-info-block']?.contactPhone || '1-800-977-8449'
                    const showLiveChat = moduleContent['contact-info-block']?.contactShowLiveChat ?? true

                    return (
                      <div className="p-6 bg-csu-lightest-gray">
                        <div className="max-w-md mx-auto text-center">
                          <h3 className="text-xl font-bold text-csu-navy mb-4">{heading}</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5 text-csu-gold" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </svg>
                              <a href={`mailto:${email}`} className="text-csu-navy hover:text-csu-gold">{email}</a>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5 text-csu-gold" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              <a href={`tel:${phone}`} className="text-csu-navy hover:text-csu-gold">{phone}</a>
                            </div>
                            {showLiveChat && (
                              <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5 text-csu-gold" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                                <a href={moduleContent['contact-info-block']?.contactLiveChatUrl || '#'} className="text-csu-navy hover:text-csu-gold">Live Chat</a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {module.id === 'faq-accordion' && (() => {
                    const userFaqs = moduleContent['faq-accordion']?.faqs
                    const hasUserContent = userFaqs && userFaqs.length > 0 && userFaqs.some((faq: { question: string; answer: string }) => faq.question?.trim() || faq.answer?.trim())

                    return (
                      <div className="p-6 max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-csu-navy mb-4">Frequently Asked Questions</h3>
                        {hasUserContent ? (
                          <div className="space-y-2">
                            {userFaqs.filter((faq: { question: string; answer: string }) => faq.question?.trim() || faq.answer?.trim()).map((faq: { question: string; answer: string }, i: number) => (
                              <div key={i} className="border border-csu-light-gray rounded">
                                <div className="p-3 font-medium text-csu-near-black bg-csu-lightest-gray">
                                  {faq.question || 'Question'}
                                </div>
                                <div className="p-3 text-sm text-csu-dark-gray">
                                  {faq.answer || 'Answer'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-csu-medium-gray italic text-center py-8 border-2 border-dashed border-csu-light-gray rounded">
                            <p>Add frequently asked questions and answers</p>
                            <p className="text-xs mt-1">Click to edit this module</p>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {module.id === 'value-proposition-cards' && (() => {
                    const userProps = moduleContent['value-proposition-cards']?.propositions
                    const hasUserContent = userProps && userProps.some((prop: { heading: string; body: string; imageUrl?: string }) => prop.heading?.trim() || prop.body?.trim())

                    return (
                      <div className="p-6">
                        {hasUserContent ? (
                          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            {userProps.map((prop: { heading: string; body: string; imageUrl?: string }, i: number) => (
                              <div key={i} className="bg-csu-lightest-gray rounded-lg p-4 text-center">
                                {prop.imageUrl ? (
                                  <img src={prop.imageUrl} alt={prop.heading} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
                                ) : (
                                  <div className="w-16 h-16 bg-csu-navy rounded-full mx-auto mb-3"></div>
                                )}
                                <h4 className="font-bold text-csu-navy">{prop.heading || 'Card Title'}</h4>
                                <p className="text-sm text-csu-dark-gray mt-2">{prop.body || 'Card description'}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-csu-medium-gray italic text-center py-8 border-2 border-dashed border-csu-light-gray rounded max-w-4xl mx-auto">
                            <p>Add value proposition cards with headings and descriptions</p>
                            <p className="text-xs mt-1">Click to edit this module</p>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Tiered Pricing Display Preview */}
                  {module.id === 'tiered-pricing-display' && (() => {
                    const heading = moduleContent['tiered-pricing-display']?.tieredPricingHeading || 'Tuition Discounts by Degree Level'
                    const tiers = moduleContent['tiered-pricing-display']?.tieredPricingTiers || [
                      { level: 'Undergraduate', discount: '10%' },
                      { level: 'Graduate', discount: '15%' },
                      { level: 'Doctoral', discount: '20%' }
                    ]
                    const footnote = moduleContent['tiered-pricing-display']?.tieredPricingFootnote

                    return (
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-csu-navy text-center mb-6">{heading}</h3>
                        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                          {tiers.map((tier, i) => (
                            <div key={i} className="bg-csu-lightest-gray rounded-lg p-4 text-center">
                              <div className="text-sm text-csu-dark-gray mb-2">{tier.level || 'Level'}</div>
                              <div className="text-3xl font-bold text-csu-gold">{tier.discount || '—'}</div>
                              {tier.originalPrice && (
                                <div className="text-xs text-csu-medium-gray line-through mt-1">{tier.originalPrice}</div>
                              )}
                            </div>
                          ))}
                        </div>
                        {footnote && <p className="text-xs text-csu-medium-gray text-center mt-4">{footnote}</p>}
                      </div>
                    )
                  })()}

                  {/* Why Choose CSU Preview */}
                  {module.id === 'why-choose-csu' && (() => {
                    const heading = moduleContent['why-choose-csu']?.whyChooseHeading || 'Why Choose CSU?'
                    const benefits = moduleContent['why-choose-csu']?.whyChooseBenefits || [
                      '100% Online - Learn from anywhere',
                      'Regionally Accredited',
                      'Affordable Tuition',
                      'Flexible Scheduling',
                      'No Application Fee',
                      'Military-Friendly'
                    ]

                    return (
                      <div className="p-6 bg-csu-lightest-gray">
                        <div className="max-w-2xl mx-auto">
                          <h3 className="text-xl font-bold text-csu-navy mb-4">{heading}</h3>
                          <ul className="grid grid-cols-2 gap-2">
                            {benefits.filter(b => b?.trim()).map((benefit, i) => (
                              <li key={i} className="flex items-center gap-2 text-csu-dark-gray">
                                <span className="text-csu-gold">✓</span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                          {benefits.filter(b => b?.trim()).length === 0 && (
                            <p className="text-csu-medium-gray italic">Add benefits to display here</p>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {module.id === 'tuition-comparison-banner' && (() => {
                    const userBullets = moduleContent['tuition-comparison-banner']?.comparisonBullets
                    const hasUserContent = moduleContent['tuition-comparison-banner']?.comparisonTitle?.trim() ||
                      moduleContent['tuition-comparison-banner']?.comparisonBody?.trim() ||
                      (userBullets && userBullets.some((b: string) => b?.trim()))

                    return (
                      <div className="p-6 bg-csu-navy text-white">
                        <div className="max-w-2xl mx-auto">
                          {hasUserContent ? (
                            <>
                              <h3 className="text-xl font-bold mb-2 text-center">
                                {moduleContent['tuition-comparison-banner']?.comparisonTitle || ''}
                              </h3>
                              <p className="text-white/80 text-center mb-4">
                                {moduleContent['tuition-comparison-banner']?.comparisonBody || ''}
                              </p>
                              {userBullets && userBullets.filter((b: string) => b?.trim()).length > 0 && (
                                <ul className="space-y-2 mb-4">
                                  {userBullets.filter((b: string) => b?.trim()).map((bullet: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2">
                                      <span className="text-csu-gold">✓</span>
                                      {bullet}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {(moduleContent['tuition-comparison-banner']?.comparisonShowCTA ?? true) && (
                                <div className="text-center">
                                  <button className="px-6 py-2 bg-csu-gold text-csu-navy font-medium rounded hover:bg-csu-gold/90">
                                    Compare Now
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-white/60 italic text-center py-8 border-2 border-dashed border-white/30 rounded">
                              <p>Add tuition comparison title, body, and bullet points</p>
                              <p className="text-xs mt-1">Click to edit this module</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Tuition Comparison Table Preview */}
                  {module.id === 'tuition-comparison-table' && (() => {
                    const heading = moduleContent['tuition-comparison-table']?.tuitionTableHeading || 'Compare Tuition Costs'
                    const subheading = moduleContent['tuition-comparison-table']?.tuitionTableSubheading
                    const rows = moduleContent['tuition-comparison-table']?.tuitionTableRows || [
                      { institution: 'Columbia Southern University', tuitionPerCredit: '$270', isCSU: true },
                      { institution: 'Average Public University', tuitionPerCredit: '$390', isCSU: false },
                      { institution: 'Average Private University', tuitionPerCredit: '$550', isCSU: false },
                    ]

                    return (
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-csu-navy text-center mb-2">{heading}</h3>
                        {subheading && <p className="text-csu-dark-gray text-center mb-4">{subheading}</p>}
                        <div className="max-w-2xl mx-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-csu-navy text-white">
                                <th className="p-3 text-left">Institution</th>
                                <th className="p-3 text-right">Tuition/Credit Hour</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, i) => (
                                <tr key={i} className={`border-b border-csu-light-gray ${row.isCSU ? 'bg-csu-gold/20 font-bold' : ''}`}>
                                  <td className="p-3">{row.institution || 'Institution'}</td>
                                  <td className="p-3 text-right">{row.tuitionPerCredit || '$0'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Cost Calculator Widget Preview */}
                  {module.id === 'cost-calculator-widget' && (() => {
                    const heading = moduleContent['cost-calculator-widget']?.calculatorHeading || 'Calculate Your Costs'
                    const iframeUrl = moduleContent['cost-calculator-widget']?.calculatorIframeUrl
                    const height = moduleContent['cost-calculator-widget']?.calculatorHeight || 400

                    return (
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-csu-navy text-center mb-4">{heading}</h3>
                        {iframeUrl ? (
                          <iframe
                            src={iframeUrl}
                            className="w-full border rounded-lg max-w-2xl mx-auto block"
                            style={{ height: `${height}px` }}
                            title="Cost Calculator"
                          />
                        ) : (
                          <div className="max-w-2xl mx-auto bg-csu-lightest-gray rounded-lg p-8 text-center text-csu-medium-gray">
                            <svg className="w-16 h-16 mx-auto mb-4 text-csu-light-gray" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z" clipRule="evenodd" />
                            </svg>
                            <p>Enter a calculator URL to embed the cost calculator</p>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {module.id === 'csu-by-the-numbers' && (() => {
                    const userStats = moduleContent['csu-by-the-numbers']?.stats
                    const hasUserContent = userStats && userStats.some((stat: { number: string; label: string }) => stat.number?.trim() || stat.label?.trim())

                    return (
                      <div className="p-6">
                        {hasUserContent ? (
                          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto text-center">
                            {userStats.map((stat: { number: string; label: string }, i: number) => (
                              <div key={i}>
                                <div className="text-2xl font-bold text-csu-navy">{stat.number || '0'}</div>
                                <div className="text-sm text-csu-dark-gray">{stat.label || 'Label'}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-csu-medium-gray italic text-center py-8 border-2 border-dashed border-csu-light-gray rounded max-w-2xl mx-auto">
                            <p>Add statistics with numbers and labels</p>
                            <p className="text-xs mt-1">Click to edit this module</p>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {module.id === 'accreditations-section' && (() => {
                    const accreds = moduleContent['accreditations-section']?.accreditations || {
                      sacscoc: true, qualityMatters: true, acbsp: true, blackboard: false, military: false
                    }
                    const activeAccreds = [
                      accreds.sacscoc && 'SACSCOC',
                      accreds.qualityMatters && 'Quality Matters',
                      accreds.acbsp && 'ACBSP',
                      accreds.blackboard && 'Blackboard',
                      accreds.military && 'Military Friendly'
                    ].filter(Boolean)
                    return (
                      <div className="p-6 bg-csu-lightest-gray">
                        <h3 className="text-xl font-bold text-csu-navy text-center mb-2">
                          {moduleContent['accreditations-section']?.accreditationHeading || 'Accreditations'}
                        </h3>
                        {moduleContent['accreditations-section']?.accreditationSubheading && (
                          <p className="text-center text-csu-dark-gray mb-4">{moduleContent['accreditations-section']?.accreditationSubheading}</p>
                        )}
                        <div className="flex justify-center gap-6 flex-wrap">
                          {activeAccreds.map((acc, i) => (
                            <div key={i} className="w-20 h-16 bg-white rounded shadow flex items-center justify-center text-xs text-csu-medium-gray text-center p-2">
                              {acc}
                            </div>
                          ))}
                          {activeAccreds.length === 0 && (
                            <p className="text-sm text-csu-medium-gray">No accreditations selected</p>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {module.id === 'degree-programs-list' && (() => {
                    const userPrograms = moduleContent['degree-programs-list']?.programs
                    const hasUserContent = userPrograms && userPrograms.some((p: { name: string; url: string }) => p.name?.trim())

                    return (
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-csu-navy text-center mb-4">
                          {moduleContent['degree-programs-list']?.programsHeading || 'Popular Degree Programs'}
                        </h3>
                        {hasUserContent ? (
                          <div className="max-w-xl mx-auto">
                            <ul className="space-y-2">
                              {userPrograms.filter((p: { name: string; url: string }) => p.name?.trim()).map((program: { name: string; url: string }, i: number) => (
                                <li key={i}>
                                  <a
                                    href={program.url || '#'}
                                    className="text-csu-navy hover:text-csu-gold underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {program.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-csu-medium-gray italic text-center py-8 border-2 border-dashed border-csu-light-gray rounded max-w-xl mx-auto">
                            <p>Add degree programs with names and URLs</p>
                            <p className="text-xs mt-1">Click to edit this module</p>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {module.id === 'scholarship-highlight' && (() => {
                    const hasUserContent = moduleContent['scholarship-highlight']?.scholarshipName?.trim() ||
                      moduleContent['scholarship-highlight']?.scholarshipDescription?.trim()

                    return (
                      <div className="p-6 bg-csu-gold/10 border-l-4 border-csu-gold">
                        <div className="max-w-2xl mx-auto">
                          {hasUserContent ? (
                            <>
                              <h3 className="text-xl font-bold text-csu-navy mb-3">
                                {moduleContent['scholarship-highlight']?.scholarshipName || ''}
                              </h3>
                              <p className="text-csu-dark-gray mb-4">
                                {moduleContent['scholarship-highlight']?.scholarshipDescription || ''}
                              </p>
                              <div className="flex items-center gap-4">
                                <a
                                  href={moduleContent['scholarship-highlight']?.scholarshipEligibilityUrl || 'https://www.columbiasouthern.edu/tuition-financing/scholarships'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-csu-navy underline hover:text-csu-gold"
                                >
                                  View Eligibility Requirements
                                </a>
                                <button className="bg-csu-gold text-csu-navy px-4 py-2 rounded font-semibold hover:bg-csu-gold/80 transition-colors">
                                  {moduleContent['scholarship-highlight']?.scholarshipCtaText || 'Apply for Scholarship'}
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="text-csu-medium-gray italic text-center py-8 border-2 border-dashed border-csu-light-gray rounded">
                              <p>Add scholarship name and description</p>
                              <p className="text-xs mt-1">Click to edit this module</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {module.id === 'video-testimonial' && (() => {
                    const videoUrl = moduleContent['video-testimonial']?.videoUrl || ''
                    const videoTitle = moduleContent['video-testimonial']?.videoTitle || 'Student Testimonial'
                    const videoCaption = moduleContent['video-testimonial']?.videoCaption || ''

                    // Extract YouTube video ID from URL
                    const getYouTubeId = (url: string) => {
                      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
                      return match ? match[1] : null
                    }
                    const videoId = getYouTubeId(videoUrl)

                    return (
                      <div className="p-6">
                        <div className="max-w-2xl mx-auto text-center">
                          <h3 className="text-xl font-bold text-csu-navy mb-4">{videoTitle}</h3>
                          {videoId ? (
                            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={videoTitle}
                                className="absolute top-0 left-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <div className="bg-csu-lightest-gray rounded-lg p-8 text-csu-medium-gray">
                              <svg className="w-16 h-16 mx-auto mb-4 text-csu-light-gray" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                              </svg>
                              <p>Enter a YouTube URL to embed a video</p>
                            </div>
                          )}
                          {videoCaption && (
                            <p className="mt-4 text-sm text-csu-dark-gray italic">{videoCaption}</p>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {module.id === 'hero-banner' && (() => {
                    const bgUrl = moduleContent['hero-banner']?.heroBackgroundUrl || ''
                    const opacity = moduleContent['hero-banner']?.heroOverlayOpacity ?? 50
                    const headline = moduleContent['hero-banner']?.heroHeadline || 'Your Future Starts Here'
                    const subheadline = moduleContent['hero-banner']?.heroSubheadline || 'Take the next step in your education journey'

                    return (
                      <div
                        className="relative min-h-[300px] flex items-center justify-center"
                        style={{
                          backgroundImage: bgUrl ? `url(${bgUrl})` : 'linear-gradient(135deg, #002855 0%, #003d7a 100%)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        {/* Overlay */}
                        <div
                          className="absolute inset-0 bg-csu-navy"
                          style={{ opacity: opacity / 100 }}
                        />
                        {/* Content */}
                        <div className="relative z-10 text-center text-white p-8">
                          {headline && (
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">{headline}</h2>
                          )}
                          {subheadline && (
                            <p className="text-lg md:text-xl opacity-90">{subheadline}</p>
                          )}
                          {!bgUrl && (
                            <p className="mt-6 text-sm opacity-70">Upload a background image to customize the hero</p>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Stats Banner Preview */}
                  {module.id === 'stats-banner' && (() => {
                    const stats = moduleContent['stats-banner']?.statsBannerStats || [
                      { value: '20%', label: 'Discount' },
                      { value: '50+', label: 'Programs' },
                      { value: '$0', label: 'Textbooks' }
                    ]
                    const style = moduleContent['stats-banner']?.statsBannerStyle || 'horizontal'

                    return (
                      <div className="p-6 bg-csu-gold">
                        <div className={`max-w-4xl mx-auto ${style === 'horizontal' ? 'flex justify-around' : 'grid grid-cols-3 gap-4'}`}>
                          {stats.map((stat, i) => (
                            <div key={i} className={`text-center ${style === 'cards' ? 'bg-white rounded-lg p-4 shadow' : ''}`}>
                              <div className="text-3xl font-bold text-csu-navy">{stat.value || '—'}</div>
                              <div className="text-sm text-csu-dark-gray">{stat.label || 'Label'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {module.id === 'secondary-cta-banner' && (() => {
                    const heading = moduleContent['secondary-cta-banner']?.secondaryCtaHeading || 'Ready to Get Started?'
                    const showApply = moduleContent['secondary-cta-banner']?.secondaryCtaShowApply ?? true
                    const showRequestInfo = moduleContent['secondary-cta-banner']?.secondaryCtaShowRequestInfo ?? true

                    return (
                      <div className="p-8 bg-csu-gold text-center">
                        <h3 className="text-2xl font-bold text-csu-navy mb-6">{heading}</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                          {showApply && (
                            <a
                              href="https://www.columbiasouthern.edu/apply"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-csu-navy text-white px-6 py-3 rounded font-semibold hover:bg-csu-navy/90 transition-colors"
                            >
                              Apply Now
                            </a>
                          )}
                          {showRequestInfo && (
                            <a
                              href="#request-info"
                              className="bg-white text-csu-navy px-6 py-3 rounded font-semibold border-2 border-csu-navy hover:bg-csu-lightest-gray transition-colors"
                            >
                              Request Information
                            </a>
                          )}
                        </div>
                        {!showApply && !showRequestInfo && (
                          <p className="text-csu-navy/70">Enable at least one button to display</p>
                        )}
                      </div>
                    )
                  })()}

                  {/* Get Started Today Banner Preview */}
                  {module.id === 'get-started-today-banner' && (() => {
                    const heading = moduleContent['get-started-today-banner']?.getStartedHeading || 'Get Started Today!'
                    const subheading = moduleContent['get-started-today-banner']?.getStartedSubheading
                    const showApply = moduleContent['get-started-today-banner']?.getStartedShowApply ?? true
                    const showRequestInfo = moduleContent['get-started-today-banner']?.getStartedShowRequestInfo ?? true
                    const bgColor = moduleContent['get-started-today-banner']?.getStartedBgColor || 'navy'

                    const bgClass = bgColor === 'navy' ? 'bg-csu-navy text-white'
                      : bgColor === 'gold' ? 'bg-csu-gold text-csu-navy'
                      : 'bg-gradient-to-r from-csu-navy to-csu-gold text-white'

                    return (
                      <div className={`p-8 ${bgClass}`}>
                        <div className="max-w-4xl mx-auto text-center">
                          <h3 className="text-2xl font-bold mb-2">{heading}</h3>
                          {subheading && <p className="opacity-90 mb-6">{subheading}</p>}
                          <div className="flex justify-center gap-4 flex-wrap">
                            {showApply && (
                              <a href="#" className={`px-6 py-3 font-semibold rounded ${bgColor === 'gold' ? 'bg-csu-navy text-white' : 'bg-csu-gold text-csu-navy'}`}>
                                Apply Now
                              </a>
                            )}
                            {showRequestInfo && (
                              <a href="#" className="px-6 py-3 font-semibold rounded bg-white text-csu-navy border-2 border-white">
                                Request Information
                              </a>
                            )}
                          </div>
                          {!showApply && !showRequestInfo && (
                            <p className="opacity-70">Enable at least one button to display</p>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {module.id === 'more-info-card' && (() => {
                    const heading = moduleContent['more-info-card']?.moreInfoHeading || 'Looking for More Information?'
                    const body = moduleContent['more-info-card']?.moreInfoBody || 'Explore our website to learn more about programs, tuition, and everything CSU has to offer.'
                    const linkUrl = moduleContent['more-info-card']?.moreInfoLinkUrl || 'https://www.columbiasouthern.edu'
                    const imageUrl = moduleContent['more-info-card']?.moreInfoImageUrl || ''

                    return (
                      <div className="p-6">
                        <div className="max-w-4xl mx-auto bg-csu-lightest-gray rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
                          {imageUrl ? (
                            <div className="md:w-1/3">
                              <img
                                src={imageUrl}
                                alt="More information section image"
                                className="w-full h-48 md:h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="md:w-1/3 bg-csu-light-gray flex items-center justify-center p-8">
                              <svg className="w-16 h-16 text-csu-medium-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="md:w-2/3 p-6 flex flex-col justify-center">
                            <h3 className="text-xl font-bold text-csu-navy mb-3">{heading}</h3>
                            <p className="text-csu-dark-gray mb-4">{body}</p>
                            <a
                              href={linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-csu-navy text-white px-4 py-2 rounded font-semibold hover:bg-csu-navy/90 transition-colors self-start"
                            >
                              Learn More
                            </a>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {module.id === 'footnotes-disclaimers' && (() => {
                    const disclaimers = moduleContent['footnotes-disclaimers']?.disclaimers || ['']

                    return (
                      <div className="p-6 bg-csu-lightest-gray">
                        <div className="max-w-4xl mx-auto">
                          <h3 className="text-lg font-bold text-csu-navy mb-4">Important Information</h3>
                          <div className="space-y-3 text-sm text-csu-dark-gray">
                            {disclaimers.filter(d => d.trim()).map((disclaimer, index) => (
                              <p key={index} className="leading-relaxed">
                                <span className="font-semibold">{index + 1}.</span> {disclaimer}
                              </p>
                            ))}
                            {disclaimers.filter(d => d.trim()).length === 0 && (
                              <p className="text-csu-medium-gray italic">Add disclaimers or footnotes to display here.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {module.id === 'footer' && (
                    <div className="p-6 text-sm">
                      {footerStyle === 'minimal' ? (
                        /* Minimal Footer */
                        <div className="text-center">
                          <p>&copy; {new Date().getFullYear()} Columbia Southern University</p>
                          <p className="text-white/60 mt-2">
                            <a
                              href="https://www.columbiasouthern.edu/privacy-policy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-white underline"
                            >
                              Privacy Policy
                            </a>
                          </p>
                        </div>
                      ) : (
                        /* Full Footer */
                        <div>
                          <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                              <h4 className="font-bold mb-3">About CSU</h4>
                              <ul className="space-y-2 text-white/70">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Accreditation</a></li>
                                <li><a href="#" className="hover:text-white">Leadership</a></li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-bold mb-3">Programs</h4>
                              <ul className="space-y-2 text-white/70">
                                <li><a href="#" className="hover:text-white">Degrees</a></li>
                                <li><a href="#" className="hover:text-white">Certificates</a></li>
                                <li><a href="#" className="hover:text-white">Military</a></li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-bold mb-3">Resources</h4>
                              <ul className="space-y-2 text-white/70">
                                <li><a href="#" className="hover:text-white">Student Portal</a></li>
                                <li><a href="#" className="hover:text-white">Library</a></li>
                                <li><a href="#" className="hover:text-white">Career Services</a></li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-bold mb-3">Contact</h4>
                              <p className="text-white/70">21982 University Lane</p>
                              <p className="text-white/70">Orange Beach, AL 36561</p>
                              <p className="text-white/70 mt-2">1-800-977-8449</p>
                            </div>
                          </div>
                          <div className="border-t border-white/20 pt-6 text-center">
                            <p>&copy; {new Date().getFullYear()} Columbia Southern University</p>
                            <p className="text-white/60 mt-2">
                              <a
                                href="https://www.columbiasouthern.edu/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white underline"
                              >
                                Privacy Policy
                              </a>
                              {' | '}
                              <a
                                href="https://www.columbiasouthern.edu/terms-of-use"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white underline"
                              >
                                Terms of Use
                              </a>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {modules.filter(m => m.enabled).length === 0 && (
                <div className="p-8 text-center text-csu-dark-gray">
                  <p>No modules enabled. Enable modules from the left panel to see the preview.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Content Panel - Bottom (Collapsible) */}
      <div className={`border-t overflow-hidden flex-shrink-0 transition-all duration-200 ${contentPanelCollapsed ? 'h-12' : 'h-64'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-csu-light-gray'}`}>
        <div className={`p-4 ${contentPanelCollapsed ? 'overflow-hidden' : 'overflow-y-auto h-full'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-csu-near-black'}`}>
              Content Editor {selectedModuleId && `- ${modules.find(m => m.id === selectedModuleId)?.name}`}
            </h2>
            <button
              onClick={() => setContentPanelCollapsed(!contentPanelCollapsed)}
              className={`text-sm ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-csu-dark-gray hover:text-csu-near-black'}`}
              aria-label={contentPanelCollapsed ? 'Expand content panel' : 'Collapse content panel'}
            >
              {contentPanelCollapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>

          {/* No module selected */}
          {!selectedModuleId && (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-csu-dark-gray'}`}>
              Select a module from the left panel to edit its content here.
            </p>
          )}

          {/* Header (locked - no editable content) */}
          {selectedModuleId === 'header' && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-csu-light-gray/50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-csu-dark-gray'}`}>
                <strong>Header</strong> is a locked module that displays the CSU corporate header with logo, phone number, and action buttons. This module cannot be edited or disabled.
              </p>
            </div>
          )}

          {/* CSU Global Menu (optional - no editable content) */}
          {selectedModuleId === 'csu-global-menu' && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-csu-light-gray/50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-csu-dark-gray'}`}>
                <strong>CSU Global Menu</strong> displays the official CSU website navigation bar with full mega-menu functionality.
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-csu-dark-gray/80'}`}>
                The preview shows simplified navigation links. The exported HTML includes the complete CSU template with:
              </p>
              <ul className={`text-sm mt-2 list-disc list-inside ${darkMode ? 'text-gray-400' : 'text-csu-dark-gray/80'}`}>
                <li>Dropdown menus with images for each section</li>
                <li>Mobile menu toggle and responsive design</li>
                <li>Site search functionality</li>
                <li>All styling from CSU global.css</li>
              </ul>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-csu-dark-gray/80'}`}>
                Enable or disable using the checkbox in the left panel.
              </p>
            </div>
          )}

          {/* Footer (locked - no editable content) */}
          {selectedModuleId === 'footer' && (
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-csu-light-gray/50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-csu-dark-gray'}`}>
                <strong>Footer</strong> is a locked module that displays the standard CSU footer with copyright and address information. This module cannot be edited or disabled.
              </p>
            </div>
          )}

          {/* Partner Headline Form */}
          {selectedModuleId === 'partner-headline' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="headline" className="block text-sm font-medium text-csu-near-black mb-1">
                    Headline Text
                  </label>
                  <input
                    type="text"
                    id="headline"
                    value={moduleContent['partner-headline']?.headline || `${partnerName} Employees`}
                    onChange={(e) => updateModuleContent('partner-headline', { headline: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="e.g., Acme Corporation Employees"
                  />
                </div>
                <div>
                  <label htmlFor="headlineStyle" className="block text-sm font-medium text-csu-near-black mb-1">
                    Headline Style
                  </label>
                  <select
                    id="headlineStyle"
                    value={moduleContent['partner-headline']?.headlineStyle || 'centered'}
                    onChange={(e) => updateModuleContent('partner-headline', { headlineStyle: e.target.value as 'centered' | 'left-aligned' | 'with-background' })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none bg-white"
                  >
                    <option value="centered">Centered</option>
                    <option value="left-aligned">Left Aligned</option>
                    <option value="with-background">With Background</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="subheadline" className="block text-sm font-medium text-csu-near-black mb-1">
                  Subheadline Text
                </label>
                <input
                  type="text"
                  id="subheadline"
                  value={moduleContent['partner-headline']?.subheadline || 'Exclusive Education Benefits for You'}
                  onChange={(e) => updateModuleContent('partner-headline', { subheadline: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., Exclusive Education Benefits for You"
                />
              </div>
            </div>
          )}

          {/* Partner Logo Form */}
          {selectedModuleId === 'partner-logo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="logoUpload" className="block text-sm font-medium text-csu-near-black mb-1">
                    Upload Logo Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="logoUpload"
                      accept="image/png,image/jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        // Validate file type
                        const validTypes = ['image/png', 'image/jpeg']
                        if (!validTypes.includes(file.type)) {
                          updateModuleContent('partner-logo', { logoError: 'Please upload a PNG or JPG image' })
                          return
                        }

                        // Validate file size (max 5MB)
                        const maxSize = 5 * 1024 * 1024 // 5MB
                        if (file.size > maxSize) {
                          updateModuleContent('partner-logo', { logoError: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum file size is 5MB.` })
                          return
                        }

                        // Read file and validate dimensions
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const img = new Image()
                          img.onload = () => {
                            if (img.width > 500 || img.height > 500) {
                              updateModuleContent('partner-logo', {
                                logoError: `Image too large (${img.width}x${img.height}). Maximum size is 500x500px.`
                              })
                            } else {
                              updateModuleContent('partner-logo', {
                                logoUrl: event.target?.result as string,
                                logoFileName: file.name,
                                logoDimensions: `${img.width}x${img.height}px`,
                                logoError: undefined
                              })
                            }
                          }
                          img.src = event.target?.result as string
                        }
                        reader.readAsDataURL(file)
                      }}
                      className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-csu-navy file:text-white hover:file:bg-csu-navy/90"
                    />
                  </div>
                  {moduleContent['partner-logo']?.logoError && (
                    <p role="alert" className="mt-1 text-sm text-red-500">{moduleContent['partner-logo'].logoError}</p>
                  )}
                  <p className="mt-1 text-xs text-csu-medium-gray">PNG or JPG only. Max 500x500px, 5MB.</p>
                </div>
                <div>
                  <label htmlFor="logoUrlInput" className="block text-sm font-medium text-csu-near-black mb-1">
                    Or Enter Image URL
                  </label>
                  <input
                    type="url"
                    id="logoUrlInput"
                    value={moduleContent['partner-logo']?.logoUrl?.startsWith('data:') ? '' : (moduleContent['partner-logo']?.logoUrl || '')}
                    onChange={(e) => {
                      const url = e.target.value
                      const isValidUrl = !url || /^https?:\/\/.+\..+/.test(url)
                      if (url) {
                        updateModuleContent('partner-logo', {
                          logoUrl: url,
                          logoFileName: undefined,
                          logoError: undefined,
                          logoUrlError: !isValidUrl ? 'Please enter a valid URL starting with http:// or https://' : undefined
                        })
                      } else {
                        updateModuleContent('partner-logo', { logoUrl: undefined, logoUrlError: undefined })
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-1 outline-none text-sm ${
                      moduleContent['partner-logo']?.logoUrlError
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-csu-light-gray focus:border-csu-navy focus:ring-csu-navy'
                    }`}
                    placeholder="https://example.com/logo.png"
                  />
                  {moduleContent['partner-logo']?.logoUrlError && (
                    <p role="alert" className="mt-1 text-sm text-red-500">{moduleContent['partner-logo'].logoUrlError}</p>
                  )}
                  <p className="mt-1 text-xs text-csu-medium-gray">Direct link to image file</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-csu-near-black mb-1">
                    Preview
                  </label>
                  {moduleContent['partner-logo']?.logoUrl ? (
                    <div className="w-24 h-24 border border-csu-light-gray rounded-lg p-2 bg-csu-lightest-gray flex items-center justify-center">
                      <img
                        src={moduleContent['partner-logo'].logoUrl}
                        alt={moduleContent['partner-logo']?.logoAlt || 'Logo preview'}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 border border-dashed border-csu-light-gray rounded-lg flex items-center justify-center text-csu-medium-gray text-xs">
                      No image
                    </div>
                  )}
                  {moduleContent['partner-logo']?.logoFileName && (
                    <p className="mt-1 text-xs text-csu-medium-gray truncate max-w-[96px]">{moduleContent['partner-logo'].logoFileName}</p>
                  )}
                  {moduleContent['partner-logo']?.logoDimensions && (
                    <p className="text-xs text-csu-navy font-medium">{moduleContent['partner-logo'].logoDimensions}</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="logoAlt" className="block text-sm font-medium text-csu-near-black mb-1">
                  Logo Alt Text
                </label>
                <input
                  type="text"
                  id="logoAlt"
                  value={moduleContent['partner-logo']?.logoAlt || `${partnerName} Logo`}
                  onChange={(e) => updateModuleContent('partner-logo', { logoAlt: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., Acme Corporation Logo"
                />
              </div>
            </div>
          )}

          {/* Partner Benefits Card Form */}
          {selectedModuleId === 'partner-benefits-card' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="benefitsTitle" className="block text-sm font-medium text-csu-near-black mb-1">
                    Benefits Card Title
                  </label>
                  <input
                    type="text"
                    id="benefitsTitle"
                    value={moduleContent['partner-benefits-card']?.benefitsTitle || 'Your Benefits'}
                    onChange={(e) => updateModuleContent('partner-benefits-card', { benefitsTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="e.g., Your Benefits"
                  />
                </div>
                <div>
                  <label htmlFor="discountPercentage" className="block text-sm font-medium text-csu-near-black mb-1">
                    Discount Percentage
                  </label>
                  <select
                    id="discountPercentage"
                    value={moduleContent['partner-benefits-card']?.discountPercentage || '10%'}
                    onChange={(e) => updateModuleContent('partner-benefits-card', { discountPercentage: e.target.value as '10%' | '15%' | '20%' | 'custom' })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none bg-white"
                  >
                    <option value="10%">10%</option>
                    <option value="15%">15%</option>
                    <option value="20%">20%</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>
              {moduleContent['partner-benefits-card']?.discountPercentage === 'custom' && (
                <div>
                  <label htmlFor="customDiscount" className="block text-sm font-medium text-csu-near-black mb-1">
                    Custom Discount
                  </label>
                  <input
                    type="text"
                    id="customDiscount"
                    value={moduleContent['partner-benefits-card']?.customDiscount || ''}
                    onChange={(e) => updateModuleContent('partner-benefits-card', { customDiscount: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="e.g., 25% or Up to $1,000"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-csu-near-black mb-2">
                  Benefit Lines
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      type="text"
                      id={`benefit-${index}`}
                      value={(moduleContent['partner-benefits-card']?.benefits || ['Tuition Discount', 'Flexible Online Learning', 'No Application Fee', ''])[index] || ''}
                      onChange={(e) => {
                        const currentBenefits = moduleContent['partner-benefits-card']?.benefits || ['Tuition Discount', 'Flexible Online Learning', 'No Application Fee', '']
                        const newBenefits = [...currentBenefits]
                        newBenefits[index] = e.target.value
                        updateModuleContent('partner-benefits-card', { benefits: newBenefits })
                      }}
                      className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none text-sm"
                      placeholder={`Benefit ${index + 1}`}
                      aria-label={`Benefit line ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeLogo"
                  checked={moduleContent['partner-benefits-card']?.includeLogo || false}
                  onChange={(e) => updateModuleContent('partner-benefits-card', { includeLogo: e.target.checked })}
                  className="w-4 h-4 text-csu-navy border-csu-light-gray rounded focus:ring-csu-navy"
                />
                <label htmlFor="includeLogo" className="text-sm font-medium text-csu-near-black">
                  Include partner logo in benefits card
                </label>
              </div>
            </div>
          )}

          {/* Benefits Copy Form */}
          {selectedModuleId === 'benefits-copy' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="eligibilityStatement" className="block text-sm font-medium text-csu-near-black mb-1">
                  Eligibility Statement
                </label>
                <input
                  type="text"
                  id="eligibilityStatement"
                  value={moduleContent['benefits-copy']?.eligibilityStatement || 'As a valued partner, you and your eligible family members can take advantage of exclusive benefits.'}
                  onChange={(e) => updateModuleContent('benefits-copy', { eligibilityStatement: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="Enter eligibility statement..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tuitionParagraph" className="block text-sm font-medium text-csu-near-black mb-1">
                    Tuition Paragraph
                  </label>
                  <textarea
                    id="tuitionParagraph"
                    value={moduleContent['benefits-copy']?.tuitionParagraph || 'Enjoy exclusive tuition discounts at Columbia Southern University. Our affordable programs make quality education accessible to you and your family.'}
                    onChange={(e) => updateModuleContent('benefits-copy', { tuitionParagraph: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none resize-none"
                    placeholder="Enter tuition information..."
                  />
                </div>
                <div>
                  <label htmlFor="flexibilityParagraph" className="block text-sm font-medium text-csu-near-black mb-1">
                    Flexibility Paragraph
                  </label>
                  <textarea
                    id="flexibilityParagraph"
                    value={moduleContent['benefits-copy']?.flexibilityParagraph || 'Our flexible online programs are designed to fit your busy schedule. Study anytime, anywhere, at your own pace.'}
                    onChange={(e) => updateModuleContent('benefits-copy', { flexibilityParagraph: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none resize-none"
                    placeholder="Enter flexibility information..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Lead Capture Form */}
          {selectedModuleId === 'lead-capture-form' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="formTitle" className="block text-sm font-medium text-csu-near-black mb-1">
                    Form Heading
                  </label>
                  <input
                    type="text"
                    id="formTitle"
                    value={moduleContent['lead-capture-form']?.formTitle || 'Request Information'}
                    onChange={(e) => updateModuleContent('lead-capture-form', { formTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="e.g., Request Information"
                  />
                </div>
                <div>
                  <label htmlFor="submitButtonText" className="block text-sm font-medium text-csu-near-black mb-1">
                    Submit Button Text
                  </label>
                  <input
                    type="text"
                    id="submitButtonText"
                    value={moduleContent['lead-capture-form']?.submitButtonText || 'Submit'}
                    onChange={(e) => updateModuleContent('lead-capture-form', { submitButtonText: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="e.g., Submit"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-csu-near-black mb-2">
                  Form Fields
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'firstName', label: 'First Name' },
                    { id: 'lastName', label: 'Last Name' },
                    { id: 'email', label: 'Email' },
                    { id: 'phone', label: 'Phone' },
                    { id: 'program', label: 'Program Interest' },
                    { id: 'comments', label: 'Comments' },
                  ].map(field => (
                    <label key={field.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        id={`field-${field.id}`}
                        checked={moduleContent['lead-capture-form']?.formFieldToggles?.[field.id as keyof typeof moduleContent['lead-capture-form']['formFieldToggles']] ?? true}
                        onChange={(e) => {
                          const currentToggles = moduleContent['lead-capture-form']?.formFieldToggles || {}
                          updateModuleContent('lead-capture-form', {
                            formFieldToggles: {
                              ...currentToggles,
                              [field.id]: e.target.checked
                            }
                          })
                        }}
                        className="w-4 h-4 text-csu-navy border-csu-light-gray rounded focus:ring-csu-navy"
                      />
                      <span className="text-sm text-csu-dark-gray">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Hidden Fields Info */}
              <div className="mt-4 pt-4 border-t border-csu-light-gray">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-csu-medium-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <span className="text-sm font-medium text-csu-near-black">Hidden Fields (Auto-Captured)</span>
                </div>
                <p className="text-xs text-csu-medium-gray mb-2">
                  The following data will be captured invisibly with each form submission:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Partner ID', value: partnerName || 'Partner Name' },
                    { name: 'Source URL', value: 'Current page URL' },
                    { name: 'UTM Parameters', value: 'Campaign tracking data' },
                    { name: 'Submission Time', value: 'Date & timestamp' },
                  ].map((field, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs bg-csu-lightest-gray px-2 py-1 rounded">
                      <span className="text-csu-dark-gray font-medium">{field.name}:</span>
                      <span className="text-csu-medium-gray truncate">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FAQ Accordion Form */}
          {selectedModuleId === 'faq-accordion' && (() => {
            const defaultFaqs = [
              { question: 'How do I apply?', answer: 'Visit our application page and complete the online form. Our admissions team will guide you through the process.' },
              { question: 'What programs are available?', answer: 'CSU offers over 50 online degree programs including business, criminal justice, fire science, and more.' },
              { question: 'How much is tuition?', answer: 'Tuition varies by program. Partner employees receive exclusive discounts on all programs.' },
              { question: 'Is financial aid available?', answer: 'Yes! CSU offers various financial aid options including federal aid, military benefits, and payment plans.' }
            ]
            const currentFaqs = moduleContent['faq-accordion']?.faqs || defaultFaqs
            const maxFaqs = 6
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-csu-near-black">FAQ Questions & Answers</div>
                  {currentFaqs.length < maxFaqs && (
                    <button
                      onClick={() => {
                        const updatedFaqs = [...currentFaqs, { question: '', answer: '' }]
                        updateModuleContent('faq-accordion', { faqs: updatedFaqs })
                      }}
                      className="px-3 py-1 text-sm bg-csu-navy text-white rounded hover:bg-csu-navy/90 transition-colors"
                    >
                      Add FAQ
                    </button>
                  )}
                  {currentFaqs.length >= maxFaqs && (
                    <span className="text-xs text-csu-medium-gray">Maximum 6 FAQs</span>
                  )}
                </div>
                {currentFaqs.map((faq, index) => (
                  <div key={index} className="relative p-3 bg-csu-lightest-gray rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`faq-question-${index}`} className="block text-xs font-medium text-csu-dark-gray mb-1">
                          Question {index + 1}
                        </label>
                        <input
                          type="text"
                          id={`faq-question-${index}`}
                          value={faq.question || ''}
                          onChange={(e) => {
                            const updatedFaqs = [...currentFaqs]
                            updatedFaqs[index] = { ...updatedFaqs[index], question: e.target.value }
                            updateModuleContent('faq-accordion', { faqs: updatedFaqs })
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                          placeholder={`Question ${index + 1}`}
                        />
                      </div>
                      <div>
                        <label htmlFor={`faq-answer-${index}`} className="block text-xs font-medium text-csu-dark-gray mb-1">
                          Answer {index + 1}
                        </label>
                        <textarea
                          id={`faq-answer-${index}`}
                          value={faq.answer || ''}
                          onChange={(e) => {
                            const updatedFaqs = [...currentFaqs]
                            updatedFaqs[index] = { ...updatedFaqs[index], answer: e.target.value }
                            updateModuleContent('faq-accordion', { faqs: updatedFaqs })
                          }}
                          rows={2}
                          className="w-full px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none resize-none"
                          placeholder={`Answer ${index + 1}`}
                        />
                      </div>
                    </div>
                    {/* Delete button - only show if more than 1 FAQ exists */}
                    {currentFaqs.length > 1 && (
                      <button
                        onClick={() => {
                          const updatedFaqs = currentFaqs.filter((_, i) => i !== index)
                          updateModuleContent('faq-accordion', { faqs: updatedFaqs })
                        }}
                        className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        aria-label={`Remove FAQ ${index + 1}`}
                        title={`Remove FAQ ${index + 1}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Value Proposition Cards Form */}
          {selectedModuleId === 'value-proposition-cards' && (() => {
            const defaultProps = [
              { heading: 'Affordable', body: 'Lower tuition than traditional universities with flexible payment options.', imageUrl: '' },
              { heading: 'Flexible', body: '100% online courses designed for working adults and busy schedules.', imageUrl: '' },
              { heading: 'Supportive', body: 'Dedicated advisors and 24/7 tech support to help you succeed.', imageUrl: '' }
            ]
            const currentProps = moduleContent['value-proposition-cards']?.propositions || defaultProps
            return (
              <div className="space-y-4">
                <div className="text-sm font-medium text-csu-near-black">Value Proposition Cards (3)</div>
                <div className="grid grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="p-3 bg-csu-lightest-gray rounded-lg space-y-2">
                      <div className="text-xs font-medium text-csu-dark-gray">Card {index + 1}</div>
                      <div>
                        <label htmlFor={`prop-heading-${index}`} className="block text-xs text-csu-medium-gray mb-1">
                          Heading
                        </label>
                        <input
                          type="text"
                          id={`prop-heading-${index}`}
                          value={currentProps[index]?.heading || ''}
                          onChange={(e) => {
                            const updatedProps = [...currentProps]
                            updatedProps[index] = { ...updatedProps[index], heading: e.target.value }
                            updateModuleContent('value-proposition-cards', { propositions: updatedProps })
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                          placeholder="Heading"
                        />
                      </div>
                      <div>
                        <label htmlFor={`prop-body-${index}`} className="block text-xs text-csu-medium-gray mb-1">
                          Body
                        </label>
                        <textarea
                          id={`prop-body-${index}`}
                          value={currentProps[index]?.body || ''}
                          onChange={(e) => {
                            const updatedProps = [...currentProps]
                            updatedProps[index] = { ...updatedProps[index], body: e.target.value }
                            updateModuleContent('value-proposition-cards', { propositions: updatedProps })
                          }}
                          rows={2}
                          className="w-full px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none resize-none"
                          placeholder="Body text"
                        />
                      </div>
                      <div>
                        <label htmlFor={`prop-image-${index}`} className="block text-xs text-csu-medium-gray mb-1">
                          Image URL
                        </label>
                        <input
                          type="url"
                          id={`prop-image-${index}`}
                          value={currentProps[index]?.imageUrl || ''}
                          onChange={(e) => {
                            const updatedProps = [...currentProps]
                            updatedProps[index] = { ...updatedProps[index], imageUrl: e.target.value }
                            updateModuleContent('value-proposition-cards', { propositions: updatedProps })
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* CSU by the Numbers Form */}
          {selectedModuleId === 'csu-by-the-numbers' && (() => {
            const defaultStats = [
              { number: '30+', label: 'Years' },
              { number: '50+', label: 'Programs' },
              { number: '30K+', label: 'Students' },
              { number: '100%', label: 'Online' },
            ]
            const currentStats = moduleContent['csu-by-the-numbers']?.stats || defaultStats
            return (
              <div className="space-y-4">
                <div className="text-sm font-medium text-csu-near-black">Statistics (4)</div>
                <div className="grid grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="p-3 bg-csu-lightest-gray rounded-lg space-y-2">
                      <div className="text-xs font-medium text-csu-dark-gray">Stat {index + 1}</div>
                      <div>
                        <label htmlFor={`stat-number-${index}`} className="block text-xs text-csu-medium-gray mb-1">
                          Number
                        </label>
                        <input
                          type="text"
                          id={`stat-number-${index}`}
                          value={currentStats[index]?.number || ''}
                          onChange={(e) => {
                            const updatedStats = [...currentStats]
                            updatedStats[index] = { ...updatedStats[index], number: e.target.value }
                            updateModuleContent('csu-by-the-numbers', { stats: updatedStats })
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                          placeholder="e.g., 30+"
                        />
                      </div>
                      <div>
                        <label htmlFor={`stat-label-${index}`} className="block text-xs text-csu-medium-gray mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          id={`stat-label-${index}`}
                          value={currentStats[index]?.label || ''}
                          onChange={(e) => {
                            const updatedStats = [...currentStats]
                            updatedStats[index] = { ...updatedStats[index], label: e.target.value }
                            updateModuleContent('csu-by-the-numbers', { stats: updatedStats })
                          }}
                          className="w-full px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                          placeholder="e.g., Years"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Accreditations Section Form */}
          {selectedModuleId === 'accreditations-section' && (() => {
            const accreds = moduleContent['accreditations-section']?.accreditations || {
              sacscoc: true, qualityMatters: true, acbsp: true, blackboard: false, military: false
            }
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="accreditationHeading" className="block text-sm font-medium text-csu-near-black mb-1">
                      Section Heading
                    </label>
                    <input
                      type="text"
                      id="accreditationHeading"
                      value={moduleContent['accreditations-section']?.accreditationHeading || 'Accreditations'}
                      onChange={(e) => updateModuleContent('accreditations-section', { accreditationHeading: e.target.value })}
                      className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                      placeholder="e.g., Accreditations"
                    />
                  </div>
                  <div>
                    <label htmlFor="accreditationSubheading" className="block text-sm font-medium text-csu-near-black mb-1">
                      Section Subheading
                    </label>
                    <input
                      type="text"
                      id="accreditationSubheading"
                      value={moduleContent['accreditations-section']?.accreditationSubheading || ''}
                      onChange={(e) => updateModuleContent('accreditations-section', { accreditationSubheading: e.target.value })}
                      className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                      placeholder="Optional subheading..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-csu-near-black mb-2">
                    Show Accreditations
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { id: 'sacscoc', label: 'SACSCOC' },
                      { id: 'qualityMatters', label: 'Quality Matters' },
                      { id: 'acbsp', label: 'ACBSP' },
                      { id: 'blackboard', label: 'Blackboard' },
                      { id: 'military', label: 'Military' },
                    ].map(acc => (
                      <label key={acc.id} className="flex items-center gap-2 cursor-pointer bg-csu-lightest-gray rounded p-2">
                        <input
                          type="checkbox"
                          id={`acc-${acc.id}`}
                          checked={accreds[acc.id as keyof typeof accreds] ?? false}
                          onChange={(e) => {
                            updateModuleContent('accreditations-section', {
                              accreditations: {
                                ...accreds,
                                [acc.id]: e.target.checked
                              }
                            })
                          }}
                          className="w-4 h-4 text-csu-navy border-csu-light-gray rounded focus:ring-csu-navy"
                        />
                        <span className="text-xs text-csu-dark-gray">{acc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Tuition Comparison Banner Form */}
          {selectedModuleId === 'tuition-comparison-banner' && (() => {
            const bullets = moduleContent['tuition-comparison-banner']?.comparisonBullets || [
              'Lower tuition than national average',
              'No hidden fees',
              'Flexible payment plans'
            ]
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="comparisonTitle" className="block text-sm font-medium text-csu-near-black mb-1">
                      Heading
                    </label>
                    <input
                      type="text"
                      id="comparisonTitle"
                      value={moduleContent['tuition-comparison-banner']?.comparisonTitle || 'Compare Our Tuition'}
                      onChange={(e) => updateModuleContent('tuition-comparison-banner', { comparisonTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                      placeholder="e.g., Compare Our Tuition"
                    />
                  </div>
                  <div>
                    <label htmlFor="comparisonBody" className="block text-sm font-medium text-csu-near-black mb-1">
                      Body
                    </label>
                    <textarea
                      id="comparisonBody"
                      value={moduleContent['tuition-comparison-banner']?.comparisonBody || 'See how CSU stacks up against other universities'}
                      onChange={(e) => updateModuleContent('tuition-comparison-banner', { comparisonBody: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none resize-none"
                      placeholder="Body text..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-csu-near-black mb-2">
                    Bullet Points (3)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((index) => (
                      <input
                        key={index}
                        type="text"
                        id={`bullet-${index}`}
                        value={bullets[index] || ''}
                        onChange={(e) => {
                          const updatedBullets = [...bullets]
                          updatedBullets[index] = e.target.value
                          updateModuleContent('tuition-comparison-banner', { comparisonBullets: updatedBullets })
                        }}
                        className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                        placeholder={`Bullet ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="comparisonShowCTA"
                      checked={moduleContent['tuition-comparison-banner']?.comparisonShowCTA ?? true}
                      onChange={(e) => updateModuleContent('tuition-comparison-banner', { comparisonShowCTA: e.target.checked })}
                      className="w-4 h-4 text-csu-navy border-csu-light-gray rounded focus:ring-csu-navy"
                    />
                    <span className="text-sm text-csu-dark-gray">Show CTA Button</span>
                  </label>
                </div>
              </div>
            )
          })()}

          {/* Degree Programs List Form */}
          {selectedModuleId === 'degree-programs-list' && (() => {
            const defaultPrograms = [
              { name: 'Bachelor of Science in Business Administration', url: 'https://www.columbiasouthern.edu/degrees/bachelors/business-administration' },
              { name: 'Bachelor of Science in Criminal Justice', url: 'https://www.columbiasouthern.edu/degrees/bachelors/criminal-justice' },
              { name: 'Bachelor of Science in Fire Science', url: 'https://www.columbiasouthern.edu/degrees/bachelors/fire-science' },
            ]
            const currentPrograms = moduleContent['degree-programs-list']?.programs || defaultPrograms
            const maxPrograms = 8
            return (
              <div className="space-y-4">
                <div>
                  <label htmlFor="programsHeading" className="block text-sm font-medium text-csu-near-black mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    id="programsHeading"
                    value={moduleContent['degree-programs-list']?.programsHeading || 'Popular Degree Programs'}
                    onChange={(e) => updateModuleContent('degree-programs-list', { programsHeading: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="e.g., Popular Degree Programs"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-csu-near-black">
                      Programs ({currentPrograms.length}/{maxPrograms})
                    </label>
                    {currentPrograms.length < maxPrograms && (
                      <button
                        onClick={() => {
                          const updatedPrograms = [...currentPrograms, { name: '', url: '' }]
                          updateModuleContent('degree-programs-list', { programs: updatedPrograms })
                        }}
                        className="px-3 py-1 text-sm bg-csu-navy text-white rounded hover:bg-csu-navy/90 transition-colors"
                      >
                        Add Program
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentPrograms.map((program, index) => (
                      <div key={index} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center p-2 bg-csu-lightest-gray rounded">
                        <input
                          type="text"
                          value={program.name || ''}
                          onChange={(e) => {
                            const updatedPrograms = [...currentPrograms]
                            updatedPrograms[index] = { ...updatedPrograms[index], name: e.target.value }
                            updateModuleContent('degree-programs-list', { programs: updatedPrograms })
                          }}
                          className="px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                          placeholder="Program Name"
                        />
                        <input
                          type="url"
                          value={program.url || ''}
                          onChange={(e) => {
                            const updatedPrograms = [...currentPrograms]
                            updatedPrograms[index] = { ...updatedPrograms[index], url: e.target.value }
                            updateModuleContent('degree-programs-list', { programs: updatedPrograms })
                          }}
                          className="px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                          placeholder="URL"
                        />
                        <button
                          onClick={() => {
                            const updatedPrograms = currentPrograms.filter((_, i) => i !== index)
                            updateModuleContent('degree-programs-list', { programs: updatedPrograms })
                          }}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {selectedModuleId === 'scholarship-highlight' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="scholarshipName" className="block text-sm font-medium text-csu-near-black mb-1">
                  Scholarship Name
                </label>
                <input
                  type="text"
                  id="scholarshipName"
                  value={moduleContent['scholarship-highlight']?.scholarshipName || ''}
                  onChange={(e) => updateModuleContent('scholarship-highlight', { scholarshipName: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., Partner Scholarship Program"
                />
              </div>
              <div>
                <label htmlFor="scholarshipDescription" className="block text-sm font-medium text-csu-near-black mb-1">
                  Description
                </label>
                <textarea
                  id="scholarshipDescription"
                  value={moduleContent['scholarship-highlight']?.scholarshipDescription || ''}
                  onChange={(e) => updateModuleContent('scholarship-highlight', { scholarshipDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none resize-none"
                  rows={3}
                  placeholder="Describe the scholarship opportunity..."
                />
              </div>
              <div>
                <label htmlFor="scholarshipEligibilityUrl" className="block text-sm font-medium text-csu-near-black mb-1">
                  Eligibility URL
                </label>
                <input
                  type="url"
                  id="scholarshipEligibilityUrl"
                  value={moduleContent['scholarship-highlight']?.scholarshipEligibilityUrl || ''}
                  onChange={(e) => updateModuleContent('scholarship-highlight', { scholarshipEligibilityUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., https://www.columbiasouthern.edu/tuition-financing/scholarships"
                />
              </div>
              <div>
                <label htmlFor="scholarshipCtaText" className="block text-sm font-medium text-csu-near-black mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  id="scholarshipCtaText"
                  value={moduleContent['scholarship-highlight']?.scholarshipCtaText || ''}
                  onChange={(e) => updateModuleContent('scholarship-highlight', { scholarshipCtaText: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., Apply for Scholarship"
                />
              </div>
            </div>
          )}

          {selectedModuleId === 'video-testimonial' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-csu-near-black mb-1">
                  YouTube URL
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  value={moduleContent['video-testimonial']?.videoUrl || ''}
                  onChange={(e) => {
                    const url = e.target.value
                    const isValidYouTube = !url ||
                      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[\w-]+/.test(url)
                    updateModuleContent('video-testimonial', {
                      videoUrl: url,
                      videoUrlError: url && !isValidYouTube ? 'Please enter a valid YouTube URL (youtube.com or youtu.be)' : undefined
                    })
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-1 outline-none ${
                    moduleContent['video-testimonial']?.videoUrlError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-csu-light-gray focus:border-csu-navy focus:ring-csu-navy'
                  }`}
                  placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                />
                {moduleContent['video-testimonial']?.videoUrlError && (
                  <p role="alert" className="mt-1 text-sm text-red-500">{moduleContent['video-testimonial'].videoUrlError}</p>
                )}
                <p className="text-xs text-csu-medium-gray mt-1">Supports youtube.com and youtu.be URLs</p>
              </div>
              <div>
                <label htmlFor="videoTitle" className="block text-sm font-medium text-csu-near-black mb-1">
                  Video Title (for accessibility)
                </label>
                <input
                  type="text"
                  id="videoTitle"
                  value={moduleContent['video-testimonial']?.videoTitle || ''}
                  onChange={(e) => updateModuleContent('video-testimonial', { videoTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., Student Testimonial - John Smith"
                />
              </div>
              <div>
                <label htmlFor="videoCaption" className="block text-sm font-medium text-csu-near-black mb-1">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  id="videoCaption"
                  value={moduleContent['video-testimonial']?.videoCaption || ''}
                  onChange={(e) => updateModuleContent('video-testimonial', { videoCaption: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., Hear from our graduates about their experience"
                />
              </div>
            </div>
          )}

          {selectedModuleId === 'hero-banner' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="heroBackgroundUrl" className="block text-sm font-medium text-csu-near-black mb-1">
                  Background Image URL
                </label>
                <input
                  type="url"
                  id="heroBackgroundUrl"
                  value={moduleContent['hero-banner']?.heroBackgroundUrl || ''}
                  onChange={(e) => updateModuleContent('hero-banner', { heroBackgroundUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., https://example.com/hero-image.jpg"
                />
                <p className="text-xs text-csu-medium-gray mt-1">Use a high-resolution image (recommended: 1920x600px or larger)</p>
              </div>
              <div>
                <label htmlFor="heroOverlayOpacity" className="block text-sm font-medium text-csu-near-black mb-1">
                  Overlay Opacity: {moduleContent['hero-banner']?.heroOverlayOpacity ?? 50}%
                </label>
                <input
                  type="range"
                  id="heroOverlayOpacity"
                  min="0"
                  max="100"
                  value={moduleContent['hero-banner']?.heroOverlayOpacity ?? 50}
                  onChange={(e) => updateModuleContent('hero-banner', { heroOverlayOpacity: parseInt(e.target.value) })}
                  className="w-full h-2 bg-csu-light-gray rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-csu-medium-gray mt-1">
                  <span>0% (No overlay)</span>
                  <span>100% (Full overlay)</span>
                </div>
              </div>
              <div>
                <label htmlFor="heroHeadline" className="block text-sm font-medium text-csu-near-black mb-1">
                  Headline (optional)
                </label>
                <input
                  type="text"
                  id="heroHeadline"
                  value={moduleContent['hero-banner']?.heroHeadline || ''}
                  onChange={(e) => updateModuleContent('hero-banner', { heroHeadline: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., Your Future Starts Here"
                />
              </div>
              <div>
                <label htmlFor="heroSubheadline" className="block text-sm font-medium text-csu-near-black mb-1">
                  Subheadline (optional)
                </label>
                <input
                  type="text"
                  id="heroSubheadline"
                  value={moduleContent['hero-banner']?.heroSubheadline || ''}
                  onChange={(e) => updateModuleContent('hero-banner', { heroSubheadline: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., Take the next step in your education journey"
                />
              </div>
            </div>
          )}

          {selectedModuleId === 'secondary-cta-banner' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="secondaryCtaHeading" className="block text-sm font-medium text-csu-near-black mb-1">
                  Heading
                </label>
                <input
                  type="text"
                  id="secondaryCtaHeading"
                  value={moduleContent['secondary-cta-banner']?.secondaryCtaHeading || ''}
                  onChange={(e) => updateModuleContent('secondary-cta-banner', { secondaryCtaHeading: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., Ready to Get Started?"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-csu-near-black">Buttons to Display</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moduleContent['secondary-cta-banner']?.secondaryCtaShowApply ?? true}
                      onChange={(e) => updateModuleContent('secondary-cta-banner', { secondaryCtaShowApply: e.target.checked })}
                      className="w-4 h-4 text-csu-navy border-csu-light-gray rounded focus:ring-csu-navy"
                    />
                    <span className="text-sm text-csu-near-black">Apply Now Button</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moduleContent['secondary-cta-banner']?.secondaryCtaShowRequestInfo ?? true}
                      onChange={(e) => updateModuleContent('secondary-cta-banner', { secondaryCtaShowRequestInfo: e.target.checked })}
                      className="w-4 h-4 text-csu-navy border-csu-light-gray rounded focus:ring-csu-navy"
                    />
                    <span className="text-sm text-csu-near-black">Request Info Button</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {selectedModuleId === 'more-info-card' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="moreInfoHeading" className="block text-sm font-medium text-csu-near-black mb-1">
                  Heading
                </label>
                <input
                  type="text"
                  id="moreInfoHeading"
                  value={moduleContent['more-info-card']?.moreInfoHeading || ''}
                  onChange={(e) => updateModuleContent('more-info-card', { moreInfoHeading: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., Looking for More Information?"
                />
              </div>
              <div>
                <label htmlFor="moreInfoBody" className="block text-sm font-medium text-csu-near-black mb-1">
                  Body Text
                </label>
                <textarea
                  id="moreInfoBody"
                  value={moduleContent['more-info-card']?.moreInfoBody || ''}
                  onChange={(e) => updateModuleContent('more-info-card', { moreInfoBody: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none resize-none"
                  rows={3}
                  placeholder="Describe what visitors will find..."
                />
              </div>
              <div>
                <label htmlFor="moreInfoLinkUrl" className="block text-sm font-medium text-csu-near-black mb-1">
                  Link URL
                </label>
                <input
                  type="url"
                  id="moreInfoLinkUrl"
                  value={moduleContent['more-info-card']?.moreInfoLinkUrl || ''}
                  onChange={(e) => updateModuleContent('more-info-card', { moreInfoLinkUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., https://www.columbiasouthern.edu"
                />
              </div>
              <div>
                <label htmlFor="moreInfoImageUrl" className="block text-sm font-medium text-csu-near-black mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  id="moreInfoImageUrl"
                  value={moduleContent['more-info-card']?.moreInfoImageUrl || ''}
                  onChange={(e) => updateModuleContent('more-info-card', { moreInfoImageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., https://example.com/image.jpg"
                />
                <p className="text-xs text-csu-medium-gray mt-1">Leave empty to show a placeholder image</p>
              </div>
            </div>
          )}

          {selectedModuleId === 'footnotes-disclaimers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-csu-near-black">
                  Disclaimers/Footnotes
                </label>
                {(moduleContent['footnotes-disclaimers']?.disclaimers?.length || 1) < 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      const current = moduleContent['footnotes-disclaimers']?.disclaimers || ['']
                      updateModuleContent('footnotes-disclaimers', {
                        disclaimers: [...current, '']
                      })
                    }}
                    className="text-sm text-csu-navy hover:text-csu-gold font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Disclaimer
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {(moduleContent['footnotes-disclaimers']?.disclaimers || ['']).map((disclaimer, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-sm text-csu-medium-gray pt-2">{index + 1}.</span>
                    <div className="flex-1">
                      <textarea
                        id={`disclaimer-${index}`}
                        value={disclaimer}
                        onChange={(e) => {
                          const current = moduleContent['footnotes-disclaimers']?.disclaimers || ['']
                          const updated = [...current]
                          updated[index] = e.target.value
                          updateModuleContent('footnotes-disclaimers', { disclaimers: updated })
                        }}
                        className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none resize-none"
                        rows={2}
                        placeholder={`Disclaimer ${index + 1}...`}
                      />
                    </div>
                    {(moduleContent['footnotes-disclaimers']?.disclaimers?.length || 1) > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const current = moduleContent['footnotes-disclaimers']?.disclaimers || ['']
                          const updated = current.filter((_, i) => i !== index)
                          updateModuleContent('footnotes-disclaimers', { disclaimers: updated })
                        }}
                        className="text-csu-medium-gray hover:text-red-500 pt-2"
                        title="Remove disclaimer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-csu-medium-gray">Add up to 6 disclaimers or footnotes (max 6)</p>
            </div>
          )}

          {/* Welcome Bar Form */}
          {selectedModuleId === 'welcome-bar' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="welcomeGreeting" className="block text-sm font-medium text-csu-near-black mb-1">
                  Greeting Text
                </label>
                <input
                  type="text"
                  id="welcomeGreeting"
                  value={moduleContent['welcome-bar']?.welcomeGreeting || `Welcome, ${partnerName || 'Partner'} Employees!`}
                  onChange={(e) => updateModuleContent('welcome-bar', { welcomeGreeting: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="e.g., Welcome, Partner Employees!"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="welcomeCtaText" className="block text-sm font-medium text-csu-near-black mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    id="welcomeCtaText"
                    value={moduleContent['welcome-bar']?.welcomeCtaText || 'Get Started'}
                    onChange={(e) => updateModuleContent('welcome-bar', { welcomeCtaText: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="e.g., Get Started"
                  />
                </div>
                <div>
                  <label htmlFor="welcomeCtaUrl" className="block text-sm font-medium text-csu-near-black mb-1">
                    CTA Button URL
                  </label>
                  <input
                    type="text"
                    id="welcomeCtaUrl"
                    value={moduleContent['welcome-bar']?.welcomeCtaUrl || '#request-info'}
                    onChange={(e) => updateModuleContent('welcome-bar', { welcomeCtaUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="e.g., #request-info"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stats Banner Form */}
          {selectedModuleId === 'stats-banner' && (() => {
            const defaultStats = [
              { value: '20%', label: 'Discount' },
              { value: '50+', label: 'Programs' },
              { value: '$0', label: 'Textbooks' }
            ]
            const currentStats = moduleContent['stats-banner']?.statsBannerStats || defaultStats

            return (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-csu-near-black mb-2">Display Style</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="statsBannerStyle"
                        value="horizontal"
                        checked={(moduleContent['stats-banner']?.statsBannerStyle || 'horizontal') === 'horizontal'}
                        onChange={() => updateModuleContent('stats-banner', { statsBannerStyle: 'horizontal' })}
                        className="text-csu-navy focus:ring-csu-navy"
                      />
                      <span className="text-sm text-csu-dark-gray">Horizontal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="statsBannerStyle"
                        value="cards"
                        checked={moduleContent['stats-banner']?.statsBannerStyle === 'cards'}
                        onChange={() => updateModuleContent('stats-banner', { statsBannerStyle: 'cards' })}
                        className="text-csu-navy focus:ring-csu-navy"
                      />
                      <span className="text-sm text-csu-dark-gray">Cards</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-csu-near-black mb-2">Statistics (3)</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="p-3 bg-csu-lightest-gray rounded-lg space-y-2">
                        <div>
                          <label className="block text-xs text-csu-medium-gray mb-1">Value</label>
                          <input
                            type="text"
                            value={currentStats[index]?.value || ''}
                            onChange={(e) => {
                              const updated = [...currentStats]
                              updated[index] = { ...updated[index], value: e.target.value }
                              updateModuleContent('stats-banner', { statsBannerStats: updated })
                            }}
                            className="w-full px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy outline-none"
                            placeholder="e.g., 20%"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-csu-medium-gray mb-1">Label</label>
                          <input
                            type="text"
                            value={currentStats[index]?.label || ''}
                            onChange={(e) => {
                              const updated = [...currentStats]
                              updated[index] = { ...updated[index], label: e.target.value }
                              updateModuleContent('stats-banner', { statsBannerStats: updated })
                            }}
                            className="w-full px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy outline-none"
                            placeholder="e.g., Discount"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Tiered Pricing Display Form */}
          {selectedModuleId === 'tiered-pricing-display' && (() => {
            const defaultTiers = [
              { level: 'Undergraduate', discount: '10%', originalPrice: '' },
              { level: 'Graduate', discount: '15%', originalPrice: '' },
              { level: 'Doctoral', discount: '20%', originalPrice: '' }
            ]
            const currentTiers = moduleContent['tiered-pricing-display']?.tieredPricingTiers || defaultTiers

            return (
              <div className="space-y-4">
                <div>
                  <label htmlFor="tieredPricingHeading" className="block text-sm font-medium text-csu-near-black mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    id="tieredPricingHeading"
                    value={moduleContent['tiered-pricing-display']?.tieredPricingHeading || 'Tuition Discounts by Degree Level'}
                    onChange={(e) => updateModuleContent('tiered-pricing-display', { tieredPricingHeading: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-csu-near-black mb-2">Pricing Tiers</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="p-3 bg-csu-lightest-gray rounded-lg space-y-2">
                        <div>
                          <label className="block text-xs text-csu-medium-gray mb-1">Level</label>
                          <input
                            type="text"
                            value={currentTiers[index]?.level || ''}
                            onChange={(e) => {
                              const updated = [...currentTiers]
                              updated[index] = { ...updated[index], level: e.target.value }
                              updateModuleContent('tiered-pricing-display', { tieredPricingTiers: updated })
                            }}
                            className="w-full px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy outline-none"
                            placeholder="e.g., Undergraduate"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-csu-medium-gray mb-1">Discount</label>
                          <input
                            type="text"
                            value={currentTiers[index]?.discount || ''}
                            onChange={(e) => {
                              const updated = [...currentTiers]
                              updated[index] = { ...updated[index], discount: e.target.value }
                              updateModuleContent('tiered-pricing-display', { tieredPricingTiers: updated })
                            }}
                            className="w-full px-2 py-1.5 text-sm border border-csu-light-gray rounded focus:border-csu-navy outline-none"
                            placeholder="e.g., 10%"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="tieredPricingFootnote" className="block text-sm font-medium text-csu-near-black mb-1">
                    Footnote (optional)
                  </label>
                  <input
                    type="text"
                    id="tieredPricingFootnote"
                    value={moduleContent['tiered-pricing-display']?.tieredPricingFootnote || ''}
                    onChange={(e) => updateModuleContent('tiered-pricing-display', { tieredPricingFootnote: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="e.g., *Discounts applied to standard tuition rates"
                  />
                </div>
              </div>
            )
          })()}

          {/* Why Choose CSU Form */}
          {selectedModuleId === 'why-choose-csu' && (() => {
            const defaultBenefits = [
              '100% Online - Learn from anywhere',
              'Regionally Accredited',
              'Affordable Tuition',
              'Flexible Scheduling',
              'No Application Fee',
              'Military-Friendly'
            ]
            const currentBenefits = moduleContent['why-choose-csu']?.whyChooseBenefits || defaultBenefits

            return (
              <div className="space-y-4">
                <div>
                  <label htmlFor="whyChooseHeading" className="block text-sm font-medium text-csu-near-black mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    id="whyChooseHeading"
                    value={moduleContent['why-choose-csu']?.whyChooseHeading || 'Why Choose CSU?'}
                    onChange={(e) => updateModuleContent('why-choose-csu', { whyChooseHeading: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-csu-near-black">Benefits List</label>
                  {currentBenefits.length < 8 && (
                    <button
                      type="button"
                      onClick={() => {
                        updateModuleContent('why-choose-csu', {
                          whyChooseBenefits: [...currentBenefits, '']
                        })
                      }}
                      className="text-sm text-csu-navy hover:text-csu-gold font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Benefit
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {currentBenefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => {
                          const updated = [...currentBenefits]
                          updated[index] = e.target.value
                          updateModuleContent('why-choose-csu', { whyChooseBenefits: updated })
                        }}
                        className="flex-1 px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                        placeholder={`Benefit ${index + 1}`}
                      />
                      {currentBenefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = currentBenefits.filter((_, i) => i !== index)
                            updateModuleContent('why-choose-csu', { whyChooseBenefits: updated })
                          }}
                          className="text-csu-medium-gray hover:text-red-500"
                          title="Remove benefit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* CTA Buttons Only Form */}
          {selectedModuleId === 'cta-buttons-only' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moduleContent['cta-buttons-only']?.ctaShowApply ?? true}
                      onChange={(e) => updateModuleContent('cta-buttons-only', { ctaShowApply: e.target.checked })}
                      className="w-4 h-4 text-csu-navy rounded focus:ring-csu-navy"
                    />
                    <span className="text-sm font-medium text-csu-near-black">Show Apply Button</span>
                  </label>
                  <input
                    type="text"
                    value={moduleContent['cta-buttons-only']?.ctaApplyText || 'Apply Now'}
                    onChange={(e) => updateModuleContent('cta-buttons-only', { ctaApplyText: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="Apply button text"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moduleContent['cta-buttons-only']?.ctaShowRequestInfo ?? true}
                      onChange={(e) => updateModuleContent('cta-buttons-only', { ctaShowRequestInfo: e.target.checked })}
                      className="w-4 h-4 text-csu-navy rounded focus:ring-csu-navy"
                    />
                    <span className="text-sm font-medium text-csu-near-black">Show Request Info Button</span>
                  </label>
                  <input
                    type="text"
                    value={moduleContent['cta-buttons-only']?.ctaRequestInfoText || 'Request Info'}
                    onChange={(e) => updateModuleContent('cta-buttons-only', { ctaRequestInfoText: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="Request info button text"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-csu-near-black mb-1">Alignment</label>
                  <select
                    value={moduleContent['cta-buttons-only']?.ctaAlignment || 'center'}
                    onChange={(e) => updateModuleContent('cta-buttons-only', { ctaAlignment: e.target.value as 'left' | 'center' | 'right' })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none bg-white"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-csu-near-black mb-1">Button Layout</label>
                  <select
                    value={moduleContent['cta-buttons-only']?.ctaStyle || 'side-by-side'}
                    onChange={(e) => updateModuleContent('cta-buttons-only', { ctaStyle: e.target.value as 'side-by-side' | 'stacked' })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none bg-white"
                  >
                    <option value="side-by-side">Side by Side</option>
                    <option value="stacked">Stacked</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info Block Form */}
          {selectedModuleId === 'contact-info-block' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="contactHeading" className="block text-sm font-medium text-csu-near-black mb-1">
                  Section Heading
                </label>
                <input
                  type="text"
                  id="contactHeading"
                  value={moduleContent['contact-info-block']?.contactHeading || 'Contact Us'}
                  onChange={(e) => updateModuleContent('contact-info-block', { contactHeading: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-csu-near-black mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={moduleContent['contact-info-block']?.contactEmail || 'info@columbiasouthern.edu'}
                    onChange={(e) => updateModuleContent('contact-info-block', { contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-csu-near-black mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    value={moduleContent['contact-info-block']?.contactPhone || '1-800-977-8449'}
                    onChange={(e) => updateModuleContent('contact-info-block', { contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={moduleContent['contact-info-block']?.contactShowLiveChat ?? true}
                    onChange={(e) => updateModuleContent('contact-info-block', { contactShowLiveChat: e.target.checked })}
                    className="w-4 h-4 text-csu-navy rounded focus:ring-csu-navy"
                  />
                  <span className="text-sm font-medium text-csu-near-black">Show Live Chat Link</span>
                </label>
              </div>
              {(moduleContent['contact-info-block']?.contactShowLiveChat ?? true) && (
                <div>
                  <label htmlFor="contactLiveChatUrl" className="block text-sm font-medium text-csu-near-black mb-1">
                    Live Chat URL
                  </label>
                  <input
                    type="url"
                    id="contactLiveChatUrl"
                    value={moduleContent['contact-info-block']?.contactLiveChatUrl || ''}
                    onChange={(e) => updateModuleContent('contact-info-block', { contactLiveChatUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Tuition Comparison Table Form */}
          {selectedModuleId === 'tuition-comparison-table' && (() => {
            const defaultRows = [
              { institution: 'Columbia Southern University', tuitionPerCredit: '$270', isCSU: true },
              { institution: 'Average Public University', tuitionPerCredit: '$390', isCSU: false },
              { institution: 'Average Private University', tuitionPerCredit: '$550', isCSU: false },
            ]
            const currentRows = moduleContent['tuition-comparison-table']?.tuitionTableRows || defaultRows

            return (
              <div className="space-y-4">
                <div>
                  <label htmlFor="tuitionTableHeading" className="block text-sm font-medium text-csu-near-black mb-1">
                    Table Heading
                  </label>
                  <input
                    type="text"
                    id="tuitionTableHeading"
                    value={moduleContent['tuition-comparison-table']?.tuitionTableHeading || 'Compare Tuition Costs'}
                    onChange={(e) => updateModuleContent('tuition-comparison-table', { tuitionTableHeading: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="tuitionTableSubheading" className="block text-sm font-medium text-csu-near-black mb-1">
                    Subheading (optional)
                  </label>
                  <input
                    type="text"
                    id="tuitionTableSubheading"
                    value={moduleContent['tuition-comparison-table']?.tuitionTableSubheading || ''}
                    onChange={(e) => updateModuleContent('tuition-comparison-table', { tuitionTableSubheading: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                    placeholder="Optional subheading text"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-csu-near-black">Table Rows</label>
                  {currentRows.length < 5 && (
                    <button
                      type="button"
                      onClick={() => {
                        updateModuleContent('tuition-comparison-table', {
                          tuitionTableRows: [...currentRows, { institution: '', tuitionPerCredit: '', isCSU: false }]
                        })
                      }}
                      className="text-sm text-csu-navy hover:text-csu-gold font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Row
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {currentRows.map((row, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={row.institution}
                        onChange={(e) => {
                          const updated = [...currentRows]
                          updated[index] = { ...updated[index], institution: e.target.value }
                          updateModuleContent('tuition-comparison-table', { tuitionTableRows: updated })
                        }}
                        className="flex-1 px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                        placeholder="Institution name"
                      />
                      <input
                        type="text"
                        value={row.tuitionPerCredit}
                        onChange={(e) => {
                          const updated = [...currentRows]
                          updated[index] = { ...updated[index], tuitionPerCredit: e.target.value }
                          updateModuleContent('tuition-comparison-table', { tuitionTableRows: updated })
                        }}
                        className="w-24 px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                        placeholder="$000"
                      />
                      <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={row.isCSU}
                          onChange={(e) => {
                            const updated = [...currentRows]
                            updated[index] = { ...updated[index], isCSU: e.target.checked }
                            updateModuleContent('tuition-comparison-table', { tuitionTableRows: updated })
                          }}
                          className="w-4 h-4 text-csu-navy rounded focus:ring-csu-navy"
                        />
                        <span className="text-xs text-csu-medium-gray">CSU</span>
                      </label>
                      {currentRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = currentRows.filter((_, i) => i !== index)
                            updateModuleContent('tuition-comparison-table', { tuitionTableRows: updated })
                          }}
                          className="text-csu-medium-gray hover:text-red-500"
                          title="Remove row"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Cost Calculator Widget Form */}
          {selectedModuleId === 'cost-calculator-widget' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="calculatorHeading" className="block text-sm font-medium text-csu-near-black mb-1">
                  Section Heading
                </label>
                <input
                  type="text"
                  id="calculatorHeading"
                  value={moduleContent['cost-calculator-widget']?.calculatorHeading || 'Calculate Your Costs'}
                  onChange={(e) => updateModuleContent('cost-calculator-widget', { calculatorHeading: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                />
              </div>
              <div>
                <label htmlFor="calculatorIframeUrl" className="block text-sm font-medium text-csu-near-black mb-1">
                  Calculator Embed URL
                </label>
                <input
                  type="url"
                  id="calculatorIframeUrl"
                  value={moduleContent['cost-calculator-widget']?.calculatorIframeUrl || ''}
                  onChange={(e) => updateModuleContent('cost-calculator-widget', { calculatorIframeUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="https://savewithcsu.com/calculator or similar"
                />
                <p className="text-xs text-csu-medium-gray mt-1">Enter the URL of the cost calculator to embed</p>
              </div>
              <div>
                <label htmlFor="calculatorHeight" className="block text-sm font-medium text-csu-near-black mb-1">
                  Widget Height (pixels)
                </label>
                <input
                  type="number"
                  id="calculatorHeight"
                  value={moduleContent['cost-calculator-widget']?.calculatorHeight || 400}
                  onChange={(e) => updateModuleContent('cost-calculator-widget', { calculatorHeight: parseInt(e.target.value) || 400 })}
                  className="w-32 px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  min={200}
                  max={800}
                />
              </div>
            </div>
          )}

          {/* Get Started Today Banner Form */}
          {selectedModuleId === 'get-started-today-banner' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="getStartedHeading" className="block text-sm font-medium text-csu-near-black mb-1">
                  Banner Heading
                </label>
                <input
                  type="text"
                  id="getStartedHeading"
                  value={moduleContent['get-started-today-banner']?.getStartedHeading || 'Get Started Today!'}
                  onChange={(e) => updateModuleContent('get-started-today-banner', { getStartedHeading: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                />
              </div>
              <div>
                <label htmlFor="getStartedSubheading" className="block text-sm font-medium text-csu-near-black mb-1">
                  Subheading (optional)
                </label>
                <input
                  type="text"
                  id="getStartedSubheading"
                  value={moduleContent['get-started-today-banner']?.getStartedSubheading || ''}
                  onChange={(e) => updateModuleContent('get-started-today-banner', { getStartedSubheading: e.target.value })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none"
                  placeholder="Optional subheading text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-csu-near-black mb-1">Background Color</label>
                <select
                  value={moduleContent['get-started-today-banner']?.getStartedBgColor || 'navy'}
                  onChange={(e) => updateModuleContent('get-started-today-banner', { getStartedBgColor: e.target.value as 'navy' | 'gold' | 'gradient' })}
                  className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:border-csu-navy focus:ring-1 focus:ring-csu-navy outline-none bg-white"
                >
                  <option value="navy">Navy Blue</option>
                  <option value="gold">Gold</option>
                  <option value="gradient">Navy to Gold Gradient</option>
                </select>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={moduleContent['get-started-today-banner']?.getStartedShowApply ?? true}
                    onChange={(e) => updateModuleContent('get-started-today-banner', { getStartedShowApply: e.target.checked })}
                    className="w-4 h-4 text-csu-navy rounded focus:ring-csu-navy"
                  />
                  <span className="text-sm font-medium text-csu-near-black">Show Apply Button</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={moduleContent['get-started-today-banner']?.getStartedShowRequestInfo ?? true}
                    onChange={(e) => updateModuleContent('get-started-today-banner', { getStartedShowRequestInfo: e.target.checked })}
                    className="w-4 h-4 text-csu-navy rounded focus:ring-csu-navy"
                  />
                  <span className="text-sm font-medium text-csu-near-black">Show Request Info Button</span>
                </label>
              </div>
            </div>
          )}

          {/* Other modules placeholder */}
          {selectedModuleId && !['partner-headline', 'partner-logo', 'partner-benefits-card', 'benefits-copy', 'lead-capture-form', 'faq-accordion', 'value-proposition-cards', 'csu-by-the-numbers', 'accreditations-section', 'tuition-comparison-banner', 'degree-programs-list', 'scholarship-highlight', 'video-testimonial', 'hero-banner', 'secondary-cta-banner', 'more-info-card', 'footnotes-disclaimers', 'welcome-bar', 'stats-banner', 'tiered-pricing-display', 'why-choose-csu', 'cta-buttons-only', 'contact-info-block', 'tuition-comparison-table', 'cost-calculator-widget', 'get-started-today-banner'].includes(selectedModuleId) && (
            <p className="text-sm text-csu-medium-gray">
              Content editing for this module is coming soon.
            </p>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="settings-title"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 id="settings-title" className="text-xl font-bold text-csu-near-black">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-csu-dark-gray hover:text-csu-near-black"
                  aria-label="Close settings"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Style */}
                <div>
                  <label className="block text-sm font-medium text-csu-near-black mb-2">
                    Header Style
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="headerStyle"
                        value="minimal"
                        checked={headerStyle === 'minimal'}
                        onChange={() => setHeaderStyle('minimal')}
                        className="text-csu-navy focus:ring-csu-navy"
                      />
                      <span className="text-sm text-csu-dark-gray">Minimal (Logo + CTA)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="headerStyle"
                        value="full"
                        checked={headerStyle === 'full'}
                        onChange={() => setHeaderStyle('full')}
                        className="text-csu-navy focus:ring-csu-navy"
                      />
                      <span className="text-sm text-csu-dark-gray">Full Navigation</span>
                    </label>
                  </div>
                </div>

                {/* Footer Style */}
                <div>
                  <label className="block text-sm font-medium text-csu-near-black mb-2">
                    Footer Style
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="footerStyle"
                        value="minimal"
                        checked={footerStyle === 'minimal'}
                        onChange={() => setFooterStyle('minimal')}
                        className="text-csu-navy focus:ring-csu-navy"
                      />
                      <span className="text-sm text-csu-dark-gray">Minimal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="footerStyle"
                        value="full"
                        checked={footerStyle === 'full'}
                        onChange={() => setFooterStyle('full')}
                        className="text-csu-navy focus:ring-csu-navy"
                      />
                      <span className="text-sm text-csu-dark-gray">Full</span>
                    </label>
                  </div>
                </div>

                {/* Auto-save Toggle */}
                <div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="block text-sm font-medium text-csu-near-black">Auto-save</span>
                      <span className="block text-xs text-csu-medium-gray mt-0.5">
                        Automatically save your work to browser storage
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={autoSaveEnabled}
                        onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-csu-navy/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-csu-navy"></div>
                    </div>
                  </label>
                </div>

                {/* Dark Mode Toggle */}
                <div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="block text-sm font-medium text-csu-near-black">Dark Mode</span>
                      <span className="block text-xs text-csu-medium-gray mt-0.5">
                        Switch builder interface to dark theme
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={(e) => setDarkMode(e.target.checked)}
                        className="sr-only peer"
                        aria-label="Toggle dark mode"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-csu-navy/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-csu-navy"></div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-csu-navy text-white rounded-lg font-medium hover:bg-csu-navy/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Draft Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowClearConfirm(false)}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="clear-confirm-title"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 id="clear-confirm-title" className="text-lg font-bold text-csu-near-black">Clear All Work?</h2>
                  <p className="text-sm text-csu-dark-gray mt-1">
                    This will delete all your unsaved changes and return to the start screen.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 text-csu-dark-gray border border-csu-light-gray rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearDraft}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Clear &amp; Start Over
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal with Requester Information */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowExportModal(false)}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="export-title"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 id="export-title" className="text-xl font-bold text-csu-near-black">Export Landing Page</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-csu-dark-gray hover:text-csu-near-black"
                  aria-label="Close export modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-csu-dark-gray mb-6">
                Please provide your information before exporting. This helps us track and manage landing page requests.
              </p>

              <div className="space-y-4">
                {/* First Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="export-firstName" className="block text-sm font-medium text-csu-near-black mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="export-firstName"
                      type="text"
                      value={exportRequester.firstName}
                      onChange={(e) => setExportRequester({ ...exportRequester, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-csu-navy/20 focus:border-csu-navy"
                      placeholder="Enter first name"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="export-lastName" className="block text-sm font-medium text-csu-near-black mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="export-lastName"
                      type="text"
                      value={exportRequester.lastName}
                      onChange={(e) => setExportRequester({ ...exportRequester, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-csu-navy/20 focus:border-csu-navy"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="export-email" className="block text-sm font-medium text-csu-near-black mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="export-email"
                    type="email"
                    value={exportRequester.email}
                    onChange={(e) => setExportRequester({ ...exportRequester, email: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-csu-navy/20 focus:border-csu-navy"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {/* Date Needed */}
                <div>
                  <label htmlFor="export-dateNeeded" className="block text-sm font-medium text-csu-near-black mb-1">
                    Date Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="export-dateNeeded"
                    type="date"
                    value={exportRequester.dateNeeded}
                    onChange={(e) => setExportRequester({ ...exportRequester, dateNeeded: e.target.value })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-csu-navy/20 focus:border-csu-navy"
                    required
                  />
                </div>

                {/* Approved by Administration */}
                <div>
                  <label htmlFor="export-approvedBy" className="block text-sm font-medium text-csu-near-black mb-1">
                    Approved by Administration <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="export-approvedBy"
                    value={exportRequester.approvedBy}
                    onChange={(e) => setExportRequester({ ...exportRequester, approvedBy: e.target.value as '' | 'yes' | 'no' | 'pending' })}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-csu-navy/20 focus:border-csu-navy bg-white"
                    required
                  >
                    <option value="">Select an option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="pending">Not Applicable</option>
                  </select>
                </div>

                {/* Additional Notes */}
                <div>
                  <label htmlFor="export-notes" className="block text-sm font-medium text-csu-near-black mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    id="export-notes"
                    value={exportRequester.additionalNotes}
                    onChange={(e) => setExportRequester({ ...exportRequester, additionalNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-csu-light-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-csu-navy/20 focus:border-csu-navy resize-none"
                    placeholder="Any additional information or special requests..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-csu-dark-gray border border-csu-light-gray rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={!isExportFormValid() || isExporting}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isExportFormValid() && !isExporting
                      ? 'bg-csu-gold text-csu-near-black hover:bg-csu-gold/90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isExporting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Exporting...
                    </span>
                  ) : (
                    'Export Files'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Results Modal with Wufoo Text */}
      {showExportResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowExportResults(false)}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="export-results-title"
          >
            <div className="p-6 border-b border-csu-light-gray">
              <div className="flex items-center justify-between">
                <h2 id="export-results-title" className="text-xl font-bold text-csu-near-black">Export Results</h2>
                <button
                  onClick={() => setShowExportResults(false)}
                  className="text-csu-dark-gray hover:text-csu-near-black"
                  aria-label="Close export results"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Copy All Button */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-csu-near-black">Wufoo Form Fields</h3>
                <button
                  onClick={() => copyToClipboard(wufooOutput, 'all')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                    copiedField === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-csu-navy text-white hover:bg-csu-navy/90'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {copiedField === 'all' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    )}
                  </svg>
                  {copiedField === 'all' ? 'Copied!' : 'Copy All'}
                </button>
              </div>

              {/* Individual Wufoo Fields */}
              <div className="space-y-3">
                {[
                  { id: 'Field2', label: 'Request Type' },
                  { id: 'Field21', label: 'Web Request Type' },
                  { id: 'Field22', label: 'URL for Website Update' },
                  { id: 'Field23', label: 'Update/New Page Information' },
                  { id: 'Field173', label: 'Content Message' },
                  { id: 'Field24', label: 'Date Needed' },
                  { id: 'Field25', label: 'Person Requesting (First)' },
                  { id: 'Field26', label: 'Person Requesting (Last)' },
                  { id: 'Field100', label: 'Email Address' },
                  { id: 'Field169', label: 'Approved by Administration' },
                  { id: 'Field98', label: 'Comments' },
                  { id: 'Field105', label: 'Document Attachment' },
                  { id: 'Field125', label: 'Additional Documents' },
                ].map(({ id, label }) => (
                  <div key={id} className="bg-csu-lightest-gray rounded-lg border border-csu-light-gray overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b border-csu-light-gray">
                      <span className="text-sm font-medium text-csu-near-black">
                        {id}: {label}
                      </span>
                      <button
                        onClick={() => copyToClipboard(wufooFields[id] || '', id)}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                          copiedField === id
                            ? 'bg-green-600 text-white'
                            : 'bg-csu-navy text-white hover:bg-csu-navy/90'
                        }`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {copiedField === id ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          )}
                        </svg>
                        {copiedField === id ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3 text-sm font-mono whitespace-pre-wrap text-csu-dark-gray">
                      {wufooFields[id] || ''}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-csu-light-gray flex flex-wrap gap-3 justify-end">
              <button
                onClick={downloadHtmlFile}
                className="px-4 py-2 bg-csu-navy text-white rounded-lg font-medium hover:bg-csu-navy/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download HTML
              </button>
              <button
                onClick={downloadAssetsZip}
                className="px-4 py-2 bg-csu-navy text-white rounded-lg font-medium hover:bg-csu-navy/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Assets ZIP
              </button>
              <button
                onClick={downloadJsonDraft}
                className="px-4 py-2 bg-csu-navy text-white rounded-lg font-medium hover:bg-csu-navy/90 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download JSON Draft
              </button>
              <a
                href="https://columbiasouthernuniv.wufoo.com/forms/marketing-request-form/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-csu-gold text-csu-near-black rounded-lg font-medium hover:bg-csu-gold/90 transition-colors flex items-center gap-2"
              >
                Open Wufoo Form
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button
                onClick={() => setShowExportResults(false)}
                className="px-4 py-2 text-csu-dark-gray border border-csu-light-gray rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Toast */}
      {showSaveSuccess && (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Draft saved successfully!</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
