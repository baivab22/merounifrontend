'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { fetchCategories } from './action'
import Table from '@/ui/shadcn/DataTable'
import { Edit2, Trash2, Eye, Plus } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { authFetch } from '@/app/utils/authFetch'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/ui/shadcn/dialog'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { Textarea } from '@/ui/shadcn/textarea'
import SearchInput from '@/ui/molecules/SearchInput'
import { formatDate } from '@/utils/date.util'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'

export default function CategoryManager() {
  const { setHeading } = usePageHeading()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: { title: '', description: '', type: '', parent_id: null }
  })

  const formParentId = watch('parent_id')

  const [categories, setCategories] = useState([])
  const [tableLoading, setTableLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editing, setEditing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingCategory, setViewingCategory] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [selectedParent, setSelectedParent] = useState(null)
  const [parentFilter, setParentFilter] = useState(null)

  useEffect(() => {
    setHeading('Category Management')
    loadCategories()
    return () => setHeading(null)
  }, [setHeading])

  useEffect(() => {
    loadCategories(1)
  }, [selectedType, parentFilter])

  useEffect(() => {
    return () => { if (searchTimeout) clearTimeout(searchTimeout) }
  }, [searchTimeout])

  const loadCategories = async (page = 1, query = searchQuery) => {
    try {
      setTableLoading(true)
      const response = await fetchCategories(page, 10, selectedType, parentFilter?.id || "", query)
      setCategories(response.items)
      setPagination({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        total: response.pagination.totalCount
      })
    } catch (err) {
      toast.error('Failed to load categories')
    } finally {
      setTableLoading(false)
    }
  }

  const handleCloseModal = () => {
    setIsOpen(false)
    setEditing(false)
    setEditingId(null)
    setSelectedParent(null)
    reset()
  }

  const handleAddClick = () => {
    setIsOpen(true)
    setEditing(false)
    setEditingId(null)
    reset()
  }

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        const res = await authFetch(`${process.env.baseUrl}/category?category_id=${editingId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error('Failed to update category')
        toast.success('Category updated successfully')
      } else {
        const res = await authFetch(`${process.env.baseUrl}/category`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error('Failed to create category')
        toast.success('Category created successfully')
      }
      handleCloseModal()
      loadCategories(pagination.currentPage)
    } catch (err) {
      toast.error(err.message || `Failed to ${editingId ? 'update' : 'create'} category`)
    }
  }

  const handleEdit = (category) => {
    setEditingId(category.id)
    setEditing(true)
    setIsOpen(true)
    setValue('title', category.title)
    setValue('description', category.description || '')
    setValue('type', category.type || '')
    setValue('parent_id', category.parent_id || null)

    if (category.parent_id) {
      // Find the parent in current categories, or it might need fetching
      const parent = categories.find(c => c.id === category.parent_id)
      if (parent) {
        setSelectedParent(parent)
      } else {
        // If not in current list, we could fetch it, but for now we'll just set what we have
        // Ideally we fetch the parent by ID
        fetchParentById(category.parent_id)
      }
    } else {
      setSelectedParent(null)
    }
  }

  const fetchParentById = async (id) => {
    try {
      const res = await authFetch(`${process.env.baseUrl}/category?category_id=${id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedParent(data)
      }
    } catch (err) {
      console.error("Failed to fetch parent", err)
    }
  }

  const handleView = (category) => {
    setViewingCategory(category)
    setIsViewOpen(true)
  }

  const handleDeleteClick = (id) => { setDeleteId(id); setIsDialogOpen(true) }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      const res = await authFetch(`${process.env.baseUrl}/category?category_id=${deleteId}`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      toast.success(data.message || 'Category deleted')
      loadCategories(pagination.currentPage)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setIsDialogOpen(false)
      setDeleteId(null)
    }
  }

  const handleSearch = async (query) => {
    loadCategories(1, query)
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    if (value === '') handleSearch('')
    else setSearchTimeout(setTimeout(() => handleSearch(value), 300))
  }

  const handleParentSearch = async (query) => {
    try {
      // Fetch categories with parent_id=null
      let fetchUrl = `${process.env.baseUrl}/category`
      if (query) fetchUrl += `&q=${query}`

      const res = await authFetch(fetchUrl)
      if (res.ok) {
        const data = await res.json()
        // Filter out the current category being edited to avoid circular dependency
        return data.items.filter(cat => cat.id !== editingId)
      }
      return []
    } catch (err) {
      console.error("Parent search failed", err)
      return []
    }
  }

  const columns = useMemo(() => [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.title}</span>
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ getValue }) => getValue()
        ? <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold uppercase">{getValue()}</span>
        : <span className="text-gray-400 italic text-xs">—</span>
    },
    {
      header: 'Parent',
      accessorKey: 'parent',
      cell: ({ row }) => row.original.parent?.title
        ? <span className="text-gray-600 text-xs font-medium">{row.original.parent.title}</span>
        : <span className="text-gray-400 italic text-xs">—</span>
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: ({ getValue }) => {
        const v = getValue()
        if (!v) return <span className="text-gray-400 italic text-xs">—</span>
        return <span className="text-gray-600 text-sm">{v.length > 60 ? `${v.substring(0, 60)}…` : v}</span>
      }
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className='flex gap-1'>
          <Button variant="ghost" size="icon" onClick={() => handleView(row.original)} className='hover:bg-blue-50 text-blue-600' title="View">
            <Eye className='w-4 h-4' />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)} className='hover:bg-amber-50 text-amber-600' title="Edit">
            <Edit2 className='w-4 h-4' />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(row.original.id)} className='hover:bg-red-50 text-red-600' title="Delete">
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      )
    }
  ], [])

  return (
    <div className='w-full'>

      <ToastContainer />

      {/* Header */}
      <div className='sticky top-0 z-30 bg-[#F7F8FA] py-4'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-md shadow-sm border'>
          <div className="flex flex-col sm:flex-row gap-3 w-full items-start sm:items-center">
            <SearchInput value={searchQuery} onChange={(e) => handleSearchInput(e.target.value)} placeholder='Search categories...' className='max-w-md w-full' />

            <SearchSelectCreate
              placeholder="Filter by Type..."
              onSearch={async (q) => {
                const types = [
                  { id: 'BLOG', title: 'Blog' },
                  { id: 'EVENT', title: 'Event' },
                  { id: 'NEWS', title: 'News' },
                  { id: 'MATERIAL', title: 'Material' },
                  { id: 'SCHOLARSHIP', title: 'Scholarship' },
                  { id: 'EXAM', title: 'Exam' }
                ]
                return types.filter(t => t.title.toLowerCase().includes(q.toLowerCase()))
              }}
              onSelect={(item) => setSelectedType(item.id)}
              onRemove={() => setSelectedType('')}
              selectedItems={selectedType ? { id: selectedType, title: selectedType } : null}
              isMulti={false}
              displayKey="title"
              valueKey="id"
              className="max-w-[200px]"
              inputSize="sm"
            />

            <SearchSelectCreate
              placeholder="Filter by Parent..."
              onSearch={handleParentSearch}
              onSelect={(item) => setParentFilter(item)}
              onRemove={() => setParentFilter(null)}
              selectedItems={parentFilter}
              isMulti={false}
              displayKey="title"
              valueKey="id"
              className="max-w-[200px]"
              inputSize="sm"
            />
          </div>

          <Button onClick={handleAddClick} className="bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Dialog isOpen={isOpen}

        onClose={handleCloseModal} className='max-w-lg'>
        <DialogContent className='max-w-lg max-h-[90vh] flex flex-col p-0'>
          <DialogHeader className='px-6 py-4 border-b'>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              {editing ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
            <DialogClose onClick={handleCloseModal} />
          </DialogHeader>

          <div className='flex-1 overflow-y-auto p-6'>
            <form id="category-form" onSubmit={handleSubmit(onSubmit)} className='space-y-5'>

              <div className="space-y-2">
                <Label htmlFor="title" required>Title</Label>
                <Input
                  id="title"
                  placeholder='e.g. Technology'
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 2, message: 'Title must be at least 2 characters' }
                  })}
                  className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.title && <p className='text-xs text-destructive mt-1'>{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" required>Type</Label>
                <SearchSelectCreate
                  placeholder="Select type…"
                  onSearch={async (q) => {
                    const types = [
                      { id: 'BLOG', title: 'Blog' },
                      { id: 'EVENT', title: 'Event' },
                      { id: 'NEWS', title: 'News' },
                      { id: 'MATERIAL', title: 'Material' },
                      { id: 'SCHOLARSHIP', title: 'Scholarship' },
                      { id: 'EXAM', title: 'Exam' }
                    ]
                    return types.filter(t => t.title.toLowerCase().includes(q.toLowerCase()))
                  }}
                  onSelect={(item) => setValue('type', item.id, { shouldValidate: true })}
                  onRemove={() => setValue('type', '', { shouldValidate: true })}
                  selectedItems={watch('type') ? { id: watch('type'), title: watch('type') } : null}
                  isMulti={false}
                  displayKey="title"
                  valueKey="id"
                  inputSize="sm"
                  className={errors.type ? 'border-destructive' : ''}
                />
                {errors.type && <p className='text-xs text-destructive mt-1'>{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder='Brief description of this category…'
                  {...register('description', { maxLength: { value: 500, message: 'Max 500 characters' } })}
                  rows={3}
                  className={`resize-none ${errors.description ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {errors.description && <p className='text-xs text-destructive mt-1'>{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Parent Category (Optional)</Label>
                <SearchSelectCreate
                  placeholder="Selection Parent Category..."
                  onSearch={handleParentSearch}
                  onSelect={(item) => {
                    setSelectedParent(item)
                    setValue('parent_id', item.id)
                  }}
                  onRemove={() => {
                    setSelectedParent(null)
                    setValue('parent_id', null)
                  }}
                  selectedItems={selectedParent}
                  isMulti={false}
                  displayKey="title"
                  valueKey="id"
                />
                <p className='text-[10px] text-gray-500'>Leave empty if this is a top-level category.</p>
              </div>

            </form>
          </div>

          <div className='sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3'>
            <Button type='button' variant='outline' onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button>
            <Button type='submit' form="category-form" disabled={isSubmitting} className='bg-[#387cae] hover:bg-[#387cae]/90 text-white'>
              {isSubmitting ? 'Processing…' : editing ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table data={categories} columns={columns} pagination={pagination} onPageChange={(p) => loadCategories(p)} showSearch={false} loading={tableLoading} />
      </div>

      {/* View Modal */}
      <Dialog isOpen={isViewOpen} onClose={() => { setIsViewOpen(false); setViewingCategory(null) }} className='max-w-lg'>
        <DialogContent className='max-w-lg max-h-[90vh] flex flex-col p-0'>
          <DialogHeader className='px-6 py-4 border-b'>
            <DialogTitle className="text-lg font-semibold text-gray-900">Category Details</DialogTitle>
            <DialogClose onClick={() => { setIsViewOpen(false); setViewingCategory(null) }} />
          </DialogHeader>
          <div className='flex-1 overflow-y-auto p-6 space-y-4'>
            <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Title</p>
              <p className="text-lg font-bold text-gray-900">{viewingCategory?.title}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Type</p>
              {viewingCategory?.type
                ? <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold uppercase">{viewingCategory.type}</span>
                : <span className="text-gray-400 italic text-sm">—</span>}
            </div>
            <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Description</p>
              <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{viewingCategory?.description || 'No description provided.'}</p>
            </div>
            {viewingCategory?.parent && (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Parent Category</p>
                <p className="text-sm font-medium text-gray-900">{viewingCategory.parent.title}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Created</p>
                <p className="text-sm text-gray-600">{formatDate(viewingCategory?.createdAt)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Updated</p>
                <p className="text-sm text-gray-600">{formatDate(viewingCategory?.updatedAt)}</p>
              </div>
            </div>
          </div>
          <div className='px-6 py-4 border-t flex justify-end'>
            <Button variant='outline' onClick={() => setIsViewOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setDeleteId(null) }}
        onConfirm={handleDeleteConfirm}
        title='Confirm Deletion'
        message='Are you sure you want to delete this category? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
      />
    </div>
  )
}
