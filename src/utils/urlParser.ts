/**
 * URL Parser utilities for extracting content from CSU landing pages
 * Due to CORS limitations, actual page fetching is not possible client-side.
 * This module simulates partial extraction based on URL patterns.
 */

export interface ExtractionResult {
  partnerName: string
  discountPercentage: string | null
  templateType: 'learning-partner' | 'channel-partner'
  warnings: ExtractionWarning[]
  success: boolean
}

export interface ExtractionWarning {
  field: string
  message: string
  module: string
}

// Known partner URL patterns with expected content
const KNOWN_PARTNERS: Record<string, Partial<ExtractionResult>> = {
  'benefithub': {
    partnerName: 'BenefitHub',
    discountPercentage: '10%',
    templateType: 'learning-partner',
  },
  'delta': {
    partnerName: 'Delta Air Lines',
    discountPercentage: '15%',
    templateType: 'channel-partner',
  },
  'perkspot': {
    partnerName: 'PerkSpot',
    discountPercentage: '10%',
    templateType: 'learning-partner',
  },
  'iafc': {
    partnerName: 'IAFC',
    discountPercentage: '15%',
    templateType: 'channel-partner',
  },
  'ebg-solutions': {
    partnerName: 'EBG Solutions',
    discountPercentage: '10%',
    templateType: 'learning-partner',
  },
}

/**
 * Extracts partner slug from URL
 */
function extractSlugFromUrl(url: string): string {
  const urlParts = url.split('/').filter(Boolean)
  const lastPart = urlParts[urlParts.length - 1]
  return lastPart?.toLowerCase().replace(/[?#].*$/, '') || ''
}

/**
 * Converts slug to human-readable partner name
 */
function slugToName(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Simulates parsing a CSU landing page URL
 * Returns extraction result with warnings for fields that couldn't be extracted
 */
export function parseUrl(url: string): ExtractionResult {
  const slug = extractSlugFromUrl(url)
  const knownPartner = KNOWN_PARTNERS[slug]

  const warnings: ExtractionWarning[] = []

  // Determine what we can "extract"
  const partnerName = knownPartner?.partnerName || slugToName(slug) || 'Partner'
  const discountPercentage = knownPartner?.discountPercentage || null
  const templateType = knownPartner?.templateType || 'learning-partner'

  // Generate warnings for fields that need manual input
  // Since we can't actually fetch the page due to CORS, most fields need manual entry

  if (!knownPartner) {
    // Unknown partner - we could only extract the name from URL
    warnings.push({
      field: 'partnerLogo',
      message: 'Partner logo could not be extracted. Please upload or enter URL.',
      module: 'Partner Logo'
    })

    warnings.push({
      field: 'discountPercentage',
      message: 'Discount percentage could not be determined. Please select the correct value.',
      module: 'Partner Benefits Card'
    })

    warnings.push({
      field: 'benefitsCopy',
      message: 'Benefits copy could not be extracted. Please enter eligibility and benefits text.',
      module: 'Benefits Copy'
    })

    warnings.push({
      field: 'faqs',
      message: 'FAQ content could not be extracted. Please enter questions and answers.',
      module: 'FAQ Accordion'
    })
  } else {
    // Known partner - fewer warnings but still some fields need manual input
    warnings.push({
      field: 'partnerLogo',
      message: 'Partner logo could not be extracted due to browser security restrictions. Please upload or enter URL.',
      module: 'Partner Logo'
    })

    warnings.push({
      field: 'benefitLines',
      message: 'Specific benefit lines could not be extracted. Default benefits applied.',
      module: 'Partner Benefits Card'
    })
  }

  return {
    partnerName,
    discountPercentage,
    templateType,
    warnings,
    success: warnings.length === 0
  }
}

/**
 * Format warnings for display
 */
export function formatWarningsForDisplay(warnings: ExtractionWarning[]): string {
  if (warnings.length === 0) return ''

  const grouped = warnings.reduce((acc, w) => {
    if (!acc[w.module]) acc[w.module] = []
    acc[w.module].push(w.message)
    return acc
  }, {} as Record<string, string[]>)

  return Object.entries(grouped)
    .map(([module, messages]) => `${module}: ${messages.join('; ')}`)
    .join('\n')
}
