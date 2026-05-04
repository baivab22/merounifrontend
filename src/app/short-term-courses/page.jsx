'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, BookOpen, X, Layers, CreditCard } from 'lucide-react'
import { debounce } from 'lodash'
import SkillCourseCard from '@/ui/molecules/cards/SkillCourseCard'
import { CardSkeleton } from '@/ui/shadcn/CardSkeleton'
import EmptyState from '@/ui/shadcn/EmptyState'
import { fetchPublicSkillCourses } from './actions'
import { THEME_BLUE } from '@/constants/constants'
import Pagination from '@/ui/molecules/common/Pagination'

// FilterSection component for consistency
const FilterSection = React.memo(function FilterSection({
  title,
  options,
  selectedValues,
  onCheckboxChange,
  icon: Icon
}) {
  return (
    <div className='bg-white rounded-2xl p-6 border border-gray-200 shadow-sm'>
      <div className='flex items-center gap-2 mb-4'>
        {Icon && <Icon className='w-4 h-4 text-gray-400' />}
        <h3 className='text-gray-800 font-bold text-xs md:text-sm uppercase tracking-wider'>
          {title}
        </h3>
      </div>
      <div className='space-y-3'>
        {options.map((opt) => (
          <label key={opt.id} className='flex items-center gap-3 group cursor-pointer'>
            <input
              type='checkbox'
              checked={selectedValues.includes(opt.id)}
              onChange={() => onCheckboxChange(opt.id)}
              className='w-4 h-4 rounded border-gray-300 text-[#0A70A7] focus:ring-[#0A70A7] transition-all cursor-pointer'
            />
            <span className='text-gray-600 group-hover:text-gray-900 text-sm font-medium transition-colors'>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
})

const SkillCoursesPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    
    // URL-synced params
    const q = searchParams.get('q') || ''
    const type = searchParams.get('type') || ''
    const price = searchParams.get('price') || ''

    const [searchTerm, setSearchTerm] = useState(q)
    const [isSearching, setIsSearching] = useState(false)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0
    })

    // Mode options
    const modeOptions = [
        { id: 'online', label: 'Online' },
        { id: 'offline', label: 'Offline' },
        { id: 'both', label: 'Both' }
    ]

    // Price options
    const priceOptions = [
        { id: 'free', label: 'Free' },
        { id: 'paid', label: 'Paid' }
    ]

    const updateURL = useCallback((params) => {
        const newParams = new URLSearchParams(searchParams.toString())
        Object.entries(params).forEach(([key, value]) => {
            if (value) newParams.set(key, value)
            else newParams.delete(key)
        })
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
    }, [searchParams, pathname, router])

    const handlePageChange = (page) => {
        if (page > 0 && page <= pagination.totalPages) {
            updateURL({ page })
        }
    }

    // Fetch courses
    useEffect(() => {
        const getCourses = async () => {
            const pg = parseInt(searchParams.get('page')) || 1
            setLoading(true)
            try {
                const response = await fetchPublicSkillCourses({
                    q,
                    type,
                    price,
                    page: pg
                })
                setCourses(response.items || [])
                if (response.pagination) {
                    setPagination(response.pagination)
                }
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }
        getCourses()
    }, [q, type, price, searchParams])

    // Debounce search input
    useEffect(() => {
        setIsSearching(true)
        const handler = setTimeout(() => {
            setIsSearching(false)
            if (searchTerm !== q) {
                updateURL({ q: searchTerm, page: 1 })
            }
        }, 500)
        return () => clearTimeout(handler)
    }, [searchTerm, q, updateURL])

    const clearFilters = () => {
        setSearchTerm('')
        updateURL({ q: '', type: '', price: '', page: 1 })
    }

    const handleFilterToggle = (key, val) => {
        const current = searchParams.get(key)
        const newVal = current === val ? '' : val
        updateURL({ [key]: newVal, page: 1 })
    }

    return (
        <div className='min-h-screen bg-gray-50/50 py-12 px-6 font-sans'>
            <div className='max-w-[1600px] mx-auto'>
                
                {/* Unified Header */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 border-b border-gray-100 pb-12'>
                    <div className='flex-1 space-y-6 w-full'>
                        <div className='flex items-center gap-4 mb-2'>
                            <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                                Short-Term Courses
                            </h1>
                            <span className='bg-blue-50 text-[#0A70A7] px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider'>
                                {pagination.totalCount || courses.length} Results
                            </span>
                        </div>

                        <div className='flex bg-white items-center rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A70A7] focus-within:border-[#0A70A7] transition-all px-5 py-2.5 relative w-full group'>
                            <Search className='w-5 h-5 text-gray-400 group-focus-within:text-[#0A70A7] transition-colors' />
                            <input
                                type='text'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder='Search courses, skills or topics...'
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
                    </div>
                </div>

                {/* Sidebar & Grid Layout */}
                <div className='flex flex-col lg:flex-row gap-12'>
                    
                    {/* Sidebar */}
                    <aside className='lg:w-[320px] space-y-8 shrink-0 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-160px)] overflow-y-auto pr-2 sidebar-scrollbar'>
                        <div className='flex justify-between items-center mb-[-16px] px-1'>
                            <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Refine By</span>
                            {(q || type || price) && (
                                <button
                                    className='text-gray-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider transition-colors'
                                    onClick={clearFilters}
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        <FilterSection
                            title='Learning Mode'
                            options={modeOptions}
                            selectedValues={type ? [type] : []}
                            onCheckboxChange={(val) => handleFilterToggle('type', val)}
                            icon={Layers}
                        />

                        <FilterSection
                            title='Price Type'
                            options={priceOptions}
                            selectedValues={price ? [price] : []}
                            onCheckboxChange={(val) => handleFilterToggle('price', val)}
                            icon={CreditCard}
                        />
                    </aside>

                    {/* Content Area */}
                    <main className='flex-1'>
                        {loading ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'>
                                {Array(6).fill('').map((_, index) => (
                                    <CardSkeleton key={index} />
                                ))}
                            </div>
                        ) : courses.length === 0 ? (
                            <div className='bg-white rounded-3xl border border-gray-100 border-dashed py-20'>
                                <EmptyState
                                    icon={BookOpen}
                                    title='No Courses Found'
                                    description='Try adjusting your search or filters to find what you are looking for.'
                                    action={q || type || price ? { label: 'Clear All Filters', onClick: clearFilters } : null}
                                />
                            </div>
                        ) : (
                            <>
                                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'>
                                    {courses.map((course) => (
                                        <SkillCourseCard
                                            key={course.id}
                                            course={course}
                                        />
                                    ))}
                                </div>

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
                    </main>
                </div>
            </div>
        </div>
    )
}

export default SkillCoursesPage
