'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, ClipboardCheck, X, Building2, Layers, GraduationCap, Briefcase, Tag } from 'lucide-react'
import { debounce } from 'lodash'
import EmptyState from '@/ui/shadcn/EmptyState'
import {
  fetchFaculties,
  fetchLevels,
  fetchUniversities,
  getExams,
  fetchExamCategories
} from './actions'
import ExamShimmer from './components/ExamShimmer'
import { formatDate } from '@/utils/date.util'
import Pagination from '../blogs/components/Pagination'

// Memoized FilterSection component for the sidebar
const FilterSection = React.memo(function FilterSection({
  title,
  options,
  selectedValue,
  onSelect,
  icon: Icon,
  placeholder = 'Search...'
}) {
  const [localSearch, setLocalSearch] = useState('')
  
  const filteredOptions = useMemo(() => {
    return options.filter(opt => 
      (opt.title || opt.fullname || opt.name || '').toLowerCase().includes(localSearch.toLowerCase())
    )
  }, [options, localSearch])

  return (
    <div className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm'>
      <div className='flex items-center gap-2 mb-4'>
        {Icon && <Icon className='w-4 h-4 text-gray-400' />}
        <h3 className='text-gray-800 font-bold text-xs md:text-sm uppercase tracking-wider'>
          {title}
        </h3>
      </div>
      
      <div className='relative flex items-center mb-4'>
        <Search className='absolute left-3 w-3.5 h-3.5 text-gray-400' />
        <input
          type='text'
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={placeholder}
          className='w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-md text-xs outline-none focus:ring-1 focus:ring-[#0A70A7] transition-all'
        />
      </div>

      <div className='space-y-2.5 max-h-48 overflow-y-auto pr-2 sidebar-scrollbar custom-scrollbar'>
        {filteredOptions.length === 0 ? (
          <div className='text-center py-4 text-xs text-gray-400 italic'>No matches</div>
        ) : (
          filteredOptions.map((opt) => (
            <label key={opt.id} className='flex items-center gap-3 group cursor-pointer'>
              <input
                type='radio'
                name={title}
                checked={String(selectedValue) === String(opt.id)}
                onChange={() => onSelect(opt.id)}
                className='w-4 h-4 rounded-full border-gray-300 text-[#0A70A7] focus:ring-[#0A70A7] transition-all cursor-pointer'
              />
              <span className={`text-sm transition-colors ${String(selectedValue) === String(opt.id) ? 'text-[#0A70A7] font-bold' : 'text-gray-600 group-hover:text-gray-900 font-medium'}`}>
                {opt.title || opt.fullname || opt.name}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  )
})

const EXAM_TYPES = [
  { id: 'Written', title: 'Written' },
  { id: 'Practical', title: 'Practical' },
  { id: 'Oral', title: 'Oral' },
]

export default function ExamsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter options
  const [faculties, setFaculties] = useState([])
  const [levels, setLevels] = useState([])
  const [universities, setUniversities] = useState([])
  const [examCategories, setExamCategories] = useState([])

  // URL-synced params
  const q = searchParams.get('q') || ''
  const type = searchParams.get('type') || ''
  const levelId = searchParams.get('levelId') || ''
  const universityId = searchParams.get('universityId') || ''
  const discipline = searchParams.get('discipline') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const page = parseInt(searchParams.get('page')) || 1

  const [searchInputValue, setSearchInputValue] = useState(q)
  const [isSearching, setIsSearching] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  })

  const updateURL = useCallback((params) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
  }, [searchParams, pathname, router])

  // Initial options fetch
  useEffect(() => {
    const getOptions = async () => {
      try {
        const [facList, levelList, uniList, catList] = await Promise.all([
          fetchFaculties(),
          fetchLevels(),
          fetchUniversities(),
          fetchExamCategories()
        ])
        setFaculties(facList || [])
        setLevels(levelList || [])
        setUniversities(uniList || [])
        setExamCategories(catList || [])
      } catch (err) {
        console.error('Error fetching options:', err)
      }
    }
    getOptions()
  }, [])

  // Sync search input with URL
  useEffect(() => {
    setSearchInputValue(q)
  }, [q])

  const debouncedSearch = useMemo(
    () => debounce((val) => updateURL({ q: val, page: 1 }), 500),
    [updateURL]
  )

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchInputValue(val)
    debouncedSearch(val)
  }

  const fetchExams = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getExams(
        page,
        q,
        type,
        levelId,
        universityId,
        discipline,
        categoryId
      )
      setExams(response.items || [])
      setPagination({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalCount: response.pagination.totalCount
      })
    } catch (err) {
      setError('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }, [page, q, type, levelId, universityId, discipline, categoryId])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  const handlePageChange = (newPage) => {
    setIsScrolling(true)
    updateURL({ page: newPage })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => setIsScrolling(false), 500)
  }

  const clearFilters = () => {
    setSearchInputValue('')
    router.push(pathname, { scroll: false })
  }

  const handleFilterToggle = (key, val) => {
    const current = searchParams.get(key)
    const newVal = String(current) === String(val) ? '' : val
    updateURL({ [key]: newVal, page: 1 })
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='bg-red-50 border border-red-100 text-red-600 px-8 py-4 rounded-2xl font-bold shadow-sm font-sans'>
          {error}
        </div>
      </div>
    )
  }

  const hasAnyFilter = q || type || levelId || universityId || discipline || categoryId

  return (
    <div className='min-h-screen bg-gray-50/50 py-12 px-6 font-sans'>
      <div className='max-w-[1600px] mx-auto'>
        
        {/* Modern Header Section */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 border-b border-gray-100 pb-12'>
          <div className='flex-1 space-y-6 w-full'>
            <div className='flex items-center gap-4 mb-2'>
              <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                Exams
              </h1>
              <span className='bg-blue-50 text-[#0A6FA7] px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider'>
                {pagination.totalCount} Results
              </span>
            </div>

            <div className='flex bg-white items-center rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A70A7] focus-within:border-[#0A70A7] transition-all px-5 py-2.5 relative w-full group'>
              <Search className='w-5 h-5 text-gray-400 group-focus-within:text-[#0A70A7] transition-colors' />
              <input
                type='text'
                value={searchInputValue}
                onChange={handleSearchChange}
                placeholder='Search by exam title or description...'
                className='w-full px-4 py-2 bg-transparent text-base font-medium outline-none placeholder:text-gray-400'
              />
              <div className='absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3'>
                {isSearching && (
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A70A7]'></div>
                )}
                {searchInputValue && (
                  <button
                    onClick={() => { setSearchInputValue(''); updateURL({ q: '', page: 1 }) }}
                    className='p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all'
                  >
                    <X className='w-5 h-5' />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar + Main Grid Layout */}
        <div className='flex flex-col lg:flex-row gap-12'>
          
          {/* Sidebar */}
          <aside className='lg:w-[320px] space-y-8 shrink-0 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-160px)] overflow-y-auto pr-2 sidebar-scrollbar custom-scrollbar'>
            <div className='flex justify-between items-center mb-[-16px] px-1'>
              <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Refine By</span>
              {hasAnyFilter && (
                <button
                  className='text-gray-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider transition-colors'
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              )}
            </div>

            <FilterSection
              title='Exam Type'
              options={EXAM_TYPES}
              selectedValue={type}
              onSelect={(val) => handleFilterToggle('type', val)}
              icon={Briefcase}
            />

            <FilterSection
              title='Category'
              options={examCategories}
              selectedValue={categoryId}
              onSelect={(val) => handleFilterToggle('categoryId', val)}
              icon={Tag}
            />

            <FilterSection
              title='Academic Level'
              options={levels}
              selectedValue={levelId}
              onSelect={(val) => handleFilterToggle('levelId', val)}
              icon={GraduationCap}
            />

            <FilterSection
              title='Affiliation'
              options={universities}
              selectedValue={universityId}
              onSelect={(val) => handleFilterToggle('universityId', val)}
              icon={Building2}
            />

            <FilterSection
              title='Discipline'
              options={faculties}
              selectedValue={discipline}
              onSelect={(val) => handleFilterToggle('discipline', val)}
              icon={Layers}
            />
          </aside>

          {/* Main Grid Area */}
          <main className='flex-1'>
            {loading || isScrolling ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {[...Array(6)].map((_, i) => <ExamShimmer key={i} />)}
              </div>
            ) : exams.length === 0 ? (
              <div className='bg-white rounded-[2rem] border border-gray-100 border-dashed py-24'>
                <EmptyState
                  icon={ClipboardCheck}
                  title='No Exams Found'
                  description={
                    hasAnyFilter
                      ? 'No exams match your current filters. Try adjusting your selections.'
                      : 'No exams are currently listed in this category.'
                  }
                  action={hasAnyFilter ? { label: 'Clear All Filters', onClick: clearFilters } : null}
                />
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                  {exams.map((exam) => (
                    <div
                      key={exam.id}
                      onClick={() => router.push(`/exams/${exam.slugs}`)}
                      className='group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#0A6FA7]/20 transition-all duration-300 cursor-pointer flex flex-col'
                    >
                      <div className='flex items-start justify-between mb-6'>
                        <div className='bg-blue-50 p-3 rounded-xl group-hover:bg-[#0A6FA7] group-hover:text-white transition-all duration-300'>
                          <ClipboardCheck className='w-5 h-5 text-[#0A6FA7] group-hover:text-white' />
                        </div>
                        <div className='flex flex-col items-end gap-1.5'>
                          {exam.level?.title && (
                            <span className='px-2.5 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider border border-gray-100'>
                              {exam.level.title}
                            </span>
                          )}
                          {exam.exam_type && (
                            <span className='px-2.5 py-1 bg-emerald-50 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-wider'>
                              {exam.exam_type}
                            </span>
                          )}
                        </div>
                      </div>

                      <h2 className='text-lg font-bold text-gray-900 mb-3 group-hover:text-[#0A6FA7] transition-colors line-clamp-2 min-h-[3.5rem] leading-tight'>
                        {exam.title}
                      </h2>

                      {exam.affiliation && exam.affiliation.length > 0 && (
                        <div className='flex items-center gap-2 mb-5'>
                          <div className='flex -space-x-2'>
                            {exam.affiliation.slice(0, 3).map((uni, idx) => (
                              <div key={idx} className='w-6 h-6 rounded-full border-2 border-white bg-gray-50 overflow-hidden shrink-0'>
                                <img src={uni.logo || '/images/default-uni.png'} alt={uni.fullname} className='w-full h-full object-contain' />
                              </div>
                            ))}
                          </div>
                          <span className='text-[11px] font-bold text-gray-400 truncate'>
                            {exam.affiliation[0].fullname}
                            {exam.affiliation.length > 1 && ` +${exam.affiliation.length - 1} more`}
                          </span>
                        </div>
                      )}

                      <div className='mt-auto pt-5 border-t border-gray-50 space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                          <div className='flex flex-col'>
                            <span className='text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-0.5'>Closing</span>
                            <span className={`text-sm font-bold ${new Date(exam.closing_date) < new Date() ? 'text-red-500' : 'text-gray-700'}`}>
                              {formatDate(exam.closing_date) || 'TBD'}
                            </span>
                          </div>
                          <div className='flex flex-col text-right'>
                            <span className='text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-0.5'>Exam Date</span>
                            <span className='text-sm font-bold text-[#0A6FA7]'>
                              {formatDate(exam.exam_date) || 'TBD'}
                            </span>
                          </div>
                        </div>

                        <button className='w-full py-3.5 rounded-xl bg-gray-900 hover:bg-[#0A6FA7] text-white text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm group-hover:shadow-[#0A6FA7]/20'>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className='mt-12 flex justify-center'>
                    <Pagination pagination={pagination} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
