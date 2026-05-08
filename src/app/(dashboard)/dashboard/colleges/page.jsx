'use client'
import { authFetch } from '@/app/utils/authFetch'
import Table from '@/ui/shadcn/DataTable'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Loader2, Building2 } from 'lucide-react'
import {
  fetchAllDegrees
} from './actions'

import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import useAdminPermission from '@/hooks/useAdminPermission'
import CreateCredentialsModal from '@/ui/molecules/dialogs/college/CreateCredentialsModal'
import CreateUpdateCollegeModal from '@/ui/molecules/dialogs/college/CreateUpdateCollegeModal'
import ViewCollegeModal from '@/ui/molecules/dialogs/college/ViewCollegeModal'
import { Button } from '../../../../ui/shadcn/button'
import { createColumns } from './columns'
import ImageLightbox from '@/ui/molecules/image-lightbox'
import ViewReferableCollegesModal from '@/ui/molecules/dialogs/college/ViewReferableCollegesModal'



export default function CollegeForm() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { setHeading } = usePageHeading()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [status, setStatus] = useState(searchParams.get('status') || 'all')

  const [colleges, setColleges] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [editSlug, setEditSlug] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page')) || 1,
    totalPages: 1,
    total: 0
  })
  const [isOpen, setIsOpen] = useState(false)
  const [allDegrees, setAllDegrees] = useState([])

  const [deleteId, setDeleteId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewCollegeData, setViewCollegeData] = useState(null)
  const [loadingView, setLoadingView] = useState(false)
  const [referableModalOpen, setReferableModalOpen] = useState(false)

  // Lightbox State
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    imageUrl: '',
    altText: ''
  })

  const handleImageClick = (imageUrl, altText) => {
    setLightbox({
      isOpen: true,
      imageUrl,
      altText: altText || 'College Logo'
    })
  }


  const author_id = useSelector((state) => state.user.data?.id)

  const { requireAdmin } = useAdminPermission()


  //for all fetching of degrees
  useEffect(() => {
    const getDegrees = async () => {
      try {
        const degreeList = await fetchAllDegrees()
        setAllDegrees(degreeList)
      } catch (error) {
        console.error('Error fetching degrees:', error)
      }
    }

    getDegrees()
  }, [])

  const handleCloseModal = () => {
    setIsOpen(false)
    setEditSlug('')
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('add') === 'true') {
      setIsOpen(true)
      setEditSlug('')
    } else {
      const editSlugParam = searchParams.get('edit')
      if (editSlugParam) {
        setEditSlug(editSlugParam)
        setIsOpen(true)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    setHeading('College Management')
    const loadInitialColleges = async () => {
      const page = parseInt(searchParams.get('page')) || 1
      try {
        const statusParam = searchParams.get('status')
      let url = `${process.env.baseUrl}/college?limit=10&page=${page}`
        if (statusParam && statusParam !== 'all') {
          url += `&status=${statusParam}`
        }
        const response = await authFetch(url)
        if (response.ok) {
          const data = await response.json()
          if (data && data.items) {
            setColleges(data.items)
            setPagination({
              currentPage: data.pagination?.currentPage || 1,
              totalPages: data.pagination?.totalPages || 1,
              total: data.pagination?.totalCount || 0
            })
          }
        } else {
          throw new Error('Failed to fetch colleges')
        }
      } catch (err) {
        console.error('Error loading colleges:', err)
        setColleges([])
        setPagination({
          currentPage: 1,
          totalPages: 1,
          total: 0
        })
      } finally {
        setTableLoading(false)
      }
    }
    loadInitialColleges()
    return () => setHeading(null)
  }, [setHeading, searchParams])

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])


  const handleDeleteClick = (id) => {
    requireAdmin(() => {
      setDeleteId(id)
      setIsDialogOpen(true)
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return

    try {
      const response = await authFetch(
        `${process.env.baseUrl}/college/${deleteId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      const res = await response.json()
      toast({
        title: 'Success',
        description: res.message || 'College deleted successfully'
      })
      // Reload colleges using authFetch
      const reloadResponse = await authFetch(
        `${process.env.baseUrl}/college?limit=10&page=${pagination.currentPage}`
      )
      if (reloadResponse.ok) {
        const reloadData = await reloadResponse.json()
        setColleges(reloadData.items || [])
        setPagination({
          currentPage:
            reloadData.pagination?.currentPage || pagination.currentPage,
          totalPages:
            reloadData.pagination?.totalPages || pagination.totalPages,
          total: reloadData.pagination?.totalCount || pagination.total
        })
      }
      setEditSlug('')
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete college',
        variant: 'destructive'
      })
    } finally {
      setIsDialogOpen(false)
      setDeleteId(null)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setDeleteId(null)
  }

  const handleOpenCredentialsModal = async (college) => {
    setSelectedCollege(college)
    setCredentialsModalOpen(true)
  }



  const handleEdit = (slug) => {
    setEditSlug(slug)
    setIsOpen(true)
  }

  const loadColleges = async (page = 1) => {
    try {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', page)
      if (status !== 'all') {
        params.set('status', status)
      } else {
        params.delete('status')
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })

      let url = `${process.env.baseUrl}/college?limit=10&page=${page}`
      if (status !== 'all') {
        url += `&status=${status}`
      }
      const response = await authFetch(url)

      if (response.ok) {
        const data = await response.json()
        setColleges(data.items || [])
        setPagination({
          currentPage: data.pagination?.currentPage || page,
          totalPages: data.pagination?.totalPages || 1,
          total: data.pagination?.totalCount || 0
        })
      } else {
        throw new Error('Failed to fetch colleges')
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load colleges',
        variant: 'destructive'
      })
      console.error('Error loading colleges:', err)
    } finally {
      setTableLoading(false)
    }
  }

  const handleSearch = async (query) => {
    try {
      let url = `${process.env.baseUrl}/college?limit=10&page=1`
      if (query) url += `&q=${query}`
      if (status !== 'all') url += `&status=${status}`

      const response = await authFetch(url)
      if (response.ok) {
        const data = await response.json()
        setColleges(data.items)

        if (data.pagination) {
          setPagination({
            currentPage: data.pagination.currentPage,
            totalPages: data.pagination.totalPages,
            total: data.pagination.totalCount
          })
        }
      } else {
        console.error('Error fetching results:', response.statusText)
        setColleges([])
      }
    } catch (error) {
      console.error('Error fetching college search results:', error.message)
      setColleges([])
    }
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeoutId = setTimeout(() => {
      handleSearch(value)
    }, 300)
    setSearchTimeout(timeoutId)
  }

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    const params = new URLSearchParams(searchParams.toString())
    if (newStatus !== 'all') {
      params.set('status', newStatus)
    } else {
      params.delete('status')
    }
    params.set('page', '1') // Reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleView = async (slug) => {
    try {
      setLoadingView(true)
      setViewModalOpen(true)

      const response = await authFetch(
        `${process.env.baseUrl}/college/${slug}`,
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch college details')
      }

      const data = await response.json()
      setViewCollegeData(data.item)
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load college details',
        variant: 'destructive'
      })
      setViewModalOpen(false)
    } finally {
      setLoadingView(false)
    }
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setViewCollegeData(null)
  }
  const handleReferable = async (id, value) => {
    // Optimistically update UI
    setColleges(prev =>
      prev.map(c => c.id === id ? { ...c, is_referable: value } : c)
    )
    try {
      await authFetch(`${process.env.baseUrl}/college/${id}/referable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_referable: value })
      })
    } catch (err) {
      // Revert on failure
      setColleges(prev =>
        prev.map(c => c.id === id ? { ...c, is_referable: !value } : c)
      )
      toast({ title: 'Error', description: 'Failed to update referability', variant: 'destructive' })
    }
  }

  const columns = createColumns({
    handleView,
    handleEdit,
    handleOpenCredentialsModal,
    handleDeleteClick,
    handleImageClick,
    handleReferable
  })

  return (
    <div className='w-full'>
      <div className='sticky mb-3 top-0 z-30 bg-[#F7F8FA] py-3'>
        <div className='bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
            <div className='flex items-center gap-3 shrink-0'>
              <div className='w-9 h-9 rounded-md bg-[#387cae]/10 flex items-center justify-center shrink-0'>
                <Building2 size={17} className='text-[#387cae]' strokeWidth={2} />
              </div>
              <div>
                <p className='text-sm font-bold text-gray-800'>Colleges</p>
                <p className='text-xs text-gray-400 flex items-center gap-1.5'>
                  {tableLoading ? (
                    <span className='inline-flex items-center gap-1'>
                      <Loader2 size={10} className='animate-spin' /> Loading…
                    </span>
                  ) : (
                    `${pagination.total} total`
                  )}
                </p>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto lg:flex-1 lg:justify-end lg:min-w-0'>
              <div className='relative shrink-0 flex-1 min-w-[160px] sm:max-w-xs lg:max-w-[240px]'>
                <Search
                  size={13}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
                />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder='Search colleges…'
                  className='w-full pl-8 pr-3 h-9 rounded-md border border-gray-200 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40 transition'
                />
              </div>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className='h-9 w-full sm:w-auto sm:min-w-[140px] shrink-0 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40 transition'
                aria-label='Filter by status'
              >
                <option value='all'>All status</option>
                <option value='published'>Published</option>
                <option value='draft'>Draft</option>
              </select>
              <Button
                type='button'
                onClick={() => setReferableModalOpen(true)}
                variant='outline'
                className='border-[#387cae]/40 text-[#387cae] hover:bg-[#387cae]/5 gap-2 h-9 px-4 rounded-md text-sm font-semibold shrink-0 w-full sm:w-auto'
              >
                View Referable Colleges
              </Button>
              <Button
                onClick={() => {
                  setIsOpen(true)
                  setEditSlug('')
                }}
                className='bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 h-9 px-4 rounded-md text-sm font-semibold shrink-0 w-full sm:w-auto'
              >
                <Plus className='w-4 h-4' />
                Add College
              </Button>
            </div>
          </div>
        </div>
      </div>
 
      <CreateUpdateCollegeModal
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
        editSlug={editSlug}
        onSuccess={() => loadColleges(pagination.currentPage)}
        allDegrees={allDegrees}
      />
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDeleteConfirm}
        title='Confirm Deletion'
        message='Are you sure you want to delete this College? This action cannot be undone.'
      />

      {/* View College Details Modal */}
      <ViewCollegeModal
        viewModalOpen={viewModalOpen}
        handleCloseViewModal={handleCloseViewModal}
        loadingView={loadingView}
        viewCollegeData={viewCollegeData}
      />

      {/* table container */}
      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table
          loading={tableLoading}
          data={colleges}
          columns={columns}
          pagination={pagination}
          onPageChange={(newPage) => loadColleges(newPage)}
          onSearch={handleSearch}
          showSearch={false}
        />
      </div>
      {/* Create Credentials Modal */}
      <CreateCredentialsModal
        setCredentialsModalOpen={setCredentialsModalOpen}
        credentialsModalOpen={credentialsModalOpen}
        selectedCollege={selectedCollege}
        setSelectedCollege={setSelectedCollege}
        setTableLoading={setTableLoading}
        pagination={pagination}
        setPagination={setPagination}
        setColleges={setColleges}
      />

      <ViewReferableCollegesModal
        isOpen={referableModalOpen}
        onClose={() => setReferableModalOpen(false)}
        onRemoveSuccess={(id) => {
          setColleges(prev =>
            prev.map(c => c.id === id ? { ...c, is_referable: false } : c)
          )
        }}
      />

      <ImageLightbox
        isOpen={lightbox.isOpen}
        onClose={() => setLightbox({ ...lightbox, isOpen: false })}
        imageUrl={lightbox.imageUrl}
        altText={lightbox.altText}
      />
    </div>
  )
}
