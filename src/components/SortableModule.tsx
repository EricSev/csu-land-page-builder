import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Module interface
export interface Module {
  id: string
  name: string
  enabled: boolean
  locked: boolean
  order: number
}

export interface SortableModuleProps {
  module: Module
  isSelected: boolean
  isComplete: boolean
  darkMode: boolean
  onToggle: (id: string) => void
  onSelect: (id: string) => void
}

export function SortableModule({ module, isSelected, isComplete, darkMode, onToggle, onSelect }: SortableModuleProps) {
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
          ? darkMode ? 'bg-gray-700 border border-csu-gold' : 'bg-csu-navy/10 border border-csu-navy'
          : darkMode ? 'hover:bg-gray-700 border border-transparent' : 'hover:bg-csu-lightest-gray border border-transparent'
      } ${module.locked ? 'opacity-75' : ''} ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Drag Handle - only for non-locked modules */}
      {!module.locked ? (
        <button
          className={`cursor-grab active:cursor-grabbing p-1 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-csu-medium-gray hover:text-csu-dark-gray'}`}
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
        className={`w-4 h-4 rounded focus:ring-csu-navy disabled:opacity-50 ${darkMode ? 'text-csu-gold border-gray-500 bg-gray-700' : 'text-csu-navy border-csu-light-gray'}`}
        aria-label={`Toggle ${module.name}`}
      />

      {/* Module Name - clickable to select */}
      <button
        className={`flex-1 text-left text-sm ${module.enabled ? (darkMode ? 'text-white' : 'text-csu-near-black') : (darkMode ? 'text-gray-500 line-through' : 'text-csu-medium-gray line-through')}`}
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

      {/* Completion status indicator */}
      {!module.locked && module.enabled && (
        isComplete ? (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" title="Complete">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20" title="Incomplete - missing required fields">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      )}
    </div>
  )
}
