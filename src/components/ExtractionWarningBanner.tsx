import { useState } from 'react'

interface ExtractionWarning {
  field: string
  message: string
  module: string
}

interface ExtractionWarningBannerProps {
  warnings: ExtractionWarning[]
  onDismiss: () => void
  darkMode?: boolean
}

/**
 * Banner component to display warnings about partial content extraction
 * Shows when URL parsing could only extract some content
 */
export function ExtractionWarningBanner({ warnings, onDismiss, darkMode = false }: ExtractionWarningBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (warnings.length === 0) return null

  // Group warnings by module
  const groupedWarnings = warnings.reduce((acc, warning) => {
    if (!acc[warning.module]) {
      acc[warning.module] = []
    }
    acc[warning.module].push(warning)
    return acc
  }, {} as Record<string, ExtractionWarning[]>)

  return (
    <div
      className={`mb-4 p-4 rounded-lg border ${
        darkMode
          ? 'bg-amber-900/30 border-amber-700 text-amber-200'
          : 'bg-amber-50 border-amber-300 text-amber-800'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Warning Icon */}
          <svg
            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>

          <div className="flex-1">
            <h3 className={`font-semibold ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>
              Partial Content Extraction
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
              Some content couldn't be extracted from the URL due to browser security restrictions.
              Please fill in the following fields manually:
            </p>

            {/* Expandable list of affected modules */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-sm mt-2 flex items-center gap-1 ${
                darkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'
              }`}
            >
              {isExpanded ? 'Hide' : 'Show'} affected modules ({Object.keys(groupedWarnings).length})
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isExpanded && (
              <ul className={`mt-2 text-sm space-y-1 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
                {Object.entries(groupedWarnings).map(([module, moduleWarnings]) => (
                  <li key={module} className="flex items-start gap-2">
                    <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>•</span>
                    <span>
                      <strong>{module}:</strong>{' '}
                      {moduleWarnings.map(w => w.message).join(' ')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className={`p-1 rounded-lg transition-colors ${
            darkMode
              ? 'hover:bg-amber-800/50 text-amber-400'
              : 'hover:bg-amber-200 text-amber-600'
          }`}
          aria-label="Dismiss extraction warning"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export type { ExtractionWarning }
