import React, { useState, useEffect, useRef } from 'react'
import { Filter, X, Check } from 'lucide-react'
import { Button } from '@/ui/shadcn/button'

export default function ActorFilter({ actors, selectedActors, onChange }) {
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

  const toggleActor = (actorId) => {
    if (selectedActors.includes(actorId)) {
      onChange(selectedActors.filter((id) => id !== actorId))
    } else {
      onChange([...selectedActors, actorId])
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
        className='gap-2 bg-white border-gray-200 h-10 w-full sm:w-auto justify-between sm:justify-start min-w-[160px]'
      >
        <div className='flex items-center gap-2'>
          <Filter className='w-4 h-4 text-gray-500' />
          <span>Filter by User</span>
          {selectedActors.length > 0 && (
            <span className='ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#387cae] text-[10px] text-white'>
              {selectedActors.length}
            </span>
          )}
        </div>
      </Button>

      {isOpen && (
        <div className='absolute right-0 z-50 mt-2 w-72 rounded-md border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2'>
          <div className='p-2'>
            <div className='flex items-center justify-between px-2 pb-2 mb-2 border-b border-gray-100'>
              <span className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                Select Users
              </span>
              {selectedActors.length > 0 && (
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
              {actors.map((actor) => {
                const isSelected = selectedActors.includes(actor.id)
                return (
                  <button
                    key={actor.id}
                    type='button'
                    onClick={() => toggleActor(actor.id)}
                    className={`flex items-center w-full px-2 py-2 text-sm rounded-md transition-colors ${
                      isSelected ? 'bg-[#387cae]/5 text-[#387cae]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`mr-3 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                      isSelected 
                        ? 'bg-[#387cae] border-[#387cae]' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <Check className='h-3 w-3 text-white' />}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden items-start pt-0.5">
                      <div className="flex items-center w-full">
                        <span className="truncate font-medium leading-tight">{actor.label}</span>
                        <span className="text-gray-400 text-[9px] ml-2 px-1.5 py-0.5 rounded-[4px] bg-gray-100 uppercase tracking-widest shrink-0">{actor.roleInfo}</span>
                      </div>
                      <span className="text-[11px] text-gray-500 truncate w-full text-left mt-0.5 leading-tight">{actor.email}</span>
                    </div>
                  </button>
                )
              })}
              {actors.length === 0 && (
                <div className="px-2 py-4 text-xs text-center text-gray-500">No users found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
