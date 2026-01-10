import { useState } from 'react'

type AppMode = 'selection' | 'builder'
type StartMode = 'new' | 'edit' | 'load'

function App() {
  const [mode, setMode] = useState<AppMode>('selection')
  const [_startMode, setStartMode] = useState<StartMode | null>(null)

  const handleModeSelect = (selectedMode: StartMode) => {
    setStartMode(selectedMode)
    setMode('builder')
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
            <p className="text-sm text-csu-dark-gray">Module list will appear here</p>
            <button
              onClick={() => setMode('selection')}
              className="mt-4 text-sm text-csu-navy underline hover:no-underline"
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
