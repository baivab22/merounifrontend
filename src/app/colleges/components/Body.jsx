'use client'

import { authFetch } from '@/app/utils/authFetch'
import CollegeCard from '@/ui/molecules/cards/CollegeCard'
import EmptyState from '@/ui/shadcn/EmptyState'
import { useRouter } from '@bprogress/next/app'
import { debounce } from 'lodash'
import { Building2, Search, X, SlidersHorizontal } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
// Local FilterSection component
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
      <div className='mt-2 space-y-2.5 overflow-y-auto h-36 pr-2 custom-scrollbar'>
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
                checked={selectedValues.includes(opt.id || opt.name)}
                onChange={() => onCheckboxChange(opt.id || opt.name)}
                className='w-4 h-4 rounded border-gray-300 text-[#0A70A7] focus:ring-[#0A70A7] transition-all cursor-pointer'
              />
              <span className='text-gray-600 group-hover:text-gray-900 text-sm font-medium transition-colors'>
                {opt.name}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  )
})
import UniversityCardShimmer from './UniversityShimmerCard'
import Pagination from '@/ui/molecules/common/Pagination'

// Helper to construct query params
const buildQueryParams = (page, filters = {}, q = '') => {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', q ? '1000' : '24')

  if (q) {
    params.append('q', q)
  }

  if (filters.degree_ids && filters.degree_ids.length > 0) {
    params.append('degree_ids', filters.degree_ids.join(','))
  }
  if (filters.district_ids && filters.district_ids.length > 0) {
    params.append('district_ids', filters.district_ids.join(','))
  }
  if (filters.affiliation_ids && filters.affiliation_ids.length > 0) {
    params.append('affiliation_ids', filters.affiliation_ids.join(','))
  }
  if (filters.type && filters.type.length > 0) {
    params.append('type', filters.type.join(','))
  }

  return params
}

// Client-side fetch functions
const fetchCollegesFromAPI = async (page = 1, filters = {}, q = '') => {
  try {
    const queryParams = buildQueryParams(page, filters, q)
    const url = `${process.env.baseUrl}/college?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return {
      colleges:
        data.items?.map((college) => ({
          name: college.name,
          location: (() => {
            const city = college.address?.city || ''
            const district = college.address?.district || ''
            const parts = [city, district].filter(Boolean)
            return parts.length > 0 ? parts.join(', ') : null
          })(),
          description: college.description || 'No description available.',
          googleMapUrl: college.google_map_url,
          instituteType: college.institute_type || 'Unknown',
          slug: college.slugs,
          collegeId: college.id,
          collegeImage: college.featured_img || college.image,
          logo: college.college_logo || 'default_logo.png',
          degrees: (college.degrees || []).map((d) => ({
            id: d.id,
            title: d.title,
            short_name: d.short_name,
            slugs: d.slugs
          })),
          universityName:
            college.university?.fullname || college.university?.name
        })) || [],
      pagination: data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalCount: data.items?.length || 0
      }
    }
  } catch (error) {
    console.error('Failed to fetch colleges:', error)
    return {
      colleges: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0
      }
    }
  }
}

const fetchDegreesFromAPI = async (searchQuery = '') => {
  try {
    const queryParams = new URLSearchParams()
    if (searchQuery) {
      queryParams.append('q', searchQuery)
    }
    const url = `${process.env.baseUrl}/degree?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Failed to fetch degrees:', error)
    return []
  }
}

const fetchDistrictsFromAPI = async (searchQuery = '') => {
  try {
    const queryParams = new URLSearchParams()
    if (searchQuery) {
      queryParams.append('q', searchQuery)
    }
    const url = `${process.env.baseUrl}/location/districts?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Failed to fetch districts:', error)
    return []
  }
}

const fetchAffiliationsFromAPI = async (searchQuery = '') => {
  try {
    const queryParams = new URLSearchParams()
    if (searchQuery) {
      queryParams.append('q', searchQuery)
    }
    const url = `${process.env.baseUrl}/affiliation?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Failed to fetch affiliations:', error)
    return []
  }
}

