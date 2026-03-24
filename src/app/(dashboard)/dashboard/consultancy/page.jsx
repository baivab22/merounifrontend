'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Edit2, Trash2, Eye, Key, GripVertical, Building2, Loader2, MapPin } from 'lucide-react'
import { FaHandshake } from 'react-icons/fa'

import { Button } from '@/ui/shadcn/button'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import useAdminPermission from '@/hooks/useAdminPermission'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import CreateUpdateConsultancy from '@/ui/molecules/dialogs/CreateUpdateConsultancy'
import ViewConsultancy from '@/ui/molecules/dialogs/ViewConsultancy'
import CreateConsultencyUser from '@/ui/molecules/dialogs/CreateConsultencyUser'
import EditConsultancyPage from './EditConsultancyPage'
import ImageLightbox from '@/ui/molecules/image-lightbox'
import { authFetch } from '@/app/utils/authFetch'
import { deleteConsultancy } from './actions'
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

// ─── Sortable Consultancy Card ────────────────────────────────────────────────
const SortableCard = ({ consultancy, onView, onEdit, onDelete, onImageClick, onCreateCredentials }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: consultancy.id })

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const address = typeof consultancy.address === 'string'
    ? JSON.parse(consultancy.address)
    : consultancy.address || {}
  const location = [address.city, address.district || address.state].filter(Boolean).join(', ')

  let destinations = consultancy.destination
  if (typeof destinations === 'string') {
    try { destinations = JSON.parse(destinations) } catch { destinations = [] }
  }
  if (!Array.isArray(destinations)) destinations = []

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

        {/* Logo */}
        <div
          role='button'
          tabIndex={0}
          onClick={() => consultancy.logo && onImageClick(consultancy.logo, consultancy.title)}
          className={cn(
            'w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm',
            consultancy.logo && 'cursor-pointer hover:opacity-90 transition-opacity'
          )}
        >
          {consultancy.logo
            ? <img src={consultancy.logo} alt={consultancy.title} className='w-full h-full object-contain p-1.5' />
            : <Building2 className='w-7 h-7 text-gray-300' />}
        </div>

        {/* Info */}
        <div className='flex-1 min-w-0'>
          <h3 className='text-[16px] font-bold text-gray-900 truncate leading-tight mb-1'>
            {consultancy.title}
          </h3>
          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5'>
            {location && (
              <span className='flex items-center gap-1.5 text-[12px] text-gray-500'>
                <MapPin size={12} className='shrink-0 text-gray-400' />
                {location}
              </span>
            )}
            <div className="flex flex-wrap gap-1">
              {destinations.slice(0, 3).map((d, i) => (
                <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-tight border border-blue-100">
                  {typeof d === 'string' ? d : d.country}
                </span>
              ))}
              {destinations.length > 3 && <span className="text-[10px] text-gray-400 font-medium">+{destinations.length - 3} more</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-1 pl-4 border-l border-gray-100'>
          <button
            onClick={() => onView(consultancy.slug || consultancy.slugs)}
            title='View details'
            className='w-9 h-9 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-all'
          >
            <Eye size={18} />
          </button>
          {!consultancy.userId && (
            <button
              onClick={() => onCreateCredentials(consultancy)}
              title='Create credentials'
              className='w-9 h-9 flex items-center justify-center rounded-lg text-indigo-500 hover:bg-indigo-50 transition-all'
            >
              <Key size={18} />
            </button>
          )}
          <button
            onClick={() => onEdit(consultancy)}
            title='Edit'
            className='w-9 h-9 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 transition-all'
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(consultancy.id)}
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
const OverlayCard = ({ consultancy }) => (
  <div className='bg-white border-2 border-[#387cae]/40 rounded-xl shadow-2xl rotate-[0.6deg] scale-[1.01]'>
    <div className='flex items-center gap-4 p-4'>
      <GripVertical size={20} className='text-[#387cae]/50 cursor-grabbing shrink-0' />
      <div className='w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0'>
        {consultancy.logo
          ? <img src={consultancy.logo} alt={consultancy.title} className='w-full h-full object-contain p-1.5' />
          : <Building2 className='w-7 h-7 text-gray-300' />}
      </div>
      <div className='flex-1 min-w-0'>
        <h3 className='text-[16px] font-bold text-gray-900 truncate'>{consultancy.title}</h3>
      </div>
    </div>
  </div>
)

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const CardSkeleton = ({ i = 0 }) => (
  <div
    className='bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse mb-3'
    style={{ animationDelay: `${i * 60}ms` }}
  >
    <div className='flex items-center gap-4 p-4'>
      <div className='w-5 h-5 bg-gray-200 rounded shrink-0' />
      <div className='w-16 h-16 bg-gray-200 rounded-lg shrink-0' />
      <div className='flex-1 space-y-2.5'>
        <div className='h-4 bg-gray-200 rounded-md w-1/3' />
        <div className='flex gap-4'>
          <div className='h-3 bg-gray-200 rounded w-24' />
          <div className='h-3 bg-gray-200 rounded w-32' />
        </div>
      </div>
      <div className='flex gap-2 pl-4 border-l border-gray-100'>
        {[0, 1, 2, 3].map(j => <div key={j} className='w-9 h-9 bg-gray-200 rounded-lg' />)}
      </div>
    </div>
  </div>
)

