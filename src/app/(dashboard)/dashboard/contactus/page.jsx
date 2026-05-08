'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose } from '@/ui/shadcn/dialog'
import Loading from '@/ui/molecules/Loading'
import Table from '@/ui/shadcn/DataTable'
import { Search, Loader2, MessageSquare } from 'lucide-react'
import { getContacts, deleteContact, updateContact } from '../../../actions/contactActions'
import { createColumns } from './columns'
import ViewContactModal from './ViewContactModal'
import { Button } from '@/ui/shadcn/button'
import { Label } from '@/ui/shadcn/label'

import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'

export default function ContactUsManager() {
    const { toast } = useToast()
    const { setHeading } = usePageHeading()
    const [contacts, setContacts] = useState([])
    const [tableLoading, setTableLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    })

    const [selectedContact, setSelectedContact] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)

    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

    const [searchTimeout, setSearchTimeout] = useState(null)

    const [updatingStatusId, setUpdatingStatusId] = useState(null)
    const [statusModalOpen, setStatusModalOpen] = useState(false)
    const [selectedStatusContact, setSelectedStatusContact] = useState(null)
    const [newStatus, setNewStatus] = useState('unread')

    // Confirmation Dialog State
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        setHeading('Contact Us Messages')
        return () => setHeading(null)
    }, [setHeading])

    useEffect(() => {
        loadContacts()
    }, [pagination.currentPage, statusFilter, debouncedSearchQuery])

    const loadContacts = async () => {
        setTableLoading(true)
        try {
            const data = await getContacts(pagination.currentPage, statusFilter, debouncedSearchQuery)
            setContacts(data.items)
            setPagination(prev => ({
                ...prev,
                ...data.pagination
            }))
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load messages',
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

    const handleView = (contact) => {
        setSelectedContact(contact)
        setIsViewModalOpen(true)
    }

    const handleStatusUpdate = (contact) => {
        setSelectedStatusContact(contact)
        setNewStatus(contact.status || 'unread')
        setStatusModalOpen(true)
    }

    const confirmStatusUpdate = async () => {
        if (!selectedStatusContact) return

        setUpdatingStatusId(selectedStatusContact.id)
        try {
            await updateContact(selectedStatusContact.id, { status: newStatus })
            toast({
                title: 'Success',
                description: `Status updated to ${newStatus}`
            })

            // Update local state to reflect change immediately
            setContacts(prev => prev.map(c =>
                c.id === selectedStatusContact.id ? { ...c, status: newStatus } : c
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
            await deleteContact(deleteId)
            toast({
                title: 'Success',
                description: 'Message deleted successfully'
            })
            loadContacts()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete message',
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
                                <MessageSquare size={17} className='text-[#387cae]' strokeWidth={2} />
                            </div>
                            <div>
                                <p className='text-sm font-bold text-gray-800'>Messages</p>
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
                                    placeholder='Search messages…'
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
                                aria-label='Filter by message status'
                            >
                                <option value='all'>All statuses</option>
                                <option value='new'>New</option>
                                <option value='unread'>Unread</option>
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
                    data={contacts}
                    columns={columns}
                    pagination={pagination}
                    onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
                    showSearch={false} // We have custom search above
                />
            </div>

            <ViewContactModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false)
                    setSelectedContact(null)
                }}
                contact={selectedContact}
                onUpdate={() => {
                    loadContacts() // Refresh list to update status in table
                    setIsViewModalOpen(false)
                }}
            />

            {/* Status Update Modal */}
            <Dialog
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                className="max-w-md"
            >
                <DialogHeader>
                    <DialogTitle>Update Contact Status</DialogTitle>
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
                                <option value='unread'>Unread</option>
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
                title="Delete Message"
                message="Are you sure you want to delete this message? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    )
}
