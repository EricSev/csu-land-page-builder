import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

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
}

// Default modules for Learning Partner template
const LEARNING_PARTNER_MODULES: Module[] = [
  { id: 'header', name: 'Header', enabled: true, locked: true, order: 1 },
  { id: 'partner-headline', name: 'Partner Headline', enabled: true, locked: false, order: 2 },
  { id: 'partner-logo', name: 'Partner Logo', enabled: true, locked: false, order: 3 },
  { id: 'partner-benefits-card', name: 'Partner Benefits Card', enabled: true, locked: false, order: 4 },
  { id: 'benefits-copy', name: 'Benefits Copy', enabled: true, locked: false, order: 5 },
  { id: 'lead-capture-form', name: 'Lead Capture Form', enabled: true, locked: false, order: 6 },
  { id: 'footer', name: 'Footer', enabled: true, locked: true, order: 7 },
]

// Default modules for Channel Partner template
const CHANNEL_PARTNER_MODULES: Module[] = [
  { id: 'header', name: 'Header', enabled: true, locked: true, order: 1 },
  { id: 'partner-headline', name: 'Partner Headline', enabled: true, locked: false, order: 2 },
  { id: 'partner-logo', name: 'Partner Logo', enabled: true, locked: false, order: 3 },
  { id: 'partner-benefits-card', name: 'Partner Benefits Card', enabled: true, locked: false, order: 4 },
  { id: 'benefits-copy', name: 'Benefits Copy', enabled: true, locked: false, order: 5 },
  { id: 'lead-capture-form', name: 'Lead Capture Form', enabled: true, locked: false, order: 6 },
  { id: 'faq-accordion', name: 'FAQ Accordion', enabled: true, locked: false, order: 7 },
  { id: 'value-proposition-cards', name: 'Value Proposition Cards', enabled: true, locked: false, order: 8 },
  { id: 'tuition-comparison-banner', name: 'Tuition Comparison Banner', enabled: true, locked: false, order: 9 },
  { id: 'csu-by-the-numbers', name: 'CSU by the Numbers', enabled: true, locked: false, order: 10 },
  { id: 'accreditations-section', name: 'Accreditations Section', enabled: true, locked: false, order: 11 },
  { id: 'degree-programs-list', name: 'Degree Programs List', enabled: true, locked: false, order: 12 },
  { id: 'scholarship-highlight', name: 'Scholarship Highlight', enabled: true, locked: false, order: 13 },
  { id: 'video-testimonial', name: 'Video Testimonial', enabled: true, locked: false, order: 14 },
  { id: 'hero-banner', name: 'Hero Banner', enabled: true, locked: false, order: 15 },
  { id: 'secondary-cta-banner', name: 'Secondary CTA Banner', enabled: true, locked: false, order: 16 },
  { id: 'more-info-card', name: 'Looking for More Info Card', enabled: true, locked: false, order: 17 },
  { id: 'footnotes-disclaimers', name: 'Footnotes/Disclaimers', enabled: true, locked: false, order: 18 },
  { id: 'footer', name: 'Footer', enabled: true, locked: true, order: 19 },
]

// Sortable module item component
interface SortableModuleProps {
  module: Module
  isSelected: boolean
  onToggle: (id: string) => void
  onSelect: (id: string) => void
}

