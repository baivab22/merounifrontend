'use client'

import { cn } from '@/app/lib/utils'
import { GripVertical, FileText, Edit2, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const SortableMaterialCard = ({ material, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: material.id })

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'bg-white border rounded-xl transition-all duration-300 overflow-hidden group/item',
                isDragging
                    ? 'border-[#387cae]/40 shadow-2xl ring-2 ring-[#387cae]/20 z-50'
                    : 'border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100'
            )}
        >
            <div className='flex items-center gap-4 p-3 md:p-4'>
                {/* Drag handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className='shrink-0 text-slate-300 hover:text-[#387cae] cursor-grab active:cursor-grabbing touch-none transition-colors'
                >
                    <GripVertical size={18} />
                </div>

                {/* Left Icon (Book Style) */}
                <div className='w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover/item:bg-blue-50 transition-colors'>
                    <FileText size={18} className='text-slate-400 group-hover/item:text-[#387cae]' />
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                        <h4 className='font-bold text-slate-800 text-[14px] leading-snug truncate'>{material.title}</h4>
                        {material.order_no && (
                            <span className='px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-bold border border-slate-200'>
                                CH {material.order_no}
                            </span>
                        )}
                    </div>
                    {material.description ? (
                        <p className='text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic'>
                            {material.description}
                        </p>
                    ) : (
                        <p className='text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-medium'>
                            {material.tagDetails?.length > 0 ? material.tagDetails.map(t => t.title).join(', ') : 'No description'}
                        </p>
                    )}
                </div>

                {/* Actions (Shadcn style buttons) */}
                <div className='flex items-center gap-2 pl-4 md:pl-6 border-l border-slate-50 shrink-0'>
                    <button
                        onClick={() => onEdit(material)}
                        className='px-3 py-1.5 rounded-lg text-[#387cae] bg-blue-50/50 hover:bg-blue-50 text-[11px] font-bold transition-all border border-blue-100/50'
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(material.id)}
                        className='p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all'
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export const OverlayCard = ({ material }) => (
    <div className='bg-white border-2 border-[#387cae]/40 rounded-xl shadow-2xl scale-[1.02] shadow-[#387cae]/20'>
        <div className='flex items-center gap-4 p-4'>
            <GripVertical size={18} className='text-[#387cae]/50' />
            <div className='w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center'>
                <FileText size={18} className='text-[#387cae]' />
            </div>
            <div className='flex-1'>
                <p className='font-bold text-slate-800 text-sm'>{material.title}</p>
                <p className='text-[10px] text-slate-400'>Reordering...</p>
            </div>
        </div>
    </div>
)
