'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { debounce } from 'lodash'
import {
  Search,
  X,
  Loader2,
  BookOpen,
  Building2,
  SlidersHorizontal
} from 'lucide-react'
import ProgramCard from '@/ui/molecules/cards/ProgramCard'
import EmptyState from '@/ui/shadcn/EmptyState'
import Pagination from '@/ui/molecules/common/Pagination'
import { getPrograms, getUniversities, getLevels } from '../actions'

const FilterSection = React.memo(function FilterSection({
  title,
  inputField,
  options,
  selectedValues,
  onCheckboxChange,
  defaultValue,
  onSearchChange,
  isLoading
}) {
  const [localSearch, setLocalSearch] = useState(defaultValue || '')

  const debouncedSearch = useMemo(
    () => debounce((val) => onSearchChange(inputField, val), 300),
    [onSearchChange, inputField]
  )

  const handleInputChange = (e) => {
    const val = e.target.value
    setLocalSearch(val)
    debouncedSearch(val)
  }

  useEffect(() => {
    setLocalSearch(defaultValue || '')
  }, [defaultValue])

  return (
    <div className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-gray-900 font-bold text-xs uppercase tracking-widest'>
          {title}
        </h3>
      </div>
      <div className='relative flex items-center mb-4'>
        <Search className='absolute left-3 w-4 h-4 text-gray-400' />
        <input
          type='text'
          value={localSearch}
          onChange={handleInputChange}
          placeholder={`Search ${title.toLowerCase()}...`}
          className='w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#0A70A7] transition-all'
        />
        {isLoading && (
          <div className='absolute right-3'>
            <Loader2 className='animate-spin h-4 w-4 text-[#0A70A7]' />
          </div>
        )}
      </div>
      <div className='mt-2 space-y-2 h-36 overflow-y-auto pr-2 custom-scrollbar'>
        {options.length === 0 ? (
          <div className='text-center py-6 text-xs text-gray-400 italic'>
            No matches
          </div>
        ) : (
          options.map((opt) => (
            <label
              key={opt.id}
              className='flex items-center gap-3 group cursor-pointer'
            >
              <input
                type='checkbox'
                checked={selectedValues.includes(String(opt.id))}
                onChange={() => onCheckboxChange(opt.id)}
                className='w-4 h-4 rounded border-gray-300 text-[#0A70A7] focus:ring-[#0A70A7]'
              />
              <span className='text-gray-600 group-hover:text-[#0A70A7] text-sm font-medium transition-colors'>
                {opt.name}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  )
})

const Body = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page')) || 1
  const selectedLevelIds = useMemo(
    () => searchParams.get('level_id')?.split(',').filter(Boolean) || [],
    [searchParams]
  )
  const selectedUniversityIds = useMemo(
    () => searchParams.get('university_ids')?.split(',').filter(Boolean) || [],
    [searchParams]
  )

  const [programs, setPrograms] = useState([])
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchInputValue, setSearchInputValue] = useState(q)
  const [isSearching, setIsSearching] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [universities, setUniversities] = useState([])
  const [levels, setLevels] = useState([])
  const [unisLoading, setUnisLoading] = useState(false)
  const [levelsLoading, setLevelsLoading] = useState(false)
  const [filterSearch, setFilterSearch] = useState({ uni: '', level: '' })

  const updateURL = useCallback(
    (params) => {
      const newParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) newParams.set(key, value.join(','))
          else newParams.delete(key)
        } else if (value !== undefined && value !== null && value !== '') {
          newParams.set(key, value)
        } else {
          newParams.delete(key)
        }
      })
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  useEffect(() => {
    const init = async () => {
      const [uRes, lRes] = await Promise.all([getUniversities(), getLevels()])
      setUniversities(uRes.map((u) => ({ id: u.id, name: u.fullname })))
      setLevels(lRes.map((l) => ({ id: l.id, name: l.title })))
    }
    init()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await getPrograms(page, {
          q,
          university_ids: selectedUniversityIds.join(','),
          level_id: selectedLevelIds.join(',')
        })
        setPrograms(data.programs)
        setPagination(data.pagination)
      } finally {
        setLoading(false)
        setIsSearching(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    loadData()
  }, [page, q, selectedLevelIds, selectedUniversityIds])

  const debouncedSearch = useMemo(
    () => debounce((value) => updateURL({ q: value, page: 1 }), 500),
    [updateURL]
  )

  const handleSearchChange = (e) => {
    setSearchInputValue(e.target.value)
    setIsSearching(true)
    debouncedSearch(e.target.value)
  }

  const handleFilterChange = (type, id) => {
    const currentParam = type === 'uni' ? 'university_ids' : 'level_id'
    const currentValues =
      type === 'uni' ? selectedUniversityIds : selectedLevelIds

    const nextValues = currentValues.includes(String(id))
      ? currentValues.filter((v) => v !== String(id))
      : [...currentValues, String(id)]

    updateURL({ [currentParam]: nextValues, page: 1 })
  }

  const handleFilterSearch = async (field, value) => {
    setFilterSearch((prev) => ({ ...prev, [field]: value }))
    if (field === 'uni') {
      setUnisLoading(true)
      const res = await getUniversities(value)
      setUniversities(res.map((u) => ({ id: u.id, name: u.fullname })))
      setUnisLoading(false)
    } else {
      setLevelsLoading(true)
      const res = await getLevels(value)
      setLevels(res.map((l) => ({ id: l.id, name: l.title })))
      setLevelsLoading(false)
    }
  }

  return (
    <>
      <div className='max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 py-10 mb-20'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 border-b border-gray-100 pb-12'>
          <div className='flex-1 w-full space-y-6'>
            <div className='flex items-center gap-4 mb-2'>
              <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                Programs
              </h1>
              <span className='bg-blue-50 text-[#0A70A7] px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider'>
                {pagination.totalCount || '0'} Available
              </span>
            </div>

            <div className='flex items-stretch gap-3 w-full'>
              <div className='flex-1 flex bg-white items-center rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A70A7] focus-within:border-[#0A70A7] transition-all px-5 py-2.5 relative group'>
                <Search className='w-5 h-5 text-gray-400 group-focus-within:text-[#0A70A7] transition-colors' />
                <input
                  type='text'
                  value={searchInputValue}
                  onChange={handleSearchChange}
                  placeholder='Search programs, degrees or domains...'
                  className='w-full px-4 py-2 bg-transparent text-base font-medium outline-none placeholder:text-gray-400'
                />
                <div className='absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3'>
                  {isSearching && (
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A70A7]'></div>
                  )}
                  {searchInputValue && (
                    <button
                      onClick={() => {
                        setSearchInputValue('')
                        updateURL({ q: '', page: 1 })
                      }}
                      className='p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all'
                    >
                      <X className='w-5 h-5' />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(true)}
                className='lg:hidden px-4 bg-white border border-gray-300 rounded-2xl shadow-sm text-gray-600 hover:text-[#0A70A7] hover:border-[#0A70A7] transition-all flex items-center justify-center shrink-0'
                aria-label='Open Filters'
              >
                <SlidersHorizontal className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row gap-12'>
          {/* Sidebar */}
          <aside className='lg:w-[320px] shrink-0 space-y-8 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar'>
            <div className='flex justify-between items-center mb-[-12px]'>
              <span className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]'>
                Refine Results
              </span>
              <button
                onClick={() => router.push(pathname, { scroll: false })}
                className='text-xs font-bold text-[#0A70A7] hover:text-red-500 transition-colors uppercase'
              >
                Clear All
              </button>
            </div>

            <FilterSection
              title='Education Level'
              inputField='level'
              options={levels}
              selectedValues={selectedLevelIds}
              onCheckboxChange={(id) => handleFilterChange('level', id)}
              defaultValue={filterSearch.level}
              onSearchChange={handleFilterSearch}
              isLoading={levelsLoading}
            />

            <FilterSection
              title='University'
              inputField='uni'
              options={universities}
              selectedValues={selectedUniversityIds}
              onCheckboxChange={(id) => handleFilterChange('uni', id)}
              defaultValue={filterSearch.uni}
              onSearchChange={handleFilterSearch}
              isLoading={unisLoading}
            />
          </aside>

          {/* Content Area */}
          <main className='flex-1'>
            {loading ? (
              <div className='grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8'>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className='h-[400px] bg-gray-50 animate-pulse rounded-xl border border-gray-100'
                  />
                ))}
              </div>
            ) : programs.length > 0 ? (
              <>
                <div className='grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8'>
                  {programs.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className='mt-20 flex justify-center'>
                    <div className='bg-white px-8 py-4 rounded-[24px] shadow-sm border border-gray-100'>
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={(p) => updateURL({ page: p })}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className='py-20'>
                <EmptyState
                  icon={BookOpen}
                  title='No Programs Found'
                  description="Try adjusting your filters or search query to find what you're looking for."
                  action={{
                    label: 'Clear All Filters',
                    onClick: () => router.push(pathname, { scroll: false })
                  }}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className='fixed inset-0 z-[100] lg:hidden'>
          <div
            className='absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity'
            onClick={() => setShowMobileFilters(false)}
          />
          <div className='absolute right-0 top-0 h-full w-[85%] max-w-[400px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300'>
            <div className='p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10'>
              <div className='flex flex-col'>
                <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                  Filters
                </span>
                <h2 className='text-lg font-bold text-gray-900'>
                  Refine Results
                </h2>
              </div>
              <div className='flex items-center gap-4'>
                <button
                  className='text-[#0A70A7] font-bold text-xs uppercase tracking-wider'
                  onClick={() => {
                    router.push(pathname, { scroll: false })
                    setShowMobileFilters(false)
                  }}
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className='p-2 hover:bg-gray-100 rounded-full text-gray-500'
                >
                  <X className='w-6 h-6' />
                </button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar'>
              <FilterSection
                title='Education Level'
                inputField='level'
                options={levels}
                selectedValues={selectedLevelIds}
                onCheckboxChange={(id) => handleFilterChange('level', id)}
                defaultValue={filterSearch.level}
                onSearchChange={handleFilterSearch}
                isLoading={levelsLoading}
              />

              <FilterSection
                title='University'
                inputField='uni'
                options={universities}
                selectedValues={selectedUniversityIds}
                onCheckboxChange={(id) => handleFilterChange('uni', id)}
                defaultValue={filterSearch.uni}
                onSearchChange={handleFilterSearch}
                isLoading={unisLoading}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Body