function SortableModule({ module, isSelected, onToggle, onSelect }: SortableModuleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: module.id,
    disabled: module.locked,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
        isSelected
          ? 'bg-csu-navy/10 border border-csu-navy'
          : 'hover:bg-csu-lightest-gray border border-transparent'
      } ${module.locked ? 'opacity-75' : ''} ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Drag Handle - only for non-locked modules */}
      {!module.locked ? (
        <button
          className="cursor-grab active:cursor-grabbing p-1 text-csu-medium-gray hover:text-csu-dark-gray"
          aria-label={`Drag to reorder ${module.name}`}
          {...attributes}
          {...listeners}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-14a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-2 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm2 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
        </button>
      ) : (
        <div className="w-6" /> // Spacer for locked modules
      )}

      {/* Checkbox for toggle */}
      <input
        type="checkbox"
        checked={module.enabled}
        onChange={() => onToggle(module.id)}
        disabled={module.locked}
        className="w-4 h-4 text-csu-navy border-csu-light-gray rounded focus:ring-csu-navy disabled:opacity-50"
        aria-label={`Toggle ${module.name}`}
      />

      {/* Module Name - clickable to select */}
      <button
        className={`flex-1 text-left text-sm ${module.enabled ? 'text-csu-near-black' : 'text-csu-medium-gray line-through'}`}
        onClick={() => !module.locked && onSelect(module.id)}
        disabled={module.locked}
      >
        {module.name}
      </button>

      {/* Locked indicator */}
      {module.locked && (
        <svg className="w-4 h-4 text-csu-medium-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )}
    </div>
  )
}

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
  const [draftError, setDraftError] = useState('')
  const [draftFileName, setDraftFileName] = useState('')
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [moduleContent, setModuleContent] = useState<Record<string, ModuleContent>>({})
  const [showSettings, setShowSettings] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [headerStyle, setHeaderStyle] = useState<'minimal' | 'full'>('minimal')
  const [footerStyle, setFooterStyle] = useState<'minimal' | 'full'>('minimal')
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [previewZoom, setPreviewZoom] = useState(75)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportRequester, setExportRequester] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateNeeded: '',
    approvedBy: '' as '' | 'yes' | 'no' | 'pending',
    additionalNotes: '',
  })

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

  // Generate Wufoo form text
  const generateWufooText = () => {
    const enabledModules = modules.filter(m => m.enabled).sort((a, b) => a.order - b.order)

    // Build module summary
    const moduleSummary = enabledModules.map(m => `- ${m.name}`).join('\n')

    // Build WHO section
    const partnerHeadline = moduleContent['partner-headline']
    const whoSection = `WHO: ${partnerName} Employees`

    // Build WHAT section
    const benefitsCard = moduleContent['partner-benefits-card']
    const benefitsCopy = moduleContent['benefits-copy']
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
      Field169: exportRequester.approvedBy === 'yes' ? 'Yes' : exportRequester.approvedBy === 'no' ? 'No' : 'Pending Approval',
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
    const benefitsCard = moduleContent['partner-benefits-card']
    const benefitsCopy = moduleContent['benefits-copy']
    const leadForm = moduleContent['lead-capture-form']
    const faqData = moduleContent['faq-accordion']
    const stats = moduleContent['csu-by-the-numbers']

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${partnerName} - Columbia Southern University</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Helvetica, Arial, sans-serif; color: #1D252D; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

    /* Header */
    .header { background-color: #002855; padding: 16px 0; }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .logo { color: white; font-weight: bold; font-size: 24px; text-decoration: none; }
    .logo span { color: #C6AA76; }
    .apply-btn { background-color: #C6AA76; color: #1D252D; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 600; }

    /* Hero Section */
    .hero { background: linear-gradient(135deg, #002855 0%, #003d7a 100%); color: white; padding: 60px 0; text-align: center; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 16px; }
    .hero p { font-size: 1.25rem; opacity: 0.9; }

    /* Benefits Card */
    .benefits-card { background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 32px; margin: -40px auto 40px; max-width: 600px; position: relative; z-index: 10; }
    .benefits-card h3 { color: #002855; margin-bottom: 20px; font-size: 1.5rem; }
    .benefits-list { list-style: none; }
    .benefits-list li { padding: 8px 0; display: flex; align-items: center; gap: 12px; }
    .benefits-list li::before { content: "✓"; color: #C6AA76; font-weight: bold; }

    /* Content Section */
    .content-section { padding: 60px 0; }
    .content-section h4 { color: #002855; margin-bottom: 12px; font-size: 1.25rem; }
    .content-section p { color: #5B6770; margin-bottom: 24px; }

    /* Lead Form */
    .lead-form { background: #DDE5ED; padding: 40px 0; }
    .lead-form h3 { color: #002855; text-align: center; margin-bottom: 24px; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 600px; margin: 0 auto; }
    .form-field { background: white; padding: 12px; border: 1px solid #D0D3D4; border-radius: 4px; }
    .form-field.full { grid-column: 1 / -1; }
    .submit-btn { background: #002855; color: white; padding: 14px 32px; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-top: 16px; }

    /* Footer */
    .footer { background: #002855; color: white; padding: 24px 0; text-align: center; }
    .footer a { color: #C6AA76; text-decoration: none; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 1.75rem; }
      .form-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="container header-content">
      <a href="https://www.columbiasouthern.edu" class="logo">
        <span>CSU</span> Columbia Southern University
      </a>
      <a href="https://www.columbiasouthern.edu/apply" class="apply-btn">Apply Now</a>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <h1>${partnerHeadline?.headline || partnerName + ' Employees'}</h1>
      <p>${partnerHeadline?.subheadline || 'Exclusive Education Benefits for You'}</p>
    </div>
  </section>

  <!-- Benefits Card -->
  ${enabledModules.some(m => m.id === 'partner-benefits-card') ? `
  <div class="container">
    <div class="benefits-card">
      <h3>${benefitsCard?.benefitsTitle || 'Your Benefits'}</h3>
      <ul class="benefits-list">
        ${(benefitsCard?.benefits || ['Tuition Discount', 'Flexible Online Learning', 'No Application Fee']).filter(b => b).map(benefit => `
        <li>${benefit}</li>
        `).join('')}
      </ul>
    </div>
  </div>
  ` : ''}

  <!-- Benefits Copy -->
  ${enabledModules.some(m => m.id === 'benefits-copy') ? `
  <section class="content-section">
    <div class="container">
      <p>${benefitsCopy?.benefitsCopy || 'As a valued partner, you and your eligible family members can take advantage of exclusive benefits.'}</p>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; margin-top: 32px;">
        <div>
          <h4>Tuition Benefits</h4>
          <p>${benefitsCopy?.tuitionParagraph || 'Enjoy exclusive tuition discounts at Columbia Southern University.'}</p>
        </div>
        <div>
          <h4>Flexible Learning</h4>
          <p>${benefitsCopy?.flexibilityParagraph || 'Our flexible online programs are designed to fit your busy schedule.'}</p>
        </div>
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Lead Capture Form -->
  ${enabledModules.some(m => m.id === 'lead-capture-form') ? `
  <section class="lead-form">
    <div class="container">
      <h3>${leadForm?.formTitle || 'Request Information'}</h3>
      <div class="form-grid">
        ${leadForm?.formFieldToggles?.firstName !== false ? '<div class="form-field">First Name</div>' : ''}
        ${leadForm?.formFieldToggles?.lastName !== false ? '<div class="form-field">Last Name</div>' : ''}
        ${leadForm?.formFieldToggles?.email !== false ? '<div class="form-field">Email</div>' : ''}
        ${leadForm?.formFieldToggles?.phone !== false ? '<div class="form-field">Phone</div>' : ''}
        ${leadForm?.formFieldToggles?.program !== false ? '<div class="form-field full">Program Interest</div>' : ''}
        ${leadForm?.formFieldToggles?.comments !== false ? '<div class="form-field full">Comments</div>' : ''}
      </div>
      <div style="text-align: center;">
        <button class="submit-btn">${leadForm?.submitButtonText || 'Submit'}</button>
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <p>© ${new Date().getFullYear()} Columbia Southern University</p>
      <p><a href="https://www.columbiasouthern.edu/privacy-policy">Privacy Policy</a></p>
    </div>
  </footer>
</body>
</html>`

    return html
  }

  const [htmlOutput, setHtmlOutput] = useState<string>('')

  // Handle export submission
  const handleExport = () => {
    if (!isExportFormValid()) return

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
  }

  // Download HTML file
  const downloadHtmlFile = () => {
    const slug = partnerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'partner'
    const filename = `${slug}-landing-page.html`
    const blob = new Blob([htmlOutput], { type: 'text/html' })
    saveAs(blob, filename)
  }

  // State for uploaded images (stores base64 data)
  const [uploadedImages, setUploadedImages] = useState<Record<string, { name: string; data: string; type: string }>>({})

  // Download assets ZIP file
  const downloadAssetsZip = async () => {
    const zip = new JSZip()
    const slug = partnerName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'partner'

    // Create images folder
    const imagesFolder = zip.folder('images')

    // Add all uploaded images to the ZIP
    let imageCount = 0
    Object.entries(uploadedImages).forEach(([id, image]) => {
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

  // DnD sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

      setPartnerName(extractedName || 'Partner')
      setParseStatus('success')
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
      <div className="min-h-screen bg-csu-lightest-gray flex flex-col">
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
      <div className="min-h-screen bg-csu-lightest-gray flex flex-col">
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
                      <p className="mt-2 text-sm text-red-500">{urlError}</p>
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
                      <p className="mt-2 text-sm text-red-500">{draftError}</p>
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
    <div className="min-h-screen bg-csu-lightest-gray flex flex-col">
      {/* Header */}
      <header className="bg-csu-navy text-white py-3 px-6 shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-csu-navy font-bold text-sm">CSU</span>
            </div>
            <h1 className="text-lg font-semibold">Landing Page Builder</h1>
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
              className="px-3 py-1.5 text-sm bg-csu-navy border border-white/30 rounded hover:bg-white/10 transition-colors"
            >
              Save Draft
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
        {/* Module Panel - Left Sidebar */}
        <aside className="w-module-panel min-w-module-panel max-w-module-panel bg-white border-r border-csu-light-gray overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <h2 className="font-semibold text-csu-near-black mb-4">Modules</h2>

            {/* Module List with Drag and Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={modules.sort((a, b) => a.order - b.order).map(m => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {modules.sort((a, b) => a.order - b.order).map((module) => (
                    <SortableModule
                      key={module.id}
                      module={module}
                      isSelected={selectedModuleId === module.id}
                      onToggle={handleModuleToggle}
                      onSelect={setSelectedModuleId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              onClick={handleClearDraft}
              className="mt-6 text-sm text-csu-navy underline hover:no-underline"
            >
              &larr; Back to start
            </button>
          </div>
        </aside>

        {/* Preview Panel - Right/Center */}
        <main className="flex-1 bg-csu-lightest-gray overflow-hidden flex flex-col">
          {/* Preview Controls */}
          <div className="bg-white border-b border-csu-light-gray px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-csu-dark-gray">Viewport:</span>
              <button
                onClick={() => setViewport('desktop')}
                className={`px-2 py-1 text-xs rounded ${viewport === 'desktop' ? 'bg-csu-navy text-white' : 'bg-gray-200 text-csu-dark-gray hover:bg-gray-300'}`}
              >
                Desktop
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`px-2 py-1 text-xs rounded ${viewport === 'tablet' ? 'bg-csu-navy text-white' : 'bg-gray-200 text-csu-dark-gray hover:bg-gray-300'}`}
              >
                Tablet
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`px-2 py-1 text-xs rounded ${viewport === 'mobile' ? 'bg-csu-navy text-white' : 'bg-gray-200 text-csu-dark-gray hover:bg-gray-300'}`}
              >
                Mobile
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-csu-dark-gray">Zoom:</span>
              <input
                type="range"
                min="25"
                max="100"
                value={previewZoom}
                onChange={(e) => setPreviewZoom(Number(e.target.value))}
                className="w-24"
                aria-label="Preview zoom level"
              />
              <span className="text-xs text-csu-dark-gray w-8">{previewZoom}%</span>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-4">
            <div
              className="bg-white mx-auto shadow-lg transition-all duration-200"
              style={{
                width: viewport === 'desktop' ? '1920px' : viewport === 'tablet' ? '768px' : '375px',
                minHeight: '800px',
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: 'top center',
              }}
            >
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
                    <div className="p-4">
                      {headerStyle === 'minimal' ? (
                        /* Minimal Header - Logo + CTA only */
                        <div className="flex items-center justify-between">
                          <a
                            href="https://www.columbiasouthern.edu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                            aria-label="Columbia Southern University Homepage"
                          >
                            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                              <span className="text-csu-navy font-bold text-sm">CSU</span>
                            </div>
                            <span className="font-semibold">Columbia Southern University</span>
                          </a>
                          <a
                            href="https://www.columbiasouthern.edu/apply"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-csu-gold text-csu-near-black rounded font-medium text-sm hover:bg-csu-gold/90 transition-colors"
                          >
                            Apply Now
                          </a>
                        </div>
                      ) : (
                        /* Full Header - Logo + Navigation + CTA */
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <a
                              href="https://www.columbiasouthern.edu"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                              aria-label="Columbia Southern University Homepage"
                            >
                              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                                <span className="text-csu-navy font-bold text-sm">CSU</span>
                              </div>
                              <span className="font-semibold">Columbia Southern University</span>
                            </a>
                            <div className="flex items-center gap-4">
                              <a href="#" className="text-sm hover:text-csu-gold transition-colors">Student Login</a>
                              <a href="#" className="text-sm hover:text-csu-gold transition-colors">Contact</a>
                              <a
                                href="https://www.columbiasouthern.edu/apply"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-csu-gold text-csu-near-black rounded font-medium text-sm hover:bg-csu-gold/90 transition-colors"
                              >
                                Apply Now
                              </a>
                            </div>
                          </div>
                          <nav className="flex gap-6 text-sm border-t border-white/20 pt-3">
                            <a href="#" className="hover:text-csu-gold transition-colors">Programs</a>
                            <a href="#" className="hover:text-csu-gold transition-colors">Admissions</a>
                            <a href="#" className="hover:text-csu-gold transition-colors">Tuition & Aid</a>
                            <a href="#" className="hover:text-csu-gold transition-colors">About</a>
                            <a href="#" className="hover:text-csu-gold transition-colors">Resources</a>
                          </nav>
                        </div>
                      )}
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

                  {module.id === 'partner-benefits-card' && (
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
                        <ul className="space-y-2 text-csu-dark-gray">
                          {(moduleContent['partner-benefits-card']?.benefits || ['Tuition Discount', 'Flexible Online Learning', 'No Application Fee', ''])
                            .filter(b => b && b.trim())
                            .map((benefit, index) => (
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
                      </div>
                    </div>
                  )}

                  {module.id === 'benefits-copy' && (
                    <div className="p-6 max-w-2xl mx-auto space-y-4">
                      <p className="text-csu-dark-gray leading-relaxed font-medium">
                        {moduleContent['benefits-copy']?.eligibilityStatement || 'As a valued partner, you and your eligible family members can take advantage of exclusive benefits.'}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-csu-lightest-gray rounded-lg p-4">
                          <h4 className="font-bold text-csu-navy mb-2">Tuition Benefits</h4>
                          <p className="text-csu-dark-gray text-sm leading-relaxed">
                            {moduleContent['benefits-copy']?.tuitionParagraph || 'Enjoy exclusive tuition discounts at Columbia Southern University. Our affordable programs make quality education accessible to you and your family.'}
                          </p>
                        </div>
                        <div className="bg-csu-lightest-gray rounded-lg p-4">
                          <h4 className="font-bold text-csu-navy mb-2">Flexible Learning</h4>
                          <p className="text-csu-dark-gray text-sm leading-relaxed">
                            {moduleContent['benefits-copy']?.flexibilityParagraph || 'Our flexible online programs are designed to fit your busy schedule. Study anytime, anywhere, at your own pace.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
                        </div>
                      </div>
                    </div>
                  )}

                  {module.id === 'faq-accordion' && (
                    <div className="p-6 max-w-2xl mx-auto">
                      <h3 className="text-xl font-bold text-csu-navy mb-4">Frequently Asked Questions</h3>
                      <div className="space-y-2">
                        {(moduleContent['faq-accordion']?.faqs || [
                          { question: 'How do I apply?', answer: 'Visit our application page and complete the online form. Our admissions team will guide you through the process.' },
                          { question: 'What programs are available?', answer: 'CSU offers over 50 online degree programs including business, criminal justice, fire science, and more.' },
                          { question: 'How much is tuition?', answer: 'Tuition varies by program. Partner employees receive exclusive discounts on all programs.' },
                          { question: 'Is financial aid available?', answer: 'Yes! CSU offers various financial aid options including federal aid, military benefits, and payment plans.' }
                        ]).map((faq, i) => (
                          <div key={i} className="border border-csu-light-gray rounded">
                            <div className="p-3 font-medium text-csu-near-black bg-csu-lightest-gray">
                              {faq.question}
                            </div>
                            <div className="p-3 text-sm text-csu-dark-gray">
                              {faq.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {module.id === 'value-proposition-cards' && (
                    <div className="p-6">
                      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {(moduleContent['value-proposition-cards']?.propositions || [
                          { heading: 'Affordable', body: 'Lower tuition than traditional universities with flexible payment options.', imageUrl: '' },
                          { heading: 'Flexible', body: '100% online courses designed for working adults and busy schedules.', imageUrl: '' },
                          { heading: 'Supportive', body: 'Dedicated advisors and 24/7 tech support to help you succeed.', imageUrl: '' }
                        ]).map((prop, i) => (
                          <div key={i} className="bg-csu-lightest-gray rounded-lg p-4 text-center">
                            {prop.imageUrl ? (
                              <img src={prop.imageUrl} alt={prop.heading} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
                            ) : (
                              <div className="w-16 h-16 bg-csu-navy rounded-full mx-auto mb-3"></div>
                            )}
                            <h4 className="font-bold text-csu-navy">{prop.heading}</h4>
                            <p className="text-sm text-csu-dark-gray mt-2">{prop.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {module.id === 'tuition-comparison-banner' && (() => {
                    const bullets = moduleContent['tuition-comparison-banner']?.comparisonBullets || [
                      'Lower tuition than national average',
                      'No hidden fees',
                      'Flexible payment plans'
                    ]
                    return (
                      <div className="p-6 bg-csu-navy text-white">
                        <div className="max-w-2xl mx-auto">
                          <h3 className="text-xl font-bold mb-2 text-center">
                            {moduleContent['tuition-comparison-banner']?.comparisonTitle || 'Compare Our Tuition'}
                          </h3>
                          <p className="text-white/80 text-center mb-4">
                            {moduleContent['tuition-comparison-banner']?.comparisonBody || 'See how CSU stacks up against other universities'}
                          </p>
                          <ul className="space-y-2 mb-4">
                            {bullets.filter(b => b).map((bullet, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="text-csu-gold">✓</span>
                                {bullet}
                              </li>
                            ))}
                          </ul>
                          {(moduleContent['tuition-comparison-banner']?.comparisonShowCTA ?? true) && (
                            <div className="text-center">
                              <button className="px-6 py-2 bg-csu-gold text-csu-navy font-medium rounded hover:bg-csu-gold/90">
                                Compare Now
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {module.id === 'csu-by-the-numbers' && (
                    <div className="p-6">
                      <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto text-center">
                        {(moduleContent['csu-by-the-numbers']?.stats || [
                          { number: '30+', label: 'Years' },
                          { number: '50+', label: 'Programs' },
                          { number: '30K+', label: 'Students' },
                          { number: '100%', label: 'Online' },
                        ]).map((stat, i) => (
                          <div key={i}>
                            <div className="text-2xl font-bold text-csu-navy">{stat.number}</div>
                            <div className="text-sm text-csu-dark-gray">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                    const programs = moduleContent['degree-programs-list']?.programs || [
                      { name: 'Bachelor of Science in Business Administration', url: 'https://www.columbiasouthern.edu/degrees/bachelors/business-administration' },
                      { name: 'Bachelor of Science in Criminal Justice', url: 'https://www.columbiasouthern.edu/degrees/bachelors/criminal-justice' },
                      { name: 'Bachelor of Science in Fire Science', url: 'https://www.columbiasouthern.edu/degrees/bachelors/fire-science' },
                    ]
                    return (
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-csu-navy text-center mb-4">
                          {moduleContent['degree-programs-list']?.programsHeading || 'Popular Degree Programs'}
                        </h3>
                        <div className="max-w-xl mx-auto">
                          <ul className="space-y-2">
                            {programs.filter(p => p.name).map((program, i) => (
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
                      </div>
                    )
                  })()}

                  {module.id === 'scholarship-highlight' && (
                    <div className="p-6 bg-csu-gold/10 border-l-4 border-csu-gold">
                      <div className="max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-csu-navy mb-3">
                          {moduleContent['scholarship-highlight']?.scholarshipName || 'Partner Scholarship Program'}
                        </h3>
                        <p className="text-csu-dark-gray mb-4">
                          {moduleContent['scholarship-highlight']?.scholarshipDescription || 'Eligible employees and their families may qualify for exclusive scholarship opportunities through our partnership. Contact an enrollment counselor to learn more about your benefits.'}
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
                      </div>
                    </div>
                  )}

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
                                alt=""
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
      <div className="bg-white border-t border-csu-light-gray h-64 overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-csu-near-black">
              Content Editor {selectedModuleId && `- ${modules.find(m => m.id === selectedModuleId)?.name}`}
            </h2>
            <button
              className="text-sm text-csu-dark-gray hover:text-csu-near-black"
              aria-label="Collapse content panel"
            >
              Collapse
            </button>
          </div>

          {/* No module selected */}
          {!selectedModuleId && (
            <p className="text-sm text-csu-dark-gray">
              Select a module from the left panel to edit its content here.
            </p>
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
                    <p className="mt-1 text-sm text-red-500">{moduleContent['partner-logo'].logoError}</p>
                  )}
                  <p className="mt-1 text-xs text-csu-medium-gray">PNG or JPG only. Max 500x500px.</p>
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
                    <p className="mt-1 text-sm text-red-500">{moduleContent['partner-logo'].logoUrlError}</p>
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
                  <div key={index} className="grid grid-cols-2 gap-3 p-3 bg-csu-lightest-gray rounded-lg">
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
                  <p className="mt-1 text-sm text-red-500">{moduleContent['video-testimonial'].videoUrlError}</p>
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

          {/* Other modules placeholder */}
          {selectedModuleId && !['partner-headline', 'partner-logo', 'partner-benefits-card', 'benefits-copy', 'lead-capture-form', 'faq-accordion', 'value-proposition-cards', 'csu-by-the-numbers', 'accreditations-section', 'tuition-comparison-banner', 'degree-programs-list', 'scholarship-highlight', 'video-testimonial', 'hero-banner', 'secondary-cta-banner', 'more-info-card', 'footnotes-disclaimers'].includes(selectedModuleId) && (
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
                    <option value="pending">Pending Approval</option>
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
                  disabled={!isExportFormValid()}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isExportFormValid()
                      ? 'bg-csu-gold text-csu-near-black hover:bg-csu-gold/90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Export Files
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
    </div>
  )
}

export default App
