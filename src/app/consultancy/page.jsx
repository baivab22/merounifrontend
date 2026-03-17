'use client'

import ConsultancyCard from '@/ui/molecules/cards/ConsultancyCard'
import { CardSkeleton } from '@/ui/shadcn/CardSkeleton'
import EmptyState from '@/ui/shadcn/EmptyState'
import { debounce } from 'lodash'
import { Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { IoSearch } from 'react-icons/io5'
import Footer from '../../components/Frontpage/Footer'
import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Pagination from '../blogs/components/Pagination'
import { getConsultancies, getConsultancyLocations } from './actions'

// Memoized FilterSection with local state for performant typing
const FilterSection = React.memo(function FilterSection({
  title,
  options,
  selectedValues,
  onSelect,
  onRemove,
  placeholder = "Search..."
}) {
  const [localSearch, setLocalSearch] = useState('')

  const filteredOptions = useMemo(() => {
    if (!localSearch) return options
    return options.filter(opt =>
      opt.toLowerCase().includes(localSearch.toLowerCase())
    )
  }, [options, localSearch])

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
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={placeholder}
          className='w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#0A70A7] focus:border-[#0A70A7] transition-all'
        />
      </div>
      <div className='mt-2 space-y-2.5 overflow-y-auto h-36 pr-2 custom-scrollbar'>
        {filteredOptions.length === 0 ? (
          <div className='text-center py-6 text-xs text-gray-400 italic font-medium'>
            No matches found
          </div>
        ) : (
          filteredOptions.map((opt, idx) => {
            const isSelected = selectedValues.includes(opt)
            return (
              <label
                key={idx}
                className='flex items-center gap-3 group cursor-pointer'
              >
                <input
                  type='checkbox'
                  checked={isSelected}
                  onChange={() => isSelected ? onRemove(opt) : onSelect(opt)}
                  className='w-4 h-4 rounded border-gray-300 text-[#0A70A7] focus:ring-[#0A70A7] transition-all cursor-pointer'
                />
                <span className='text-gray-600 group-hover:text-gray-900 text-sm font-medium transition-colors'>
                  {opt}
                </span>
              </label>
            )
          })
        )}
      </div>
    </div>
  )
})

