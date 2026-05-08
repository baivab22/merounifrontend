'use client'

import { formatDate } from '@/utils/date.util'
import { Eye, Trash2, SquarePen } from 'lucide-react'
import { Button } from '@/ui/shadcn/button'

export const createColumns = ({ handleView, handleDelete, handleStatusUpdate }) => [
    {
        header: 'Full Name',
        accessorKey: 'fullname',
        cell: ({ row }) => <span className="font-medium">{row.original.fullname || row.original.fullName}</span>
    },
    {
        header: 'Email',
        accessorKey: 'email',
    },
    {
        header: 'Subject',
        accessorKey: 'subject',
        cell: ({ getValue }) => (
            <span className="truncate max-w-[200px] block" title={getValue()}>
                {getValue()}
            </span>
        )
    },
    {
        header: 'Date',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => getValue() ? formatDate(getValue()) : '-'
    },
    {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
            const status = getValue() || 'unread'
            const colors = {
                new: 'bg-blue-100 text-blue-800 border border-blue-200',
                unread: 'bg-slate-100 text-slate-800 border border-slate-200',
                in_progress: 'bg-amber-100 text-amber-900 border border-amber-200',
                resolved: 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }
            const label = String(status).replace(/_/g, ' ')
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                    {label}
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
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStatusUpdate(row.original)}
                    className='hover:bg-purple-50 text-purple-600'
                    title='Update Status'
                >
                    <SquarePen className='w-4 h-4' />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(row.original)}
                    className='hover:bg-blue-50 text-blue-600'
                    title='View Details'
                >
                    <Eye className='w-4 h-4' />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(row.original.id)}
                    className='hover:bg-red-50 text-red-600'
                    title='Delete Message'
                >
                    <Trash2 className='w-4 h-4' />
                </Button>
            </div>
        )
    }
]
