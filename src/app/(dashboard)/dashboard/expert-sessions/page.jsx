'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from '@/ui/shadcn/dialog'
import Loading from '@/ui/molecules/Loading'
import Table from '@/ui/shadcn/DataTable'
import { Search, Loader2, GraduationCap } from 'lucide-react'
import { getExpertSessions, deleteExpertSession, updateExpertSession } from './actions'
import { createColumns } from './columns'
import ViewExpertSessionModal from './ViewExpertSessionModal'
import { Button } from '@/ui/shadcn/button'
import { Label } from '@/ui/shadcn/label'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'

export default function ExpertSessionsManager() {
    const { toast } = useToast()
    const { setHeading } = usePageHeading()
    const [sessions, setSessions] = useState([])
    const [tableLoading, setTableLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    })

    const [selectedSession, setSelectedSession] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
    const [searchTimeout, setSearchTimeout] = useState(null)

    const [updatingStatusId, setUpdatingStatusId] = useState(null)
    const [statusModalOpen, setStatusModalOpen] = useState(false)
    const [selectedStatusSession, setSelectedStatusSession] = useState(null)
    const [newStatus, setNewStatus] = useState('new')

    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        setHeading('Expert Sessions')
        return () => setHeading(null)
    }, [setHeading])

    useEffect(() => {
        loadSessions()
    }, [pagination.currentPage, statusFilter, debouncedSearchQuery])

    const loadSessions = async () => {
        setTableLoading(true)
        try {
            const data = await getExpertSessions(pagination.currentPage, statusFilter, debouncedSearchQuery)
            setSessions(data.items)
            setPagination(prev => ({
                ...prev,
                ...data.pagination
            }))
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load expert sessions',
                variant: 'destructive'
            })
            console.error(error)
        } finally {
            setTableLoading(false)
        }
    }

    const handleSearchInput = (query) => {
        setSearchQuery(query)

        if (searchTimeout) clearTimeout(searchTimeout)

        const timeout = setTimeout(() => {
            setPagination(prev => ({ ...prev, currentPage: 1 }))
            setDebouncedSearchQuery(query)
        }, 500)

        setSearchTimeout(timeout)
    }

    const handleView = (session) => {
        setSelectedSession(session)
        setIsViewModalOpen(true)
    }

    const handleStatusUpdate = (session) => {
        setSelectedStatusSession(session)
        setNewStatus(session.status || 'new')
        setStatusModalOpen(true)
    }

    const confirmStatusUpdate = async () => {
        if (!selectedStatusSession) return

        setUpdatingStatusId(selectedStatusSession.id)
        try {
            await updateExpertSession(selectedStatusSession.id, { status: newStatus })
            toast({
                title: 'Success',
                description: `Status updated to ${newStatus}`
            })

            setSessions(prev => prev.map(s =>
                s.id === selectedStatusSession.id ? { ...s, status: newStatus } : s
            ))

            setStatusModalOpen(false)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update status',
                variant: 'destructive'
            })
        } finally {
            setUpdatingStatusId(null)
        }
    }

    const handleDelete = (id) => {
        setDeleteId(id)
        setDeleteConfirmationOpen(true)
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            await deleteExpertSession(deleteId)
            toast({
                title: 'Success',
                description: 'Session deleted successfully'
            })
            loadSessions()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete session',
                variant: 'destructive'
            })
        } finally {
            setDeleteConfirmationOpen(false)
            setDeleteId(null)
        }
    }

    const columns = useMemo(() => createColumns({ handleView, handleDelete, handleStatusUpdate }), [])

    return (
        <div className='w-full'>

            <div className='sticky mb-3 top-0 z-30 bg-[#F7F8FA] py-3'>
                <div className='bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3'>
                    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3'>
                        <div className='flex items-center gap-3 shrink-0'>
                            <div className='w-9 h-9 rounded-md bg-[#387cae]/10 flex items-center justify-center shrink-0'>
                                <GraduationCap size={17} className='text-[#387cae]' strokeWidth={2} />
                            </div>
                            <div>
                                <p className='text-sm font-bold text-gray-800'>Expert Sessions</p>
                                <p className='text-xs text-gray-400 flex items-center gap-1.5'>
                                    {tableLoading ? (
                                        <span className='inline-flex items-center gap-1'>
                                            <Loader2 size={10} className='animate-spin' /> Loading…
                                        </span>
                                    ) : (
                                        `${pagination.total} total`
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className='flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full lg:w-auto lg:flex-1 lg:justify-end lg:min-w-0'>
                            <div className='relative shrink-0 flex-1 min-w-[160px] sm:max-w-xs lg:max-w-[280px]'>
                                <Search
                                    size={13}
                                    className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
                                />
                                <input
                                    type='text'
                                    value={searchQuery}
                                    onChange={(e) => handleSearchInput(e.target.value)}
                                    placeholder='Search name, phone or course…'
                                    className='w-full pl-8 pr-3 h-9 rounded-md border border-gray-200 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40 transition'
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value)
                                    setPagination(prev => ({ ...prev, currentPage: 1 }))
                                }}
                                className='h-9 w-full sm:w-auto sm:min-w-[200px] shrink-0 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40 transition cursor-pointer'
                                aria-label='Filter by session status'
                            >
                                <option value='all'>All statuses</option>
                                <option value='new'>New</option>
                                <option value='in_progress'>In progress</option>
                                <option value='resolved'>Resolved</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-md shadow-sm border overflow-hidden">
                <Table
                    loading={tableLoading}
                    data={sessions}
                    columns={columns}
                    pagination={pagination}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                    showSearch={false}
                />
            </div>

            <ViewExpertSessionModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false)
                    setSelectedSession(null)
                }}
                session={selectedSession}
            />

            {/* Status Update Modal */}
            <Dialog
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                className="max-w-md"
            >
                <DialogHeader>
                    <DialogTitle>Update Session Status</DialogTitle>
                    <DialogClose onClick={() => setStatusModalOpen(false)} />
                </DialogHeader>
                <DialogContent>
                    <div className="space-y-4">
                        <div>
                            <Label className="block text-sm font-medium text-gray-700 mb-1">
                                Status <span className="text-red-500">*</span>
                            </Label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className='w-full h-9 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40'
                            >
                                <option value='new'>New</option>
                                <option value='in_progress'>In progress</option>
                                <option value='resolved'>Resolved</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setStatusModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmStatusUpdate}
                                disabled={updatingStatusId}
                            >
                                {updatingStatusId ? 'Updating...' : 'Update Status'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={deleteConfirmationOpen}
                onClose={() => {
                    setDeleteConfirmationOpen(false)
                    setDeleteId(null)
                }}
                onConfirm={confirmDelete}
                title="Delete Session"
                message="Are you sure you want to delete this session request? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    )
}
