'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useToast } from '@/hooks/use-toast'
import {
  Edit2,
  Eye,
  Trash2,
  Plus,
  GripVertical,
  Building2,
  GraduationCap,
  Loader2,
  Search,
  FileText,
  Check,
  Paperclip,
  Settings
} from 'lucide-react'

import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogClose
} from '@/ui/shadcn/dialog'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import { Textarea } from '@/ui/shadcn/textarea'

import {
  getAdmissions,
  getAdmissionDetail,
  createOrUpdateAdmission,
  deleteAdmission,
  fetchColleges,
  fetchPrograms,
  fetchProgramsByCollege,
  updateAdmissionOrder
} from './action'
import AdmissionViewModal from './AdmissionViewModal'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'
import FileUpload from '../colleges/FileUpload'

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
import { cn } from '@/app/lib/utils'

// ─── Sortable Admission Card ───────────────────────────────────────────────────
const SortableCard = ({ admission, onView, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: admission.id })

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const collegeName = admission.collegeAdmissionCollege?.name || 'N/A'
  const collegeLogo =
    admission.collegeAdmissionCollege?.college_logo ||
    admission.collegeAdmissionCollege?.featured_img ||
    null
  const programTitle = admission.program?.title || 'N/A'

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
        <div className='w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 shadow-sm'>
          {collegeLogo ? (
            <img
              src={collegeLogo}
              alt={collegeName}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <Building2 className='w-7 h-7 text-gray-300' />
            </div>
          )}
        </div>

        {/* Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap mb-1'>
            <h3 className='text-[16px] font-bold text-gray-900 truncate leading-tight'>
              {collegeName}
            </h3>
          </div>
          <div className='flex items-center gap-1.5 text-[13px] text-gray-500 mt-1'>
            <GraduationCap className='w-4 h-4 shrink-0 text-gray-400' />
            <span className='truncate'>{programTitle}</span>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-1 pl-4 border-l border-gray-100'>
          <button
            onClick={() => onView(admission.id)}
            title='View details'
            className='w-9 h-9 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-all'
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(admission)}
            title='Edit'
            className='w-9 h-9 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 transition-all'
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(admission.id)}
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
const OverlayCard = ({ admission }) => {
  const collegeName = admission.collegeAdmissionCollege?.name || 'N/A'
  const collegeLogo =
    admission.collegeAdmissionCollege?.college_logo ||
    admission.collegeAdmissionCollege?.featured_img ||
    null
  const programTitle = admission.program?.title || 'N/A'

  return (
    <div className='bg-white border-2 border-[#387cae]/40 rounded-xl shadow-2xl rotate-[0.6deg] scale-[1.01]'>
      <div className='flex items-center gap-4 p-4'>
        <GripVertical
          size={20}
          className='text-[#387cae]/50 cursor-grabbing shrink-0'
        />
        <div className='w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0'>
          {collegeLogo ? (
            <img
              src={collegeLogo}
              alt={collegeName}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <Building2 className='w-7 h-7 text-gray-300' />
            </div>
          )}
        </div>
        <div className='flex-1 min-w-0'>
          <h3 className='text-[16px] font-bold text-gray-900 truncate mb-1'>
            {collegeName}
          </h3>
          <div className='flex items-center gap-1.5 text-[13px] text-gray-500'>
            <span className='truncate'>{programTitle}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

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
        <div className='h-5 bg-gray-200 rounded-md w-1/3' />
        <div className='h-3 bg-gray-200 rounded w-1/4' />
      </div>
      <div className='flex gap-2 pl-4 border-l border-gray-100'>
        {[0, 1, 2].map((j) => (
          <div key={j} className='w-9 h-9 bg-gray-200 rounded-lg' />
        ))}
      </div>
    </div>
  </div>
)

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className='flex items-center gap-3 mb-6'>
    <div className='w-10 h-10 rounded-md bg-[#387cae]/10 flex items-center justify-center text-[#387cae] shadow-sm border border-[#387cae]/20'>
      <Icon size={20} />
    </div>
    <div>
      <h3 className='text-lg font-bold text-gray-900 leading-tight'>{title}</h3>
      {subtitle && (
        <p className='text-xs text-gray-400 mt-0.5 font-medium'>{subtitle}</p>
      )}
    </div>
  </div>
)

export default function AdmissionManager() {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const searchParams = useSearchParams()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      school_college_id: '',
      program_id: '',
      eligibility_criteria: '',
      admission_process: '',
      fee_details: '',
      description: '',
      pdf_file: ''
    }
  })

  const [admissions, setAdmissions] = useState([])
  const [editing, setEditing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittingDraft, setSubmittingDraft] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const searchDebounceRef = useRef(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const statusFilterRef = useRef(statusFilter)
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    statusFilterRef.current = statusFilter
  }, [statusFilter])

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  const [deleteId, setDeleteId] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewData, setViewData] = useState(null)

  const [selectedInstitution, setSelectedInstitution] = useState(null)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState({ pdf_file: '' })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    setHeading('Admission Management')
    loadAdmissions(searchQuery, false, statusFilter)
    return () => setHeading(null)
  }, [setHeading])

  const loadAdmissions = async (
    search = searchQuery,
    silent = true,
    status = statusFilterRef.current
  ) => {
    if (!silent) setListLoading(true)
    try {
      let all = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const data = await getAdmissions(page, search, status)
        all = [...all, ...(data.items || [])]
        hasMore = page < (data.pagination?.totalPages || 1)
        page++
      }

      // Display all recursively fetched items for drag-and-drop
      const uniqueItems = Array.from(
        new Map(all.map((a) => [a.id, a])).values()
      )

      uniqueItems.sort((a, b) => {
        const oA = a.order_no ?? Infinity
        const oB = b.order_no ?? Infinity
        return oA !== oB ? oA - oB : b.id - a.id
      })

      setAdmissions(uniqueItems)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load admissions',
        variant: 'destructive'
      })
    } finally {
      if (!silent) setListLoading(false)
    }
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (value === '') {
      loadAdmissions('', false, statusFilterRef.current)
      return
    }
    searchDebounceRef.current = setTimeout(() => {
      loadAdmissions(value, false, statusFilterRef.current)
    }, 350)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    loadAdmissions(searchQuery, false, status)
  }

  const handleDragStart = (event) => setActiveId(event.active.id)
  const handleDragCancel = () => setActiveId(null)

  const handleDragEnd = async (event) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = admissions.findIndex((a) => a.id === active.id)
    const newIdx = admissions.findIndex((a) => a.id === over.id)
    const reordered = arrayMove(admissions, oldIdx, newIdx)
    setAdmissions(reordered)

    const payload = reordered.map((a, i) => ({ id: a.id, order_no: i + 1 }))
    await saveOrder(payload)
  }

  const saveOrder = async (payload) => {
    try {
      setSaving(true)
      await updateAdmissionOrder(payload)
      setAdmissions((prev) =>
        prev.map((a) => {
          const updated = payload.find((p) => p.id === a.id)
          return updated ? { ...a, order_no: updated.order_no } : a
        })
      )
      toast({
        title: 'Success',
        description: 'Order saved'
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save order',
        variant: 'destructive'
      })
      loadAdmissions(searchQuery, true)
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = () => {
    setEditing(false)
    setEditingId(null)
    setSelectedInstitution(null)
    setSelectedProgram(null)
    reset({
      school_college_id: '',
      program_id: '',
      eligibility_criteria: '',
      admission_process: '',
      fee_details: '',
      description: '',
      pdf_file: '',
      associated_organization_name: '',
      author_id: '',
      status: 'published',
      slug: '',
      meta_description: ''
    })
    setUploadedFiles({ pdf_file: '' })
    setIsOpen(true)
  }

  const saveAdmission = async (data, asDraft) => {
    try {
      if (asDraft) setSubmittingDraft(true)
      else setSubmitting(true)
      const payload = {
        ...data,
        pdf_file: uploadedFiles.pdf_file || data.pdf_file || '',
        status: asDraft ? 'draft' : 'published',
        slug: data.slug || data.slug,
        meta_description: data.meta_description
      }
      if (editing) payload.id = editingId

      await createOrUpdateAdmission(payload)
      toast({
        title: 'Success',
        description: asDraft
          ? editing
            ? 'Admission saved as draft'
            : 'Draft admission saved'
          : editing
            ? 'Admission updated successfully'
            : 'Admission created successfully'
      })
      handleCloseModal()
      loadAdmissions(searchQuery, false)
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save admission',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
      setSubmittingDraft(false)
    }
  }

  const onSubmit = async (data) => {
    await saveAdmission(data, false)
  }

  const onSaveDraft = () => {
    handleSubmit((data) => saveAdmission(data, true))()
  }

  const handleEdit = async (item) => {
    setEditing(true)
    setEditingId(item.id)

    // Set selected objects for SearchSelectCreate
    setSelectedInstitution(
      item.collegeAdmissionCollege
        ? {
            id: item.collegeAdmissionCollege.id,
            name: item.collegeAdmissionCollege.name,
            college_logo: item.collegeAdmissionCollege.college_logo
          }
        : null
    )

    setSelectedProgram(
      item.program
        ? {
            id: item.program.id,
            title: item.program.title
          }
        : null
    )

    reset({
      school_college_id: item.collegeAdmissionCollege?.id || '',
      program_id: item.program?.id || '',
      eligibility_criteria: item.eligibility_criteria || '',
      admission_process: item.admission_process || '',
      fee_details: item.fee_details || '',
      description: item.description || '',
      pdf_file: item.pdf_file || '',
      associated_organization_name: item.associated_organization_name || '',
      author_id: item.author_id || '',
      status: item.status || 'published',
      slug: item.slug || '',
      meta_description: item.meta_description || ''
    })
    setUploadedFiles({ pdf_file: item.pdf_file || '' })

    setIsOpen(true)
  }

  const handleDeleteClick = (id) => {
    setDeleteId(id)
    setIsConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteAdmission(deleteId)
      toast({
        title: 'Success',
        description: 'Admission deleted successfully'
      })
      loadAdmissions(searchQuery, false)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete admission',
        variant: 'destructive'
      })
    } finally {
      setIsConfirmOpen(false)
      setDeleteId(null)
    }
  }

  const handleView = async (id) => {
    try {
      const data = await getAdmissionDetail(id)
      setViewData(data)
      setViewModalOpen(true)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load details',
        variant: 'destructive'
      })
    }
  }

  const handleCloseModal = () => {
    setIsOpen(false)
    setEditing(false)
    setEditingId(null)
    setSelectedInstitution(null)
    setSelectedProgram(null)
    setUploadedFiles({ pdf_file: '' })
    reset()
  }

  return (
    <div className='w-full'>
      <div className='sticky mb-3 top-0 z-30 bg-[#F7F8FA] py-3'>
        <div className='bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-md bg-[#387cae]/10 flex items-center justify-center shrink-0'>
              <GraduationCap
                size={17}
                className='text-[#387cae]'
                strokeWidth={2}
              />
            </div>
            <div>
              <p className='text-sm font-bold text-gray-800'>Admissions</p>
              <p className='text-xs text-gray-400 flex items-center gap-1.5 flex-wrap'>
                {listLoading ? (
                  <span className='inline-flex items-center gap-1'>
                    <Loader2 size={10} className='animate-spin' />
                    Loading…
                  </span>
                ) : (
                  `${admissions.length} total`
                )}
                {saving && (
                  <span className='inline-flex items-center gap-1 text-[#387cae]'>
                    · <Loader2 size={10} className='animate-spin' />
                    Saving order…
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
                placeholder='Search admissions…'
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
              onClick={handleAdd}
              className='bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 h-9 px-4 rounded-md text-sm font-semibold shrink-0'
            >
              <Plus className='w-4 h-4' />
              Add Admission
            </Button>
          </div>
        </div>
      </div>

      <div className='mt-2'>
        {listLoading ? (
          <div className='flex flex-col gap-3'>
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} i={i} />
            ))}
          </div>
        ) : admissions.length === 0 ? (
          <div className='bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center'>
            <GraduationCap className='w-10 h-10 text-gray-200 mx-auto mb-3' />
            <p className='text-gray-500 font-medium text-sm'>
              {searchQuery
                ? 'No admissions match your search.'
                : 'No admissions found.'}
            </p>
          </div>
        ) : (
          <>
            <p className='text-[11px] text-gray-400 px-1 mb-2 flex items-center gap-1.5'>
              <GripVertical size={11} className='text-gray-300' />
              Drag the grip handle to reorder · Changes save automatically
              {saving && (
                <span className='text-[#387cae] ml-2 animate-pulse'>
                  Saving order...
                </span>
              )}
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={admissions.map((a) => a.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className='flex flex-col gap-3'>
                  {admissions.map((admission) => (
                    <SortableCard
                      key={admission.id}
                      admission={admission}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
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
                {activeId ? (
                  <OverlayCard
                    admission={admissions.find((a) => a.id === activeId)}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </>
        )}
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={handleCloseModal}
        closeOnOutsideClick={false}
        className='max-w-6xl'
      >
        <DialogHeader className='bg-white border-b border-gray-100 p-6'>
          <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center gap-3'>
            <GraduationCap className='text-[#387cae]' size={28} />
            {editing ? 'Edit Admission Detail' : 'Create Admission Record'}
          </DialogTitle>
          <DialogClose onClick={handleCloseModal} />
        </DialogHeader>

        <DialogContent className='max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-gray-50/50'>
          <form
            id='admission-form'
            className='flex flex-col max-h-[calc(100vh-160px)]'
            onSubmit={(e) => e.preventDefault()}
          >
            <div className='flex-1 overflow-y-auto p-8 sidebar-scrollbar'>
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6'>
                {/* Left Column (8/12) */}
                <div className='lg:col-span-8 space-y-8'>
                  {/* Basic Selection Card */}
                  <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                    <SectionHeader
                      icon={Building2}
                      title='Institution & Program'
                      subtitle='Select the college and corresponding program'
                    />

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                      {/* College Selection */}
                      <div className='space-y-2.5'>
                        <Label
                          required
                          className='text-gray-700 font-semibold mb-1.5 block text-sm'
                        >
                          Target School/College
                        </Label>
                        <SearchSelectCreate
                          onSearch={fetchColleges}
                          onSelect={(item) => {
                            setSelectedInstitution(item)
                            setValue('school_college_id', item.id, {
                              shouldValidate: true
                            })
                            setSelectedProgram(null)
                            setValue('program_id', '', { shouldValidate: true })
                          }}
                          onRemove={() => {
                            setSelectedInstitution(null)
                            setValue('school_college_id', '', { shouldValidate: true })
                            setSelectedProgram(null)
                            setValue('program_id', '', { shouldValidate: true })
                          }}
                          selectedItems={selectedInstitution}
                          placeholder='Search and select school/college...'
                          isMulti={false}
                          displayKey='name'
                          renderItem={(item) => (
                            <div className='flex items-center gap-3'>
                              {item.college_logo ? (
                                <img
                                  src={item.college_logo}
                                  alt={item.name}
                                  className='w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0'
                                />
                              ) : (
                                <div className='w-8 h-8 rounded-full bg-[#387cae]/10 flex items-center justify-center shrink-0'>
                                  <span className='text-xs font-bold text-[#387cae]'>
                                    {item.name?.charAt(0)?.toUpperCase() || 'C'}
                                  </span>
                                </div>
                              )}
                              <span className='text-sm font-medium text-gray-800 tracking-tight'>
                                {item.name}
                              </span>
                            </div>
                          )}
                          renderSelected={(item) => (
                            <div className='flex items-center gap-3'>
                              {item.college_logo ? (
                                <img
                                  src={item.college_logo}
                                  alt={item.name}
                                  className='w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0'
                                />
                              ) : (
                                <div className='w-7 h-7 rounded-full bg-[#387cae]/10 flex items-center justify-center shrink-0'>
                                  <span className='text-xs font-bold text-[#387cae]'>
                                    {item.name?.charAt(0)?.toUpperCase() || 'C'}
                                  </span>
                                </div>
                              )}
                              <span className='text-sm font-semibold text-gray-900 truncate'>
                                {item.name}
                              </span>
                            </div>
                          )}
                        />
                        <input
                          type='hidden'
                          {...register('school_college_id', {
                            required: 'Institution is required'
                          })}
                        />
                        {errors.school_college_id && (
                          <p className='text-xs font-bold text-red-500 mt-2 ml-1'>
                            {errors.school_college_id.message}
                          </p>
                        )}
                      </div>

                      {/* Program Selection */}
                      <div className='space-y-2.5'>
                        <Label
                          required
                          className='text-gray-700 font-semibold mb-1.5 block text-sm'
                        >
                          Academic Program
                        </Label>
                        <SearchSelectCreate
                          onSearch={(q) =>
                            fetchProgramsByCollege(selectedInstitution?.id, q)
                          }
                          onSelect={(item) => {
                            setSelectedProgram(item)
                            setValue('program_id', item.id, {
                              shouldValidate: true
                            })
                          }}
                          onRemove={() => {
                            setSelectedProgram(null)
                            setValue('program_id', '', { shouldValidate: true })
                          }}
                          selectedItems={selectedProgram}
                          placeholder={
                            selectedInstitution
                              ? 'Search and select program...'
                              : 'Select a school/college first'
                          }
                          isMulti={false}
                          displayKey='title'
                          isLoading={!selectedInstitution}
                        />
                        <input
                          type='hidden'
                          {...register('program_id', {
                            required: 'Program is required'
                          })}
                        />
                        {errors.program_id && (
                          <p className='text-xs font-bold text-red-500 mt-2 ml-1'>
                            {errors.program_id.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Sections Card */}
                  <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                    <SectionHeader
                      icon={Edit2}
                      title='Admission Details'
                      subtitle='Criteria, process, and fee information'
                    />

                    <div className='grid grid-cols-1 gap-8'>
                      <div className='space-y-2.5'>
                        <Label className='text-gray-700 font-semibold mb-1.5 block text-sm'>
                          Eligibility Criteria
                        </Label>
                        <Textarea
                          {...register('eligibility_criteria')}
                          className='flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all'
                          placeholder='Describe who is eligible for this course...'
                        />
                      </div>

                      <div className='space-y-2.5'>
                        <Label className='text-gray-700 font-semibold mb-1.5 block text-sm'>
                          Admission Process
                        </Label>
                        <Textarea
                          {...register('admission_process')}
                          className='flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all'
                          placeholder='Detail the step-by-step application and selection process...'
                        />
                      </div>

                      <div className='space-y-2.5'>
                        <Label className='text-gray-700 font-semibold mb-1.5 block text-sm'>
                          Fee Structure & Details
                        </Label>
                        <Textarea
                          {...register('fee_details')}
                          className='flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all'
                          placeholder='Provide specific fee breakdown or important financial notes...'
                        />
                      </div>

                      <div className='space-y-3'>
                        <Label className='text-gray-700 font-semibold mb-1 block text-sm'>
                          Comprehensive Description
                        </Label>
                        <div className='border border-gray-200 rounded-lg overflow-hidden'>
                          <TipTapEditor
                            value={watch('description')}
                            onChange={(html) => setValue('description', html)}
                            placeholder='Enter any additional admission related information...'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column (4/12) */}
                <div className='lg:col-span-4 space-y-8'>
                  {/* PDF attachment — same pattern as blog form */}
                  <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                    <SectionHeader
                      icon={Paperclip}
                      title='Attachment'
                      subtitle='Optional PDF document'
                    />
                    <div className='p-4 bg-gray-50 rounded-md border border-gray-100 border-dashed'>
                      <Label className='text-xs font-semibold tracking-wider mb-3 block'>
                        Attachment (PDF)
                      </Label>
                      <FileUpload
                        label=''
                        accept='application/pdf'
                        onUploadComplete={(url) => {
                          setUploadedFiles((prev) => ({
                            ...prev,
                            pdf_file: url
                          }))
                          setValue('pdf_file', url)
                        }}
                        defaultPreview={uploadedFiles.pdf_file}
                      />
                    </div>
                  </div>

                  {/* SEO Settings */}
                  <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4'>
                    <SectionHeader icon={Settings} title='SEO Settings' />
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='slug'>URL Slug</Label>
                        <Input
                          id='slug'
                          {...register('slug')}
                          placeholder='url-slug-here'
                          className='text-sm'
                        />
                        <p className='text-[10px] text-gray-400 mt-1 italic'>
                          Leave empty to auto-generate from title
                        </p>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='meta_description'>
                          Meta Description
                        </Label>
                        <Textarea
                          id='meta_description'
                          {...register('meta_description')}
                          placeholder='SEO meta description...'
                          className='min-h-[100px] text-sm'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='shrink-0 flex justify-end items-center gap-3 p-6 bg-white border-t border-gray-100 z-20 sticky bottom-0'>
              <Button
                type='button'
                variant='outline'
                onClick={handleCloseModal}
                disabled={submitting || submittingDraft}
              >
                Cancel
              </Button>
              <Button
                type='button'
                variant='secondary'
                disabled={submitting || submittingDraft}
                onClick={onSaveDraft}
                className='bg-gray-100 hover:bg-gray-200 text-gray-700 border-none gap-2'
              >
                {submittingDraft ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span>Saving draft…</span>
                  </>
                ) : (
                  <>
                    <FileText className='w-4 h-4' />
                    <span>Save as Draft</span>
                  </>
                )}
              </Button>
              <Button
                type='button'
                disabled={submitting || submittingDraft}
                onClick={() => handleSubmit(onSubmit)()}
                className='bg-[#387cae] hover:bg-[#2d658d] text-white min-w-[140px] gap-2'
              >
                {submitting ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span>Saving…</span>
                  </>
                ) : editing ? (
                  <>
                    <Check className='w-4 h-4' />
                    <span>Update Admission</span>
                  </>
                ) : (
                  <>
                    <Plus className='w-4 h-4' />
                    <span>Create Admission</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AdmissionViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        admission={viewData}
      />

      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title='Delete Admission'
        message='Are you sure you want to delete this admission record? This action cannot be undone.'
      />
    </div>
  )
}
