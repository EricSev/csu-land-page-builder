import { useState } from 'react'
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { MODULE_CATEGORIES, CategoryDefinition } from '../types'
import { MODULE_CATEGORY_MAP, getModulesByCategory } from '../config/moduleCategories'
import { SortableModule, Module } from './SortableModule'

interface ModuleSidebarProps {
  modules: Module[]
  selectedModuleId: string | null
  darkMode: boolean
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  onDragEnd: (event: DragEndEvent) => void
  isModuleComplete: (id: string) => boolean
  onBackToStart: () => void
}

interface CollapsibleCategoryProps {
  category: CategoryDefinition
  modules: Module[]
  selectedModuleId: string | null
  darkMode: boolean
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  isModuleComplete: (id: string) => boolean
}

function CollapsibleCategory({
  category,
  modules,
  selectedModuleId,
  darkMode,
  onToggle,
  onSelect,
  isModuleComplete
}: CollapsibleCategoryProps) {
  const [isExpanded, setIsExpanded] = useState(category.defaultExpanded)
  const enabledCount = modules.filter(m => m.enabled).length

  if (modules.length === 0) return null

  return (
    <div className="mb-2">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
          darkMode
            ? 'hover:bg-gray-700 text-gray-300'
            : 'hover:bg-csu-lightest-gray text-csu-dark-gray'
        }`}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{category.name}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          darkMode ? 'bg-gray-700' : 'bg-csu-light-gray'
        }`}>
          {enabledCount}/{modules.length}
        </span>
      </button>

      {/* Category Content */}
      {isExpanded && (
        <div className="ml-2 mt-1 space-y-1">
          <SortableContext
            items={modules.sort((a, b) => a.order - b.order).map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            {modules.sort((a, b) => a.order - b.order).map(module => (
              <SortableModule
                key={module.id}
                module={module}
                isSelected={selectedModuleId === module.id}
                isComplete={isModuleComplete(module.id)}
                darkMode={darkMode}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  )
}

export function ModuleSidebar({
  modules,
  selectedModuleId,
  darkMode,
  onToggle,
  onSelect,
  onDragEnd,
  isModuleComplete,
  onBackToStart,
}: ModuleSidebarProps) {
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

  return (
    <aside className={`w-64 min-w-[256px] max-w-[256px] border-r overflow-y-auto flex-shrink-0 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-csu-light-gray'
    }`}>
      <div className="p-4">
        <h2 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-csu-near-black'}`}>
          Modules
        </h2>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          {MODULE_CATEGORIES.map(category => {
            const categoryModules = getModulesByCategory(modules, category.id)

            return (
              <CollapsibleCategory
                key={category.id}
                category={category}
                modules={categoryModules}
                selectedModuleId={selectedModuleId}
                darkMode={darkMode}
                onToggle={onToggle}
                onSelect={onSelect}
                isModuleComplete={isModuleComplete}
              />
            )
          })}
        </DndContext>

        {/* Back to Start link */}
        <button
          onClick={onBackToStart}
          className={`mt-4 text-sm flex items-center gap-1 ${
            darkMode
              ? 'text-csu-gold hover:text-csu-gold/80'
              : 'text-csu-navy hover:text-csu-navy/80'
          }`}
        >
          <span>&larr;</span>
          <span>Back to start</span>
        </button>
      </div>
    </aside>
  )
}
