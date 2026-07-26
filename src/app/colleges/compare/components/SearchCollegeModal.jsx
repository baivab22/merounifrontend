'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, MapPin } from 'lucide-react'

const SearchCollegeModal = ({ isOpen, onClose, onSelect, selectedSlugs = [] }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef(null)
  const searchTimeout = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  const handleSearch = useCallback((val) => {
    setQuery(val)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)

    if (val.trim().length === 0) {
      setResults([])
      return
    }

    setIsSearching(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.baseUrl}/college?page=1&limit=1000&q=${val}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
          }
        )

        if (!response.ok) throw new Error('Search failed')

        const data = await response.json()
        const colleges = (data.items || []).map((clz) => ({
          id: clz.id,
          slug: clz.slug,
          name: clz.name,
          logo: clz.college_logo,
          location: `${clz.address?.city || ''}, ${clz.address?.district || ''}`,
          collegeImage: clz.featured_img
        }))
        setResults(colleges)
      } catch (err) {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500)
  }, [])

  const isAlreadySelected = (slug) => selectedSlugs.includes(slug)

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-[1000] flex items-start justify-center pt-[10vh] sm:pt-[12vh] px-4'>
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      <div className='relative z-50 w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
          <h3 className='font-bold text-gray-900 text-sm'>Search & Add College</h3>
          <button
            onClick={onClose}
            className='w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors'
          >
            <X className='w-4 h-4 text-gray-400' />
          </button>
        </div>

        {/* Search Input */}
        <div className='px-5 py-4'>
          <div className='flex items-center bg-white rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A70A7] focus-within:border-[#0A70A7] transition-all px-5 py-2.5 group'>
            <Search className='w-5 h-5 text-gray-400 group-focus-within:text-[#0A70A7] transition-colors' />
            <input
              ref={inputRef}
              type='text'
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder='Search by college name...'
              className='w-full px-4 py-2 bg-transparent text-base font-medium outline-none placeholder:text-gray-400'
            />
            <div className='flex items-center gap-3'>
              {isSearching && (
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A70A7]' />
              )}
              {query && (
                <button
                  onClick={() => { setQuery(''); setResults([]) }}
                  className='p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all'
                  title='Clear search'
                >
                  <X className='w-5 h-5' />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className='max-h-[50vh] overflow-y-auto px-2 pb-3'>
          {isSearching && results.length === 0 && (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A70A7]' />
            </div>
          )}

          {!isSearching && query.length > 0 && results.length === 0 && (
            <div className='text-center py-10 text-sm text-gray-400 font-medium'>
              No colleges found
            </div>
          )}

          {!isSearching && query.length === 0 && (
            <div className='text-center py-10 text-sm text-gray-400 font-medium'>
              Type to search colleges
            </div>
          )}

          {results.length > 0 && (
            <div className='space-y-1'>
              {results.map((college) => {
                const selected = isAlreadySelected(college.slug)
                return (
                  <button
                    key={college.slug}
                    onClick={() => !selected && onSelect(college)}
                    disabled={selected}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                      selected
                        ? 'bg-gray-50 opacity-50 cursor-default'
                        : 'hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0'>
                      {college.logo ? (
                        <img src={college.logo} alt={college.name} className='w-full h-full object-cover' />
                      ) : (
                        <span className='text-sm font-bold text-[#0A70A7]'>
                          {college.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-gray-900 truncate'>
                        {college.name}
                      </p>
                      <div className='flex items-center gap-1 mt-0.5'>
                        <MapPin className='w-3 h-3 text-gray-400' />
                        <p className='text-xs text-gray-500 truncate'>
                          {college.location || 'Nepal'}
                        </p>
                      </div>
                    </div>
                    {selected && (
                      <span className='text-xs text-gray-400 font-medium'>Added</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchCollegeModal
