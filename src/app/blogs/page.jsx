'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, BookOpen, X } from 'lucide-react'
import { debounce } from 'lodash'
import FeaturedBlogs from './components/FeaturedBlogs'
import services from '@/app/apiService'

// Memoized FilterSection matching platform standard
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

const Blogs = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // State
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [allCategories, setAllCategories] = useState([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)
  const [filterInput, setFilterInput] = useState('')

  // Initialization from search params
  const initialSearch = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialPage = parseInt(searchParams.get('page')) || 1

  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [isSearching, setIsSearching] = useState(false)

  // Pagination State
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalCount: 0
  })

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

  // Data Fetching Logic
  const fetchBlogsData = async (page = 1, search = '', category = '') => {
    setLoading(true)
    try {
      const params = {
        page,
        category_id: category || '',
        status: 'published',
        q: search
      }
      const response = await services.blogs.getAll(params)

      if (response && response.items) {
        setBlogs(response.items)
        if (response.pagination) {
          setPagination({
            currentPage: response.pagination.currentPage,
            totalPages: response.pagination.totalPages,
            totalCount: response.pagination.totalCount
          })
        }
      } else {
        setBlogs([])
        setPagination(prev => ({ ...prev, totalCount: 0, currentPage: page }))
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Sync state when URL params change
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const cat = searchParams.get('category') || ''
    const pg = parseInt(searchParams.get('page')) || 1

    setSearchQuery(q)
    setSelectedCategory(cat)
    setPagination(prev => ({ ...prev, currentPage: pg }))
    
    fetchBlogsData(pg, q, cat)
  }, [searchParams])

  // Fetch categories on mount
  useEffect(() => {
    const getCategories = async () => {
      setIsCategoriesLoading(true)
      try {
        const response = await services.category.getAll({ type: 'BLOG' })
        if (response && response.items) {
          setCategories(response.items)
          setAllCategories(response.items)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsCategoriesLoading(false)
      }
    }
    getCategories()
  }, [])

  // Debounced main search
  useEffect(() => {
    setIsSearching(true)
    const handler = setTimeout(() => {
      setIsSearching(false)
      if (searchQuery !== initialSearch) {
        updateURL({ q: searchQuery, page: 1 })
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery, initialSearch, updateURL])

  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.totalPages) {
      updateURL({ page })
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setFilterInput('')
    updateURL({ q: '', category: '', page: 1 })
  }

  const handleCategoryToggle = (catId) => {
    const newVal = selectedCategory === catId ? '' : catId
    setSelectedCategory(newVal)
    updateURL({ category: newVal, page: 1 })
  }

  const handleCategorySearch = (q) => {
    setFilterInput(q)
    if (!q) {
      setCategories(allCategories)
    } else {
      setCategories(allCategories.filter(cat => 
        cat.title.toLowerCase().includes(q.toLowerCase())
      ))
    }
  }

  // Scroll top on URL change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [searchParams])

  return (
    <div className='min-h-screen bg-gray-50/50 py-12 px-6 font-sans'>
      <div className='max-w-[1600px] mx-auto'>
        
        {/* Header Section with Search (Unified Pattern) */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 border-b border-gray-100 pb-12'>
          <div className='flex-1 space-y-6 w-full'>
            <div className='flex items-center gap-4 mb-2'>
              <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                Blogs
              </h1>
              <span className='bg-blue-50 text-[#0A6FA7] px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider'>
                {pagination.totalCount || blogs.length} Results
              </span>
            </div>

            <div className='flex bg-white items-center rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A70A7] focus-within:border-[#0A70A7] transition-all px-5 py-2.5 relative w-full group'>
              <Search className='w-5 h-5 text-gray-400 group-focus-within:text-[#0A6FA7] transition-colors' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search blogs by title or content...'
                className='w-full px-4 py-2 bg-transparent text-base font-medium outline-none placeholder:text-gray-400'
              />
              <div className='absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3'>
                {isSearching && (
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A70A7]'></div>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className='p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all'
                  >
                    <X className='w-5 h-5' />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar & Content Layout */}
        <div className='flex flex-col lg:flex-row gap-12'>
          
          {/* Left Sidebar */}
          <div className='lg:w-[320px] space-y-8 shrink-0 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-160px)] overflow-y-auto pr-2 sidebar-scrollbar'>
            <div className='flex justify-between items-center mb-[-16px] px-1'>
              <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Filters</span>
              {(searchQuery || selectedCategory) && (
                <button
                  className='text-gray-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider transition-colors'
                  onClick={clearFilters}
                >
                  Clear All
                </button>
              )}
            </div>
            <FilterSection
              title='Category'
              inputField='category'
              options={categories}
              selectedValues={selectedCategory ? [selectedCategory] : []}
              onCheckboxChange={handleCategoryToggle}
              defaultValue={filterInput}
              onSearchChange={(field, val) => handleCategorySearch(val)}
              isLoading={isCategoriesLoading}
            />
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            <FeaturedBlogs
              blogs={blogs}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              searchQuery={searchQuery || selectedCategory}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blogs