export default function ConsultancyManager() {
  const { role } = useAdminPermission()

  // If user is consultancy, show the edit page
  if (role.consultancy) {
    return <EditConsultancyPage />
  }

  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [consultancies, setConsultancies] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingOrder, setSavingOrder] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editingData, setEditingData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [viewSlug, setViewSlug] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false)
  const [selectedConsultancy, setSelectedConsultancy] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const activeConsultancy = consultancies.find((c) => c.id === activeId)

  // Lightbox State
  const [lightbox, setLightbox] = useState({ isOpen: false, imageUrl: '', altText: '' })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleImageClick = (imageUrl, altText) => {
    setLightbox({ isOpen: true, imageUrl, altText: altText || 'Consultancy Logo' })
  }

  useEffect(() => {
    setHeading('Consultancy Management')
    loadConsultancies()
    return () => setHeading(null)
  }, [setHeading])

  useEffect(() => {
    const addParam = searchParams.get('add')
    if (addParam === 'true') {
      setEditingData(null)
      setIsOpen(true)
      router.replace('/dashboard/consultancy', { scroll: false })
    }
  }, [searchParams, router])

  const loadConsultancies = async (silent = false, query = searchQuery) => {
    if (!silent) setLoading(true)
    try {
      let all = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        let url = `${process.env.baseUrl}/consultancy?page=${page}&limit=100`
        if (query) url += `&q=${encodeURIComponent(query)}`
        
        const response = await authFetch(url)
        if (!response.ok) throw new Error('Failed to load consultancies')
        const data = await response.json()
        
        all = [...all, ...(data.items || [])]
        hasMore = page < (data.pagination?.totalPages || 1)
        page++
      }

      // Sort by order_no_for_website
      all.sort((a, b) => {
        const oA = a.order_no_for_website ?? Infinity
        const oB = b.order_no_for_website ?? Infinity
        return oA !== oB ? oA - oB : b.id - a.id
      })

      setConsultancies(all)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load consultancies',
        variant: 'destructive'
      })
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const id = setTimeout(() => loadConsultancies(true, value), 350)
    setSearchTimeout(id)
  }

  const handleAdd = () => {
    setEditingData(null)
    setIsOpen(true)
  }

  const handleEdit = (item) => {
    setEditingData(item)
    setIsOpen(true)
  }

  const handleView = (slug) => {
    setViewSlug(slug)
    setIsViewOpen(true)
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setIsConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteConsultancy(deleteId)
      toast({ title: 'Success', description: 'Consultancy deleted successfully' })
      loadConsultancies(true)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete',
        variant: 'destructive'
      })
    } finally {
      setIsConfirmOpen(false)
      setDeleteId(null)
    }
  }

  const handleDragStart = (event) => setActiveId(event.active.id)
  const handleDragCancel = () => setActiveId(null)

  const handleDragEnd = async (event) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = consultancies.findIndex((c) => c.id === active.id)
    const newIdx = consultancies.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(consultancies, oldIdx, newIdx)
    setConsultancies(reordered)

    const payload = reordered.map((c, i) => ({ id: c.id, order_no: i + 1 }))
    await saveOrder(payload)
  }

  const saveOrder = async (payload) => {
    try {
      setSavingOrder(true)
      const res = await authFetch(`${process.env.baseUrl}/consultancy/update-order`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultancies: payload })
      })
      if (!res.ok) throw new Error('Failed to save order')
      
      toast({ title: 'Success', description: 'Order saved' })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save order',
        variant: 'destructive'
      })
      loadConsultancies(true)
    } finally {
      setSavingOrder(false)
    }
  }

  const handleOpenCredentialsModal = (consultancy) => {
    setSelectedConsultancy(consultancy)
    setCredentialsModalOpen(true)
  }

  return (
    <div className='w-full'>

      {/* Sticky Header */}
      <div className='sticky mb-3 top-0 z-30 bg-[#F7F8FA] py-3'>
        <div className='bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-md bg-[#387cae]/10 flex items-center justify-center shrink-0'>
              <FaHandshake size={17} className='text-[#387cae]' />
            </div>
            <div>
              <p className='text-sm font-bold text-gray-800'>Consultancies</p>
              <p className='text-xs text-gray-400 flex items-center gap-1.5'>
                {loading
                  ? <span className='inline-flex items-center gap-1'><Loader2 size={10} className='animate-spin' /> Loading…</span>
                  : `${consultancies.length} total`
                }
                {savingOrder && (
                  <span className='inline-flex items-center gap-1 text-[#387cae]'>
                    · <Loader2 size={10} className='animate-spin' /> Saving order…
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2 w-full sm:w-auto'>
            <div className='relative shrink-0 sm:w-64'>
              <Search size={13} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder='Search consultancies…'
                className='w-full pl-8 pr-3 h-9 rounded-md border border-gray-200 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40 transition'
              />
            </div>
            <Button onClick={handleAdd} className="bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 h-9 px-4 rounded-md text-sm font-semibold shrink-0">
              <Plus className="w-4 h-4" />
              Add Consultancy
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className='flex flex-col gap-3'>
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} i={i} />)}
        </div>
      ) : consultancies.length === 0 ? (
        <div className='bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center'>
          <FaHandshake className='w-10 h-10 text-gray-200 mx-auto mb-3' />
          <p className='text-gray-500 font-medium text-sm'>
            {searchQuery ? 'No consultancies match your search.' : 'No consultancies yet.'}
          </p>
          {!searchQuery && (
            <Button onClick={handleAdd} className='mt-4 bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 text-sm'>
              <Plus size={15} /> Add First Consultancy
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className='text-[11px] text-gray-400 px-1 mb-2 flex items-center gap-1.5'>
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
              items={consultancies.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className='flex flex-col gap-3'>
                {consultancies.map((consultancy) => (
                  <SortableCard
                    key={consultancy.id}
                    consultancy={consultancy}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onImageClick={handleImageClick}
                    onCreateCredentials={handleOpenCredentialsModal}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
              {activeConsultancy ? <OverlayCard consultancy={activeConsultancy} /> : null}
            </DragOverlay>
          </DndContext>
        </>
      )}

      <CreateUpdateConsultancy
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          setEditingData(null)
        }}
        onSuccess={() => loadConsultancies(true)}
        initialData={editingData}
      />

      <ViewConsultancy
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        slug={viewSlug}
      />

      <CreateConsultencyUser
        isOpen={credentialsModalOpen}
        onClose={() => setCredentialsModalOpen(false)}
        selectedConsultancy={selectedConsultancy}
        onSuccess={() => loadConsultancies(true)}
      />

      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false)
          setDeleteId(null)
        }}
        onConfirm={handleDeleteConfirm}
        title='Confirm Deletion'
        message='Are you sure you want to delete this consultancy? This action cannot be undone.'
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
