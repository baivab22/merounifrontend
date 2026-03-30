'use client'

import { CardSkeleton } from '@/ui/shadcn/CardSkeleton'
import EmptyState from '@/ui/shadcn/EmptyState'
import { formatDate } from '@/utils/date.util'
import { debounce } from 'lodash'
import { Briefcase, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import Pagination from '../blogs/components/Pagination'
import { fetchCategories } from '../(dashboard)/dashboard/category/action'
import { getCareers } from './actions'
import ApplyCareerModal from './components/ApplyCareerModal'

// Memoized FilterSection matching Admission/DegreePage
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
        {options.length === 0 ? (
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

const CareerPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const user = useSelector((state) => state.user?.data)

  const initialSearch = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialPage = parseInt(searchParams.get('page')) || 1

  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)

  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalCount: 0
  })

  const [categories, setCategories] = useState([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [filterInput, setFilterInput] = useState('')
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [selectedCareer, setSelectedCareer] = useState(null)

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
    const cat = searchParams.get('category') || ''
    const pg = parseInt(searchParams.get('page')) || 1

    setSearchTerm(q)
    setDebouncedSearch(q)
    setSelectedCategory(cat)
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

  // Fetch Categories for Sidebar
  const fetchCategoryList = useCallback(async (q = '') => {
    setIsCategoriesLoading(true)
    try {
      const data = await fetchCategories(1, 1000, 'CAREER', '', q)
      setCategories(data?.items || [])
    } catch (error) {
      console.error('Failed to load categories', error)
    } finally {
      setIsCategoriesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategoryList('')
  }, [fetchCategoryList])

  // Fetch Career Data
  const loadCareers = useCallback(
    async (page = 1, search = '', category = '') => {
      setLoading(true)
      try {
        const response = await getCareers(page, search, category)
        setCareers(response.items || [])
        setPagination((prev) => ({
          ...prev,
          currentPage: response.pagination?.currentPage || 1,
          totalPages: response.pagination?.totalPages || 1,
          totalCount: response.pagination?.totalCount || 0
        }))
      } catch (error) {
        console.error('Error fetching careers:', error)
        setCareers([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const q = searchParams.get('q') || ''
    const cat = searchParams.get('category') || ''
    const pg = parseInt(searchParams.get('page')) || 1
    loadCareers(pg, q, cat)
  }, [searchParams, loadCareers])

  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.totalPages) {
      updateURL({ page })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setFilterInput('')
    updateURL({ q: '', category: '', page: 1 })
  }

  const handleCategoryToggle = (catId) => {
    const newVal = selectedCategory === catId ? '' : catId
    setSelectedCategory(newVal)
    updateURL({ category: newVal, page: 1 })
  }

  return (
    <div className='min-h-screen bg-gray-50/50 py-12 px-6 font-sans'>
      <div className='max-w-7xl mx-auto'>
        {/* Header Section with Search */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 border-b border-gray-100 pb-12'>
          <div className='flex-1 space-y-6 w-full'>
            <div className='flex items-center gap-4 mb-2'>
              <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                Explore Careers
              </h1>
              <span className='bg-blue-50 text-[#0A6FA7] px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider'>
                {pagination.totalCount || '0'} Results
              </span>
            </div>

            <div className='flex bg-white items-center rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A6FA7] focus-within:border-[#0A6FA7] transition-all px-5 py-2.5 relative w-full group'>
              <Search className='w-5 h-5 text-gray-400 group-focus-within:text-[#0A6FA7] transition-colors' />
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search by job title or keywords...'
                className='w-full px-4 py-2 bg-transparent text-base font-medium outline-none placeholder:text-gray-400'
              />
              <div className='absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3'>
                {isSearching && (
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A6FA7]'></div>
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
          </div>
        </div>

        <div className='flex flex-col lg:flex-row gap-12'>
          {/* Sidebar (Left Side) */}
          <div className='lg:w-[320px] space-y-8 shrink-0 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-160px)] overflow-y-auto pr-2 sidebar-scrollbar'>
            <div className='flex justify-between items-center mb-[-16px] px-1'>
              <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
                Filters
              </span>
              {(searchTerm || selectedCategory) && (
                <button
                  className='text-gray-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider transition-colors'
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              )}
            </div>
            <FilterSection
              title='Department / Category'
              inputField='category'
              options={categories}
              selectedValues={selectedCategory ? [selectedCategory] : []}
              onCheckboxChange={handleCategoryToggle}
              defaultValue={filterInput}
              onSearchChange={(field, val) => {
                setFilterInput(val)
                fetchCategoryList(val)
              }}
              isLoading={isCategoriesLoading}
            />
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            {!loading && (
              <div className='mb-8 px-2'>
                <p className='text-sm text-gray-500 font-semibold'>
                  Showing <span className='text-gray-900'>{careers.length}</span>{' '}
                  of{' '}
                  <span className='text-gray-900'>{pagination.totalCount}</span>{' '}
                  results
                </p>
              </div>
            )}

            {/* Careers Grid */}
            {loading ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {Array(6)
                  .fill('')
                  .map((_, index) => (
                    <CardSkeleton key={index} />
                  ))}
              </div>
            ) : careers.length === 0 ? (
              <div className='bg-white rounded-[32px] border border-gray-100 border-dashed py-20'>
                <EmptyState
                  icon={Briefcase}
                  title='No Opportunities Found'
                  description={
                    searchTerm || selectedCategory
                      ? 'No career opportunities match your filters. Try clearing them to see more.'
                      : 'We are adding more opportunities soon!'
                  }
                  action={
                    searchTerm || selectedCategory
                      ? { label: 'Clear All Filters', onClick: clearFilters }
                      : null
                  }
                />
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  {careers.map((career) => (
                    <Link
                      href={`/career/${career.slugs}`}
                      key={career.id}
                      className='group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1'
                    >
                      <div className='relative h-52 bg-gray-100 overflow-hidden'>
                        <img
                          src={career.featuredImage || '/images/job.webp'}
                          alt={career.title}
                          className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700'
                        />
                        <div className='absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500' />
                        <div className='absolute bottom-4 left-4'>
                          <span className='bg-white/90 backdrop-blur-md text-[#0A6FA7] px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider'>
                            {career.category?.title || 'Open Role'}
                          </span>
                        </div>
                      </div>
                      <div className='p-8 flex flex-col h-[240px]'>
                        <h2 className='text-xl font-bold text-gray-900 mb-3 group-hover:text-[#0A6FA7] transition-all line-clamp-2 leading-tight'>
                          {career.title}
                        </h2>
                        <p className='text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed font-medium'>
                          {career.description}
                        </p>

                        <div className='mt-auto flex items-center justify-between pt-6 border-t border-gray-50'>
                           <div className='flex flex-col'>
                            <span className='text-[10px] uppercase tracking-widest font-bold text-gray-400'>
                              Posted
                            </span>
                            <span className='text-sm font-bold text-gray-700'>
                              {formatDate(career.createdAt)}
                            </span>
                          </div>

                          <div className='flex items-center gap-3'>
                            {career.status === 'inactive' ? (
                              <span className='px-4 py-1.5 bg-gray-100 text-gray-400 rounded-full text-xs font-bold uppercase'>
                                Expired
                              </span>
                            ) : career.hasApplied ? (
                              <span className='px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase'>
                                Applied
                              </span>
                            ) : (
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedCareer(career);
                                    setApplyModalOpen(true);
                                  }}
                                  className='px-5 py-1.5 bg-[#0A6FA7] text-white rounded-full text-[11px] font-bold hover:bg-[#0A6FA7]/90 transition-all uppercase tracking-wider'
                                >
                                  Apply
                                </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className='mt-20 flex justify-center'>
                    <Pagination
                      pagination={pagination}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {selectedCareer && (
        <ApplyCareerModal
          isOpen={applyModalOpen}
          onClose={() => {
            setApplyModalOpen(false)
            setSelectedCareer(null)
          }}
          careerId={selectedCareer.id}
          careerTitle={selectedCareer.title}
        />
      )}
    </div>
  )
}

export default CareerPage
