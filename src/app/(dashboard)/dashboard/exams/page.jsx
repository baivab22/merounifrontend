'use client'
import { useToast } from '@/hooks/use-toast'
import { Edit2, Eye, Plus, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { authFetch } from '@/app/utils/authFetch'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import useAdminPermission from '@/hooks/useAdminPermission'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import SearchInput from '@/ui/molecules/SearchInput'
import { Button } from '@/ui/shadcn/button'
import Table from '@/ui/shadcn/DataTable'
import { formatDate } from '@/utils/date.util'
import { createExam, deleteExam, getAllExams } from './actions'
import ExamFormModal from './components/ExamFormModal'
import ExamViewModal from './ExamViewModal'

export default function ExamManager() {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const author_id = useSelector((state) => state.user.data?.id)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { requireAdmin } = useAdminPermission()

  const [exams, setExams] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingExam, setViewingExam] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  })

  // Removed old useForm and secondary selected states (moved to ExamFormModal)

  useEffect(() => {
    setHeading('Exam Management')
    loadExams()
    return () => setHeading(null)
  }, [setHeading])

  useEffect(() => {
    const addParam = searchParams.get('add')
    if (addParam === 'true') {
      handleAdd()
      router.replace('/dashboard/exams', { scroll: false })
    }
  }, [searchParams, router])

  const loadExams = async (page = 1, query = searchQuery, status = statusFilter) => {
    setTableLoading(true)
    try {
      let url = `${process.env.baseUrl}/exam/admin/list?page=${page}&sortBy=createdAt&order=DESC`
      if (query) {
        url += `&q=${encodeURIComponent(query)}`
      }
      if (status && status !== 'all') {
        url += `&status=${status}`
      }

      const res = await authFetch(url)
      const response = await res.json()


      const flattenedItems = (response.items || []).map((exam) => {
        const examDetail = exam.exam_details?.[0] || {}
        const appDetail = exam.application_details?.[0] || {}
        return {
          ...exam,
          // Extract nested fields for table and form
          exam_type: exam.exam_type || examDetail.exam_type || 'Written',
          question_type: exam.question_type || examDetail.question_type || 'MCQ',
          duration: exam.duration || examDetail.duration || '',
          full_marks: exam.full_marks || examDetail.full_marks || '',
          pass_marks: exam.pass_marks || examDetail.pass_marks || '',
          questions_count: exam.questions_count || examDetail.number_of_question || '',
          normal_fee: exam.normal_fee || appDetail.normal_fee || '',
          late_fee: exam.late_fee || appDetail.late_fee || '',
          opening_date: exam.opening_date || appDetail.opening_date || null,
          closing_date: exam.closing_date || appDetail.closing_date || null,
          exam_date: exam.exam_date || appDetail.exam_date || null
        }
      })

      setExams(flattenedItems)
      setPagination({
        currentPage: response.pagination?.currentPage || 1,
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.totalCount || 0
      })
    } catch (error) {
      console.error('Failed to fetch exams:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch exams',
        variant: 'destructive'
      })
    } finally {
      setTableLoading(false)
      setTableLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadExams(1, query, statusFilter)
  }

  const handleStatusChange = (status) => {
    setStatusFilter(status)
    loadExams(1, searchQuery, status)
  }

  const handleAdd = () => {
    setEditingId(null)
    setIsOpen(true)
  }

  const handleEdit = (exam) => {
    setEditingId(exam.id)
    setIsOpen(true)
  }

  const handleModalClose = () => {
    setIsOpen(false)
    setEditingId(null)
  }

  const onSubmit = async (data) => {
    // Basic date validation
    if (data.opening_date && data.closing_date && new Date(data.opening_date) >= new Date(data.closing_date)) {
      toast({
        title: 'Invalid Dates',
        description: 'Opening date must be before closing date',
        variant: 'destructive'
      })
      return
    }
    if (data.closing_date && data.exam_date && new Date(data.closing_date) >= new Date(data.exam_date)) {
      toast({
        title: 'Invalid Dates',
        description: 'Closing date must be before exam date',
        variant: 'destructive'
      })
      return
    }

    try {
      setTableLoading(true)
      const formattedData = {
        ...data,
        author: author_id,
        full_marks: data.full_marks ? Number(data.full_marks) : undefined,
        pass_marks: data.pass_marks ? Number(data.pass_marks) : undefined,
        questions_count: data.questions_count ? Number(data.questions_count) : undefined,
        normal_fee: data.normal_fee ? Number(data.normal_fee) : undefined,
        late_fee: data.late_fee ? Number(data.late_fee) : undefined,
        category_id: data.category_id || undefined,
        ...(editingId && { id: editingId })
      }

      // Convert all null and "" to undefined before sending to API
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === null || formattedData[key] === "") {
          formattedData[key] = undefined
        }
      })

      await createExam(formattedData)
      toast({
        title: 'Success',
        description: `Exam ${editingId ? 'updated' : 'created'} successfully`
      })
      handleModalClose()
      loadExams()
    } catch (error) {
      console.error('Error saving exam:', error)
      toast({
        title: 'Error',
        description: error.message || `Failed to ${editingId ? 'update' : 'create'} exam`,
        variant: 'destructive'
      })
    } finally {
      setTableLoading(false)
    }
  }

  const handleDeleteClick = (id) => {
    requireAdmin(() => {
      setDeleteId(id)
      setIsDialogOpen(true)
    })
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteExam(deleteId)
      toast({
        title: 'Exam Deleted',
        description: 'Exam deleted successfully'
      })
      loadExams()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete exam',
        variant: 'destructive'
      })
    } finally {
      setIsDialogOpen(false)
      setDeleteId(null)
    }
  }

  const columns = useMemo(() => [
    {
      header: 'S.N.',
      accessorKey: 'id',
      cell: ({ row }) => (
        <span className="text-gray-500 font-medium">
          {(pagination.currentPage - 1) * (pagination.limit || 10) + row.index + 1}
        </span>
      )
    },
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.title}</div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category.title',
      cell: ({ row }) => (
        <span className='px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium'>
          {row.original.category?.title || 'N/A'}
        </span>
      )
    },
    {
      header: 'Level',
      accessorKey: 'level.title',
      cell: ({ row }) => (
        <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium'>
          {row.original.level?.title || 'N/A'}
        </span>
      )
    },
    {
      header: 'Affiliation',
      accessorKey: 'university.fullname',
      cell: ({ row }) => {
        const title = row.original.university?.fullname || row.original.affiliation
        return title ? (
          <span className='px-2 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium'>
            {title}
          </span>
        ) : (
          <span className="text-gray-400">N/A</span>
        )
      }
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status || 'published'
        const isPublished = status === 'published'
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPublished
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}>
            {status}
          </span>
        )
      }
    },
    {
      header: 'Exam Date',
      accessorKey: 'exam_date',
      cell: ({ row }) => row.original.exam_date ? formatDate(row.original.exam_date) : 'N/A'
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <div className='flex gap-1'>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setViewingExam(row.original)
              setIsViewModalOpen(true)
            }}
            className='hover:bg-blue-50 text-blue-600'
            title="View Details"
          >
            <Eye className='w-4 h-4' />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
            className='hover:bg-amber-50 text-amber-600'
            title="Edit"
          >
            <Edit2 className='w-4 h-4' />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(row.original.id)}
            className='hover:bg-red-50 text-red-600'
            title="Delete"
          >
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      )
    }
  ], [pagination])


  return (
    <div className='w-full'>

      <div className='flex flex-col mb-3 sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-md shadow-sm border'>
        <div className='flex flex-col sm:flex-row gap-4 w-full max-w-2xl'>
          <SearchInput
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder='Search exams by title...'
            className='flex-1'
          />
          <div className='w-full sm:w-48'>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className='flex h-11 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#387cae] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium text-gray-700'
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <Button onClick={handleAdd} className="bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 h-11 px-6 rounded-md shadow-sm transition-all shrink-0 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Exam
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table
          loading={tableLoading}
          data={exams}
          columns={columns}
          pagination={pagination}
          onPageChange={(page) => loadExams(page, searchQuery, statusFilter)}
          showSearch={false}
        />
      </div>

      {/* Form Modal */}
      <ExamFormModal
        isOpen={isOpen}
        onClose={handleModalClose}
        editingId={editingId}
        initialData={exams.find(e => e.id === editingId)}
        onSave={onSubmit}
        submitting={tableLoading}
        author_id={author_id}
      />

      <ConfirmationDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title='Confirm Deletion'
        message='Are you sure you want to delete this exam? This action cannot be undone and will remove all associated details.'
      />

      <ExamViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        exam={viewingExam}
      />
    </div>
  )
}
