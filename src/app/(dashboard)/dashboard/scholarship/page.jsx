'use client'
import { authFetch } from '@/app/utils/authFetch'
import { cn } from '@/app/lib/utils'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import { useToast } from '@/hooks/use-toast'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import Loading from '@/ui/molecules/Loading'
import { Button } from '@/ui/shadcn/button'
import { formatDate } from '@/utils/date.util'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Award,
  Calendar,
  Edit2,
  Eye,
  GripVertical,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  createScholarship,
  deleteScholarship,
  getScholarshipApplications,
  updateScholarship,
  updateScholarshipOrder
} from './actions'
import ScholarshipFormModal from './components/ScholarshipFormModal'
import ScholarshipViewModal from './ScholarshipViewModal'

const StatusBadge = ({ status }) => {
  if (!status) return null
  const isPublished = status.toLowerCase() === 'published'
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0',
        isPublished
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
          : 'bg-amber-50 text-amber-700 border-amber-100'
      )}
    >
      {status}
    </span>
  )
}

const formatAmount = (amount) => {
  if (!amount) return null
  const parsed = parseFloat(amount)
  if (Number.isNaN(parsed)) return amount
  return `Rs. ${parsed.toLocaleString()}`
}

const SortableCard = ({
  scholarship,
  onView,
  onEdit,
  onDelete,
  onApplications
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: scholarship.id })

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const categoryTitle = scholarship.scholarshipCategory?.title
  const deadline = scholarship.applicationDeadline
    ? formatDate(scholarship.applicationDeadline)
    : null
  const amount = formatAmount(scholarship.amount)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white border rounded-xl transition-all duration-200 overflow-hidden',
        isDragging
          ? 'border-[#387cae]/40 shadow-xl ring-2 ring-[#387cae]/20'
          : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
      )}
    >
      <div className='flex items-center gap-4 p-4'>
        <div
          {...attributes}
          {...listeners}
          className='shrink-0 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none transition-colors'
          title='Drag to reorder'
        >
          <GripVertical size={20} />
        </div>

        <div className='w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm'>
          {scholarship.featured_image ? (
            <img
              src={scholarship.featured_image}
              alt={scholarship.name}
              className='w-full h-full object-cover'
            />
          ) : (
            <Award className='w-7 h-7 text-gray-300' />
          )}
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap mb-1'>
            {scholarship.slug ? (
              <Link
                href={`/scholarship/${scholarship.slug}`}
                target='_blank'
                rel='noopener noreferrer'
                className='font-bold text-gray-900 hover:text-[#387cae] hover:underline text-[16px] leading-tight truncate'
              >
                {scholarship.name}
              </Link>
            ) : (
              <h3 className='text-[16px] font-bold text-gray-900 truncate leading-tight'>
                {scholarship.name}
              </h3>
            )}
            {categoryTitle && (
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-purple-50 text-purple-700 border-purple-200 shrink-0'>
                {categoryTitle}
              </span>
            )}
            <StatusBadge status={scholarship.status} />
          </div>

          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5'>
            {deadline && (
              <span className='flex items-center gap-1.5 text-[12px] text-gray-500'>
                <Calendar size={12} className='shrink-0 text-gray-400' />
                Deadline: {deadline}
              </span>
            )}
            {amount && (
              <span className='text-[12px] font-medium text-gray-600'>
                {amount}
              </span>
            )}
          </div>
        </div>

        <div className='flex items-center gap-1 pl-4 border-l border-gray-100'>
          <button
            type='button'
            onClick={() => onView(scholarship)}
            title='View details'
            className='w-9 h-9 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-all'
          >
            <Eye size={18} />
          </button>
          <button
            type='button'
            onClick={() => onApplications(scholarship.id)}
            title='View applications'
            className='w-9 h-9 flex items-center justify-center rounded-lg text-purple-500 hover:bg-purple-50 transition-all'
          >
            <Users size={18} />
          </button>
          <button
            type='button'
            onClick={() => onEdit(scholarship)}
            title='Edit'
            className='w-9 h-9 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 transition-all'
          >
            <Edit2 size={18} />
          </button>
          <button
            type='button'
            onClick={() => onDelete(scholarship.id)}
            title='Delete'
            className='w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-all'
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

