import { useState, useEffect } from 'react'

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
  { id: 'footer', name: 'Footer', enabled: true, locked: true, order: 12 },
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
  const [draftError, setDraftError] = useState('')
  const [draftFileName, setDraftFileName] = useState('')
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)

  // Initialize modules when entering builder mode based on template type
  useEffect(() => {
    if (mode === 'builder' && modules.length === 0) {
      const defaultModules = templateType === 'learning-partner'
        ? LEARNING_PARTNER_MODULES
        : CHANNEL_PARTNER_MODULES
      setModules(defaultModules.map(m => ({ ...m })))
    }
  }, [mode, templateType, modules.length])

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
      const draft = JSON.parse(text)

      // Validate draft structure
      if (!draft.version || !draft.metadata) {
        throw new Error('Invalid draft file format')
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
              className="px-3 py-1.5 text-sm bg-csu-navy border border-white/30 rounded hover:bg-white/10 transition-colors"
              aria-label="Settings"
            >
              Settings
            </button>
            <button className="px-3 py-1.5 text-sm bg-csu-navy border border-white/30 rounded hover:bg-white/10 transition-colors">
              Save Draft
            </button>
            <button className="px-4 py-1.5 text-sm bg-csu-gold text-csu-near-black rounded font-medium hover:bg-csu-gold/90 transition-colors">
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

            {/* Module List */}
            <div className="space-y-1">
              {modules.sort((a, b) => a.order - b.order).map((module) => (
                <div
                  key={module.id}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedModuleId === module.id
                      ? 'bg-csu-navy/10 border border-csu-navy'
                      : 'hover:bg-csu-lightest-gray border border-transparent'
                  } ${module.locked ? 'opacity-75' : ''}`}
                  onClick={() => !module.locked && setSelectedModuleId(module.id)}
                >
                  {/* Checkbox for toggle */}
                  <input
                    type="checkbox"
                    checked={module.enabled}
                    onChange={() => handleModuleToggle(module.id)}
                    disabled={module.locked}
                    className="w-4 h-4 text-csu-navy border-csu-light-gray rounded focus:ring-csu-navy disabled:opacity-50"
                    aria-label={`Toggle ${module.name}`}
                  />

                  {/* Module Name */}
                  <span className={`flex-1 text-sm ${module.enabled ? 'text-csu-near-black' : 'text-csu-medium-gray line-through'}`}>
                    {module.name}
                  </span>

                  {/* Locked indicator */}
                  {module.locked && (
                    <svg className="w-4 h-4 text-csu-medium-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleBackToSelection}
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
              <button className="px-2 py-1 text-xs bg-csu-navy text-white rounded">Desktop</button>
              <button className="px-2 py-1 text-xs bg-gray-200 text-csu-dark-gray rounded hover:bg-gray-300">Tablet</button>
              <button className="px-2 py-1 text-xs bg-gray-200 text-csu-dark-gray rounded hover:bg-gray-300">Mobile</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-csu-dark-gray">Zoom:</span>
              <input
                type="range"
                min="25"
                max="100"
                defaultValue="75"
                className="w-24"
                aria-label="Preview zoom level"
              />
              <span className="text-xs text-csu-dark-gray w-8">75%</span>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-white mx-auto shadow-lg" style={{ maxWidth: '1200px', minHeight: '800px' }}>
              <div className="bg-csu-navy text-white p-4 text-center">
                <p className="text-lg">Preview will render here</p>
              </div>
              <div className="p-8 text-center text-csu-dark-gray">
                <p>Select a template and add content to see the live preview.</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Content Panel - Bottom (Collapsible) */}
      <div className="bg-white border-t border-csu-light-gray h-64 overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-csu-near-black">Content Editor</h2>
            <button
              className="text-sm text-csu-dark-gray hover:text-csu-near-black"
              aria-label="Collapse content panel"
            >
              Collapse
            </button>
          </div>
          <p className="text-sm text-csu-dark-gray">
            Select a module from the left panel to edit its content here.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
