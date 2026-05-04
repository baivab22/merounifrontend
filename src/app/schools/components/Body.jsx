'use client'

import { authFetch } from '@/app/utils/authFetch'
import SchoolCard from '@/ui/molecules/cards/SchoolCard'
import EmptyState from '@/ui/shadcn/EmptyState'
import { useRouter } from '@bprogress/next/app'
import { debounce } from 'lodash'
import { Building2, Search, X } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import FilterSection from './FilterSection'
import { ShimmerCard } from './ShimmerCard'
import Pagination from '@/ui/molecules/common/Pagination'


// Helper to construct School filter params
const buildSchoolQueryParams = (page, filters = {}, q = '') => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('page', page.toString())
  params.append('limit', q ? '1000' : '24')

  params.append('institute_level', 'school')

  if (q) params.append('q', q)

  if (filters.board_ids && filters.board_ids.length > 0) {
    params.append('board_ids', filters.board_ids.join(','))
  }

  if (filters.stream_ids && filters.stream_ids.length > 0) {
    params.append('stream_ids', filters.stream_ids.join(','))
  }


  if (filters.type && filters.type.length > 0) {
    const typeValue = Array.isArray(filters.type)
      ? filters.type.join(',')
      : filters.type
    params.append('type', typeValue)
  }

  return params
}

// Client-side fetch functions
const fetchSchoolsFromAPI = async (page = 1, filters = {}, q = '') => {
  try {
    const queryParams = buildSchoolQueryParams(page, filters, q)
    const url = `${process.env.baseUrl}/school?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()

    return {
      schools:
        data.items?.map((school) => ({
          name: school.name,
          location: (() => {
            const city = school.address?.city || ''
            const district = school.address?.district || ''
            const parts = [city, district].filter(Boolean)
            return parts.length > 0 ? parts.join(', ') : null
          })(),
          description: school.description || 'No description available.',
          googleMapUrl: school.google_map_url,
          instituteType: school.institute_type || 'Unknown',
          slug: school.slugs,
          collegeId: school.id,
          collegeImage: school.featured_img || school.image,
          logo: school.logo || 'default_logo.png',
          tags: [
            ...(school.boards || []).map(b => b.name),
            ...(school.streams || []).map(s => s.name)
          ],
          universityName: school.university?.fullname || school.university?.name
        })) || [],
      pagination: data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: data.items?.length || 0
      }
    }
  } catch (error) {
    console.error('Failed to fetch schools:', error)
    return {
      schools: [],
      pagination: { currentPage: 1, totalPages: 1, totalCount: 0 }
    }
  }
}



const fetchSchoolBoardsFromAPI = async (searchQuery = '') => {
  try {
    const queryParams = new URLSearchParams()
    if (searchQuery) queryParams.append('q', searchQuery)
    const url = `${process.env.baseUrl}/school/boards?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Failed to fetch school boards:', error)
    return []
  }
}