const OverlayCard = ({ scholarship }) => (
  <div className='bg-white border-2 border-[#387cae]/40 rounded-xl shadow-2xl rotate-[0.6deg] scale-[1.01]'>
    <div className='flex items-center gap-4 p-4'>
      <GripVertical size={20} className='text-[#387cae]/50 cursor-grabbing shrink-0' />
      <div className='w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0'>
        {scholarship.featured_image ? (
          <img
            src={scholarship.featured_image}
            alt={scholarship.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <Award className='w-7 h-7 text-gray-300' />
        )}
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <h3 className='text-[16px] font-bold text-gray-900 truncate'>
            {scholarship.name}
          </h3>
          <StatusBadge status={scholarship.status} />
        </div>
      </div>
    </div>
  </div>
)

const CardSkeleton = ({ i = 0 }) => (
  <div
    className='bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse'
    style={{ animationDelay: `${i * 60}ms` }}
  >
    <div className='flex items-center gap-4 p-4'>
      <div className='w-5 h-5 bg-gray-200 rounded shrink-0' />
      <div className='w-16 h-16 bg-gray-200 rounded-lg shrink-0' />
      <div className='flex-1 space-y-2.5'>
        <div className='flex items-center gap-2'>
          <div className='h-4 bg-gray-200 rounded-md w-1/3' />
          <div className='h-5 bg-gray-200 rounded-full w-16' />
        </div>
        <div className='h-3 bg-gray-200 rounded w-32' />
      </div>
      <div className='flex gap-2 pl-4 border-l border-gray-100'>
        {[0, 1, 2, 3].map((j) => (
          <div key={j} className='w-9 h-9 bg-gray-200 rounded-lg' />
        ))}
      </div>
    </div>
  </div>
)

export default function ScholarshipManager() {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const author_id = useSelector((state) => state.user.data?.id)
  const searchParams = useSearchParams()
  const router = useRouter()

  const [scholarships, setScholarships] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  const [activeId, setActiveId] = useState(null)
  const statusFilterRef = useRef(statusFilter)
  const activeOnlyRef = useRef(activeOnly)
  const searchDebounceRef = useRef(null)

  const activeScholarship = scholarships.find((s) => s.id === activeId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    statusFilterRef.current = statusFilter
    activeOnlyRef.current = activeOnly
  }, [statusFilter, activeOnly])

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

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

  const normalizeScholarship = (s) => ({
    ...s,
    categoryId: s.scholarshipCategory?.id,
    applicationDeadline: s.applicationDeadline
      ? new Date(s.applicationDeadline)
      : null
  })

  const loadScholarships = async (
    query = searchQuery,
    status = statusFilter,
    active = activeOnly,
    silent = false
  ) => {
    try {
      if (!silent) setTableLoading(true)
      let all = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        let url = `${process.env.baseUrl}/scholarship?page=${page}&limit=100`
        if (query) url += `&q=${encodeURIComponent(query)}`
        if (status && status !== 'all') url += `&status=${status}`
        if (active) url += `&activeOnly=true`

        const res = await authFetch(url)
        if (!res.ok) throw new Error('Failed to load scholarships')
        const response = await res.json()
        const items = response.scholarships || response.items || []
        all = [...all, ...items]
        hasMore = page < (response.pagination?.totalPages || 1)
        page++
      }

      const uniqueItems = Array.from(
        new Map(all.map((s) => [s.id, normalizeScholarship(s)])).values()
      )

      uniqueItems.sort((a, b) => {
        const oA = a.order_no_for_website ?? Infinity
        const oB = b.order_no_for_website ?? Infinity
        return oA !== oB ? oA - oB : b.id - a.id
      })

      setScholarships(uniqueItems)
    } catch (error) {
      console.error('Failed to fetch scholarships:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch scholarships',
        variant: 'destructive'
      })
    } finally {
      if (!silent) setTableLoading(false)
    }
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      loadScholarships(value, statusFilterRef.current, activeOnlyRef.current)
    }, 350)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    loadScholarships(searchQuery, status, activeOnly, true)
  }

  const handleActiveToggle = (active) => {
    setActiveOnly(active)
    loadScholarships(searchQuery, statusFilter, active, true)
  }

  const handleDragStart = (event) => setActiveId(event.active.id)
  const handleDragCancel = () => setActiveId(null)

  const handleDragEnd = async (event) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = scholarships.findIndex((s) => s.id === active.id)
    const newIdx = scholarships.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(scholarships, oldIdx, newIdx)
    setScholarships(reordered)

    const payload = reordered.map((s, i) => ({ id: s.id, order_no: i + 1 }))
    await saveOrder(payload)
  }

  const saveOrder = async (payload) => {
    try {
      setSaving(true)
      await updateScholarshipOrder(payload)
      setScholarships((prev) =>
        prev.map((s) => {
          const updated = payload.find((p) => p.id === s.id)
          return updated
            ? { ...s, order_no_for_website: updated.order_no }
            : s
        })
      )
      toast({ title: 'Success', description: 'Order saved' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save order',
        variant: 'destructive'
      })
      loadScholarships(searchQuery, statusFilter, activeOnly, true)
    } finally {
      setSaving(false)
    }
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
      loadScholarships(searchQuery, statusFilter, activeOnly, true)
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
      loadScholarships(searchQuery, statusFilter, activeOnly, true)
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
                  `${scholarships.length} total`
                )}
                {saving && (
                  <span className='inline-flex items-center gap-1 text-[#387cae]'>
                    · <Loader2 size={10} className='animate-spin' /> Saving
                    order…
                  </span>
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

      {tableLoading ? (
        <div className='flex flex-col gap-3'>
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} i={i} />
          ))}
        </div>
      ) : scholarships.length === 0 ? (
        <div className='bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center'>
          <Award className='w-10 h-10 text-gray-200 mx-auto mb-3' />
          <p className='text-gray-500 font-medium text-sm'>
            {searchQuery
              ? 'No scholarships match your search.'
              : 'No scholarships yet.'}
          </p>
          {!searchQuery && (
            <Button
              onClick={handleAdd}
              className='mt-4 bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 text-sm'
            >
              <Plus size={15} /> Add First Scholarship
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className='text-[11px] text-gray-400 px-1 flex items-center gap-1.5 mb-2'>
            <GripVertical size={11} className='text-gray-300' />
            Drag the grip handle to reorder · Changes save automatically
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={scholarships.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='flex flex-col gap-3'>
                {scholarships.map((scholarship) => (
                  <SortableCard
                    key={scholarship.id}
                    scholarship={scholarship}
                    onView={(s) => {
                      setViewData(s)
                      setIsViewOpen(true)
                    }}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onApplications={handleViewApplications}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay
              dropAnimation={{
                duration: 180,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'
              }}
            >
              {activeScholarship ? (
                <OverlayCard scholarship={activeScholarship} />
              ) : null}
            </DragOverlay>
          </DndContext>
        </>
      )}

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
