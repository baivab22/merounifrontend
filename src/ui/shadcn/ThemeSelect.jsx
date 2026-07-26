'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export function ThemeSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select...',
  icon: Icon,
  className = '',
  triggerClassName = '',
  dropdownClassName = '',
  compact = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const selected = options.find((o) => o.value === value)
  const displayLabel = selected?.label || placeholder

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (opt) => {
    onChange(opt.value)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type='button'
        onClick={() => setIsOpen((p) => !p)}
        className={cn(
          'flex items-center gap-2 rounded-xl border-2 border-[#0A6FA7]/20 bg-white text-[#0A6FA7] font-bold transition-all shadow-sm hover:shadow-md hover:border-[#0A6FA7]/40 active:scale-[0.98]',
          compact
            ? 'w-full justify-between px-3 py-1.5 text-xs'
            : 'h-[42px] px-3 sm:px-4 text-xs',
          isOpen && 'border-[#0A6FA7] ring-2 ring-[#0A6FA7]/10',
          triggerClassName
        )}
      >
        <span className='flex items-center gap-2 min-w-0'>
          {Icon && <Icon className='w-4 h-4 flex-shrink-0' />}
          <span className={cn('truncate', !selected && 'text-[#0A6FA7]/50 font-semibold')}>
            {displayLabel}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150',
            compact ? 'w-full' : 'min-w-[200px] right-0',
            dropdownClassName
          )}
        >
          <div className='max-h-60 overflow-y-auto thin-scrollbar py-1'>
            {options.length === 0 ? (
              <div className='px-4 py-3 text-xs text-gray-400 text-center italic'>
                No options
              </div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors flex items-center gap-2',
                    opt.value === value
                      ? 'bg-[#0A6FA7]/5 text-[#0A6FA7]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#0A6FA7]'
                  )}
                >
                  {opt.icon && <span className='flex-shrink-0'>{opt.icon}</span>}
                  <span className='truncate'>{opt.label}</span>
                  {opt.value === value && (
                    <span className='ml-auto flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#0A6FA7]' />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