const Body = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Initial values from URL
  const initialSearch = searchParams.get('q') || ''
  const initialPage = parseInt(searchParams.get('page')) || 1
  const initialDegreeIds =
    searchParams.get('degree_ids')?.split(',').filter(Boolean) || []
  const initialDistrictIds =
    searchParams.get('district_ids')?.split(',').filter(Boolean) || []
  const initialAffiliationIds =
    searchParams.get('affiliation_ids')?.split(',').filter(Boolean) || []
  const initialType = searchParams.get('type')?.split(',').filter(Boolean) || []

  const [colleges, setColleges] = useState([])
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: initialPage,
    totalCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [isSearching, setIsSearching] = useState(false)

  // Filter Input States (for search within filters)
  const [filterSearchInputs, setFilterSearchInputs] = useState({
    degree: '',
    district: '',
    affiliation: '',
    instituteType: ''
  })
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const [degrees, setDegrees] = useState([])
  const [districts, setDistricts] = useState([])
  const [affiliations, setAffiliations] = useState([])
  const [isDegreesLoading, setIsDegreesLoading] = useState(false)
  const [isDistrictsLoading, setIsDistrictsLoading] = useState(false)
  const [isAffiliationsLoading, setIsAffiliationsLoading] = useState(false)

  // Selected Filter Values
  const [selectedDegrees, setSelectedDegrees] = useState(initialDegreeIds)
  const [selectedDistricts, setSelectedDistricts] = useState(initialDistrictIds)
  const [selectedAffiliations, setSelectedAffiliations] = useState(
    initialAffiliationIds
  )
  const [selectedTypes, setSelectedTypes] = useState(initialType)

  const user = useSelector((state) => state.user.data)
  const [wishlistCollegeIds, setWishlistCollegeIds] = useState(new Set())

  // Initial Fetch for Categories/Filters
  useEffect(() => {
    const initFilters = async () => {
      setIsDegreesLoading(true)
      setIsDistrictsLoading(true)
      setIsAffiliationsLoading(true)
      const [degs, dists, affs] = await Promise.all([
        fetchDegreesFromAPI(),
        fetchDistrictsFromAPI(),
        fetchAffiliationsFromAPI()
      ])
      setDegrees(degs.map((d) => ({ id: String(d.id), name: d.title })))
      setDistricts(dists.map((d) => ({ id: String(d.id), name: d.name })))
      setAffiliations(affs.map((a) => ({ id: String(a.id), name: a.name })))
      setIsDegreesLoading(false)
      setIsDistrictsLoading(false)
      setIsAffiliationsLoading(false)
    }
    initFilters()
  }, [])

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

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.id) {
        return setWishlistCollegeIds(new Set())
      }
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
        console.error('Error fetching wishlist:', error)
        setWishlistCollegeIds(new Set())
      }
    }
    fetchWishlist()
  }, [user?.id])

  // Sync state on URL change (e.g. Back button)
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const pg = parseInt(searchParams.get('page')) || 1
    const degs =
      searchParams.get('degree_ids')?.split(',').filter(Boolean) || []
    const dists =
      searchParams.get('district_ids')?.split(',').filter(Boolean) || []
    const affs =
      searchParams.get('affiliation_ids')?.split(',').filter(Boolean) || []
    const t = searchParams.get('type')?.split(',').filter(Boolean) || []

    setSearchQuery(q)
    setPagination((prev) => ({ ...prev, currentPage: pg }))
    setSelectedDegrees(degs)
    setSelectedDistricts(dists)
    setSelectedAffiliations(affs)
    setSelectedTypes(t)
  }, [searchParams])

  // Scroll top on URL change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [searchParams])

  // Debounced college search
  const debouncedCollegeSearch = useMemo(
    () =>
      debounce(async (query) => {
        updateURL({ q: query, page: 1 })
      }, 500),
    [updateURL]
  )

  useEffect(() => {
    if (searchQuery !== initialSearch) {
      debouncedCollegeSearch(searchQuery)
      return () => debouncedCollegeSearch.cancel()
    }
  }, [searchQuery, initialSearch, debouncedCollegeSearch])

  // Main Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      const q = searchParams.get('q') || ''
      const pg = parseInt(searchParams.get('page')) || 1
      const filters = {
        degree_ids:
          searchParams.get('degree_ids')?.split(',').filter(Boolean) || [],
        district_ids:
          searchParams.get('district_ids')?.split(',').filter(Boolean) || [],
        affiliation_ids:
          searchParams.get('affiliation_ids')?.split(',').filter(Boolean) || [],
        type: searchParams.get('type')?.split(',').filter(Boolean) || []
      }

      setIsLoading(true)
      if (q) {
        setIsSearching(true)
      }

      try {
        const data = await fetchCollegesFromAPI(pg, filters, q)
        setColleges(data.colleges)
        setPagination(data.pagination)
      } catch (err) {
        setColleges([])
      } finally {
        setIsLoading(false)
        setIsSearching(false)
      }
    }
    fetchData()
  }, [searchParams])

  const handleFilterSearchChange = async (field, value) => {
    setFilterSearchInputs((prev) => ({ ...prev, [field]: value }))

    if (field === 'degree') {
      setIsDegreesLoading(true)
      const data = await fetchDegreesFromAPI(value)
      setDegrees(data.map((d) => ({ id: String(d.id), name: d.title })))
      setIsDegreesLoading(false)
    }

    if (field === 'district') {
      setIsDistrictsLoading(true)
      const data = await fetchDistrictsFromAPI(value)
      setDistricts(data.map((d) => ({ id: String(d.id), name: d.name })))
      setIsDistrictsLoading(false)
    }

    if (field === 'affiliation') {
      setIsAffiliationsLoading(true)
      const data = await fetchAffiliationsFromAPI(value)
      setAffiliations(data.map((a) => ({ id: String(a.id), name: a.name })))
      setIsAffiliationsLoading(false)
    }
  }

  const handleFilterChange = (filterType, value) => {
    let nextState
    let paramKey

    if (filterType === 'degree') {
      nextState = selectedDegrees.includes(value)
        ? selectedDegrees.filter((v) => v !== value)
        : [...selectedDegrees, value]
      setSelectedDegrees(nextState)
      paramKey = 'degree_ids'
    } else if (filterType === 'district') {
      nextState = selectedDistricts.includes(value)
        ? selectedDistricts.filter((v) => v !== value)
        : [...selectedDistricts, value]
      setSelectedDistricts(nextState)
      paramKey = 'district_ids'
    } else if (filterType === 'affiliation') {
      nextState = selectedAffiliations.includes(value)
        ? selectedAffiliations.filter((v) => v !== value)
        : [...selectedAffiliations, value]
      setSelectedAffiliations(nextState)
      paramKey = 'affiliation_ids'
    } else if (filterType === 'type') {
      nextState = selectedTypes.includes(value)
        ? selectedTypes.filter((v) => v !== value)
        : [...selectedTypes, value]
      setSelectedTypes(nextState)
      paramKey = 'type'
    }

    // Update URL with all current filters
    updateURL({
      [paramKey]: nextState.join(','),
      page: 1 // Reset to first page on filter change
    })
  }

  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.totalPages) {
      updateURL({ page })
    }
  }

  const staticOptions = useMemo(
    () => ({
      instituteType: [
        { id: 'public', name: 'Public' },
        { id: 'private', name: 'Private' }
      ]
    }),
    []
  )

  const instituteTypes = useMemo(
    () =>
      staticOptions.instituteType.filter((t) =>
        t.name
          .toLowerCase()
          .includes(filterSearchInputs.instituteType.toLowerCase())
      ),
    [filterSearchInputs.instituteType, staticOptions.instituteType]
  )

  return (
    <div className='max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 mb-20'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 border-b border-gray-100 pb-12'>
        <div className='flex-1 space-y-6 w-full'>
          <div className='flex items-center gap-4 mb-2'>
            <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
              Colleges
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search by college name, city or state...'
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

      <div className='flex flex-col lg:flex-row gap-12'>
        <div className='lg:w-[320px] space-y-8 shrink-0 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-160px)] overflow-y-auto pr-2 sidebar-scrollbar'>
          <div className='flex justify-between items-center mb-[-16px] px-1'>
            <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
              Filters
            </span>
            <button
              className='text-gray-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider transition-colors'
              onClick={() => {
                setSearchQuery('')
                setFilterSearchInputs({
                  degree: '',
                  district: '',
                  affiliation: '',
                  instituteType: ''
                })
                router.push(pathname, { scroll: false })
              }}
            >
              Clear All
            </button>
          </div>
          <FilterSection
            title='Degree'
            inputField='degree'
            options={degrees}
            selectedValues={selectedDegrees}
            onCheckboxChange={(val) => handleFilterChange('degree', val)}
            defaultValue={filterSearchInputs.degree}
            onSearchChange={handleFilterSearchChange}
            isLoading={isDegreesLoading}
          />
          <FilterSection
            title='District'
            inputField='district'
            options={districts}
            selectedValues={selectedDistricts}
            onCheckboxChange={(val) => handleFilterChange('district', val)}
            defaultValue={filterSearchInputs.district}
            onSearchChange={handleFilterSearchChange}
            isLoading={isDistrictsLoading}
          />
          <FilterSection
            title='Affiliation'
            inputField='affiliation'
            options={affiliations}
            selectedValues={selectedAffiliations}
            onCheckboxChange={(val) => handleFilterChange('affiliation', val)}
            defaultValue={filterSearchInputs.affiliation}
            onSearchChange={handleFilterSearchChange}
            isLoading={isAffiliationsLoading}
          />
          <FilterSection
            title='Institute type'
            inputField='instituteType'
            options={instituteTypes}
            selectedValues={selectedTypes}
            onCheckboxChange={(val) => handleFilterChange('type', val)}
            defaultValue={filterSearchInputs.instituteType}
            onSearchChange={(f, v) =>
              setFilterSearchInputs((prev) => ({ ...prev, instituteType: v }))
            }
          />
        </div>

        {/* Content Area */}
        <div className='flex-1'>
          {isLoading ? (
            <div className='grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-10'>
              {Array.from({ length: 9 }).map((_, idx) => (
                <UniversityCardShimmer key={idx} />
              ))}
            </div>
          ) : colleges.length > 0 ? (
            <div className='grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-10'>
              {colleges.map((u, idx) => (
                <CollegeCard
                  key={u.collegeId ?? idx}
                  name={u.name}
                  location={u.location}
                  collegeId={u.collegeId}
                  slug={u.slug}
                  collegeImage={u.collegeImage}
                  instituteType={u.instituteType}
                  universityName={u.universityName}
                  logo={u.logo}
                  degrees={u.degrees}
                  wishlistCollegeIds={wishlistCollegeIds}
                  onWishlistUpdate={setWishlistCollegeIds}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title='No Colleges Found'
              description="We couldn't find any colleges matching your current search or filter criteria. Try clearing some filters to see more results."
              action={{
                label: 'Clear All Filters',
                onClick: () => {
                  setSearchQuery('')
                  setFilterSearchInputs({
                    degree: '',
                    district: '',
                    affiliation: '',
                    instituteType: ''
                  })
                  router.push(pathname, { scroll: false })
                }
              }}
            />
          )}

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

            <div className='flex-1 overflow-y-auto p-5 space-y-6 sidebar-scrollbar'>
              <FilterSection
                title='Degree'
                inputField='degree'
                options={degrees}
                selectedValues={selectedDegrees}
                onCheckboxChange={(val) => handleFilterChange('degree', val)}
                defaultValue={filterSearchInputs.degree}
                onSearchChange={handleFilterSearchChange}
                isLoading={isDegreesLoading}
              />
              <FilterSection
                title='District'
                inputField='district'
                options={districts}
                selectedValues={selectedDistricts}
                onCheckboxChange={(val) => handleFilterChange('district', val)}
                defaultValue={filterSearchInputs.district}
                onSearchChange={handleFilterSearchChange}
                isLoading={isDistrictsLoading}
              />
              <FilterSection
                title='Affiliation'
                inputField='affiliation'
                options={affiliations}
                selectedValues={selectedAffiliations}
                onCheckboxChange={(val) =>
                  handleFilterChange('affiliation', val)
                }
                defaultValue={filterSearchInputs.affiliation}
                onSearchChange={handleFilterSearchChange}
                isLoading={isAffiliationsLoading}
              />
              <FilterSection
                title='Institute type'
                inputField='instituteType'
                options={instituteTypes}
                selectedValues={selectedTypes}
                onCheckboxChange={(val) => handleFilterChange('type', val)}
                defaultValue={filterSearchInputs.instituteType}
                onSearchChange={(f, v) =>
                  setFilterSearchInputs((prev) => ({
                    ...prev,
                    instituteType: v
                  }))
                }
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

export default Body
