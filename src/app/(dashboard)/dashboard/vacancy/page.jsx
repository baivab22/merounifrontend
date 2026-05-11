'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useToast } from '@/hooks/use-toast'

import Table from '@/ui/shadcn/DataTable'
import FileUpload from '../colleges/FileUpload'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/ui/shadcn/dialog'
import { authFetch } from '@/app/utils/authFetch'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'
import useAdminPermission from '@/hooks/useAdminPermission'
import {
  Eye,
  Edit2,
  Trash2,
  Plus,
  Loader2,
  Search,
  Briefcase,
  FileText,
  Check,
  Settings
} from 'lucide-react'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { Textarea } from '@/ui/shadcn/textarea'

const VacancyManager = () => {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const author_id = useSelector((state) => state.user.data?.id)
  const { requireAdmin } = useAdminPermission()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      content: '',
      featuredImage: '',
      pdf_file: '',
      associated_organization_name: '',
      author_id,
      status: 'published',
      slug: '',
      meta_description: ''
    }
  })

  const [vacancies, setVacancies] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page')) || 1,
    totalPages: 1,
    total: 0
  })
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState({
    featuredImage: '',
    pdf_file: ''
  })
  const [deleteId, setDeleteId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittingDraft, setSubmittingDraft] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchDebounceRef = useRef(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewVacancyData, setViewVacancyData] = useState(null)
  const [loadingView, setLoadingView] = useState(false)
  const abortControllerRef = useRef(null)

  const loadVacancies = async (page = 1, qOpt, statusOpt) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const params = new URLSearchParams(searchParams.toString())
      const currentPage = params.get('page') || '1'

      if (currentPage !== String(page)) {
        params.set('page', page)
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      }

      const qRaw = qOpt !== undefined ? qOpt : searchQuery
      const status = statusOpt !== undefined ? statusOpt : statusFilter
      const q = (qRaw || '').trim()

      setTableLoading(true)
      let url = `${process.env.baseUrl}/vacancy?page=${page}`
      if (q) url += `&q=${encodeURIComponent(q)}`
      if (status && status !== 'all')
        url += `&status=${encodeURIComponent(status)}`

      const response = await authFetch(url, {
        signal: abortControllerRef.current.signal
      })
      const data = await response.json()
      setVacancies(data.items || [])
      if (data.pagination) {
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          total: data.pagination.totalCount
        })
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      toast({
        title: 'Error',
        description: 'Failed to load vacancies',
        variant: 'destructive'
      })
    } finally {
      if (abortControllerRef.current?.signal?.aborted === false) {
        setTableLoading(false)
      }
    }
  }

  useEffect(() => {
    setHeading('Vacancy Management')
    const page = searchParams.get('page') || 1
    loadVacancies(page)
    return () => setHeading(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setHeading])

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      handleAddClick()
      router.replace(pathname, { scroll: false })
    }
  }, [searchParams])

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  const handleCloseModal = () => {
    setIsOpen(false)
    setEditing(false)
    setEditingId(null)
    reset()
    setUploadedFiles({ featuredImage: '', pdf_file: '' })
  }

  const handleAddClick = () => {
    setIsOpen(true)
    setEditing(false)
    setEditingId(null)
    reset()
    setUploadedFiles({ featuredImage: '', pdf_file: '' })
  }

  const saveVacancy = async (data, asDraft) => {
    try {
      if (asDraft) setSubmittingDraft(true)
      else setSubmitting(true)
      const payload = {
        ...data,
        author_id,
        featuredImage: uploadedFiles.featuredImage || data.featuredImage,
        pdf_file: uploadedFiles.pdf_file || data.pdf_file || '',
        status: asDraft ? 'draft' : 'published',
        slug: data.slug || data.slug,
        meta_description: data.meta_description
      }

      const method = editing ? 'PUT' : 'POST'
      const url = editing
        ? `${process.env.baseUrl}/vacancy?id=${editingId}`
        : `${process.env.baseUrl}/vacancy`

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save vacancy')
      }
      toast({
        title: editing ? 'Vacancy Updated' : 'Vacancy Created',
        description: asDraft
          ? 'Vacancy saved as draft'
          : editing
            ? 'Vacancy updated successfully'
            : 'Vacancy created successfully'
      })
      handleCloseModal()
      loadVacancies(pagination.currentPage, undefined, undefined)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save vacancy',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
      setSubmittingDraft(false)
    }
  }

  const onSubmit = async (data) => {
    await saveVacancy(data, false)
  }

  const onSaveDraft = () => {
    handleSubmit((data) => saveVacancy(data, true))()
  }

  const handleEdit = async (slug) => {
    try {
      setEditing(true)
      setLoading(true)
      setIsOpen(true)

      const response = await authFetch(
        `${process.env.baseUrl}/vacancy/${slug}`
      )
      const data = await response.json()
      const vacancy = data.item

      setEditingId(vacancy.id)
      setValue('title', vacancy.title)
      setValue('description', vacancy.description || '')
      setValue('content', vacancy.content || '')
      setValue('featuredImage', vacancy.featuredImage || '')
      setValue('pdf_file', vacancy.pdf_file || '')
      setValue(
        'associated_organization_name',
        vacancy.associated_organization_name || ''
      )
      setValue('status', vacancy.status === 'draft' ? 'draft' : 'published')
      setValue('slug', vacancy.slug || vacancy.slug || '')
      setValue('meta_description', vacancy.meta_description || '')
      setUploadedFiles({
        featuredImage: vacancy.featuredImage || '',
        pdf_file: vacancy.pdf_file || ''
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch vacancy details',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

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
        `${process.env.baseUrl}/vacancy?id=${deleteId}`,
        { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
      )
      const res = await response.json()
      if (!response.ok)
        throw new Error(res.message || 'Failed to delete vacancy')
      toast({
        title: 'Deleted',
        description: res.message || 'Vacancy deleted'
      })
      loadVacancies(pagination.currentPage)
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
      const response = await authFetch(`${process.env.baseUrl}/vacancy/${slug}`)
      if (!response.ok) throw new Error('Failed to fetch vacancy details')
      const data = await response.json()
      setViewVacancyData(data.item)
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load vacancy details',
        variant: 'destructive'
      })
      setViewModalOpen(false)
    } finally {
      setLoadingView(false)
    }
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (value === '') {
      loadVacancies(pagination.currentPage, '', undefined)
      return
    }
    searchDebounceRef.current = setTimeout(
      () => loadVacancies(1, value, undefined),
      350
    )
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    loadVacancies(1, undefined, status)
  }

  const columns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
        cell: ({ row }) => {
          const { title, slug } = row.original
          return (
            <Link
              href={slug ? `/vacancies/${slug}` : '#'}
              target='_blank'
              rel='noopener noreferrer'
              className='font-medium text-gray-900 hover:text-[#387cae] hover:underline'
            >
              {title}
            </Link>
          )
        }
      },
      {
        header: 'Organization / Institution',
        accessorKey: 'associated_organization_name',
        cell: ({ row }) => {
          const org = row.original.associated_organization_name
          return org ? (
            <span className='px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium'>
              {org}
            </span>
          ) : (
            <span className='text-gray-400 text-sm'>—</span>
          )
        }
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: ({ getValue }) => {
          const text = getValue()
          return (
            <span className='text-gray-600 text-sm'>
              {text?.length > 80 ? `${text.substring(0, 80)}...` : text || '—'}
            </span>
          )
        }
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <div className='flex gap-1'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => handleView(row.original.slug)}
              className='hover:bg-blue-50 text-blue-600'
              title='View Details'
            >
              <Eye className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => handleEdit(row.original.slug)}
              className='hover:bg-amber-50 text-amber-600'
              title='Edit'
            >
              <Edit2 className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
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
    [requireAdmin]
  )

  return (
    <div className='w-full'>
      {/* Header card — aligned with consultancy dashboard */}
      <div className='sticky mb-3 top-0 z-30 bg-[#F7F8FA] py-3'>
        <div className='bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-md bg-[#387cae]/10 flex items-center justify-center shrink-0'>
              <Briefcase size={17} className='text-[#387cae]' strokeWidth={2} />
            </div>
            <div>
              <p className='text-sm font-bold text-gray-800'>Vacancies</p>
              <p className='text-xs text-gray-400 flex items-center gap-1.5'>
                {tableLoading ? (
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
                placeholder='Search vacancies…'
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
              onClick={handleAddClick}
              className='bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 h-9 px-4 rounded-md text-sm font-semibold shrink-0'
            >
              <Plus className='w-4 h-4' />
              Add Vacancy
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-md shadow-sm border overflow-hidden'>
        <Table
          loading={tableLoading}
          data={vacancies}
          columns={columns}
          pagination={pagination}
          onPageChange={(newPage) =>
            loadVacancies(newPage, undefined, undefined)
          }
          showSearch={false}
        />
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={handleCloseModal}
        closeOnOutsideClick={false}
        className='max-w-6xl'
      >
        <DialogContent className='max-w-6xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-gray-50/50'>
          <DialogHeader className='px-6 py-4 border-b shrink-0 bg-white'>
            <DialogTitle className='text-lg font-semibold text-gray-900'>
              {editing ? 'Edit Vacancy' : 'Add New Vacancy'}
            </DialogTitle>
            <DialogClose onClick={handleCloseModal} />
          </DialogHeader>

          <form
            id='vacancy-form'
            className='flex flex-col flex-1 min-h-0 max-h-[calc(90vh-56px)]'
            onSubmit={(e) => e.preventDefault()}
          >
            <div className='flex-1 overflow-y-auto p-8 sidebar-scrollbar'>
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6'>
                {/* Left Column (8/12) */}
                <div className='lg:col-span-8 space-y-8'>
                  {/* Basic Information */}
                  <section className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6'>
                    <h3 className='text-base font-semibold text-slate-800 border-b pb-2 flex items-center gap-2'>
                      <Briefcase size={18} className='text-[#387cae]' />
                      Vacancy Information
                    </h3>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='space-y-2'>
                        <Label required>Vacancy Title</Label>
                        <Input
                          placeholder='Enter vacancy title'
                          {...register('title', {
                            required: 'Title is required'
                          })}
                          className={errors.title ? 'border-red-400' : ''}
                        />
                        {errors.title && (
                          <p className='text-xs text-red-500'>
                            {errors.title.message}
                          </p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label>Associated Organization / Institution</Label>
                        <Input
                          placeholder='Enter organization or institution name'
                          {...register('associated_organization_name')}
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label>Short Description</Label>
                      <Textarea
                        placeholder='Enter a brief summary of the vacancy...'
                        {...register('description')}
                        className='min-h-[100px]'
                      />
                    </div>
                  </section>

                  {/* Content */}
                  <section className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6'>
                    <h3 className='text-base font-semibold text-slate-800 border-b pb-2 flex items-center gap-2'>
                      <FileText size={18} className='text-[#387cae]' />
                      Detailed Content
                    </h3>
                    <div className='space-y-2'>
                      <Label>Content</Label>
                      <Controller
                        name='content'
                        control={control}
                        render={({ field }) => (
                          <TipTapEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder='Enter detailed vacancy content, requirements, responsibilities...'
                          />
                        )}
                      />
                    </div>
                  </section>
                </div>

                {/* Right Column (4/12) */}
                <div className='lg:col-span-4 space-y-8'>
                  {/* Media */}
                  <section className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4'>
                    <h3 className='text-base font-semibold text-slate-800 border-b pb-2 flex items-center gap-2'>
                      <Plus size={18} className='text-[#387cae]' />
                      Media & Attachments
                    </h3>
                    <div className='space-y-6'>
                      <div className='space-y-2'>
                        <FileUpload
                          label='Featured Image (Optional)'
                          onUploadComplete={(url) => {
                            setUploadedFiles((prev) => ({
                              ...prev,
                              featuredImage: url
                            }))
                            setValue('featuredImage', url)
                          }}
                          defaultPreview={uploadedFiles.featuredImage}
                        />
                      </div>
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
                  </section>

                  {/* SEO Settings */}
                  <section className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4'>
                    <h3 className='text-base font-semibold text-slate-800 border-b pb-2 flex items-center gap-2'>
                      <Settings size={18} className='text-[#387cae]' />
                      SEO Settings
                    </h3>
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
                  </section>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className='shrink-0 flex justify-end items-center gap-3 p-6 bg-white border-t border-gray-100 z-20'>
              <Button
                type='button'
                variant='outline'
                onClick={handleCloseModal}
                disabled={submitting || submittingDraft || loading}
              >
                Cancel
              </Button>
              <Button
                type='button'
                variant='secondary'
                disabled={submitting || submittingDraft || loading}
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
                disabled={submitting || submittingDraft || loading}
                onClick={() => handleSubmit(onSubmit)()}
                className='bg-[#387cae] hover:bg-[#2d658d] text-white gap-2'
              >
                {submitting ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    <span>Saving…</span>
                  </>
                ) : editing ? (
                  <>
                    <Check className='w-4 h-4' />
                    <span>Update Vacancy</span>
                  </>
                ) : (
                  <>
                    <Plus className='w-4 h-4' />
                    <span>Create Vacancy</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title='Confirm Deletion'
        message='Are you sure you want to delete this vacancy? This action cannot be undone.'
      />

      {/* View Vacancy Modal */}
      <Dialog
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false)
          setViewVacancyData(null)
        }}
        className='max-w-3xl'
      >
        <DialogContent className='max-w-3xl max-h-[90vh] flex flex-col p-0'>
          <DialogHeader className='px-6 py-4 border-b'>
            <DialogTitle className='text-lg font-semibold text-gray-900'>
              Vacancy Details
            </DialogTitle>
            <DialogClose
              onClick={() => {
                setViewModalOpen(false)
                setViewVacancyData(null)
              }}
            />
          </DialogHeader>

          <div className='flex-1 overflow-y-auto p-6'>
            {loadingView ? (
              <div className='flex justify-center items-center h-48 text-gray-400'>
                Loading...
              </div>
            ) : viewVacancyData ? (
              <div className='space-y-6'>
                {viewVacancyData.featuredImage && (
                  <div className='w-full h-56 rounded-md overflow-hidden border'>
                    <img
                      src={viewVacancyData.featuredImage}
                      alt={viewVacancyData.title}
                      className='w-full h-full object-cover'
                    />
                  </div>
                )}

                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    {viewVacancyData.title}
                  </h2>
                  {viewVacancyData.associated_organization_name && (
                    <span className='mt-2 inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium'>
                      {viewVacancyData.associated_organization_name}
                    </span>
                  )}
                </div>

                {viewVacancyData.description && (
                  <div className='bg-gray-50 p-4 rounded-md border'>
                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                      Description
                    </h3>
                    <div
                      className='text-gray-700 prose prose-sm max-w-none'
                      dangerouslySetInnerHTML={{
                        __html: viewVacancyData.description
                      }}
                    />
                  </div>
                )}

                {viewVacancyData.content && (
                  <div>
                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                      Content
                    </h3>
                    <div
                      className='text-gray-700 prose prose-sm max-w-none'
                      dangerouslySetInnerHTML={{
                        __html: viewVacancyData.content
                      }}
                    />
                  </div>
                )}

                {viewVacancyData.pdf_file && (
                  <div>
                    <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                      Attachment (PDF)
                    </h3>
                    <a
                      href={viewVacancyData.pdf_file}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm font-medium text-[#387cae] hover:underline'
                    >
                      View PDF
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className='text-center text-gray-400 py-12'>
                No vacancy data available.
              </p>
            )}
          </div>

          <div className='sticky bottom-0 bg-white border-t p-4 px-6 flex justify-end'>
            <Button
              variant='outline'
              onClick={() => {
                setViewModalOpen(false)
                setViewVacancyData(null)
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VacancyManager
