'use client'

import Pagination from '@/ui/molecules/common/Pagination'

import { authFetch } from '@/app/utils/authFetch'
import { DistrictLists } from '@/constants/district'
import CollegeCard from '@/ui/molecules/cards/CollegeCard'
import EmptyState from '@/ui/shadcn/EmptyState'
import { useRouter } from '@bprogress/next/app'
import { debounce } from 'lodash'
import { Building2, Search, X } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import UniversityCardShimmer from './UniversityShimmerCard'

// Client-side fetch functions
const fetchCollegesFromAPI = async (page = 1, filters = {}, q = '') => {
  try {
    const body = {
      page,
      limit: q ? 1000 : 24,

      degree_ids: filters.degree_ids || [],
      districts: filters.districts || [],
      university_ids: filters.university_ids || [],
      types: (filters.types || []).map((t) => t.toLowerCase()),
      institute_level: ['college'],
      q: q || ''
    }

    const url = `${process.env.baseUrl}/college/filter`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()

    return {
      colleges:
        data.items?.map((college) => ({
          name: college.name,
          location: [
            college.collegeAddress?.street || college.address?.street,
            college.collegeAddress?.city ||
              college.address?.city ||
              college.collegeAddress?.district ||
              college.address?.district
          ]
            .filter(Boolean)
            .join(', '),
          description: college.description,
          googleMapUrl: college.google_map_url,
          instituteType: college.institute_type,
          slug: college.slugs,
          collegeId: college.id,
          collegeImage: college.featured_img,
          logo: college.college_logo || college.logo,
          universityName:
            college.university?.fullname || college.university?.name,
          degrees: college.degrees || []
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
      pagination: { currentPage: 1, totalPages: 1, totalCount: 0 }
    }
  }
}

const searchColleges = async (query) => {
  try {
    const response = await fetch(
      `${process.env.baseUrl}/college?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      }
    )

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    if (!data.items || data.items.length === 0) {
      return {
        colleges: [],
        pagination: { currentPage: 1, totalPages: 0, totalCount: 0 }
      }
    }

    const colleges = data.items.map((clz) => ({
      collegeId: clz.id,
      name: clz.name,
      slug: clz.slugs,
      collegeImage: clz.featured_img,
      location: [
        clz.collegeAddress?.street || clz.address?.street,
        clz.collegeAddress?.city ||
          clz.address?.city ||
          clz.collegeAddress?.district ||
          clz.address?.district
      ]
        .filter(Boolean)
        .join(', '),
      description: clz.description || 'No description available.',
      logo: clz.college_logo || clz.logo || 'default_logo.png',
      instituteType: clz.institute_type || 'Unknown',
      universityName: clz.university?.fullname || clz.university?.name,
      degrees: clz.degrees || []
    }))

    return {
      colleges,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: colleges.length
      }
    }
  } catch (error) {
    console.error('Failed to search colleges:', error)
    return {
      colleges: [],
      pagination: { currentPage: 1, totalPages: 1, totalCount: 0 }
    }
  }
}

const getDegrees = async (searchQuery = '') => {
  try {
    const queryParams = new URLSearchParams()
    if (searchQuery) queryParams.append('q', searchQuery)
    const url = `${process.env.baseUrl}/degree?${queryParams.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })
    if (!response.ok) throw new Error('Failed to fetch degrees')
    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Error fetching degrees:', error)
    return []
  }
}

const getUniversity = async (searchQuery = '') => {
  try {
    const queryParams = new URLSearchParams()
    if (searchQuery) queryParams.append('q', searchQuery)
    const url = `${process.env.baseUrl}/university?${queryParams.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })
    if (!response.ok) throw new Error('Failed to fetch universities')
    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Error fetching universities:', error)
    return []
  }
}

// Memoized FilterSection with local state for performant typing
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

  // Update local search if default value changes externally (e.g. Clear All)
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
                checked={selectedValues.includes(String(opt.id || opt.name))}
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

const CollegeFinder = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Derived Values from URL (Single Source of Truth)
  const q = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page')) || 1
  const selectedDegreeIds = useMemo(
    () => searchParams.get('degree_ids')?.split(',').filter(Boolean) || [],
    [searchParams]
  )
  const selectedDistricts = useMemo(
    () => searchParams.get('districts')?.split(',').filter(Boolean) || [],
    [searchParams]
  )
  const selectedUniversityIds = useMemo(
    () => searchParams.get('university_ids')?.split(',').filter(Boolean) || [],
    [searchParams]
  )
  const selectedTypes = useMemo(
    () => searchParams.get('types')?.split(',').filter(Boolean) || [],
    [searchParams]
  )

  // UI States
  const [colleges, setColleges] = useState([])
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    totalCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchInputValue, setSearchInputValue] = useState(q)
  const [isSearching, setIsSearching] = useState(false)

  // Filter Data States
  const [filteredDegrees, setFilteredDegrees] = useState([])
  const [filteredAffiliations, setFilteredAffiliations] = useState([])
  const [isDegreesLoading, setIsDegreesLoading] = useState(false)
  const [isAffiliationLoading, setIsAffiliationLoading] = useState(false)
  const [filterSearchInputs, setFilterSearchInputs] = useState({
    degree: '',
    affiliation: '',
    district: '',
    instituteType: ''
  })

  const user = useSelector((state) => state.user.data)
  const [wishlistCollegeIds, setWishlistCollegeIds] = useState(new Set())

  // URL Sync Helper
  const updateURL = useCallback(
    (params) => {
      const newParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value.length > 0) newParams.set(key, value.join(','))
          else newParams.delete(key)
        } else if (value !== undefined && value !== null && value !== '') {
          newParams.set(key, value)
        } else {
          newParams.delete(key)
        }
      })
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  // Initial Data for Filters
  useEffect(() => {
    const initFilters = async () => {
      setIsDegreesLoading(true)
      setIsAffiliationLoading(true)
      try {
        const [degrees, unis] = await Promise.all([
          getDegrees(),
          getUniversity()
        ])
        setFilteredDegrees(degrees.map((p) => ({ id: p.id, name: p.title })))
        setFilteredAffiliations(
          unis.map((u) => ({ id: u.id, name: u.fullname }))
        )
      } finally {
        setIsDegreesLoading(false)
        setIsAffiliationLoading(false)
      }
    }
    initFilters()
  }, [])

  // Sync Search Input with URL (e.g. back button)
  useEffect(() => {
    setSearchInputValue(q)
  }, [q])

  // Debounced Search Update
  const debouncedSearch = useMemo(
    () => debounce((value) => updateURL({ q: value, page: 1 }), 500),
    [updateURL]
  )

  const handleSearchInputChange = (e) => {
    const val = e.target.value
    setSearchInputValue(val)
    debouncedSearch(val)
  }

  // Filter Event Handlers
  const handleFilterChange = (type, value) => {
    const currentParam =
      type === 'uni'
        ? 'university_ids'
        : type === 'degree'
          ? 'degree_ids'
          : type === 'type'
            ? 'types'
            : 'districts'

    const currentValues =
      type === 'uni'
        ? selectedUniversityIds
        : type === 'degree'
          ? selectedDegreeIds
          : type === 'type'
            ? selectedTypes
            : selectedDistricts

    const nextValues = currentValues.includes(String(value))
      ? currentValues.filter((v) => v !== String(value))
      : [...currentValues, String(value)]

    updateURL({ [currentParam]: nextValues, page: 1 })
  }

  const handleFilterSearch = async (field, value) => {
    setFilterSearchInputs((prev) => ({ ...prev, [field]: value }))
    if (field === 'degree') {
      setIsDegreesLoading(true)
      const data = await getDegrees(value)
      setFilteredDegrees(data.map((p) => ({ id: p.id, name: p.title })))
      setIsDegreesLoading(false)
    }
    if (field === 'affiliation') {
      setIsAffiliationLoading(true)
      const data = await getUniversity(value)
      setFilteredAffiliations(data.map((u) => ({ id: u.id, name: u.fullname })))
      setIsAffiliationLoading(false)
    }
  }

  // Main Data Fetch (Triggers on any URL change)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      if (q) setIsSearching(true)

      const filters = {
        degree_ids: selectedDegreeIds,
        districts: selectedDistricts,
        university_ids: selectedUniversityIds,
        types: selectedTypes
      }

      try {
        const data = await fetchCollegesFromAPI(page, filters, q)
        setColleges(data.colleges)
        setPagination(data.pagination)
      } catch (error) {
        setColleges([])
      } finally {
        setIsLoading(false)
        setIsSearching(false)
        window.scrollTo({ top: 0, behavior: 'auto' })
      }
    }
    loadData()
  }, [
    page,
    q,
    selectedDegreeIds,
    selectedDistricts,
    selectedUniversityIds,
    selectedTypes
  ])

  // Wishlist Logic
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
      } catch (error) {}
    }
    fetchWishlist()
  }, [user?.id])

  // Filter Option Lists
  const districts = useMemo(
    () =>
      DistrictLists.filter((d) =>
        d.toLowerCase().includes(filterSearchInputs.district.toLowerCase())
      ).map((d) => ({ id: d, name: d })),
    [filterSearchInputs.district]
  )

  const instituteTypes = useMemo(
    () =>
      ['Private', 'Public']
        .filter((t) =>
          t
            .toLowerCase()
            .includes(filterSearchInputs.instituteType.toLowerCase())
        )
        .map((t) => ({ id: t.toLowerCase(), name: t })),
    [filterSearchInputs.instituteType]
  )

  return (
    <div className='max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 mb-5'>
      {/* Header & Search */}
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
          <div className='flex bg-white items-center rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A70A7] focus-within:border-[#0A70A7] transition-all px-5 py-2.5 relative w-full group'>
            <Search className='w-5 h-5 text-gray-400 group-focus-within:text-[#0A70A7] transition-colors' />
            <input
              type='text'
              value={searchInputValue}
              onChange={handleSearchInputChange}
              placeholder='Search by college name, city or district...'
              className='w-full px-4 py-2 bg-transparent text-base font-medium outline-none placeholder:text-gray-400'
            />
            <div className='absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3'>
              {isSearching && (
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A70A7]'></div>
              )}
              {searchInputValue && (
                <button
                  onClick={() => {
                    setSearchInputValue('')
                    updateURL({ q: '', page: 1 })
                  }}
                  className='p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500'
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
            <span className='text-xs font-bold text-gray-400 uppercase tracking-widest'>
              Filters
            </span>
            <button
              className='text-gray-400 hover:text-red-500 font-bold text-[10px] uppercase tracking-wider'
              onClick={() => router.push(pathname, { scroll: false })}
            >
              Clear All
            </button>
          </div>
          <FilterSection
            title='Degree'
            inputField='degree'
            options={filteredDegrees}
            selectedValues={selectedDegreeIds}
            onCheckboxChange={(val) => handleFilterChange('degree', val)}
            defaultValue={filterSearchInputs.degree}
            onSearchChange={handleFilterSearch}
            isLoading={isDegreesLoading}
          />
          <FilterSection
            title='District'
            inputField='district'
            options={districts}
            selectedValues={selectedDistricts}
            onCheckboxChange={(val) => handleFilterChange('district', val)}
            defaultValue={filterSearchInputs.district}
            onSearchChange={(f, v) =>
              setFilterSearchInputs((prev) => ({ ...prev, district: v }))
            }
          />
          <FilterSection
            title='Affiliation'
            inputField='affiliation'
            options={filteredAffiliations}
            selectedValues={selectedUniversityIds}
            onCheckboxChange={(val) => handleFilterChange('uni', val)}
            defaultValue={filterSearchInputs.affiliation}
            onSearchChange={handleFilterSearch}
            isLoading={isAffiliationLoading}
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
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10'>
              {Array.from({ length: 9 }).map((_, idx) => (
                <UniversityCardShimmer key={idx} />
              ))}
            </div>
          ) : colleges.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10'>
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
              description="We couldn't find any colleges matching your criteria. Try clearing filters."
              action={{
                label: 'Clear All Filters',
                onClick: () => router.push(pathname, { scroll: false })
              }}
            />
          )}

          {pagination.totalPages > 1 && (
            <div className='mt-20 flex justify-center'>
              <div className='bg-white px-8 py-4 rounded-[24px] shadow-sm border border-gray-100'>
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CollegeFinder
