'use client'
import EmptyState from '@/ui/shadcn/EmptyState'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'
import { Building2, ClipboardCheck, Search, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { useSearchParams } from 'next/navigation'
import Pagination from '../blogs/components/Pagination'
import {
  fetchFaculties,
  fetchLevels,
  fetchUniversities,
  getExams,
  fetchExamCategories
} from './actions'
import ExamShimmer from './components/ExamShimmer'
import SingleExam from './components/SingleExam'
import { formatDate } from '@/utils/date.util'

const EXAM_TYPES = [
  { id: 'Written', title: 'Written' },
  { id: 'Practical', title: 'Practical' },
  { id: 'Oral', title: 'Oral' },
]

export default function ExamsPage() {
  const searchParams = useSearchParams()

  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSingle, setShowSingle] = useState(false)
  const [singleExam, setSingleExam] = useState([])

  // Search state
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)

  // Filter data
  const [faculties, setFaculties] = useState([])
  const [levels, setLevels] = useState([])
  const [universities, setUniversities] = useState([])
  const [examCategories, setExamCategories] = useState([])

  // Selected filter values (single object or null)
  const [selectedType, setSelectedType] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [selectedAffiliation, setSelectedAffiliation] = useState(null)
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')

  const [isScrolling, setIsScrolling] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  })

  // Fetch filter options on mount
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
        console.error('Error fetching filter options:', err)
      }
    }
    getOptions()
  }, [])

  const fetchExams = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getExams(
        pagination.currentPage,
        debouncedSearch,
        selectedType?.id || '',
        selectedLevel?.id || '',
        selectedAffiliation?.id || '',
        selectedFaculty?.id || '',
        selectedCategory
      )
      setExams(response.items)
      setPagination((prev) => ({
        ...prev,
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalCount: response.pagination.totalCount
      }))
    } catch (err) {
      setError('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }, [
    pagination.currentPage,
    debouncedSearch,
    selectedType,
    selectedLevel,
    selectedAffiliation,
    selectedFaculty,
    selectedCategory
  ])

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  // Scroll to top on pagination change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [searchParams, pagination.currentPage])

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
  }, [debouncedSearch, selectedType, selectedLevel, selectedAffiliation, selectedFaculty, selectedCategory])

  const handleClick = (id) => {
    const single = exams.find((item) => item.id === id)
    setSingleExam(single ? [single] : [])
    setShowSingle(true)
  }

  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.totalPages) {
      setIsScrolling(true)
      setPagination((prev) => ({ ...prev, currentPage: page }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => setIsScrolling(false), 500)
    }
  }

  const hasFilters = search || selectedType || selectedLevel || selectedAffiliation || selectedFaculty || selectedCategory

  const clearFilters = () => {
    setSearch('')
    setSelectedType(null)
    setSelectedLevel(null)
    setSelectedAffiliation(null)
    setSelectedFaculty(null)
    setSelectedCategory('')
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='bg-red-50 border border-red-100 text-red-600 px-8 py-4 rounded-2xl font-bold shadow-sm'>
          {error}
        </div>
      </div>
    )
  }

  return (
    <>
      {!showSingle ? (
        <div className='min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6'>
          <div className='max-w-7xl mx-auto'>

            {/* ── Page Header ── */}
            <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8'>
              <div>
                <div className='relative inline-block mb-3'>
                  <h1 className='text-3xl md:text-4xl font-extrabold text-gray-900'>
                    Explore <span className='text-[#0A6FA7]'>Exams</span>
                  </h1>
                  <div className='absolute -bottom-2 left-0 w-14 h-1 bg-[#0A6FA7] rounded-full' />
                </div>
                <p className='text-gray-500 max-w-xl text-sm font-medium mt-2'>
                  Find upcoming entrance and periodic exams tailored to your academic path.
                </p>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className='flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-600 transition-colors shrink-0'
                >
                  <X className='w-4 h-4' />
                  Clear Filters
                </button>
              )}
            </div>

            {/* ── Category Pills ── */}
            <div className='flex flex-wrap gap-2 mb-6'>
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${selectedCategory === ''
                    ? 'bg-[#0A6FA7] text-white border-[#0A6FA7] shadow-md shadow-[#0A6FA7]/20'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#0A6FA7] hover:text-[#0A6FA7]'
                  }`}
              >
                All Exams
              </button>
              {examCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${selectedCategory === cat.id
                      ? 'bg-[#0A6FA7] text-white border-[#0A6FA7] shadow-md shadow-[#0A6FA7]/20'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#0A6FA7] hover:text-[#0A6FA7]'
                    }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* ── Filter Bar ── */}
            <div className='bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>

                {/* Search */}
                <div>
                  <label className='block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5'>
                    Search
                  </label>
                  <div className='relative'>
                    <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                    <input
                      type='text'
                      placeholder='Search by exam title...'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className='w-full h-10 pl-10 pr-4 rounded-md border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-[#0A6FA7]/20 focus:border-[#0A6FA7] transition-all text-sm'
                    />
                  </div>
                </div>

                {/* Exam Type */}
                <div>
                  <label className='block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5'>
                    Type
                  </label>
                  <SearchSelectCreate
                    isMulti={false}
                    allowCreate={false}
                    placeholder='All Types'
                    displayKey='title'
                    valueKey='id'
                    selectedItems={selectedType ? [selectedType] : []}
                    onSearch={async (q) =>
                      EXAM_TYPES.filter((t) =>
                        t.title.toLowerCase().includes(q.toLowerCase())
                      )
                    }
                    onSelect={(item) => setSelectedType(item)}
                    onRemove={() => setSelectedType(null)}
                    inputSize='sm'
                  />
                </div>

                {/* Level */}
                <div>
                  <label className='block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5'>
                    Level
                  </label>
                  <SearchSelectCreate
                    isMulti={false}
                    allowCreate={false}
                    placeholder='All Levels'
                    displayKey='title'
                    valueKey='id'
                    selectedItems={selectedLevel ? [selectedLevel] : []}
                    onSearch={async (q) =>
                      levels.filter((l) =>
                        l.title.toLowerCase().includes(q.toLowerCase())
                      )
                    }
                    onSelect={(item) => setSelectedLevel(item)}
                    onRemove={() => setSelectedLevel(null)}
                    inputSize='sm'
                  />
                </div>

                {/* Affiliation */}
                <div>
                  <label className='block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5'>
                    Affiliation
                  </label>
                  <SearchSelectCreate
                    isMulti={false}
                    allowCreate={false}
                    placeholder='All Universities'
                    displayKey='fullname'
                    valueKey='id'
                    selectedItems={selectedAffiliation ? [selectedAffiliation] : []}
                    onSearch={async (q) =>
                      universities.filter((u) =>
                        u.fullname.toLowerCase().includes(q.toLowerCase())
                      )
                    }
                    onSelect={(item) => setSelectedAffiliation(item)}
                    onRemove={() => setSelectedAffiliation(null)}
                    inputSize='sm'
                  />
                </div>

                {/* Discipline */}
                <div>
                  <label className='block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5'>
                    Discipline
                  </label>
                  <SearchSelectCreate
                    isMulti={false}
                    allowCreate={false}
                    placeholder='All Disciplines'
                    displayKey='title'
                    valueKey='id'
                    selectedItems={selectedFaculty ? [selectedFaculty] : []}
                    onSearch={async (q) =>
                      faculties.filter((f) =>
                        f.title.toLowerCase().includes(q.toLowerCase())
                      )
                    }
                    onSelect={(item) => setSelectedFaculty(item)}
                    onRemove={() => setSelectedFaculty(null)}
                    inputSize='sm'
                  />
                </div>

              </div>
            </div>

            {/* ── Results count ── */}
            {!loading && pagination.totalCount > 0 && (
              <p className='text-sm text-gray-400 font-medium mb-5'>
                Showing <span className='text-gray-700 font-bold'>{pagination.totalCount}</span> exam{pagination.totalCount !== 1 ? 's' : ''}
              </p>
            )}

            {/* ── Content ── */}
            {loading || isScrolling ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {[...Array(6)].map((_, i) => <ExamShimmer key={i} />)}
              </div>
            ) : exams.length === 0 ? (
              <div className='bg-white rounded-2xl p-20 border border-gray-100 shadow-sm'>
                <EmptyState
                  icon={ClipboardCheck}
                  title='No Exams Found'
                  description={
                    hasFilters
                      ? 'No exams match your current filter criteria. Try adjusting your selections.'
                      : 'No exams are currently available at the moment.'
                  }
                  action={hasFilters ? { label: 'Clear All Filters', onClick: clearFilters } : null}
                />
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {exams.map((exam) => (
                    <div
                      key={exam.id}
                      className='group h-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#0A6FA7]/20 transition-all duration-300 flex flex-col'
                    >
                      {/* Card Header */}
                      <div className='flex items-start justify-between mb-5'>
                        <div className='bg-blue-50 p-3 rounded-xl group-hover:bg-[#0A6FA7]/10 transition-colors'>
                          <ClipboardCheck className='w-5 h-5 text-[#0A6FA7]' />
                        </div>
                        <div className='flex flex-col items-end gap-1.5'>
                          {exam.level?.title && (
                            <span className='px-2.5 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-wider border border-gray-100'>
                              {exam.level.title}
                            </span>
                          )}
                          {exam.exam_details?.[0]?.exam_type && (
                            <span className='px-2.5 py-1 bg-emerald-50 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-wider'>
                              {exam.exam_details[0].exam_type}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h2 className='text-base font-bold text-gray-900 mb-3 group-hover:text-[#0A6FA7] transition-colors line-clamp-2 min-h-[3rem]'>
                        {exam.title}
                      </h2>

                      {/* University */}
                      {exam.examUniversity?.fullname && (
                        <p className='text-xs text-gray-500 font-semibold mb-4 flex items-center gap-1.5'>
                          <Building2 className='w-3.5 h-3.5 text-gray-400 shrink-0' />
                          <span className='line-clamp-1'>{exam.examUniversity.fullname}</span>
                        </p>
                      )}

                      {/* Dates + CTA */}
                      <div className='mt-auto pt-4 border-t border-gray-50 space-y-4'>
                        {exam.application_details?.length > 0 ? (
                          <div className='grid grid-cols-2 gap-3'>
                            <div className='flex flex-col'>
                              <span className='text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-0.5'>
                                Closing
                              </span>
                              <span className='text-sm font-bold text-gray-700'>
                                {formatDate(exam.application_details[0].closing_date) ?? 'TBD'}
                              </span>
                            </div>
                            <div className='flex flex-col text-right'>
                              <span className='text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-0.5'>
                                Exam Date
                              </span>
                              <span className='text-sm font-bold text-[#0A6FA7]'>
                                {formatDate(exam.application_details[0].exam_date) ?? 'TBD'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className='text-xs font-semibold text-gray-400 text-center py-2 bg-gray-50 rounded-lg'>
                            Dates to be announced
                          </p>
                        )}

                        <button
                          onClick={() => handleClick(exam?.id)}
                          className='w-full py-3 rounded-xl bg-[#0A6FA7] hover:bg-[#085e8a] text-white text-sm font-bold shadow-sm shadow-[#0A6FA7]/20 transition-all hover:scale-[1.01] active:scale-95'
                        >
                          View Exam Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className='mt-10 bg-white py-5 px-8 rounded-2xl border border-gray-100 shadow-sm flex justify-center'>
                    <Pagination pagination={pagination} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <SingleExam exam={singleExam} />
      )}
    </>
  )
}
