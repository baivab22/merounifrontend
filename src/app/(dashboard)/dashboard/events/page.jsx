'use client'
import { authFetch } from '@/app/utils/authFetch'
import { Button } from '@/ui/shadcn/button'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import {
  Plus,
  GripVertical,
  Layers,
  Eye,
  Edit2,
  Trash2,
  Search,
  MapPin,
  Calendar,
  Loader2,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useToast } from '@/hooks/use-toast'
import { fetchCategories } from '../category/action'
import { formatDate } from '@/utils/date.util'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import EventFormModal from './components/EventFormModal'
import ImageLightbox from '@/ui/molecules/image-lightbox'
import { cn } from '@/app/lib/utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogClose
} from '@/ui/shadcn/dialog'

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (!status) return null
  const isPublished = status.toLowerCase() === 'published'
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0',
      isPublished
        ? 'bg-blue-50 text-blue-600 border-blue-100'
        : 'bg-orange-50 text-orange-600 border-orange-100'
    )}>
      {status}
    </span>
  )
}

// ─── Helper: parse event_host JSON safely ─────────────────────────────────────
const parseEventHost = (raw) => {
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  try { return JSON.parse(raw) } catch { return {} }
}

// ─── Sortable Event Card ──────────────────────────────────────────────────────
const SortableCard = ({ event, onView, onEdit, onDelete, onImageClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: event.id })

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const host = parseEventHost(event.event_host)
  const startDate = host.start_date ? formatDate(host.start_date) : null
  const endDate = host.end_date ? formatDate(host.end_date) : null
  const location = host.location || null
  const categoryTitle = event.category?.title || null

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
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className='shrink-0 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none transition-colors'
          title='Drag to reorder'
        >
          <GripVertical size={20} />
        </div>

        {/* Image */}
        <div
          role='button'
          tabIndex={0}
          onClick={() => event.image && onImageClick(event.image, event.title)}
          onKeyDown={(e) => e.key === 'Enter' && event.image && onImageClick(event.image, event.title)}
          className={cn(
            'w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm',
            event.image && 'cursor-pointer hover:opacity-90 transition-opacity'
          )}
        >
          {event.image
            ? <img src={event.image} alt={event.title} className='w-full h-full object-cover' />
            : <Layers className='w-7 h-7 text-gray-300' />}
        </div>

        {/* Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap mb-1'>
            {event.slug ? (
              <Link
                href={`/events/${event.slug}`}
                target='_blank'
                rel='noopener noreferrer'
                className='font-bold text-gray-900 hover:text-[#387cae] hover:underline text-[16px] leading-tight truncate'
              >
                {event.title}
              </Link>
            ) : (
              <h3 className='text-[16px] font-bold text-gray-900 truncate leading-tight'>
                {event.title}
              </h3>
            )}
            {categoryTitle && (
              <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0'>
                {categoryTitle}
              </span>
            )}
            <StatusBadge status={event.status} />
          </div>

          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5'>
            {startDate && (
              <span className='flex items-center gap-1.5 text-[12px] text-gray-500'>
                <Calendar size={12} className='shrink-0 text-gray-400' />
                {startDate}{endDate ? ` — ${endDate}` : ''}
              </span>
            )}
            {host.time && (
              <span className='flex items-center gap-1.5 text-[12px] text-gray-500'>
                <Clock size={12} className='shrink-0 text-gray-400' />
                {host.time}
              </span>
            )}
            {location && (
              <span className='flex items-center gap-1.5 text-[12px] text-gray-500'>
                <MapPin size={12} className='shrink-0 text-gray-400' />
                {location}
              </span>
            )}
            {host.host && (
              <span className='text-[12px] text-gray-400 border-l border-gray-200 pl-4 ml-0'>
                Host: <span className='font-medium text-gray-600'>{host.host}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-1 pl-4 border-l border-gray-100'>
          <button
            onClick={() => onView(event.slug)}
            title='View details'
            className='w-9 h-9 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-all'
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(event)}
            title='Edit'
            className='w-9 h-9 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 transition-all'
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(event.id)}
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

// ─── Drag Overlay Ghost Card ──────────────────────────────────────────────────
const OverlayCard = ({ event }) => (
  <div className='bg-white border-2 border-[#387cae]/40 rounded-xl shadow-2xl rotate-[0.6deg] scale-[1.01]'>
    <div className='flex items-center gap-4 p-4'>
      <GripVertical size={20} className='text-[#387cae]/50 cursor-grabbing shrink-0' />
      <div className='w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0'>
        {event.image
          ? <img src={event.image} alt={event.title} className='w-full h-full object-cover' />
          : <Layers className='w-7 h-7 text-gray-300' />}
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <h3 className='text-[16px] font-bold text-gray-900 truncate'>{event.title}</h3>
          <StatusBadge status={event.status} />
        </div>
      </div>
    </div>
  </div>
)

// ─── Skeleton Card ────────────────────────────────────────────────────────────
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
          <div className='h-5 bg-gray-200 rounded-full w-16' />
        </div>
        <div className='flex gap-4'>
          <div className='h-3 bg-gray-200 rounded w-24' />
          <div className='h-3 bg-gray-200 rounded w-32' />
        </div>
      </div>
      <div className='flex gap-2 pl-4 border-l border-gray-100'>
        {[0, 1, 2].map(j => <div key={j} className='w-9 h-9 bg-gray-200 rounded-lg' />)}
      </div>
    </div>
  </div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EventManager() {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const author_id = useSelector((state) => state.user.data?.id)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [events, setEvents] = useState([])
  const [editing, setEditing] = useState(false)
  const [editingEventData, setEditingEventData] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [deleteId, setDeleteId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEventId, setEditingEventId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewEventData, setViewEventData] = useState(null)
  const [loadingView, setLoadingView] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const activeEvent = events.find((e) => e.id === activeId)
  const [lightbox, setLightbox] = useState({ isOpen: false, imageUrl: '', altText: '' })

  const handleImageClick = (imageUrl, altText) => {
    setLightbox({ isOpen: true, imageUrl, altText: altText || 'Event Image' })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesList = await fetchCategories(1, 1000, 'EVENT')
        if (categoriesList && categoriesList.items) {
          setCategories(categoriesList.items)
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    setHeading('Events Management')
    loadEvents(searchQuery, statusFilter)
    return () => setHeading(null)
  }, [setHeading])

  useEffect(() => {
    const addParam = searchParams.get('add')
    if (addParam === 'true') {
      handleAddClick()
      router.replace(pathname, { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    return () => { if (searchTimeout) clearTimeout(searchTimeout) }
  }, [searchTimeout])

  const loadEvents = async (query = '', status = 'All', silent = false) => {
    try {
      if (!silent) setTableLoading(true)
      let all = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        let url = `${process.env.baseUrl}/event?page=${page}&limit=100`
        if (query) url += `&q=${encodeURIComponent(query)}`
        if (status && status !== 'All') url += `&status=${status.toLowerCase()}`
        const res = await authFetch(url)
        if (!res.ok) throw new Error('Failed to load events')
        const data = await res.json()
        all = [...all, ...(data.items || [])]
        hasMore = page < (data.pagination?.totalPages || 1)
        page++
      }

      const uniqueItems = Array.from(
        new Map(all.map((e) => [e.id, e])).values()
      )

      uniqueItems.sort((a, b) => {
        const oA = a.order_no_for_website ?? Infinity
        const oB = b.order_no_for_website ?? Infinity
        return oA !== oB ? oA - oB : b.id - a.id
      })

      setEvents(uniqueItems)
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load events',
        variant: 'destructive'
      })
    } finally {
      if (!silent) setTableLoading(false)
    }
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const id = setTimeout(() => loadEvents(value, statusFilter, true), 350)
    setSearchTimeout(id)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    loadEvents(searchQuery, status, true)
  }

  const handleDragStart = (event) => setActiveId(event.active.id)
  const handleDragCancel = () => setActiveId(null)

  const handleDragEnd = async (event) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = events.findIndex((e) => e.id === active.id)
    const newIdx = events.findIndex((e) => e.id === over.id)
    const reordered = arrayMove(events, oldIdx, newIdx)
    setEvents(reordered)

    const payload = reordered.map((e, i) => ({ id: e.id, order_no: i + 1 }))
    await saveOrder(payload)
  }

  const saveOrder = async (payload) => {
    try {
      setSaving(true)
      const res = await authFetch(`${process.env.baseUrl}/event/update-order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: payload })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save order')
      }
      setEvents((prev) =>
        prev.map((e) => {
          const updated = payload.find((p) => p.id === e.id)
          return updated ? { ...e, order_no_for_website: updated.order_no } : e
        })
      )
      toast({ title: 'Success', description: 'Order saved' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save order',
        variant: 'destructive'
      })
      loadEvents(searchQuery, statusFilter, true)
    } finally {
      setSaving(false)
    }
  }

  const handleCloseModal = () => {
    setIsOpen(false)
    setEditing(false)
    setEditingEventData(null)
    setEditingEventId(null)
  }

  const handleAddClick = () => {
    setEditing(false)
    setEditingEventData(null)
    setEditingEventId(null)
    setIsOpen(true)
  }

  const onSubmit = async (formData) => {
    setLoading(true)
    try {
      if (editing) {
        formData.id = editingEventId
      }
      formData.author_id = author_id

      const response = await authFetch(`${process.env.baseUrl}/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const responseData = await response.json()
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to process event')
      }

      toast({
        title: 'Success',
        description: editing ? 'Event updated successfully' : 'Event created successfully'
      })
      handleCloseModal()
      loadEvents(searchQuery, statusFilter, true)
    } catch (err) {
      toast({
        title: 'Error',
        description: `Failed to ${editing ? 'update' : 'create'} event: ${err.message || 'Network error'}`,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (data) => {
    try {
      setLoading(true)
      const response = await authFetch(`${process.env.baseUrl}/event/${data.slug}`)
      if (!response.ok) throw new Error('Failed to fetch event details')
      const result = await response.json()
      const eventData = result.item

      setEditingEventData(eventData)
      setEditingEventId(eventData.id)
      setEditing(true)
      setIsOpen(true)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch event data for editing',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setIsDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      const response = await authFetch(
        `${process.env.baseUrl}/event?event_id=${deleteId}`,
        { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
      )
      const res = await response.json()
      toast({ title: 'Event Deleted', description: res.message })
      loadEvents(searchQuery, statusFilter, true)
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      })
    } finally {
      setIsDialogOpen(false)
      setDeleteId(null)
    }
  }

  const handleView = async (slug) => {
    try {
      setLoadingView(true)
      setViewModalOpen(true)
      const response = await authFetch(`${process.env.baseUrl}/event/${slug}`)
      if (!response.ok) throw new Error('Failed to fetch event details')
      const data = await response.json()
      setViewEventData(data.item)
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load event details',
        variant: 'destructive'
      })
      setViewModalOpen(false)
    } finally {
      setLoadingView(false)
    }
  }

  return (
    <>
      <div className='w-full'>

        {/* ── Sticky Header ──────────────────────────────────────────────────── */}
        <div className='sticky mb-3 top-0 z-30 bg-[#F7F8FA] py-3'>
          <div className='bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-md bg-[#387cae]/10 flex items-center justify-center shrink-0'>
                <Layers size={17} className='text-[#387cae]' />
              </div>
              <div>
                <p className='text-sm font-bold text-gray-800'>Events</p>
                <p className='text-xs text-gray-400 flex items-center gap-1.5'>
                  {tableLoading
                    ? <span className='inline-flex items-center gap-1'><Loader2 size={10} className='animate-spin' /> Loading…</span>
                    : `${events.length} total`
                  }
                  {saving && (
                    <span className='inline-flex items-center gap-1 text-[#387cae]'>
                      · <Loader2 size={10} className='animate-spin' /> Saving order…
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 w-full sm:w-auto overflow-x-auto sm:overflow-visible pb-1 sm:pb-0'>
              <div className='relative shrink-0 sm:w-60'>
                <Search size={13} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder='Search events…'
                  className='w-full pl-8 pr-3 h-9 rounded-md border border-gray-200 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40 transition'
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className='h-9 rounded-md border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 transition-all font-medium min-w-[120px]'
              >
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>

              <Button
                onClick={handleAddClick}
                className='bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 h-9 px-4 rounded-md text-sm font-semibold shrink-0'
              >
                <Plus size={15} />
                Add Event
              </Button>
            </div>
          </div>
        </div>

        {/* ── Card List ─────────────────────────────────────────────────────── */}
        {tableLoading ? (
          <div className='flex flex-col gap-3'>
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} i={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className='bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center'>
            <Layers className='w-10 h-10 text-gray-200 mx-auto mb-3' />
            <p className='text-gray-500 font-medium text-sm'>
              {searchQuery ? 'No events match your search.' : 'No events yet.'}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleAddClick}
                className='mt-4 bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 text-sm'
              >
                <Plus size={15} /> Add First Event
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
                items={events.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className='flex flex-col gap-3'>
                  {events.map((event) => (
                    <SortableCard
                      key={event.id}
                      event={event}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                      onImageClick={handleImageClick}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                {activeEvent ? <OverlayCard event={activeEvent} /> : null}
              </DragOverlay>
            </DndContext>
          </>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <EventFormModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        isEditing={editing}
        initialData={editingEventData}
        categories={categories}
        onSave={onSubmit}
        submitting={loading}
      />

      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setDeleteId(null) }}
        onConfirm={handleDeleteConfirm}
        title='Confirm Deletion'
        message='Are you sure you want to delete this event? This action cannot be undone.'
      />

      {/* View Event Modal */}
      <Dialog
        isOpen={viewModalOpen}
        onClose={() => { setViewModalOpen(false); setViewEventData(null) }}
        className='max-w-4xl'
      >
        <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col p-0'>
          <DialogHeader className='px-6 py-4 border-b'>
            <DialogTitle className='text-lg font-semibold text-gray-900'>Event Details</DialogTitle>
            <DialogClose onClick={() => { setViewModalOpen(false); setViewEventData(null) }} />
          </DialogHeader>

          <div className='flex-1 overflow-y-auto p-6'>
            {loadingView ? (
              <div className='flex justify-center items-center h-48 text-gray-400'>Loading...</div>
            ) : viewEventData ? (
              <div className='space-y-6'>
                {viewEventData.image && (
                  <div className='w-full h-56 rounded-md overflow-hidden border'>
                    <img src={viewEventData.image} alt={viewEventData.title} className='w-full h-full object-cover' />
                  </div>
                )}

                <div className='flex items-start gap-3 flex-wrap'>
                  <h2 className='text-2xl font-bold text-gray-900'>{viewEventData.title}</h2>
                  <StatusBadge status={viewEventData.status} />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {viewEventData.category && (
                    <div className='bg-gray-50 p-3 rounded-md border'>
                      <p className='text-xs font-bold uppercase tracking-wide text-gray-400 mb-1'>Category</p>
                      <p className='font-medium text-gray-800'>{viewEventData.category.title}</p>
                    </div>
                  )}
                  {viewEventData.college && (
                    <div className='bg-gray-50 p-3 rounded-md border'>
                      <p className='text-xs font-bold uppercase tracking-wide text-gray-400 mb-1'>College</p>
                      <p className='font-medium text-gray-800'>{viewEventData.college.name}</p>
                    </div>
                  )}
                </div>

                {viewEventData.event_host && (() => {
                  const eventHost = viewEventData.event_host
                  return (
                    <div className='bg-gray-50 p-4 rounded-md border space-y-2'>
                      <h3 className='text-sm font-bold uppercase tracking-wide text-gray-400 mb-3'>Event Schedule</h3>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                        {eventHost.host && (
                          <div><span className='text-gray-500'>Host:</span> <span className='font-medium text-gray-800'>{eventHost.host}</span></div>
                        )}
                        {eventHost.start_date && (
                          <div><span className='text-gray-500'>Start:</span> <span className='font-medium text-gray-800'>{formatDate(eventHost.start_date)}</span></div>
                        )}
                        {eventHost.end_date && (
                          <div><span className='text-gray-500'>End:</span> <span className='font-medium text-gray-800'>{formatDate(eventHost.end_date)}</span></div>
                        )}
                        {eventHost.time && (
                          <div><span className='text-gray-500'>Time:</span> <span className='font-medium text-gray-800'>{eventHost.time}</span></div>
                        )}
                        {eventHost.map_url && (
                          <div>
                            <a href={eventHost.map_url} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline inline-flex items-center gap-1 text-sm'>
                              <MapPin className='w-3.5 h-3.5' /> View Map
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {viewEventData.description && (
                  <div>
                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>Description</h3>
                    <div className='text-gray-700 prose prose-sm max-w-none' dangerouslySetInnerHTML={{ __html: viewEventData.description }} />
                  </div>
                )}

                {viewEventData.content && (
                  <div>
                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>Content</h3>
                    <div className='text-gray-700 prose prose-sm max-w-none' dangerouslySetInnerHTML={{ __html: viewEventData.content }} />
                  </div>
                )}
              </div>
            ) : (
              <p className='text-center text-gray-400 py-12'>No event data available.</p>
            )}
          </div>

          <div className='sticky bottom-0 bg-white border-t p-4 px-6 flex justify-end'>
            <Button variant='outline' onClick={() => { setViewModalOpen(false); setViewEventData(null) }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ImageLightbox
        isOpen={lightbox.isOpen}
        onClose={() => setLightbox({ ...lightbox, isOpen: false })}
        imageUrl={lightbox.imageUrl}
        altText={lightbox.altText}
      />
    </>
  )
}
