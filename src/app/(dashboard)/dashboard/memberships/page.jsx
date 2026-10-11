'use client'

import { usePageHeading } from '@/contexts/PageHeadingContext'
import { useToast } from '@/hooks/use-toast'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import Loading from '@/ui/molecules/Loading'
import Table from '@/ui/shadcn/DataTable'
import EmptyState from '@/ui/shadcn/EmptyState'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/ui/shadcn/dialog'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { Select } from '@/ui/shadcn/select'
import { Textarea } from '@/ui/shadcn/textarea'
import { cn } from '@/app/lib/utils'
import { formatDate } from '@/utils/date.util'
import {
  BadgeCheck,
  Check,
  Copy,
  Crown,
  Edit2,
  Eye,
  Gem,
  Hourglass,
  Loader2,
  Plus,
  Settings,
  Shield,
  Trash2,
  Wallet
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  deleteMembership,
  deleteMembershipOption,
  getAllMemberships,
  getMembershipOptions,
  createMembershipOption,
  updateMembershipOption,
  updateMembershipStatus
} from './actions'
import MembershipApproveModal from './components/MembershipApproveModal'
import MembershipViewModal from './components/MembershipViewModal'

const MEMBERSHIP_META = {
  PLUS2: { icon: Shield, label: '+2 / Grade 12', badge: 'bg-gray-100 text-gray-700 border-gray-200' },
  BACHELORS: { icon: Crown, label: "Bachelor's", badge: 'bg-[#387cae]/10 text-[#387cae] border-[#387cae]/20' },
  GRADUATE: { icon: Gem, label: 'Graduate', badge: 'bg-purple-50 text-purple-700 border-purple-200' }
}

const OPTION_TYPES = [
  { value: 'LEVEL', label: 'Levels' },
  { value: 'CAREER_FIELD', label: 'Career fields & courses' },
  { value: 'PAYMENT_METHOD', label: 'Payment methods' }
]

const emptyOptionForm = {
  type: 'LEVEL',
  slug: '',
  label: '',
  description: '',
  fee: '',
  tagline: '',
  note: '',
  trainings: '',
  sort_order: 0,
  is_active: true
}

const normalizeSlug = (value) =>
  value
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9_-]/g, '')

const parseTrainings = (value) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split('|')
      return {
        title: title.trim(),
        description: rest.join('|').trim()
      }
    })
    .filter((training) => training.title)

const formatTrainings = (trainings = []) =>
  trainings
    .map((training) => {
      const title = training.title || training.t || ''
      const description = training.description || training.d || ''
      return description ? `${title} | ${description}` : title
    })
    .filter(Boolean)
    .join('\n')

const getOptionPayload = (form) => {
  const metadata = {}

  if (form.type === 'LEVEL') {
    if (form.fee) metadata.fee = form.fee
    if (form.tagline) metadata.tagline = form.tagline
    if (form.note) metadata.note = form.note
  }

  if (form.type === 'CAREER_FIELD') {
    metadata.trainings = parseTrainings(form.trainings)
  }

  return {
    type: form.type,
    slug: normalizeSlug(form.slug),
    label: form.label.trim(),
    description: form.description.trim() || null,
    metadata,
    sort_order: Number(form.sort_order) || 0,
    is_active: Boolean(form.is_active)
  }
}

const formFromOption = (option) => ({
  type: option.type,
  slug: option.slug,
  label: option.label,
  description: option.description || '',
  fee: option.metadata?.fee || '',
  tagline: option.metadata?.tagline || '',
  note: option.metadata?.note || '',
  trainings: formatTrainings(option.metadata?.trainings),
  sort_order: option.sort_order || 0,
  is_active: option.is_active !== false
})

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    EXPIRED: 'bg-gray-100 text-gray-600 border-gray-200'
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0',
        styles[status] || styles.PENDING
      )}
    >
      {status}
    </span>
  )
}

