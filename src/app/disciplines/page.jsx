'use client'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { fetchDisciplines } from './actions'
import Pagination from '../blogs/components/Pagination'

// Skeleton card
const CardSkeleton = () => (
  <div className='bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse'>
    <div className='aspect-[16/10] bg-gray-200 w-full' />
    <div className='p-4 space-y-2'>
      <div className='h-4 bg-gray-200 rounded w-3/4' />
      <div className='h-3 bg-gray-100 rounded w-full' />
      <div className='h-3 bg-gray-100 rounded w-5/6' />
    </div>
  </div>
)

// Discipline card
const DisciplineCard = ({ item }) => (
  <Link
    href={`/disciplines/${item.slug}`}
    className='group cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300'
  >
    <div className='relative aspect-[16/10] overflow-hidden bg-gray-100'>
      {item.featured_image ? (
        <Image
          src={item.featured_image}
          alt={item.title || 'Discipline'}
          fill
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
          className='object-cover transition-transform duration-500 group-hover:scale-110'
        />
      ) : (
        <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A6FA7]/10 to-[#31AD8F]/10 text-[#0A6FA7]'>
          <BookOpen className='w-12 h-12 opacity-40' />
        </div>
      )}
      <div className='absolute inset-0 bg-black/40 group-hover:opacity-20 transition-opacity duration-300' />
      <div className='absolute bottom-4 left-4 right-4'>
        <h3 className='text-base font-bold text-white leading-tight'>{item.title}</h3>
      </div>
    </div>
    <div className='p-4'>
      <p className='text-sm text-gray-500 line-clamp-2'>
        {item.description || `${item.title} discipline`}
      </p>
      <div className='mt-4 pt-3 border-t border-gray-50 flex items-center justify-between'>
        <span className='text-xs font-semibold text-[#0A6FA7]'>View Degrees</span>
        <div className='w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#387cae] transition-colors'>
          <svg className='w-3 h-3 text-gray-400 group-hover:text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
          </svg>
        </div>
      </div>
    </div>
  </Link>
)

const DisciplinesPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const initialSearch = searchParams.get('q') || ''
  const initialPage = parseInt(searchParams.get('page')) || 1

  const [disciplines, setDisciplines] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [isSearching, setIsSearching] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalCount: 0
  })

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

  // Sync state with URL params
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const pg = parseInt(searchParams.get('page')) || 1
    setSearchTerm(q)
    setPagination((prev) => ({ ...prev, currentPage: pg }))
  }, [searchParams])

  // Scroll to top on search/page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [searchParams])

  // Debounce search input → update URL
  useEffect(() => {
    setIsSearching(true)
    const handler = setTimeout(() => {
      setIsSearching(false)
      if (searchTerm !== (searchParams.get('q') || '')) {
        updateURL({ q: searchTerm, page: 1 })
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm, searchParams, updateURL])

  // Fetch disciplines on URL change
  const loadDisciplines = useCallback(async (page = 1, search = '') => {
    setLoading(true)
    try {
      const response = await fetchDisciplines(search, page)
      setDisciplines(response.items || [])
      setPagination((prev) => ({
        ...prev,
        totalPages: response.pagination?.totalPages ?? 1,
        totalCount: response.pagination?.totalCount ?? 0
      }))
    } catch (error) {
      console.error('Error:', error)
      setDisciplines([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const q = searchParams.get('q') || ''
    const pg = parseInt(searchParams.get('page')) || 1
    loadDisciplines(pg, q)
  }, [searchParams, loadDisciplines])

  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.totalPages) {
      updateURL({ page })
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    updateURL({ q: '', page: 1 })
  }

  return (
    <div className='min-h-screen bg-gray-50/50 py-12 px-6 font-sans'>
      <div className='max-w-7xl mx-auto'>

        {/* Header & Search */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 border-b border-gray-100 pb-12'>
          <div className='flex-1 space-y-6 w-full'>
            <div className='flex items-center gap-4 mb-2'>
              <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                Disciplines
              </h2>
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
                placeholder='Search disciplines...'
                className='w-full px-4 py-2 bg-transparent text-base font-medium outline-none placeholder:text-gray-400'
              />
              <div className='absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3'>
                {isSearching && (
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A6FA7]' />
                )}
                {searchTerm && (
                  <button
                    onClick={clearSearch}
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

        {/* Results info */}
        {!loading && (
          <div className='mb-8 px-2'>
            <p className='text-sm text-gray-500 font-semibold'>
              Showing <span className='text-gray-900'>{disciplines.length}</span>{' '}
              of <span className='text-gray-900'>{pagination.totalCount}</span> results
            </p>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {Array(8).fill('').map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : disciplines.length === 0 ? (
          <div className='bg-white rounded-[32px] border border-gray-100 border-dashed py-20 text-center'>
            <BookOpen className='w-14 h-14 text-gray-300 mx-auto mb-4' />
            <h3 className='text-gray-700 font-bold text-lg mb-1'>No Disciplines Found</h3>
            <p className='text-gray-400 text-sm'>
              {searchTerm
                ? 'No disciplines match your search. Try a different keyword.'
                : 'No disciplines are currently available.'}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className='mt-6 px-5 py-2 bg-[#0A6FA7] text-white rounded-xl text-sm font-semibold hover:bg-[#0e4f7a] transition-colors'
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {disciplines.map((item) => (
                <DisciplineCard key={item.id} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className='mt-20 flex justify-center'>
                <div className='bg-white px-8 py-4 rounded-[24px] shadow-sm border border-gray-100'>
                  <Pagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DisciplinesPage
