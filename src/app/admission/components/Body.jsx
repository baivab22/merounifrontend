'use client'
import AdmissionCard from '@/ui/molecules/cards/AdmissionCard'
import AdmissionCardSkeleton from './AdmissionCardSkeleton'
import EmptyState from '@/ui/shadcn/EmptyState'
import { debounce } from 'lodash'
import { Clipboard, Search, X, SlidersHorizontal } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Pagination from '@/ui/molecules/common/Pagination'
import { fetchCourses, getAdmission } from '../actions'

// Memoized FilterSection matching DegreePage
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
        <h3 className='text-gray-800 font-bold text-xs md:text-sm uppercase tracking-wider'>
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
          className='w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0A70A7] focus:border-[#0A70A7] transition-all'
        />
        {isLoading && (
          <div className='absolute right-3'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-[#0A70A7]'></div>
          </div>
        )}
      </div>
      <div className='mt-2 space-y-2.5 overflow-y-auto h-48 pr-2 custom-scrollbar'>
        {isLoading ? (
          <div className='flex items-center justify-center h-full'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A70A7]'></div>
          </div>
        ) : options.length === 0 ? (
          <div className='text-center py-6 text-xs text-gray-400 italic font-medium'>
            No matches found
          </div>
        ) : (
          options.map((opt, idx) => (
            <label
              key={idx}
              className='flex items-center gap-3 group cursor-pointer'
            >
              <input
                type='checkbox'
                checked={selectedValues.includes(opt.id?.toString())}
                onChange={() => onCheckboxChange(opt.id?.toString())}
                className='w-4 h-4 rounded border-gray-300 text-[#0A70A7] focus:ring-[#0A70A7] transition-all cursor-pointer'
              />
              <span className='text-gray-600 group-hover:text-gray-900 text-sm font-medium transition-colors'>
                {opt.title}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  )
})

const AdmissionPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const initialSearch = searchParams.get('q') || ''
  const initialProgram = searchParams.get('program') || ''
  const initialPage = parseInt(searchParams.get('page')) || 1

  const [admission, setAdmission] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [selectedProgram, setSelectedProgram] = useState(initialProgram)

  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalCount: 0
  })

  const [programs, setPrograms] = useState([])
  const [isProgramsLoading, setIsProgramsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [filterInput, setFilterInput] = useState('')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // URL Sync Helper
  const updateURL = useCallback(
    (params) => {
      const newParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value)
        } else {
          newParams.delete(key)
        }
      })
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  // Sync state with URL
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const prog = searchParams.get('program') || ''
    const pg = parseInt(searchParams.get('page')) || 1

    setSearchTerm(q)
    setDebouncedSearch(q)
    setSelectedProgram(prog)
    setPagination((prev) => ({ ...prev, currentPage: pg }))
  }, [searchParams])

  // Debounce main search
  useEffect(() => {
    setIsSearching(true)
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setIsSearching(false)
      if (searchTerm !== initialSearch) {
        updateURL({ q: searchTerm, page: 1 })
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm, initialSearch, updateURL])

  // Fetch Programs for Sidebar
  const fetchProgramList = useCallback(async (q = '') => {
    setIsProgramsLoading(true)
    const data = await fetchCourses(q)
    setPrograms(data || [])
    setIsProgramsLoading(false)
  }, [])

  useEffect(() => {
    fetchProgramList('')
  }, [fetchProgramList])

  // Fetch Admission Data
  const fetchAdmissionData = useCallback(
    async (page = 1, search = '', course = '') => {
      setLoading(true)
      try {
        const response = await getAdmission(search, page, course)
        setAdmission(response.items || [])
        setPagination((prev) => ({
          ...prev,
          totalPages: response.pagination?.totalPages ?? 1,
          totalCount: response.pagination?.totalCount ?? 0
        }))
      } catch (error) {
        console.error('Error:', error)
        setAdmission([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const q = searchParams.get('q') || ''
    const prog = searchParams.get('program') || ''
    const pg = parseInt(searchParams.get('page')) || 1
    fetchAdmissionData(pg, q, prog)
  }, [searchParams, fetchAdmissionData])

  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.totalPages) {
      updateURL({ page })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedProgram('')
    setFilterInput('')
    updateURL({ q: '', program: '', page: 1 })
  }

  const handleProgramToggle = (progId) => {
    const newVal = selectedProgram === progId ? '' : progId
    setSelectedProgram(newVal)
    updateURL({ program: newVal, page: 1 })
  }

  return (
    <div className='min-h-screen bg-gray-50/50 py-12 px-6 font-sans'>
      <div className='max-w-[1600px] mx-auto'>
        {/* Header Section with Search */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 border-b border-gray-100 pb-12'>
          <div className='flex-1 space-y-6 w-full'>
            <div className='flex items-center gap-4 mb-2'>
              <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                Admissions
              </h1>
              <span className='bg-blue-50 text-[#0A70A7] px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider'>
                {pagination.totalCount || '0'} Results
              </span>
            </div>

            <div className='flex items-center gap-3 w-full'>
              <div className='flex-1 flex bg-white items-center rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A70A7] focus-within:border-[#0A70A7] transition-all px-5 py-2.5 relative group'>
                <Search className='w-5 h-5 text-gray-400 group-focus-within:text-[#0A70A7] transition-colors' />
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Search by college or course...'
                  className='w-full px-4 py-2 bg-transparent text-base font-medium outline-none placeholder:text-gray-400'
                />
                <div className='absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3'>
                  {isSearching && (
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A70A7]'></div>
                  )}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className='p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all'
                    >
                      <X className='w-5 h-5' />
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowMobileFilters(true)}
                className='lg:hidden p-3.5 bg-white border border-gray-300 rounded-2xl shadow-sm text-gray-600 hover:text-[#0A70A7] hover:border-[#0A70A7] transition-all flex items-center justify-center shrink-0'
                aria-label='Open Filters'
              >
                <SlidersHorizontal className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar & Content Section */}
        <div className='flex flex-col lg:flex-row gap-12'>
          {/* Sidebar (Desktop) */}
          <div className='lg:w-[320px] space-y-8 shrink-0 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-160px)] overflow-y-auto pr-2 sidebar-scrollbar'>
            <div className='flex justify-between items-center mb-[-16px] px-1'>
              <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                Filters
              </span>
              {(searchTerm || selectedProgram) && (
                <button
                  className='text-gray-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider transition-colors'
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              )}
            </div>
            <FilterSection
              title='Program'
              inputField='program'
              options={programs}
              selectedValues={selectedProgram ? [selectedProgram] : []}
              onCheckboxChange={handleProgramToggle}
              defaultValue={filterInput}
              onSearchChange={(field, val) => {
                setFilterInput(val)
                fetchProgramList(val)
              }}
              isLoading={isProgramsLoading}
            />
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            {!loading && (
              <div className='mb-8 px-2'>
                <p className='text-sm text-gray-500 font-semibold'>
                  Showing{' '}
                  <span className='text-gray-900'>{admission.length}</span> of{' '}
                  <span className='text-gray-900'>{pagination.totalCount}</span>{' '}
                  results
                </p>
              </div>
            )}

            {/* Admissions Grid */}
            {loading ? (
              <div className='grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-10'>
                {Array(6)
                  .fill('')
                  .map((_, index) => (
                    <AdmissionCardSkeleton key={index} />
                  ))}
              </div>
            ) : admission.length === 0 ? (
              <div className='bg-white rounded-[32px] border border-gray-100 border-dashed py-20'>
                <EmptyState
                  icon={Clipboard}
                  title='No Admissions Found'
                  description={
                    searchTerm || selectedProgram
                      ? 'No admissions match your selected filters. Try clearing them to see more.'
                      : 'No admission details are currently available'
                  }
                  action={
                    searchTerm || selectedProgram
                      ? { label: 'Clear All Filters', onClick: clearFilters }
                      : null
                  }
                />
              </div>
            ) : (
              <>
                <div className='grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-10'>
                  {admission.map((admis) => (
                    <AdmissionCard key={admis.id} admis={admis} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className='mt-20 flex justify-center'>
                    <div className='bg-white px-8 py-4 rounded-[24px] shadow-sm border border-gray-100'>
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
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
                    clearFilters()
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

            <div className='flex-1 overflow-y-auto p-5 space-y-6 sidebar-scrollbar'>
              <FilterSection
                title='Program'
                inputField='program'
                options={programs}
                selectedValues={selectedProgram ? [selectedProgram] : []}
                onCheckboxChange={handleProgramToggle}
                defaultValue={filterInput}
                onSearchChange={(field, val) => {
                  setFilterInput(val)
                  fetchProgramList(val)
                }}
                isLoading={isProgramsLoading}
              />
            </div>

            <div className='p-5 border-t border-gray-100 bg-gray-50 sticky bottom-0'>
              <button
                onClick={() => setShowMobileFilters(false)}
                className='w-full py-4 bg-[#0A70A7] text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-[#085a86] transition-all'
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdmissionPage
