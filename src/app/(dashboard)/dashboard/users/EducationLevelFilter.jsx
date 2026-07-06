import React, { useState, useEffect, useRef } from 'react'
import { GraduationCap, X, Check } from 'lucide-react'
import { Button } from '@/ui/shadcn/button'

const EDUCATION_LEVELS = [
  { id: 'upto_class_10', label: 'Upto Class 10' },
  { id: 'plus_two_running', label: '+2 Running' },
  { id: 'plus_two_graduate', label: '+2 Graduate' },
  { id: 'bachelors', label: 'Bachelors' },
  { id: 'masters', label: 'Masters' }
]

export default function EducationLevelFilter({ selectedLevels, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleLevel = (levelId) => {
    if (selectedLevels.includes(levelId)) {
      onChange(selectedLevels.filter((id) => id !== levelId))
    } else {
      onChange([...selectedLevels, levelId])
    }
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className='relative' ref={dropdownRef}>
      <Button
        variant='outline'
        type='button'
        onClick={() => setIsOpen(!isOpen)}
        className='gap-2 bg-white border-gray-200 h-9 w-full sm:w-auto justify-between sm:justify-start'
      >
        <div className='flex items-center gap-2'>
          <GraduationCap className='w-4 h-4 text-gray-500' />
          <span>Education Level</span>
          {selectedLevels.length > 0 && (
            <span className='ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#387cae] text-[10px] text-white'>
              {selectedLevels.length}
            </span>
          )}
        </div>
      </Button>

      {isOpen && (
        <div className='absolute z-50 mt-2 w-64 rounded-md border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2'>
          <div className='p-2'>
            <div className='flex items-center justify-between px-2 pb-2 mb-2 border-b border-gray-100'>
              <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                Filter by Education
              </span>
              {selectedLevels.length > 0 && (
                <button
                  type='button'
                  onClick={clearAll}
                  className='text-xs text-red-500 hover:text-red-700 transition-colors'
                >
                  Clear all
                </button>
              )}
            </div>

            <div className='space-y-1 max-h-60 overflow-y-auto'>
              {EDUCATION_LEVELS.map((level) => {
                const isSelected = selectedLevels.includes(level.id)
                return (
                  <button
                    key={level.id}
                    type='button'
                    onClick={() => toggleLevel(level.id)}
                    className={`flex items-center w-full px-2 py-2 text-sm rounded-md transition-colors ${
                      isSelected
                        ? 'bg-[#387cae]/5 text-[#387cae]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`mr-3 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                        isSelected
                          ? 'bg-[#387cae] border-[#387cae]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className='h-3 w-3 text-white' />}
                    </div>
                    <span>{level.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
