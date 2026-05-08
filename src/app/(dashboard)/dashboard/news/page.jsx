'use client'

import { authFetch } from '@/app/utils/authFetch'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import { useToast } from '@/hooks/use-toast'
import useAdminPermission from '@/hooks/useAdminPermission'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import ImageLightbox from '@/ui/molecules/image-lightbox'
import Table from '@/ui/shadcn/DataTable'
import { Button } from '@/ui/shadcn/button'
import { Edit2, Eye, Loader2, Newspaper, Plus, Search, Trash2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { fetchCategories } from '../category/action.js'
import {
  createNews,
  deleteNews,
  fetchNews,
  getNewsById,
  getNewsBySlug,
  updateNews
} from './action'
import ViewNewsModal from './components/ViewNewsModal'
import NewsForm from './components/NewsForm.jsx'
import { formatDateTime } from '@/utils/date.util.js'

export default function NewsPage() {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const author_id = useSelector((state) => state.user.data?.id)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [initialData, setInitialData] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page')) || 1,
    totalPages: 1,
    total: 0
  })
  const [deleteId, setDeleteId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchDebounceRef = useRef(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const statusFilterRef = useRef(statusFilter)

  useEffect(() => {
    statusFilterRef.current = statusFilter
  }, [statusFilter])

  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewNewsData, setViewNewsData] = useState(null)
  const [loadingView, setLoadingView] = useState(false)
  const [colleges, setColleges] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingColleges, setLoadingColleges] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)

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
      altText: altText || 'News Image'
    })
  }

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  const columns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
        cell: ({ row }) => {
          const { title, status, visibility, featured_image, slug } = row.original
          const statusLabel = status || 'draft'
          const visibilityLabel = visibility || 'private'

          const statusClasses =
            statusLabel === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'

          const visibilityClasses =
            visibilityLabel === 'public'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'

          return (
            <div className='flex items-center gap-3 max-w-xs overflow-hidden'>
              {featured_image ? (
                <div
                  className='w-14 h-14 rounded shrink-0 overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity'
                  onClick={() => handleImageClick(featured_image, title)}
                >
                  <img
                    src={featured_image}
                    alt='News'
                    className='w-full h-full object-cover'
                  />
                </div>
              ) : (
                <div className='w-14 h-14 rounded shrink-0 bg-gray-100 border border-dashed flex items-center justify-center text-xs text-gray-400'>
                  No img
                </div>
              )}
              <div className='flex-1 overflow-hidden'>
                <div
                  onClick={() => handleView(row.original.slug || row.original.slugs)}
                  className='truncate font-semibold text-slate-900 hover:text-[#387cae] hover:underline cursor-pointer block'
                >
                  {title}
                </div>
                <div className='flex flex-wrap gap-2 mt-1'>
                  {status && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClasses}`}
                    >
                      {statusLabel}
                    </span>
                  )}
                  {visibility && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${visibilityClasses}`}
                    >
                      {visibilityLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        }
      },
      {
        header: 'Category',
        accessorKey: 'newsCategory',
        cell: ({ row }) => {
          const category = row.original.newsCategory
          return (
            <span className="text-sm text-slate-600">
              {category?.title || '—'}
            </span>
          )
        }
      },
      {
        header: 'Created At',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => {
          const date = new Date(getValue())
          return (
            <div className='whitespace-nowrap text-sm text-slate-600'>{formatDateTime(date)}</div>
          )
        }
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className='flex gap-1'>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleView(row.original.slug)}
              className='hover:bg-purple-50 text-purple-600'
              title='View Details'
            >
              <Eye className='w-4 h-4' />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(row.original)}
              className='hover:bg-blue-50 text-blue-600'
              title='Edit'
            >
              <Edit2 className='w-4 h-4' />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.id)}
              className='hover:bg-red-50 text-red-600'
              title='Delete'
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        )
      }
    ],
    []
  )

  useEffect(() => {
    setHeading('News Management')
    const page = parseInt(searchParams.get('page')) || 1
    loadData(page)
    return () => setHeading(null)
  }, [setHeading, searchParams])

  // Check for 'add' query parameter
  useEffect(() => {
    const addParam = searchParams.get('add')
    if (addParam === 'true') {
      setIsOpen(true)
      setEditing(false)
      setInitialData(null)
      fetchAllColleges()
      fetchAllCategories()
      router.replace('/dashboard/news')
    }
  }, [searchParams, router])

  const { requireAdmin } = useAdminPermission()

  const fetchAllColleges = async (force = false) => {
    if (colleges.length > 0 && !force) return
    try {
      setLoadingColleges(true)
      const response = await authFetch(
        `${process.env.baseUrl}/college?limit=1000`
      )
      if (response.ok) {
        const data = await response.json()
        setColleges(data.items || [])
      }
    } catch (err) {
      console.error('Error loading colleges:', err)
    } finally {
      setLoadingColleges(false)
    }
  }

  const fetchAllCategories = async (force = false) => {
    if (categories.length > 0 && !force) return
    try {
      setLoadingCategories(true)
      const response = await fetchCategories(1, 1000, 'NEWS')
      setCategories(response.items || [])
    } catch (err) {
      console.error('Error loading categories:', err)
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadData = async (page = 1, search = '', status = statusFilterRef.current) => {
    try {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', page)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })

      setLoading(true)
      const response = await fetchNews(page, search, status)

      setNews(response.items || [])
      setPagination({
        currentPage: response.pagination?.currentPage || 1,
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.totalCount || 0
      })
    } catch (error) {
      console.error('Error loading news:', error)
      toast({
        title: 'Error',
        description: 'Failed to load news',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadData(1, query, statusFilterRef.current)
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (value === '') {
      loadData(1, '', statusFilterRef.current)
      return
    }
    searchDebounceRef.current = setTimeout(() => {
      loadData(1, value, statusFilterRef.current)
    }, 350)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    loadData(1, searchQuery, status)
  }

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true)

      const newsData = {
        title: data.title,
        description: data.description,
        featured_image: data.featured_image,
        pdf_file: data.pdf_file || null,
        status: data.status,
        visibility: data.visibility || 'private',
        author: author_id,
        college_id: data.college_id || null,
        category_id: data.category_id || null,
        meta_description: data.meta_description || null
      }

      if (editing && editingId) {
        await updateNews(editingId, newsData)
        toast({
          title: 'Success',
          description: 'News updated successfully'
        })
      } else {
        await createNews(newsData)
        toast({
          title: 'Success',
          description: 'News created successfully'
        })
      }

      setIsOpen(false)
      setEditing(false)
      setEditingId(null)
      setInitialData(null)
      loadData(pagination.currentPage, searchQuery, statusFilter)
    } catch (error) {
      console.error('Error saving news:', error)
      toast({
        title: 'Error',
        description: `Failed to ${editing ? 'update' : 'create'} news: ${error.message || ''}`,
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (newsItem) => {
    setInitialData(newsItem)
    setEditingId(newsItem.id)
    setEditing(true)
    setIsOpen(true)
    fetchAllColleges()
    fetchAllCategories()
  }

  const handleView = async (slug) => {
    try {
      setLoadingView(true)
      setViewModalOpen(true)
      const newsData = await getNewsBySlug(slug)
      setViewNewsData(newsData)
    } catch (error) {
      console.error('Error fetching news details:', error)
      toast({
        title: 'Error',
        description: 'Failed to load news details',
        variant: 'destructive'
      })
      setViewModalOpen(false)
    } finally {
      setLoadingView(false)
    }
  }

  const handleCloseViewModal = () => {
    setViewModalOpen(false)
    setViewNewsData(null)
  }

  const handleDeleteClick = (id) => {
    requireAdmin(() => {
      setDeleteId(id)
      setIsDialogOpen(true)
    }, 'You do not have permission to delete news.')
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setDeleteId(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return

    try {
      await deleteNews(deleteId)
      setNews((prev) => prev.filter((n) => n.id !== deleteId))
      toast({
        title: 'Success',
        description: 'News deleted successfully'
      })
      loadData(pagination.currentPage, searchQuery, statusFilter)
    } catch (error) {
      console.error('Error deleting news:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete news',
        variant: 'destructive'
      })
    } finally {
      handleDialogClose()
    }
  }

  const handleModalClose = () => {
    setIsOpen(false)
    setEditing(false)
    setEditingId(null)
    setInitialData(null)
  }

  return (
    <div className='w-full'>

      <div className='sticky mb-3 top-0 z-30 bg-[#F7F8FA] py-3'>
        <div className='bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-md bg-[#387cae]/10 flex items-center justify-center shrink-0'>
              <Newspaper size={17} className='text-[#387cae]' strokeWidth={2} />
            </div>
            <div>
              <p className='text-sm font-bold text-gray-800'>News</p>
              <p className='text-xs text-gray-400 flex items-center gap-1.5'>
                {loading ? (
                  <span className='inline-flex items-center gap-1'>
                    <Loader2 size={10} className='animate-spin' />
                    Loading…
                  </span>
                ) : (
                  `${pagination.total} total`
                )}
              </p>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto'>
            <div className='relative shrink-0 flex-1 sm:flex-initial sm:w-64'>
              <Search
                size={13}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
              />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder='Search news…'
                className='w-full pl-8 pr-3 h-9 rounded-md border border-gray-200 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40 transition'
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className='h-9 shrink-0 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40 transition sm:w-[140px]'
              aria-label='Filter by status'
            >
              <option value='all'>All status</option>
              <option value='published'>Published</option>
              <option value='draft'>Draft</option>
            </select>
            <Button
              onClick={() => {
                setIsOpen(true)
                setEditing(false)
                setInitialData(null)
                fetchAllColleges()
                fetchAllCategories()
              }}
              className='bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 h-9 px-4 rounded-md text-sm font-semibold shrink-0'
            >
              <Plus className='w-4 h-4' />
              Add News
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        {/* Table Section */}
        <Table
          data={news}
          columns={columns}
          pagination={pagination}
          onPageChange={(newPage) => loadData(newPage, searchQuery, statusFilter)}
          onSearch={handleSearch}
          showSearch={false}
          loading={loading}
          emptyContent={searchQuery ? "No news found matching your search." : "No news available."}
        />
      </div>

      {/* News Form Modal */}
      <NewsForm
        isOpen={isOpen}
        onClose={handleModalClose}
        editing={editing}
        initialData={initialData}
        onSubmit={handleSubmit}
        submitting={submitting}
        colleges={colleges}
        categories={categories}
        loadingColleges={loadingColleges}
        loadingCategories={loadingCategories}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDeleteConfirm}
        title='Delete News'
        message='Are you sure you want to delete this news item?'
      />

      {/* View News Details Modal */}
      <ViewNewsModal
        isOpen={viewModalOpen}
        onClose={handleCloseViewModal}
        news={viewNewsData}
        loading={loadingView}
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
