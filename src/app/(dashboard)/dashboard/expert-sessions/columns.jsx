'use client'

import { formatDate } from '@/utils/date.util'
import { Eye, Trash2, SquarePen, Phone, GraduationCap } from 'lucide-react'
import { Button } from '@/ui/shadcn/button'

export const createColumns = ({ handleView, handleDelete, handleStatusUpdate }) => [
    {
        header: 'Full Name',
        accessorKey: 'fullname',
        cell: ({ row }) => <span className="font-medium">{row.original.fullname || '-'}</span>
    },
    {
        header: 'Phone',
        accessorKey: 'phone',
        cell: ({ getValue }) => (
            <span className="inline-flex items-center gap-1.5 text-gray-700">
                <Phone className="w-3.5 h-3.5 text-[#0A6FA7]" />
                {getValue() || '-'}
            </span>
        )
    },
    {
        header: 'Desired Course',
        accessorKey: 'desired_course',
        cell: ({ getValue }) => (
            <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#30AD8F]" />
                <span className="font-semibold text-[#0A6FA7]">{getValue() || '-'}</span>
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
            const status = getValue() || 'new'
            const colors = {
                new: 'bg-blue-100 text-blue-800 border border-blue-200',
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
                    title='Delete Session'
                >
                    <Trash2 className='w-4 h-4' />
                </Button>
            </div>
        )
    }
]
