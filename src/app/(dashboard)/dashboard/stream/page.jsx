'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import Table from '@/ui/shadcn/DataTable'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { authFetch } from '@/app/utils/authFetch'
import { useToast } from '@/hooks/use-toast'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import useAdminPermission from '@/hooks/useAdminPermission'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from '@/ui/shadcn/dialog'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import SearchInput from '@/ui/molecules/SearchInput'

export default function StreamForm() {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const { requireAdmin } = useAdminPermission()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { name: '', board_id: '' } })

  const [isOpen, setIsOpen] = useState(false)
  const [streams, setStreams] = useState([])
  const [boards, setBoards] = useState([])
  const [tableLoading, setTableLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editId, setEditingId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 })
  const abortControllerRef = useRef(null)

  useEffect(() => {
    setHeading('Stream Management')
    fetchStreams()
    fetchBoards()
    return () => setHeading(null)
  }, [setHeading])

  useEffect(() => {
    return () => { if (searchTimeout) clearTimeout(searchTimeout) }
  }, [searchTimeout])

  const fetchBoards = async () => {
    try {
      const res = await authFetch(`${process.env.baseUrl}/board?limit=100`)
      const data = await res.json()
      setBoards(data.items || [])
    } catch (error) {
      console.error('Failed to fetch boards', error)
    }
  }

  const fetchStreams = async (page = 1) => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    abortControllerRef.current = new AbortController()
    setTableLoading(true)
    try {
      const res = await authFetch(`${process.env.baseUrl}/stream?page=${page}`, { signal: abortControllerRef.current.signal })
      const data = await res.json()
      setStreams(data.items || [])
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 1,
        total: data.pagination?.totalCount || 0
      })
    } catch (error) {
      if (error.name === 'AbortError') return
      toast({
        title: 'Error',
        description: 'Failed to fetch streams',
        variant: 'destructive'
      })
    } finally {
      if (abortControllerRef.current?.signal?.aborted === false) setTableLoading(false)
    }
  }

  const handleCloseModal = () => { setIsOpen(false); setEditing(false); setEditingId(null); reset() }

  const onSubmit = async (data) => {
    try {
      if (editing) {
        const res = await authFetch(`${process.env.baseUrl}/stream?id=${editId}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error('Failed to update stream')
        toast({
          title: 'Success',
          description: 'Stream updated successfully!'
        })
      } else {
        const res = await authFetch(`${process.env.baseUrl}/stream`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
        })
        if (!res.ok) throw new Error('Failed to create stream')
        toast({
          title: 'Success',
          description: 'Stream created successfully!'
        })
      }
      handleCloseModal()
      fetchStreams(pagination.currentPage)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save stream',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (stream) => {
    setEditing(true)
    setIsOpen(true)
    setEditingId(stream.id)
    setValue('name', stream.name)
    setValue('board_id', stream.board_id || '')
  }

  const handleSearchInput = (value) => {
    setSearchQuery(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    if (value === '') handleSearch('')
    else setSearchTimeout(setTimeout(() => handleSearch(value), 300))
  }

  const handleDeleteClick = (id) => requireAdmin(() => { setDeleteId(id); setIsDialogOpen(true) })

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      const res = await authFetch(`${process.env.baseUrl}/stream?id=${deleteId}`, { method: 'DELETE' })
      const data = await res.json()
      toast({
        title: 'Stream Deleted',
        description: data.message || 'Stream deleted successfully'
      })
      fetchStreams(pagination.currentPage)
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete',
        variant: 'destructive'
      })
    } finally {
      setIsDialogOpen(false)
      setDeleteId(null)
    }
  }

  const handleSearch = async (query) => {
    if (!query) { fetchStreams(); return }
    try {
      const res = await authFetch(`${process.env.baseUrl}/stream?q=${query}`)
      if (res.ok) {
        const data = await res.json()
        setStreams(data.items || [])
        if (data.pagination) setPagination({ currentPage: data.pagination.currentPage, totalPages: data.pagination.totalPages, total: data.pagination.totalCount })
      } else setStreams([])
    } catch { setStreams([]) }
  }

  const columns = useMemo(() => [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>
    },
    {
      header: 'Board',
      accessorKey: 'board.name',
      cell: ({ row }) => <span className="text-gray-600">{row.original.board?.name || 'N/A'}</span>
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className='flex gap-1'>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)} className='hover:bg-amber-50 text-amber-600' title="Edit">
            <Edit2 className='w-4 h-4' />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(row.original.id)} className='hover:bg-red-50 text-red-600' title="Delete">
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      )
    }
  ], [requireAdmin])

  return (
    <div className='w-full'>
      {/* Header */}
      <div className='sticky top-0 z-30 bg-[#F7F8FA] py-4'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-md shadow-sm border'>
          <SearchInput value={searchQuery} onChange={(e) => handleSearchInput(e.target.value)} placeholder='Search streams...' className='max-w-md w-full' />
          <Button onClick={() => { setIsOpen(true); setEditing(false); setEditingId(null); reset() }} className="bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Stream
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table loading={tableLoading} data={streams} columns={columns} pagination={pagination} onPageChange={(p) => fetchStreams(p)} showSearch={false} />
      </div>

      {/* Create / Edit Modal */}
      <Dialog isOpen={isOpen} onClose={handleCloseModal} className='max-w-md'>
        <DialogContent className='max-w-md flex flex-col p-0'>
          <DialogHeader className='px-6 py-4 border-b'>
            <DialogTitle className="text-lg font-semibold text-gray-900">{editing ? 'Edit Stream' : 'Add Stream'}</DialogTitle>
            <DialogClose onClick={handleCloseModal} />
          </DialogHeader>
          <div className='p-6'>
            <form id="stream-form" onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
              <div className="space-y-2">
                <Label htmlFor="name" required>Name</Label>
                <Input
                  id="name"
                  placeholder='e.g. Science'
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.name && <p className='text-xs text-destructive mt-1'>{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="board_id" required>Board</Label>
                <select
                  id="board_id"
                  {...register('board_id', { required: 'Board is required' })}
                  className={`w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.board_id ? 'border-destructive' : ''}`}
                >
                  <option value="">Select Board</option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>{board.name}</option>
                  ))}
                </select>
                {errors.board_id && <p className='text-xs text-destructive mt-1'>{errors.board_id.message}</p>}
              </div>
            </form>
          </div>
          <div className='px-6 py-4 border-t flex justify-end gap-3'>
            <Button type='button' variant='outline' onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button>
            <Button type='submit' form="stream-form" disabled={isSubmitting} className='bg-[#387cae] hover:bg-[#387cae]/90 text-white'>
              {isSubmitting ? 'Saving…' : editing ? 'Update Stream' : 'Create Stream'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setDeleteId(null) }}
        onConfirm={handleDeleteConfirm}
        title='Confirm Deletion'
        message='Are you sure you want to delete this stream? This action cannot be undone.'
        confirmText='Delete'
        cancelText='Cancel'
      />
    </div>
  )
}