export default function ConsultanciesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Initialization from search params
  const initialSearch = searchParams.get('q') || ''
  const initialPage = parseInt(searchParams.get('page')) || 1
  const initialCity = searchParams.get('city') || ''
  const initialDest = searchParams.get('destination') || ''

  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [consultancyData, setConsultancyData] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  // Filter Data
  const [locations, setLocations] = useState({ cities: [], destinations: [] })
  const [selectedCity, setSelectedCity] = useState(initialCity)
  const [selectedDestination, setSelectedDestination] = useState(initialDest)

  // URL Sync Helper
  const updateURL = useCallback((params) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
  }, [searchParams, pathname, router])

  // Fetch Locations/Destinations
  useEffect(() => {
    async function loadLocations() {
      const res = await getConsultancyLocations()
      if (res?.data) {
        setLocations({
          cities: (res.data.cities || []).map(c => typeof c === 'string' ? c : c.city || c.name || '').filter(Boolean),
          destinations: (res.data.destinations || []).map(d => typeof d === 'string' ? d : d.country || d.name || '').filter(Boolean)
        })
      }
    }
    loadLocations()
  }, [])

  // Sync state with URL
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const pg = parseInt(searchParams.get('page')) || 1
    const city = searchParams.get('city') || ''
    const dest = searchParams.get('destination') || ''

    setSearchTerm(q)
    setSelectedCity(city)
    setSelectedDestination(dest)
    setPagination(prev => ({ ...prev, currentPage: pg }))
  }, [searchParams])

  // Scroll to top on URL change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [searchParams])

  // Debouncing logic (Updates URL)
  const debouncedSearch = useMemo(
    () => debounce((val) => updateURL({ q: val, page: 1 }), 500),
    [updateURL]
  )

  useEffect(() => {
    if (searchTerm !== initialSearch) {
      debouncedSearch(searchTerm)
      return () => debouncedSearch.cancel()
    }
  }, [searchTerm, initialSearch, debouncedSearch])

  // Fetch consultancies when URL params change
  useEffect(() => {
    async function fetchData() {
      const q = searchParams.get('q') || ''
      const pg = parseInt(searchParams.get('page')) || 1
      const city = searchParams.get('city') || ''
      const destination = searchParams.get('destination') || ''

      setLoading(true)
      try {
        if (q) setIsSearching(true)
        const data = await getConsultancies(pg, q, '', city, destination)
        setConsultancyData(data.items)
        setPagination((prev) => ({
          ...prev,
          totalPages: data.pagination.totalPages,
          totalCount: data.pagination.totalCount
        }))
        if (q) setIsSearching(false)
      } catch (err) {
        setConsultancyData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchParams])

  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.totalPages) {
      updateURL({ page })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    updateURL({ q: '', city: '', destination: '', page: 1 })
  }

  return (
    <>
      <div className='bg-gray-50/50'>
        <div className='max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 mb-20'>
          {/* Header & Search Section */}
          <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 border-b border-gray-100 pb-12'>
            <div className='flex-1 space-y-6 w-full'>
              <div className='flex items-center gap-4 mb-2'>
                <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                  Explore <span className='text-[#0A6FA7]'>Consultancies</span>
                </h1>
                <span className='bg-blue-50 text-[#0A70A7] px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider'>
                  {pagination.totalCount || '0'} Results
                </span>
              </div>

              <div className='flex bg-white items-center rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A6FA7] focus-within:border-[#0A6FA7] transition-all px-5 py-2.5 relative w-full group'>
                <IoSearch className='w-5 h-5 text-gray-400 group-focus-within:text-[#0A6FA7] transition-colors' />
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Search consultancies by name...'
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
                      title='Clear search'
                    >
                      <X className='w-5 h-5' />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col lg:flex-row gap-12'>
            {/* Sidebar Filters */}
            <div className='lg:w-[320px] space-y-8 shrink-0 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-160px)] overflow-y-auto pr-2 sidebar-scrollbar'>
              <div className='flex justify-between items-center mb-[-16px] px-1'>
                <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Filters</span>
                {(searchTerm || selectedCity || selectedDestination) && (
                  <button
                    className='text-gray-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider transition-colors'
                    onClick={clearFilters}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <FilterSection
                title='Location'
                options={locations.cities}
                selectedValues={selectedCity ? [selectedCity] : []}
                onSelect={(val) => updateURL({ city: val, page: 1 })}
                onRemove={() => updateURL({ city: '', page: 1 })}
                placeholder="Search city..."
              />

              <FilterSection
                title='Student Destination'
                options={locations.destinations}
                selectedValues={selectedDestination ? [selectedDestination] : []}
                onSelect={(val) => updateURL({ destination: val, page: 1 })}
                onRemove={() => updateURL({ destination: '', page: 1 })}
                placeholder="Search destination..."
              />
            </div>

            {/* Main Content */}
            <div className='flex-1'>
              {loading ? (
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10'>
                  {Array(6).fill('').map((_, idx) => (
                    <CardSkeleton key={idx} />
                  ))}
                </div>
              ) : consultancyData.length === 0 ? (
                <div className='bg-white rounded-[32px] border border-gray-100 border-dashed py-20'>
                  <EmptyState
                    icon={Search}
                    title='No Consultancies Found'
                    description={
                      searchTerm
                        ? `No consultancies match your search "${searchTerm}"`
                        : (selectedCity || selectedDestination)
                          ? "No consultancies match the selected filters."
                          : 'No consultancies are currently available'
                    }
                    action={
                      (searchTerm || selectedCity || selectedDestination)
                        ? {
                          label: 'Clear All Filters',
                          onClick: clearFilters
                        }
                        : null
                    }
                  />
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10'>
                  {[...consultancyData]
                    .sort((a, b) => (b.pinned === 1 ? 1 : 0) - (a.pinned === 1 ? 1 : 0))
                    .map((consultancy) => (
                      <ConsultancyCard
                        key={consultancy.id}
                        consultancy={consultancy}
                      />
                    ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className='mt-16 flex justify-center'>
                  <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
