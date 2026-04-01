'use client'
import { authFetch } from '@/app/utils/authFetch'
import Table from '@/ui/shadcn/DataTable'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import {
  fetchAllDegrees
} from './actions'

import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import useAdminPermission from '@/hooks/useAdminPermission'
import SearchInput from '@/ui/molecules/SearchInput'
import CreateCredentialsModal from '@/ui/molecules/dialogs/college/CreateCredentialsModal'
import CreateUpdateSchoolModal from '@/ui/molecules/dialogs/school/CreateUpdateSchoolModal'
import ViewCollegeModal from '@/ui/molecules/dialogs/college/ViewCollegeModal'
import { Button } from '../../../../ui/shadcn/button'
import { createColumns } from './columns'
import ImageLightbox from '@/ui/molecules/image-lightbox'

export default function SchoolManagement() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { setHeading } = usePageHeading()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [status, setStatus] = useState(searchParams.get('status') || 'all')

  const [schools, setSchools] = useState([])
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
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewSchoolData, setViewSchoolData] = useState(null)
  const [loadingView, setLoadingView] = useState(false)

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
      altText: altText || 'School Logo'
    })
  }

  const { requireAdmin } = useAdminPermission()

  // For all fetching of degrees
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
    const params = new URLSearchParams(window.location.search)
    if (params.get('add') === 'true') {
      setIsOpen(true)
      setEditSlug('')
    } else {
      const editSlugParam = params.get('edit')
      if (editSlugParam) {
        setEditSlug(editSlugParam)
        setIsOpen(true)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    setHeading('School Management')
    const loadInitialSchools = async () => {
      const page = parseInt(searchParams.get('page')) || 1
      try {
        const statusParam = searchParams.get('status')
        let url = `${process.env.baseUrl}/school?limit=10&page=${page}`
        if (statusParam && statusParam !== 'all') {
          url += `&status=${statusParam}`
        }
        const response = await authFetch(url)
        if (response.ok) {
          const data = await response.json()
          if (data && data.items) {
            setSchools(data.items)
            setPagination({
              currentPage: data.pagination?.currentPage || 1,
              totalPages: data.pagination?.totalPages || 1,
              total: data.pagination?.totalCount || 0
            })
          }
        } else {
          throw new Error('Failed to fetch schools')
        }
      } catch (err) {
        console.error('Error loading schools:', err)
        setSchools([])
        setPagination({
          currentPage: 1,
          totalPages: 1,
          total: 0
        })
      } finally {
        setTableLoading(false)
      }
    }
    loadInitialSchools()
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
        `${process.env.baseUrl}/school/${deleteId}`,
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
        description: res.message || 'School deleted successfully'
      })
      
      loadSchools(pagination.currentPage)
      setEditSlug('')
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete school',
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

  const handleOpenCredentialsModal = async (school) => {
    setSelectedSchool(school)
    setCredentialsModalOpen(true)
  }

  const handleEdit = (slug) => {
    setEditSlug(slug)
    setIsOpen(true)
  }

  const loadSchools = async (page = 1) => {
    try {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', page)
      if (status !== 'all') {
        params.set('status', status)
      } else {
        params.delete('status')
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })

      let url = `${process.env.baseUrl}/school?limit=10&page=${page}`
      if (status !== 'all') {
        url += `&status=${status}`
      }
      const response = await authFetch(url)

      if (response.ok) {
        const data = await response.json()
        setSchools(data.items || [])
        setPagination({
          currentPage: data.pagination?.currentPage || page,
          totalPages: data.pagination?.totalPages || 1,
          total: data.pagination?.totalCount || 0
        })
      } else {
        throw new Error('Failed to fetch schools')
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load schools',
        variant: 'destructive'
      })
      console.error('Error loading schools:', err)
    } finally {
      setTableLoading(false)
    }
  }

  const handleSearch = async (query) => {
    try {
      let url = `${process.env.baseUrl}/school?limit=10&page=1`
      if (query) url += `&q=${query}`
      if (status !== 'all') url += `&status=${status}`

      const response = await authFetch(url)
      if (response.ok) {
        const data = await response.json()
        setSchools(data.items)

        if (data.pagination) {
          setPagination({
            currentPage: data.pagination.currentPage,
            totalPages: data.pagination.totalPages,
            total: data.pagination.totalCount
          })
        }
      } else {
        console.error('Error fetching results:', response.statusText)
        setSchools([])
      }
    } catch (error) {
      console.error('Error fetching school search results:', error.message)
      setSchools([])
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
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleView = async (slug) => {
    try {
      setLoadingView(true)
      setViewModalOpen(true)

      const response = await authFetch(
        `${process.env.baseUrl}/school/${slug}`,
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch school details')
      }

      const data = await response.json()
      setViewSchoolData(data.item)
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load school details',
        variant: 'destructive'
      })
      setViewModalOpen(false)
    } finally {
      setLoadingView(false)
    }
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setViewSchoolData(null)
  }

  const handleReferable = async (id, value) => {
    setSchools(prev =>
      prev.map(s => s.id === id ? { ...s, is_referable: value } : s)
    )
    try {
      await authFetch(`${process.env.baseUrl}/school/${id}/referable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_referable: value })
      })
    } catch (err) {
      setSchools(prev =>
        prev.map(s => s.id === id ? { ...s, is_referable: !value } : s)
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
      <div className='flex flex-col mb-3 sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-md shadow-sm border'>
        <div className='flex flex-col md:flex-row gap-4 items-start md:items-center flex-1 w-full'>
          <SearchInput
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder='Search schools...'
            className='max-w-md w-full'
          />
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className='flex h-11 w-full md:w-40 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#387cae]/20 transition-all font-medium text-gray-700 hover:bg-gray-50'
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <Button
          onClick={() => {
            setIsOpen(true)
            setEditSlug('')
          }}
          className="bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 h-11 px-6 rounded-md shadow-sm transition-all shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add School
        </Button>
      </div>

      <CreateUpdateSchoolModal
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
        editSlug={editSlug}
        onSuccess={() => loadSchools(pagination.currentPage)}
        allDegrees={allDegrees}
      />

      <ConfirmationDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDeleteConfirm}
        title='Confirm Deletion'
        message='Are you sure you want to delete this School? This action cannot be undone.'
      />

      <ViewCollegeModal
        viewModalOpen={viewModalOpen}
        handleCloseViewModal={handleCloseViewModal}
        loadingView={loadingView}
        viewCollegeData={viewSchoolData}
      />

      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table
          loading={tableLoading}
          data={schools}
          columns={columns}
          pagination={pagination}
          onPageChange={(newPage) => loadSchools(newPage)}
          onSearch={handleSearch}
          showSearch={false}
        />
      </div>

      <CreateCredentialsModal
        setCredentialsModalOpen={setCredentialsModalOpen}
        credentialsModalOpen={credentialsModalOpen}
        selectedCollege={selectedSchool}
        setSelectedCollege={setSelectedSchool}
        setTableLoading={setTableLoading}
        pagination={pagination}
        setPagination={setPagination}
        setColleges={setSchools}
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
