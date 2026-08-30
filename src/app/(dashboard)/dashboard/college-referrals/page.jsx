'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import { authFetch } from '@/app/utils/authFetch'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import ShimmerEffect from '@/ui/molecules/ShimmerEffect'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/ui/shadcn/table-primitives'
import { Button } from '@/ui/shadcn/button'
import {
  Search,
  X,
  Filter,
  ChevronDown,
  FileText,
  AlertCircle
} from 'lucide-react'
import SearchInput from '@/ui/molecules/SearchInput'

const ReferedStudentsPage = () => {
  const { setHeading } = usePageHeading()
  const [referrals, setReferrals] = useState([])
  const [allReferrals, setAllReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Dropdown states
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [statusSearchTerm, setStatusSearchTerm] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const statusDropdownRef = useRef(null)

  useEffect(() => {
    setHeading('Referred Students')
    return () => setHeading(null)
  }, [setHeading])

  useEffect(() => {
    let isMounted = true

    const loadReferrals = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await authFetch(
          `${process.env.baseUrl}/referral/user/referrals`,
          { cache: 'no-store' }
        )

        if (!response.ok) {
          throw new Error('Failed to load referred students')
        }

        const data = await response.json()
        if (!isMounted) return
        const list = Array.isArray(data) ? data : []
        setAllReferrals(list)
        setReferrals(list)
      } catch (err) {
        console.error('Error loading referred students:', err)
        if (isMounted) {
          setError(err.message || 'Failed to load referred students')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadReferrals()

    return () => {
      isMounted = false
    }
  }, [])

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'All Status' },
      { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
      { value: 'ACCEPTED', label: 'ACCEPTED' },
      { value: 'REJECTED', label: 'REJECTED' }
    ],
    []
  )

  const filteredStatusOptions = useMemo(() => {
    if (!statusSearchTerm) return statusOptions
    return statusOptions.filter((option) =>
      option.label.toLowerCase().includes(statusSearchTerm.toLowerCase())
    )
  }, [statusOptions, statusSearchTerm])

  const selectedStatusLabel = useMemo(
    () =>
      statusOptions.find((opt) => opt.value === statusFilter)?.label ||
      'All Status',
    [statusOptions, statusFilter]
  )

  // Filter referrals based on search and status
  useEffect(() => {
    let filtered = [...allReferrals]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((referral) => {
        const college = referral.referralCollege || {}
        const address = college.address || {}
        const location = [address.city, address.state, address.country]
          .filter(Boolean)
          .join(', ')
        const collegeName = (college.name || '').toLowerCase()
        const studentName = (referral.student_name || '').toLowerCase()
        const studentEmail = (referral.student_email || '').toLowerCase()
        const studentPhone = (referral.student_phone_no || '').toLowerCase()
        const studentDesc = (referral.student_description || '').toLowerCase()

        return (
          collegeName.includes(query) ||
          location.toLowerCase().includes(query) ||
          studentName.includes(query) ||
          studentEmail.includes(query) ||
          studentPhone.includes(query) ||
          studentDesc.includes(query)
        )
      })
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (referral) => referral.status === statusFilter
      )
    }

    setReferrals(filtered)
  }, [searchQuery, statusFilter, allReferrals])

  // Reset to first page whenever search/filter results change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, allReferrals])

  // Pagination derivations
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(referrals.length / pageSize)),
    [referrals.length, pageSize]
  )

  const safePage = Math.min(currentPage, totalPages)

  const paginatedReferrals = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return referrals.slice(start, start + pageSize)
  }, [referrals, safePage, pageSize])

  const pageNumbers = useMemo(() => {
    const pages = []
    const total = totalPages
    const current = safePage
    const maxVisible = 5

    let start = Math.max(1, current - Math.floor(maxVisible / 2))
    let end = Math.min(total, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }, [totalPages, safePage])

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setStatusDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setStatusSearchTerm('')
  }

  const hasActiveFilters = searchQuery || statusFilter

  const getStatusBadge = (status) => {
    const value = status || 'IN_PROGRESS'
    const className =
      value === 'ACCEPTED'
        ? 'bg-green-100 text-green-800'
        : value === 'REJECTED'
          ? 'bg-red-100 text-red-800'
          : 'bg-yellow-100 text-yellow-800'
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}
      >
        {value}
      </span>
    )
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) return <ShimmerEffect />
  if (error)
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-center'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
          <p className='text-red-600'>Error: {error}</p>
        </div>
      </div>
    )

  return (
    <div className='p-6 bg-white min-h-screen'>
      {/* Search and Filter Section */}
      <div className='mb-6 space-y-4'>
        <div className='flex flex-col md:flex-row gap-4'>
          {/* Search Input */}
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search by student, college, phone or email...'
            className='max-w-md'
          />

          {/* Status Filter - Searchable Dropdown */}
          <div className='relative' ref={statusDropdownRef}>
            <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10' />
            <button
              type='button'
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className='w-full pl-10 pr-8 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px] hover:bg-gray-50 transition-colors'
            >
              <span
                className={statusFilter ? 'text-gray-900' : 'text-gray-500'}
              >
                {selectedStatusLabel}
              </span>
            </button>
            <ChevronDown
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''
                }`}
            />

            {statusDropdownOpen && (
              <div className='absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden'>
                <div className='p-2 border-b border-gray-200'>
                  <div className='relative'>
                    <Search className='absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                      type='text'
                      placeholder='Search status...'
                      value={statusSearchTerm}
                      onChange={(e) => setStatusSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className='w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                      autoFocus
                    />
                  </div>
                </div>
                <div className='max-h-48 overflow-y-auto'>
                  {filteredStatusOptions.length > 0 ? (
                    filteredStatusOptions.map((option) => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => {
                          setStatusFilter(option.value)
                          setStatusSearchTerm('')
                          setStatusDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${statusFilter === option.value
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))
                  ) : (
                    <div className='px-3 py-2 text-sm text-gray-500 text-center'>
                      No status found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant='outline'
              onClick={handleClearFilters}
              className='whitespace-nowrap'
            >
              <X className='w-4 h-4 mr-1' />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Count */}
        {hasActiveFilters && (
          <div className='text-sm text-gray-600'>
            Showing {referrals.length} of {allReferrals.length} referred
            students
          </div>
        )}
      </div>

      {allReferrals.length === 0 ? (
        <div className='text-center py-12 border border-gray-200 rounded-md bg-gray-50'>
          <FileText className='w-16 h-16 text-gray-400 mx-auto mb-4' />
          <p className='text-lg text-gray-600 mb-2'>No referred students yet</p>
          <p className='text-sm text-gray-500'>
            Start referring students from the &quot;Refer Student&quot; page
          </p>
        </div>
      ) : (
        <div className='rounded-md border bg-white overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50px] text-gray-600'>S.N.</TableHead>
                <TableHead className='text-gray-600'>College</TableHead>
                <TableHead className='text-gray-600'>Student Details</TableHead>
                <TableHead className='text-gray-600'>Description</TableHead>
                <TableHead className='text-gray-600'>Referred On</TableHead>
                <TableHead className='text-gray-600'>Remarks</TableHead>
                <TableHead className='text-gray-600'>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className='text-center py-8 text-muted-foreground'
                  >
                    No results match your filters
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReferrals.map((referral, index) => {
                  const college = referral.referralCollege || {}
                  const address = college.address || {}
                  const location = [
                    address.city,
                    address.state,
                    address.country
                  ]
                    .filter(Boolean)
                    .join(', ')

                  return (
                    <TableRow key={referral.id} className='hover:bg-gray-50'>
                      <TableCell className='font-medium'>
                        {(safePage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-start gap-3'>
                          {college.college_logo ? (
                            <img
                              src={college.college_logo}
                              alt={college.name}
                              className='w-10 h-10 object-contain rounded-md border border-gray-200 flex-shrink-0'
                            />
                          ) : (
                            <div className='w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200 flex-shrink-0'>
                              <span className='text-xl font-semibold text-gray-400'>
                                {(college.name || 'C').charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className='min-w-0'>
                            <div className='font-medium text-gray-800'>
                              {college.name || 'N/A'}
                            </div>
                            {location && (
                              <div className='text-sm text-muted-foreground'>
                                {location}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-col space-y-1'>
                          <div className='font-medium'>
                            {referral.student_name || 'N/A'}
                          </div>
                          {referral.student_email && (
                            <a
                              href={`mailto:${referral.student_email}`}
                              className='text-sm text-blue-600 hover:underline'
                            >
                              {referral.student_email}
                            </a>
                          )}
                          {referral.student_phone_no && (
                            <div className='text-sm text-muted-foreground'>
                              {referral.student_phone_no}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {referral.student_description ? (
                          <span className='text-sm text-muted-foreground'>
                            {referral.student_description.length > 80
                              ? `${referral.student_description.substring(0, 80)}...`
                              : referral.student_description}
                          </span>
                        ) : (
                          <span className='text-sm text-muted-foreground'>N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className='text-xs text-muted-foreground whitespace-nowrap'>
                          {formatDate(referral.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {referral.remarks ? (
                          <span className='text-sm text-muted-foreground'>
                            {referral.remarks.length > 50
                              ? `${referral.remarks.substring(0, 50)}...`
                              : referral.remarks}
                          </span>
                        ) : (
                          <span className='text-sm text-muted-foreground'>N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(referral.status)}</TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {referrals.length > 0 && (
            <div className='flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-white rounded-b-md'>
              <div className='flex items-center gap-3 text-sm text-gray-600'>
                <label className='flex items-center gap-1.5 whitespace-nowrap'>
                  Rows per page
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className='border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </label>
                <span className='whitespace-nowrap'>
                  Page {safePage} of {totalPages} ({referrals.length} total)
                </span>
              </div>

              <div className='flex items-center gap-1'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage === 1}
                >
                  Previous
                </Button>

                {pageNumbers.map((page) => (
                  <Button
                    key={page}
                    variant={page === safePage ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => handlePageChange(page)}
                    className={page === safePage ? 'min-w-[36px]' : 'min-w-[36px]'}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReferedStudentsPage
