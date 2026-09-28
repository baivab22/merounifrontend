'use client'

import { usePageHeading } from '@/contexts/PageHeadingContext'
import { useToast } from '@/hooks/use-toast'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import Loading from '@/ui/molecules/Loading'
import Table from '@/ui/shadcn/DataTable'
import EmptyState from '@/ui/shadcn/EmptyState'
import { Button } from '@/ui/shadcn/button'
import { Select } from '@/ui/shadcn/select'
import { cn } from '@/app/lib/utils'
import { formatDate } from '@/utils/date.util'
import {
  BadgeCheck,
  Check,
  Crown,
  Eye,
  Gem,
  Hourglass,
  Loader2,
  Shield,
  Trash2,
  Wallet
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  deleteMembership,
  getAllMemberships,
  updateMembershipStatus
} from './actions'
import MembershipApproveModal from './components/MembershipApproveModal'
import MembershipViewModal from './components/MembershipViewModal'

const MEMBERSHIP_META = {
  PLUS2: { icon: Shield, label: '+2 / Grade 12', badge: 'bg-gray-100 text-gray-700 border-gray-200' },
  BACHELORS: { icon: Crown, label: "Bachelor's", badge: 'bg-[#387cae]/10 text-[#387cae] border-[#387cae]/20' },
  GRADUATE: { icon: Gem, label: 'Graduate', badge: 'bg-purple-50 text-purple-700 border-purple-200' }
}

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
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
                meta.badge
              )}
            >
              <Icon size={13} />
              {meta.label}
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
                  : career_field}
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
    [handleDeleteClick]
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
            <option value='PLUS2'>+2 / Grade 12</option>
            <option value='BACHELORS'>Bachelor's</option>
            <option value='GRADUATE'>Graduate</option>
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
          pageSize={10}
          pageSizeOptions={[10]}
        />
      )}

      <MembershipViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        membership={viewData}
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