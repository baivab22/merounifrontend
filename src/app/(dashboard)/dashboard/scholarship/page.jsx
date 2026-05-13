'use client'
import { authFetch } from '@/app/utils/authFetch'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import { useToast } from '@/hooks/use-toast'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import { Button } from '@/ui/shadcn/button'
import Table from '@/ui/shadcn/DataTable'
import { formatDate } from '@/utils/date.util'
import {
  Award,
  Edit2,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  createScholarship,
  deleteScholarship,
  getAllScholarships,
  getScholarshipApplications,
  updateScholarship
} from './actions'
import ScholarshipFormModal from './components/ScholarshipFormModal'
import ScholarshipViewModal from './ScholarshipViewModal'
import Loading from '@/ui/molecules/Loading'

export default function ScholarshipManager() {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const author_id = useSelector((state) => state.user.data?.id)
  const searchParams = useSearchParams()
  const router = useRouter()

  const [scholarships, setScholarships] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewData, setViewData] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false)
  const [applicationsData, setApplicationsData] = useState([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeOnly, setActiveOnly] = useState(true)
  const statusFilterRef = useRef(statusFilter)
  const activeOnlyRef = useRef(activeOnly)
  const searchDebounceRef = useRef(null)

  useEffect(() => {
    statusFilterRef.current = statusFilter
    activeOnlyRef.current = activeOnly
  }, [statusFilter, activeOnly])

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  })

  useEffect(() => {
    setHeading('Scholarship Management')
    loadScholarships()
    return () => setHeading(null)
  }, [setHeading])

  useEffect(() => {
    const addParam = searchParams.get('add')
    if (addParam === 'true') {
      handleAdd()
      router.replace('/dashboard/scholarship', { scroll: false })
    }
  }, [searchParams, router])

  const loadScholarships = async (
    page = 1,
    query = searchQuery,
    status = statusFilter,
    active = activeOnly
  ) => {
    setTableLoading(true)
    try {
      let url = `${process.env.baseUrl}/scholarship?page=${page}`
      if (query) url += `&q=${encodeURIComponent(query)}`
      if (status && status !== 'all') url += `&status=${status}`
      if (active) url += `&activeOnly=true`

      const res = await authFetch(url)
      const response = await res.json()

      const items = response.scholarships || response.items || []
      setScholarships(
        items.map((s) => ({
          ...s,
          categoryId: s.scholarshipCategory?.id,
          applicationDeadline: s.applicationDeadline
            ? new Date(s.applicationDeadline)
            : null
        }))
      )

      setPagination({
        currentPage: response.pagination?.currentPage || 1,
        totalPages: response.pagination?.totalPages || 1,
        totalCount: response.pagination?.totalCount || 0
      })
    } catch (error) {
      console.error('Failed to fetch scholarships:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch scholarships',
        variant: 'destructive'
      })
    } finally {
      setTableLoading(false)
    }
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      loadScholarships(1, value, statusFilterRef.current, activeOnlyRef.current)
    }, 350)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    loadScholarships(1, searchQuery, status, activeOnly)
  }

  const handleActiveToggle = (active) => {
    setActiveOnly(active)
    loadScholarships(1, searchQuery, statusFilter, active)
  }

  const handleAdd = () => {
    setEditingId(null)
    setIsOpen(true)
  }

  const handleEdit = (scholarship) => {
    setEditingId(scholarship.id)
    setIsOpen(true)
  }

  const handleModalClose = () => {
    setIsOpen(false)
    setEditingId(null)
  }

  const onSubmit = async (payload) => {
    try {
      setTableLoading(true)
      if (editingId) {
        await updateScholarship(editingId, payload)
        toast({
          title: 'Success',
          description: 'Scholarship updated successfully'
        })
      } else {
        await createScholarship(payload)
        toast({
          title: 'Success',
          description: 'Scholarship created successfully'
        })
      }
      handleModalClose()
      loadScholarships(
        pagination.currentPage,
        searchQuery,
        statusFilter,
        activeOnly
      )
    } catch (error) {
      console.error('Error saving scholarship:', error)
      toast({
        title: 'Error',
        description: `Failed to ${editingId ? 'update' : 'create'} scholarship`,
        variant: 'destructive'
      })
    } finally {
      setTableLoading(false)
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setIsDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteScholarship(deleteId)
      toast({
        title: 'Success',
        description: 'Scholarship deleted successfully'
      })
      loadScholarships(
        pagination.currentPage,
        searchQuery,
        statusFilter,
        activeOnly
      )
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete scholarship',
        variant: 'destructive'
      })
    } finally {
      setIsDialogOpen(false)
      setDeleteId(null)
    }
  }

  const handleViewApplications = async (scholarshipId) => {
    setIsApplicationsOpen(true)
    setApplicationsLoading(true)
    setApplicationsData([])
    try {
      const data = await getScholarshipApplications(scholarshipId)
      setApplicationsData(data.applications || [])
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive'
      })
    } finally {
      setApplicationsLoading(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Scholarship',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className='flex items-start gap-3 py-1'>
            {row.original.featured_image ? (
              <img
                src={row.original.featured_image}
                alt=''
                className='w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0 bg-gray-50'
              />
            ) : (
              <div
                className='w-10 h-10 rounded-lg border border-dashed border-gray-200 shrink-0 bg-gray-50/80'
                aria-hidden
              />
            )}
            <div className='flex flex-col gap-1.5 min-w-0'>
              <div className='font-semibold text-gray-900 leading-none'>
                {row.original.name}
              </div>
              {row.original.scholarshipCategory?.title && (
                <span className='w-fit px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold uppercase tracking-tight border border-purple-100/50'>
                  {row.original.scholarshipCategory.title}
                </span>
              )}
            </div>
          </div>
        )
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => {
          const isPublished = row.original.status === 'published'
          return (
            <span
              className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}
            >
              {row.original.status || 'published'}
            </span>
          )
        }
      },
      {
        header: 'Deadline',
        accessorKey: 'applicationDeadline',
        cell: ({ row }) =>
          row.original.applicationDeadline
            ? formatDate(row.original.applicationDeadline)
            : 'N/A'
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className='flex gap-1'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => {
                setViewData(row.original)
                setIsViewOpen(true)
              }}
              className='hover:bg-blue-50 text-blue-600'
            >
              <Eye className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => handleViewApplications(row.original.id)}
              className='hover:bg-purple-50 text-purple-600'
            >
              <Users className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => handleEdit(row.original)}
              className='hover:bg-amber-50 text-amber-600'
            >
              <Edit2 className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => handleDeleteClick(row.original.id)}
              className='hover:bg-red-50 text-red-600'
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        )
      }
    ],
    []
  )

  return (
    <div className='w-full'>
      <div className='sticky mb-3 top-0 z-30 bg-[#F7F8FA] py-3'>
        <div className='bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-md bg-[#387cae]/10 flex items-center justify-center shrink-0'>
              <Award size={17} className='text-[#387cae]' strokeWidth={2} />
            </div>
            <div>
              <p className='text-sm font-bold text-gray-800'>Scholarships</p>
              <p className='text-xs text-gray-400 flex items-center gap-1.5'>
                {tableLoading ? (
                  <span className='inline-flex items-center gap-1'>
                    <Loader2 size={10} className='animate-spin' />
                    Loading…
                  </span>
                ) : (
                  `${pagination.totalCount} total`
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
                placeholder='Search scholarships…'
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

            <div className='flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 h-9 rounded-md shrink-0'>
              <input
                type='checkbox'
                id='active-only'
                checked={activeOnly}
                onChange={(e) => handleActiveToggle(e.target.checked)}
                className='w-4 h-4 rounded border-gray-300 text-[#387cae] focus:ring-[#387cae]'
              />
              <label
                htmlFor='active-only'
                className='text-xs font-semibold text-gray-700 cursor-pointer select-none'
              >
                Hide Expired
              </label>
            </div>

            <Button
              onClick={handleAdd}
              className='bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 h-9 px-4 rounded-md text-sm font-semibold shrink-0'
            >
              <Plus className='w-4 h-4' />
              Add Scholarship
            </Button>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-md shadow-sm border overflow-hidden'>
        <Table
          loading={tableLoading}
          data={scholarships}
          columns={columns}
          pagination={pagination}
          onPageChange={(page) =>
            loadScholarships(page, searchQuery, statusFilter, activeOnly)
          }
          showSearch={false}
        />
      </div>

      <ScholarshipFormModal
        isOpen={isOpen}
        onClose={handleModalClose}
        editingId={editingId}
        initialData={scholarships.find((s) => s.id === editingId)}
        onSave={onSubmit}
        submitting={tableLoading}
        author_id={author_id}
      />

      <ScholarshipViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        scholarship={viewData}
      />

      {/* Applications Modal */}
      <ConfirmationDialog
        open={isApplicationsOpen}
        onClose={() => setIsApplicationsOpen(false)}
        hideCancel={true}
        title='Scholarship Applications'
        message={
          <div className='max-h-[60vh] overflow-y-auto mt-4'>
            {applicationsLoading ? (
              <Loading fullPage={false} />
            ) : applicationsData.length === 0 ? (
              <p className='text-center py-8 text-gray-400'>
                No applications found
              </p>
            ) : (
              <div className='space-y-4'>
                {applicationsData.map((app) => (
                  <div
                    key={app.id}
                    className='bg-gray-50 p-4 rounded-lg border text-left'
                  >
                    <div className='flex justify-between items-start'>
                      <div>
                        <p className='font-bold text-gray-900'>
                          {app.student?.firstName} {app.student?.lastName}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {app.student?.email}
                        </p>
                      </div>
                      <span className='text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full'>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        }
      />

      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title='Confirm Deletion'
        message='Are you sure you want to delete this scholarship? This action cannot be undone.'
      />
    </div>
  )
}