const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING':
      return {
        icon: <Hourglass className='w-4 h-4 text-yellow-600' />,
        card: 'bg-yellow-50 border-yellow-200',
        label: 'text-yellow-700'
      }
    case 'APPROVED':
      return {
        icon: <Check className='w-4 h-4 text-green-600' />,
        card: 'bg-green-50 border-green-200',
        label: 'text-green-700'
      }
    case 'REJECTED':
      return {
        icon: <Trash2 className='w-4 h-4 text-red-600' />,
        card: 'bg-red-50 border-red-200',
        label: 'text-red-700'
      }
    case 'EXPIRED':
      return {
        icon: <Wallet className='w-4 h-4 text-gray-500' />,
        card: 'bg-gray-50 border-gray-200',
        label: 'text-gray-600'
      }
    default:
      return {
        icon: <Hourglass className='w-4 h-4 text-yellow-600' />,
        card: 'bg-yellow-50 border-yellow-200',
        label: 'text-yellow-700'
      }
  }
}

const MembershipsPage = () => {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()

  const [memberships, setMemberships] = useState([])
  const [options, setOptions] = useState([])
  const [activeTab, setActiveTab] = useState('applications')
  const [optionTypeFilter, setOptionTypeFilter] = useState('LEVEL')
  const [optionModalOpen, setOptionModalOpen] = useState(false)
  const [optionForm, setOptionForm] = useState(emptyOptionForm)
  const [editingOption, setEditingOption] = useState(null)
  const [savingOption, setSavingOption] = useState(false)
  const [deletingOptionId, setDeletingOptionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  })
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const searchDebounceRef = useRef(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0
  })

  const [viewData, setViewData] = useState(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [approveData, setApproveData] = useState(null)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [approving, setApproving] = useState(false)

  const [deleteId, setDeleteId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setHeading('Student Memberships')
    return () => setHeading(null)
  }, [setHeading])

  const loadMemberships = useCallback(
    async (params = {}) => {
      try {
        setLoading(true)
        const data = await getAllMemberships({
          page: params.page ?? pagination.currentPage,
          limit: 10,
          status: params.status ?? (statusFilter || undefined),
          membershipType: params.type ?? (typeFilter || undefined),
          q: params.q ?? (searchQuery || undefined)
        })

        const items = data.memberships || []
        setMemberships(items)
        setPagination(
          data.pagination || {
            currentPage: 1,
            totalPages: 1,
            total: 0
          }
        )

        const total = data.pagination?.totalCount || items.length || 0
        setStats((prev) => ({ ...prev, total }))
      } catch (error) {
        console.error('Failed to load memberships:', error)
        toast({
          title: 'Error',
          description: error.message || 'Failed to load memberships',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    },
    [pagination.currentPage, statusFilter, typeFilter, searchQuery, toast]
  )

  useEffect(() => {
    loadMemberships()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.currentPage, statusFilter, typeFilter])

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  const handleSearch = useCallback(
    (value) => {
      setSearchQuery(value)
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = setTimeout(() => {
        loadMemberships({ q: value || undefined, page: 1 })
      }, 350)
    },
    [loadMemberships]
  )

  const handleCopyReference = useCallback(
    async (reference) => {
      try {
        await navigator.clipboard.writeText(reference)
        toast({ title: 'Reference copied', description: reference })
      } catch {
        toast({
          title: 'Could not copy',
          description: `Reference: ${reference}`,
          variant: 'destructive'
        })
      }
    },
    [toast]
  )

  const refreshStats = useCallback(async () => {
    try {
      const [allData, pendingData, approvedData, rejectedData, expiredData] =
        await Promise.all([
          getAllMemberships({ page: 1, limit: 1 }),
          getAllMemberships({ page: 1, limit: 1, status: 'PENDING' }),
          getAllMemberships({ page: 1, limit: 1, status: 'APPROVED' }),
          getAllMemberships({ page: 1, limit: 1, status: 'REJECTED' }),
          getAllMemberships({ page: 1, limit: 1, status: 'EXPIRED' })
        ])
      setStats({
        total: allData.pagination?.totalCount || 0,
        pending: pendingData.pagination?.totalCount || 0,
        approved: approvedData.pagination?.totalCount || 0,
        rejected: rejectedData.pagination?.totalCount || 0,
        expired: expiredData.pagination?.totalCount || 0
      })
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    }
  }, [])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  const loadOptions = useCallback(async () => {
    try {
      const data = await getMembershipOptions()
      setOptions(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load membership setup',
        variant: 'destructive'
      })
    }
  }, [toast])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  const optionLabelBySlug = useMemo(() => {
    return options.reduce((acc, option) => {
      acc[option.slug] = option.label
      return acc
    }, {})
  }, [options])

  const levelOptions = useMemo(
    () => options.filter((option) => option.type === 'LEVEL'),
    [options]
  )

  const visibleOptions = useMemo(
    () => options.filter((option) => option.type === optionTypeFilter),
    [options, optionTypeFilter]
  )

  const openCreateOption = (type = optionTypeFilter) => {
    setEditingOption(null)
    setOptionForm({ ...emptyOptionForm, type })
    setOptionModalOpen(true)
  }

  const openEditOption = (option) => {
    setEditingOption(option)
    setOptionForm(formFromOption(option))
    setOptionModalOpen(true)
  }

  const closeOptionModal = () => {
    if (savingOption) return
    setOptionModalOpen(false)
    setEditingOption(null)
    setOptionForm(emptyOptionForm)
  }

  const handleOptionChange = (key, value) => {
    setOptionForm((prev) => ({ ...prev, [key]: value }))
  }

  const saveOption = async (e) => {
    e.preventDefault()
    const payload = getOptionPayload(optionForm)
    if (!payload.slug || !payload.label) {
      toast({
        title: 'Missing details',
        description: 'Slug and label are required.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSavingOption(true)
      if (editingOption) {
        await updateMembershipOption(editingOption.id, payload)
      } else {
        await createMembershipOption(payload)
      }
      toast({
        title: 'Success',
        description: `Membership ${editingOption ? 'option updated' : 'option created'} successfully`
      })
      setOptionModalOpen(false)
      setEditingOption(null)
      setOptionForm(emptyOptionForm)
      loadOptions()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save membership option',
        variant: 'destructive'
      })
    } finally {
      setSavingOption(false)
    }
  }

  const handleDeleteOption = async (id) => {
    try {
      setDeletingOptionId(id)
      await deleteMembershipOption(id)
      toast({
        title: 'Success',
        description: 'Membership option deleted successfully'
      })
      loadOptions()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete membership option',
        variant: 'destructive'
      })
    } finally {
      setDeletingOptionId(null)
    }
  }

  const handleDeleteClick = useCallback((id) => {
    setDeleteId(id)
    setIsDialogOpen(true)
  }, [])

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setDeleteId(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    try {
      setDeleting(true)
      await deleteMembership(deleteId)
      toast({
        title: 'Success',
        description: 'Membership deleted successfully!'
      })
      setIsDialogOpen(false)
      setDeleteId(null)
      loadMemberships()
      refreshStats()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete membership',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleApproveSubmit = async (payload) => {
    if (!approveData) return
    try {
      setApproving(true)
      await updateMembershipStatus(approveData.id, payload)
      toast({
        title: 'Success',
        description: 'Membership status updated successfully!'
      })
      setIsApproveOpen(false)
      setApproveData(null)
      loadMemberships()
      refreshStats()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update membership status',
        variant: 'destructive'
      })
    } finally {
      setApproving(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        header: 'Reference',
        accessorKey: 'reference_id',
        cell: ({ getValue }) => {
          const reference = getValue()
          if (!reference)
            return <span className='text-xs text-gray-300'>—</span>
          return (
            <button
              type='button'
              onClick={() => handleCopyReference(reference)}
              title='Copy reference'
              className='inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-gray-700 transition-colors hover:border-[#387cae]/40 hover:bg-[#387cae]/5 hover:text-[#387cae]'
            >
              {reference}
              <Copy size={11} className='text-gray-400' />
            </button>
          )
        }
      },
      {
        header: 'Student',
        accessorKey: 'student_name',
        cell: ({ row }) => {
          const m = row.original
          const name =
            m.student_name ||
            (m.student
              ? `${m.student?.firstName || ''} ${m.student?.lastName || ''}`.trim()
              : null)
          const email = m.student_email || m.student?.email || 'No email'
          const phone = m.student_phone_no || m.student?.phoneNo || ''
          return (
            <div className='min-w-[160px]'>
              <p className='font-semibold text-gray-900 text-sm truncate'>
                {name || 'Guest Student'}
              </p>
              <p className='text-xs text-gray-400 truncate'>{email}</p>
              {phone && (
                <p className='text-xs text-gray-400 truncate'>{phone}</p>
              )}
            </div>
          )
        }
      },
      {
        header: 'Level',
        accessorKey: 'membership_type',
        cell: ({ getValue }) => {
          const type = getValue()
          const meta = MEMBERSHIP_META[type] || MEMBERSHIP_META.PLUS2
          const Icon = meta.icon
          const label = optionLabelBySlug[type] || meta.label || type
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
                meta.badge
              )}
            >
              <Icon size={13} />
              {label}
            </span>
          )
        }
      },
      {
        header: 'Field',
        accessorKey: 'career_field',
        cell: ({ row }) => {
          const { career_field, selected_trainings } = row.original
          if (!career_field)
            return <span className='text-gray-300'>—</span>
          let trainings = []
          try {
            trainings = selected_trainings ? JSON.parse(selected_trainings) : []
          } catch {
            trainings = []
          }
          return (
            <div className='min-w-[120px]'>
              <p className='text-xs font-semibold text-gray-800 capitalize'>
                {career_field === 'unsure'
                  ? 'Deciding later'
                  : optionLabelBySlug[career_field] || career_field}
              </p>
              {trainings.length > 0 && (
                <p className='text-[11px] text-gray-400 truncate max-w-[160px]'>
                  {trainings.length} training{trainings.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )
        }
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => <StatusBadge status={getValue()} />
      },
      {
        header: 'Duration',
        accessorKey: 'start_date',
        cell: ({ row }) => {
          const { start_date: start, end_date: end } = row.original
          if (!start && !end) return <span className='text-gray-400'>—</span>
          return (
            <div className='text-xs text-gray-600 min-w-[110px]'>
              <p>{start ? formatDate(start) : '—'} →</p>
              <p>{end ? formatDate(end) : '—'}</p>
            </div>
          )
        }
      },
      {
        header: 'Applied On',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => (
          <span className='text-xs text-gray-500 whitespace-nowrap'>
            {getValue() ? formatDate(getValue()) : '—'}
          </span>
        )
      },
      {
        header: 'Proof',
        accessorKey: 'payment_proof_url',
        cell: ({ getValue }) => {
          const url = getValue()
          if (!url) return <span className='text-gray-300'>—</span>
          return (
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-[11px] font-semibold text-[#387cae] hover:underline'
            >
              View
            </a>
          )
        }
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => {
          const m = row.original
          return (
            <div className='flex items-center justify-center gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setViewData(m)
                  setIsViewOpen(true)
                }}
                className='p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                title='View details'
              >
                <Eye className='w-4 h-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setApproveData(m)
                  setIsApproveOpen(true)
                }}
                className='p-1.5 text-[#387cae] hover:text-[#2d658e] hover:bg-[#387cae]/10'
                title='Update status'
              >
                <BadgeCheck className='w-4 h-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleDeleteClick(m.id)}
                className='p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50'
                title='Delete'
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            </div>
          )
        }
      }
    ],
    [handleDeleteClick, handleCopyReference, optionLabelBySlug]
  )

  const statCards = [
    { key: 'total', label: 'Total', value: stats.total, card: 'bg-white border-gray-200' },
    { key: 'pending', label: 'Pending', value: stats.pending },
    { key: 'approved', label: 'Approved', value: stats.approved },
    { key: 'rejected', label: 'Rejected', value: stats.rejected },
    { key: 'expired', label: 'Expired', value: stats.expired }
  ]

  if (loading && memberships.length === 0) {
    return (
      <div className='p-4'>
        <Loading />
      </div>
    )
  }

  return (
    <div className='w-full space-y-4'>
      <div className='flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm'>
        {[
          { id: 'applications', label: 'Applications', icon: Crown },
          { id: 'setup', label: 'Setup', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors',
                active
                  ? 'bg-[#387cae] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'applications' ? (
        <>
      {/* Stats cards */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
        {statCards.map((s) => {
          const color = getStatusColor(s.key === 'total' ? 'APPROVED' : s.key)
          return (
            <div
              key={s.key}
              className={cn(
                'rounded-xl border p-4 flex items-center gap-3',
                s.key === 'total' ? 'bg-white border-gray-200' : color.card
              )}
            >
              <span className='w-9 h-9 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center'>
                {s.key === 'total' ? (
                  <Wallet className='w-4 h-4 text-[#387cae]' />
                ) : (
                  color.icon
                )}
              </span>
              <div>
                <p className='text-xl font-bold text-gray-900 leading-none'>
                  {s.value}
                </p>
                <p className={cn('text-[11px] font-semibold uppercase tracking-wider mt-1', color.label)}>
                  {s.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className='bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-md bg-[#387cae]/10 flex items-center justify-center shrink-0'>
            <Crown size={17} className='text-[#387cae]' strokeWidth={2} />
          </div>
          <div>
            <p className='text-sm font-bold text-gray-800'>Memberships</p>
            <p className='text-xs text-gray-400'>
              {stats.total} total applications
            </p>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto'>
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPagination((prev) => ({ ...prev, currentPage: 1 }))
            }}
            className='h-9 shrink-0 sm:w-[140px] text-sm'
            aria-label='Filter by level'
          >
            <option value=''>All levels</option>
            {levelOptions.map((level) => (
              <option key={level.id} value={level.slug}>
                {level.label}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPagination((prev) => ({ ...prev, currentPage: 1 }))
            }}
            className='h-9 shrink-0 sm:w-[150px] text-sm'
            aria-label='Filter by status'
          >
            <option value=''>All status</option>
            <option value='PENDING'>Pending</option>
            <option value='APPROVED'>Approved</option>
            <option value='REJECTED'>Rejected</option>
            <option value='EXPIRED'>Expired</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      {memberships.length === 0 && !loading ? (
        <div className='bg-white rounded-2xl border border-gray-200 p-12'>
          <EmptyState
            icon={Crown}
            title='No Memberships Found'
            description={
              statusFilter || typeFilter
                ? 'No memberships match the selected filters.'
                : 'No membership applications yet.'
            }
          />
        </div>
      ) : (
        <Table
          loading={loading}
          data={memberships}
          columns={columns}
          pagination={pagination}
          onPageChange={(newPage) =>
            setPagination((prev) => ({ ...prev, currentPage: newPage }))
          }
          onSearch={handleSearch}
          searchPlaceholder='Search name, email, phone or payment reference...'
          pageSize={10}
          pageSizeOptions={[10]}
        />
      )}
        </>
      ) : (
        <div className='space-y-4'>
          <div className='rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-3'>
                <span className='flex h-9 w-9 items-center justify-center rounded-md bg-[#387cae]/10'>
                  <Settings size={17} className='text-[#387cae]' />
                </span>
                <div>
                  <p className='text-sm font-bold text-gray-800'>Membership setup</p>
                  <p className='text-xs text-gray-400'>
                    Manage levels, career fields, trainings and payment methods
                  </p>
                </div>
              </div>
              <Button
                type='button'
                onClick={() => openCreateOption()}
                className='h-9 gap-2 bg-[#387cae] text-white hover:bg-[#2d658e]'
              >
                <Plus size={15} />
                Add option
              </Button>
            </div>

            <div className='mt-4 flex flex-wrap gap-2'>
              {OPTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type='button'
                  onClick={() => setOptionTypeFilter(type.value)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors',
                    optionTypeFilter === type.value
                      ? 'border-[#387cae] bg-[#387cae]/10 text-[#387cae]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800'
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {visibleOptions.length === 0 ? (
            <div className='rounded-2xl border border-gray-200 bg-white p-12'>
              <EmptyState
                icon={Settings}
                title='No Options Found'
                description='Add the first option for this membership setup area.'
              />
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
              {visibleOptions.map((option) => (
                <div
                  key={option.id}
                  className='rounded-2xl border border-gray-200 bg-white p-4 shadow-sm'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='font-semibold text-gray-900'>{option.label}</p>
                        <span
                          className={cn(
                            'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                            option.is_active
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-gray-100 text-gray-500'
                          )}
                        >
                          {option.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                      <p className='mt-1 font-mono text-[11px] text-gray-400'>
                        {option.slug}
                      </p>
                      {option.description && (
                        <p className='mt-2 text-sm leading-relaxed text-gray-500'>
                          {option.description}
                        </p>
                      )}
                    </div>
                    <div className='flex shrink-0 items-center gap-1'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => openEditOption(option)}
                        className='p-1.5 text-[#387cae] hover:bg-[#387cae]/10'
                        title='Edit option'
                      >
                        <Edit2 size={15} />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDeleteOption(option.id)}
                        disabled={deletingOptionId === option.id}
                        className='p-1.5 text-red-600 hover:bg-red-50'
                        title='Delete option'
                      >
                        {deletingOptionId === option.id ? (
                          <Loader2 size={15} className='animate-spin' />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className='mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500'>
                    {option.metadata?.fee && (
                      <span className='rounded-md bg-gray-50 px-2 py-1 font-semibold'>
                        {option.metadata.fee}
                      </span>
                    )}
                    {option.metadata?.tagline && (
                      <span className='rounded-md bg-gray-50 px-2 py-1'>
                        {option.metadata.tagline}
                      </span>
                    )}
                    {Array.isArray(option.metadata?.trainings) && (
                      <span className='rounded-md bg-gray-50 px-2 py-1 font-semibold'>
                        {option.metadata.trainings.length} training{option.metadata.trainings.length === 1 ? '' : 's'}
                      </span>
                    )}
                    <span className='rounded-md bg-gray-50 px-2 py-1'>
                      Order {option.sort_order || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <MembershipViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        membership={viewData}
        optionLabels={optionLabelBySlug}
      />

      <MembershipApproveModal
        isOpen={isApproveOpen}
        onClose={() => {
          if (!approving) {
            setIsApproveOpen(false)
            setApproveData(null)
          }
        }}
        membership={approveData}
        onSave={handleApproveSubmit}
        submitting={approving}
      />

      <Dialog
        isOpen={optionModalOpen}
        onClose={closeOptionModal}
        className='max-w-2xl'
      >
        <DialogHeader>
          <DialogTitle>
            {editingOption ? 'Edit membership option' : 'Add membership option'}
          </DialogTitle>
          <DialogClose onClick={closeOptionModal} />
        </DialogHeader>
        <DialogContent>
          <form onSubmit={saveOption} className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='option_type'>Type</Label>
                <Select
                  id='option_type'
                  value={optionForm.type}
                  onChange={(e) => handleOptionChange('type', e.target.value)}
                  className='h-10'
                >
                  {OPTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='option_order'>Order</Label>
                <Input
                  id='option_order'
                  type='number'
                  value={optionForm.sort_order}
                  onChange={(e) => handleOptionChange('sort_order', e.target.value)}
                  className='h-10'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='option_label'>Label</Label>
                <Input
                  id='option_label'
                  value={optionForm.label}
                  onChange={(e) => {
                    handleOptionChange('label', e.target.value)
                    if (!editingOption && !optionForm.slug) {
                      handleOptionChange('slug', normalizeSlug(e.target.value))
                    }
                  }}
                  placeholder='Information Technology'
                  className='h-10'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='option_slug'>Slug</Label>
                <Input
                  id='option_slug'
                  value={optionForm.slug}
                  onChange={(e) => handleOptionChange('slug', normalizeSlug(e.target.value))}
                  placeholder='information-technology'
                  className='h-10 font-mono text-sm'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='option_description'>
                {optionForm.type === 'CAREER_FIELD'
                  ? 'Partner / short description'
                  : 'Description'}
              </Label>
              <Textarea
                id='option_description'
                value={optionForm.description}
                onChange={(e) => handleOptionChange('description', e.target.value)}
                rows={3}
                placeholder='Shown on the membership form'
              />
            </div>

            {optionForm.type === 'LEVEL' && (
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                <div className='space-y-2'>
                  <Label htmlFor='option_fee'>Fee</Label>
                  <Input
                    id='option_fee'
                    value={optionForm.fee}
                    onChange={(e) => handleOptionChange('fee', e.target.value)}
                    placeholder='Rs. 1,000'
                    className='h-10'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='option_note'>Badge note</Label>
                  <Input
                    id='option_note'
                    value={optionForm.note}
                    onChange={(e) => handleOptionChange('note', e.target.value)}
                    placeholder='INCLUDES FREE EXAM PREP'
                    className='h-10'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='option_tagline'>Tagline</Label>
                  <Input
                    id='option_tagline'
                    value={optionForm.tagline}
                    onChange={(e) => handleOptionChange('tagline', e.target.value)}
                    placeholder='Board exam prep'
                    className='h-10'
                  />
                </div>
              </div>
            )}

            {optionForm.type === 'CAREER_FIELD' && (
              <div className='space-y-2'>
                <Label htmlFor='option_trainings'>Courses / trainings</Label>
                <Textarea
                  id='option_trainings'
                  value={optionForm.trainings}
                  onChange={(e) => handleOptionChange('trainings', e.target.value)}
                  rows={6}
                  placeholder={'Web Development Fundamentals | HTML, CSS, JS basics\nPython Programming | Core programming for beginners'}
                  className='font-mono text-sm'
                />
                <p className='text-xs text-gray-400'>
                  Add one course per line. Use a vertical bar to separate title and description.
                </p>
              </div>
            )}

            <label className='flex items-center gap-2 text-sm font-medium text-gray-700'>
              <input
                type='checkbox'
                checked={optionForm.is_active}
                onChange={(e) => handleOptionChange('is_active', e.target.checked)}
                className='h-4 w-4 rounded border-gray-300 text-[#387cae] focus:ring-[#387cae]'
              />
              Show this option on the membership form
            </label>

            <div className='flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={closeOptionModal}
                disabled={savingOption}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={savingOption}
                className='gap-2 bg-[#387cae] text-white hover:bg-[#2d658e]'
              >
                {savingOption && <Loader2 size={15} className='animate-spin' />}
                {savingOption ? 'Saving...' : 'Save option'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDeleteConfirm}
        title='Delete Membership'
        message='Are you sure you want to delete this membership application? This action cannot be undone.'
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText='Cancel'
      />
    </div>
  )
}

export default MembershipsPage
