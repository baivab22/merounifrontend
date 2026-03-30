'use client'
import { authFetch } from '@/app/utils/authFetch'
import Table from '@/ui/shadcn/DataTable'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import SearchInput from '@/ui/molecules/SearchInput'
import ViewCollegeModal from '@/ui/molecules/dialogs/college/ViewCollegeModal'
import { createColumns } from '../colleges/columns'
import ImageLightbox from '@/ui/molecules/image-lightbox'

export default function ReferableCollegesPage() {
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
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page')) || 1,
    totalPages: 1,
    total: 0
  })

  // View Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewCollegeData, setViewCollegeData] = useState(null)
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
      altText: altText || 'College Logo'
    })
  }

  useEffect(() => {
    setHeading('Referable Colleges')
    loadColleges(pagination.currentPage)
    return () => setHeading(null)
  }, [setHeading, searchParams])

  const loadColleges = async (page = 1) => {
    setTableLoading(true)
    try {
      let url = `${process.env.baseUrl}/college?is_referable=true&limit=10&page=${page}`
      const statusParam = searchParams.get('status')
      if (statusParam && statusParam !== 'all') {
        url += `&status=${statusParam}`
      }
      const q = searchParams.get('q')
      if (q) {
        url += `&q=${q}`
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
      }
    } catch (err) {
      console.error('Error loading referable colleges:', err)
      toast({
        title: 'Error',
        description: 'Failed to load referable colleges',
        variant: 'destructive'
      })
    } finally {
      setTableLoading(false)
    }
  }

  const handleSearch = (query) => {
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchTimeout) clearTimeout(searchTimeout)
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
      const response = await authFetch(`${process.env.baseUrl}/college/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setViewCollegeData(data.item)
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load college details',
        variant: 'destructive'
      })
      setViewModalOpen(false)
    } finally {
      setLoadingView(false)
    }
  }

  const handleReferable = async (id, value) => {
    try {
      const response = await authFetch(`${process.env.baseUrl}/college/${id}/referable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_referable: value })
      })
      if (response.ok) {
        toast({ title: 'Success', description: 'Referability updated' })
        // If unchecking referable, remove from this specialized list
        if (!value) {
          setColleges(prev => prev.filter(c => c.id !== id))
        }
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update referability', variant: 'destructive' })
    }
  }

  // Reuse columns from standard colleges, but filter out Address and Actions
  const allColumns = createColumns({
    handleView,
    handleEdit: (slug) => router.push(`/dashboard/colleges?edit=${slug}`),
    handleOpenCredentialsModal: null,
    handleDeleteClick: null,
    handleImageClick,
    handleReferable
  })

  // Filter out columns as requested
  const columns = allColumns.filter(
    (col) => col.header !== 'Address' && col.header !== 'Actions' && col.id !== 'actions'
  )

  return (
    <div className='w-full'>
      <div className='flex flex-col mb-3 sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-md shadow-sm border'>
        <div className='flex flex-col md:flex-row gap-4 items-start md:items-center flex-1 w-full'>
          <SearchInput
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder='Search referable colleges...'
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
      </div>

      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table
          loading={tableLoading}
          data={colleges}
          columns={columns}
          pagination={pagination}
          onPageChange={(newPage) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', newPage)
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
          }}
          onSearch={handleSearch}
          showSearch={false}
          emptyContent="No referable colleges found."
        />
      </div>

      <ViewCollegeModal
        viewModalOpen={viewModalOpen}
        handleCloseViewModal={() => setViewModalOpen(false)}
        loadingView={loadingView}
        viewCollegeData={viewCollegeData}
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