const fetchSchoolStreamsFromAPI = async (searchQuery = '') => {
  try {
    const queryParams = new URLSearchParams()
    if (searchQuery) queryParams.append('q', searchQuery)
    const url = `${process.env.baseUrl}/school/streams?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Failed to fetch school streams:', error)
    return []
  }
}


const SchoolFinder = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Initial values from URL
  const initialSearch = searchParams.get('q') || ''
  const initialPage = parseInt(searchParams.get('page')) || 1
  const initialBoardIds = searchParams.get('board_ids')?.split(',').filter(Boolean) || []
  const initialStreamIds = searchParams.get('stream_ids')?.split(',').filter(Boolean) || []
  const initialType = searchParams.get('type')?.split(',').filter(Boolean) || []


  const [schools, setSchools] = useState([])
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: initialPage,
    totalCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [isSearching, setIsSearching] = useState(false)

  // Filter Input States (for search within filters)
  const [filterInputs, setFilterInputs] = useState({
    type: '',
    board: '',
    stream: ''
  })

  const [boards, setBoards] = useState([])
  const [streams, setStreams] = useState([])
  const [isBoardsLoading, setIsBoardsLoading] = useState(false)
  const [isStreamsLoading, setIsStreamsLoading] = useState(false)

  // Selected Filter Values
  const [selectedFilters, setSelectedFilters] = useState({
    board_ids: initialBoardIds,
    stream_ids: initialStreamIds,
    type: initialType
  })


  const user = useSelector((state) => state.user.data)
  const [wishlistCollegeIds, setWishlistCollegeIds] = useState(new Set())

  // Initial Fetch for Boards and Streams
  useEffect(() => {
    const initFilters = async () => {
      setIsBoardsLoading(true)
      setIsStreamsLoading(true)
      const boardsData = await fetchSchoolBoardsFromAPI()
      const streamsData = await fetchSchoolStreamsFromAPI()
      setBoards(boardsData.map(b => ({ id: String(b.id), name: b.name })))
      setStreams(streamsData.map(s => ({ id: String(s.id), name: s.name })))
      setIsBoardsLoading(false)
      setIsStreamsLoading(false)
    }
    initFilters()
  }, [])


  // Static Filter Options
  const staticOptions = useMemo(() => ({
    type: [
      { id: 'public', name: 'Public' },
      { id: 'private', name: 'Private' },
    ]
  }), [])

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

  // Fetch Wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.id) return setWishlistCollegeIds(new Set())
      try {
        const response = await authFetch(
          `${process.env.baseUrl}/wishlist?user_id=${user.id}`
        )
        if (response.ok) {
          const data = await response.json()
          setWishlistCollegeIds(
            new Set(
              (data.items || []).map((item) => item.college?.id).filter(Boolean)
            )
          )
        }
      } catch (error) {
        setWishlistCollegeIds(new Set())
      }
    }
    fetchWishlist()
  }, [user?.id])

  // Sync state on URL change
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const pg = parseInt(searchParams.get('page')) || 1
    const bids = searchParams.get('board_ids')?.split(',').filter(Boolean) || []
    const sids = searchParams.get('stream_ids')?.split(',').filter(Boolean) || []
    const t = searchParams.get('type')?.split(',').filter(Boolean) || []

    setSearchQuery(q)
    setPagination(prev => ({ ...prev, currentPage: pg }))
    setSelectedFilters({ board_ids: bids, stream_ids: sids, type: t })
  }, [searchParams])


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [searchParams])

  const debouncedSearchUpdate = useMemo(
    () =>
      debounce(async (query) => {
        updateURL({ q: query, page: 1 })
      }, 500),
    [updateURL]
  )

  useEffect(() => {
    if (searchQuery !== initialSearch) {
      debouncedSearchUpdate(searchQuery)
      return () => debouncedSearchUpdate.cancel()
    }
  }, [searchQuery, initialSearch, debouncedSearchUpdate])

  // Main Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      const q = searchParams.get('q') || ''
      const pg = parseInt(searchParams.get('page')) || 1
      const filters = {
        board_ids: searchParams.get('board_ids')?.split(',').filter(Boolean) || [],
        stream_ids: searchParams.get('stream_ids')?.split(',').filter(Boolean) || [],
        type: searchParams.get('type')?.split(',').filter(Boolean) || []
      }

      setIsLoading(true)
      if (q) setIsSearching(true)

      try {
        const data = await fetchSchoolsFromAPI(pg, filters, q)
        setSchools(data.schools)
        setPagination(data.pagination)
      } catch (err) {
        setSchools([])
      } finally {
        setIsLoading(false)
        setIsSearching(false)
      }
    }
    fetchData()
  }, [searchParams])

  const handleFilterSearchChange = async (field, value) => {
    setFilterInputs((prev) => ({ ...prev, [field]: value }))

    if (field === 'board') {
      setIsBoardsLoading(true)
      const data = await fetchSchoolBoardsFromAPI(value)
      setBoards(data.map(b => ({ id: String(b.id), name: b.name })))
      setIsBoardsLoading(false)
    }

    if (field === 'stream') {
      setIsStreamsLoading(true)
      const data = await fetchSchoolStreamsFromAPI(value)
      setStreams(data.map(s => ({ id: String(s.id), name: s.name })))
      setIsStreamsLoading(false)
    }
  }


  const handleFilterChange = (filterType, value) => {
    setSelectedFilters((prev) => {
      const arr = prev[filterType]
      const nextArr = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value]

      // Update URL with selected filters
      updateURL({
        [filterType]: nextArr.join(','),
        page: 1 // Reset to first page on filter change
      })

      return {
        ...prev,
        [filterType]: nextArr
      }
    })
  }

  const filteredBoards = useMemo(() => boards, [boards])
  const filteredStreams = useMemo(() => streams, [streams])

  const filteredInstituteTypes = useMemo(
    () =>
      staticOptions.type.filter((t) =>
        t.name.toLowerCase().includes(filterInputs.type.toLowerCase())
      ),
    [filterInputs.type, staticOptions.type]
  )


  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.totalPages) {
      updateURL({ page })
    }
  }

  return (
    <div className='max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 mb-20'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 border-b border-gray-100 pb-12'>
        <div className='flex-1 space-y-6 w-full'>
          <div className='flex items-center gap-4 mb-2'>
            <h2 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
              Schools
            </h2>
            <span className='bg-blue-50 text-[#0A70A7] px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider'>
              {pagination.totalCount || '0'} Results
            </span>
          </div>

          <div className='flex bg-white items-center rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A70A7] focus-within:border-[#0A70A7] transition-all px-5 py-2.5 relative w-full group'>
            <Search className='w-5 h-5 text-gray-400 group-focus-within:text-[#0A70A7] transition-colors' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by school name, city or state...'
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
        <div className='lg:w-[320px] space-y-8 shrink-0 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-160px)] overflow-y-auto pr-2 sidebar-scrollbar'>
          <div className='flex justify-between items-center mb-[-16px] px-1'>
            <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Filters</span>
            <button
              className='text-gray-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider transition-colors'
              onClick={() => {
                setSearchQuery('')
                setFilterInputs({ type: '', board: '', stream: '' })
                router.push(pathname, { scroll: false })
              }}
            >
              Clear All
            </button>

          </div>
          <FilterSection
            title='Board'
            inputField='board'
            options={filteredBoards}
            selectedValues={selectedFilters.board_ids}
            onCheckboxChange={(val) => handleFilterChange('board_ids', val)}
            defaultValue={filterInputs.board}
            onSearchChange={handleFilterSearchChange}
            isLoading={isBoardsLoading}
          />
          <FilterSection
            title='Stream'
            inputField='stream'
            options={filteredStreams}
            selectedValues={selectedFilters.stream_ids}
            onCheckboxChange={(val) => handleFilterChange('stream_ids', val)}
            defaultValue={filterInputs.stream}
            onSearchChange={handleFilterSearchChange}
            isLoading={isStreamsLoading}
          />

          <FilterSection
            title='Institute type'
            inputField='type'
            options={filteredInstituteTypes}
            selectedValues={selectedFilters.type}
            onCheckboxChange={(val) => handleFilterChange('type', val)}
            defaultValue={filterInputs.type}
            onSearchChange={handleFilterSearchChange}
          />
        </div>

        <div className='flex-1'>
          {isLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10'>
              {Array.from({ length: 9 }).map((_, idx) => (
                <ShimmerCard key={idx} />
              ))}
            </div>
          ) : schools.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10'>
              {schools.map((s, idx) => (
                <SchoolCard
                  key={s.collegeId ?? idx}
                  name={s.name}
                  location={s.location}
                  collegeId={s.collegeId}
                  slug={s.slug}
                  collegeImage={s.collegeImage}
                  instituteType={s.instituteType}
                  logo={s.logo}
                  tags={s.tags}
                  universityName={s.universityName}
                  wishlistCollegeIds={wishlistCollegeIds}
                  onWishlistUpdate={setWishlistCollegeIds}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title='No Schools Found'
              description="We couldn't find any schools matching your current search or filter criteria. Try clearing some filters to see more results."
              action={{
                label: 'Clear All Filters',
                onClick: () => {
                  setSearchQuery('')
                  setFilterInputs({ type: '', board: '', stream: '' })
                  router.push(pathname, { scroll: false })
                }
              }}
            />

          )}

          {!searchQuery && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          )}
        </div>
      </div>

    </div>

  )
}

export default SchoolFinder
