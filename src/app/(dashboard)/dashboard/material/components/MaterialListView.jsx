'use client'

import { useState } from 'react'
import { Plus, FileText, GripVertical, Folder, ChevronDown, BookCopy, Trash2, Edit2, ChevronRight } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/ui/shadcn/button'
import { cn } from '@/app/lib/utils'

const CardSkeleton = ({ i = 0 }) => (
    <div
        className='bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse mb-3'
        style={{ animationDelay: `${i * 60}ms` }}
    >
        <div className='flex items-center gap-4 p-4'>
            <div className='w-5 h-5 bg-gray-200 rounded shrink-0' />
            <div className='w-12 h-12 bg-gray-200 rounded-lg shrink-0' />
            <div className='flex-1 space-y-2'>
                <div className='h-4 bg-gray-200 rounded-md w-1/2' />
                <div className='h-3 bg-gray-200 rounded w-1/4' />
            </div>
        </div>
    </div>
)
const SortableTreeItem = ({ id, type, data, children, depth = 0, onAdd, onEdit, onDelete, isExpanded, onToggle }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `${type}-${id}`,
        data: { type, id, parentId: data.parent_id }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 100 : 'auto'
    }

    const getIcon = () => {
        if (type === 'material') return <FileText size={16} />
        if (depth === 0) return isExpanded ? <ChevronDown size={18} /> : <Folder size={18} />
        if (depth === 1) return <BookCopy size={16} />
        return <div className='w-2 h-2 rounded-full bg-blue-400' />
    }

    const getLevelStyles = () => {
        if (depth === 0) return 'bg-white border-slate-200 shadow-sm text-slate-800'
        if (depth === 1) return 'bg-slate-50/50 border-slate-100 text-slate-700'
        if (depth === 2) return 'bg-transparent border-transparent text-slate-600'
        return 'bg-white'
    }

    return (
        <div ref={setNodeRef} style={style} className='group/item'>
            <div
                className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 mb-2',
                    getLevelStyles(),
                    isDragging && 'border-blue-400 ring-4 ring-blue-50',
                    !isDragging && 'hover:border-blue-200 hover:shadow-md'
                )}
            >
                <div
                    {...attributes}
                    {...listeners}
                    className='shrink-0 text-slate-300 hover:text-blue-500 cursor-grab active:cursor-grabbing p-1'
                >
                    <GripVertical size={16} />
                </div>

                <div
                    onClick={onToggle}
                    className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition-colors',
                        depth === 0 ? 'bg-blue-50 text-blue-600' : 'text-slate-400',
                        onToggle && 'hover:bg-blue-100/50'
                    )}
                >
                    {getIcon()}
                </div>

                <div className='flex-1 min-w-0' onClick={onToggle}>
                    <p className={cn(
                        'truncate font-bold tracking-tight',
                        depth === 0 ? 'text-[15px]' : 'text-sm'
                    )}>
                        {data.title}
                    </p>
                    {type !== 'material' && (
                        <p className='text-[10px] text-slate-400 font-bold uppercase mt-0.5'>
                            {data.materials?.length || 0} Files • {data.subcategories?.length || 0} Sub-levels
                        </p>
                    )}
                </div>

                <div className='flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity'>
                    {onAdd && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAdd(data); }}
                            className='w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors'
                        >
                            <Plus size={16} />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(data); }}
                        className='w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors'
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
                        className='w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors'
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {isExpanded && children && (
                <div className='ml-11 border-l-2 border-slate-100 pl-4 py-1'>
                    {children}
                </div>
            )}
        </div>
    )
}

export default function MaterialListView({
    materials,
    loading,
    onEdit,
    onDelete,
    onReorder,
    onCategoryReorder,
    onSubCategoryReorder,
    onAddClick,
    searchQuery
}) {
    const [expandedIds, setExpandedIds] = useState({})
    const [activeId, setActiveId] = useState(null)
    const [activeData, setActiveData] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const toggleExpand = (id) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))

    const handleDragStart = (event) => {
        const { active } = event
        setActiveId(active.id)
        setActiveData(active.data.current)
    }

    const handleDragEnd = (event) => {
        const { active, over } = event
        setActiveId(null)
        setActiveData(null)

        if (!over || active.id === over.id) return

        const activeType = active.data.current.type
        const overType = over.data.current.type

        if (activeType !== overType) return // Only sort within same level/type

        const activeItemParts = active.id.split('-')
        const overItemParts = over.id.split('-')
        const activeRealId = activeItemParts[1]
        const overRealId = overItemParts[1]

        if (activeType === 'material') {
            onReorder(activeRealId, overRealId)
        } else if (activeType === 'category') {
            // General category reorder
            onCategoryReorder(activeRealId, overRealId, active.data.current.parentId)
        }
    }

    if (loading) {
        return (
            <div className='space-y-4'>
                {[...Array(5)].map((_, i) => <CardSkeleton key={i} i={i} />)}
            </div>
        )
    }

    if (materials.length === 0) {
        return (
            <div className='bg-white border-2 border-dashed border-slate-100 rounded-[2rem] py-32 text-center'>
                <div className='w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100'>
                    <Folder className='w-10 h-10 text-slate-200' />
                </div>
                <h3 className='text-lg font-bold text-slate-800 mb-2'>No materials found</h3>
                <p className='text-slate-400 text-sm mb-8'>Start organizing your library by adding your first class.</p>
                <Button
                    onClick={() => onAddClick()}
                    className='bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 font-bold px-8 h-12 rounded-xl shadow-xl shadow-blue-500/20'
                >
                    <Plus size={18} /> Create New Class
                </Button>
            </div>
        )
    }

    const renderTree = (items, depth = 0, parentId = null) => {
        return (
            <SortableContext
                items={items.map(item => `${item.type || 'category'}-${item.id}`)}
                strategy={verticalListSortingStrategy}
            >
                {items.map(item => {
                    const id = item.id
                    const type = item.type || 'category'
                    const uniqueId = `${type}-${id}`
                    const isExpanded = expandedIds[uniqueId] || (depth < 1) // Auto-expand Class level

                    return (
                        <SortableTreeItem
                            key={uniqueId}
                            id={id}
                            type={type}
                            depth={depth}
                            data={item}
                            isExpanded={isExpanded}
                            onToggle={() => toggleExpand(uniqueId)}
                            onAdd={depth < 3 ? (item) => onAddClick(
                                depth === 0 ? { l1: item } :
                                    depth === 1 ? { l2: item } :
                                        { l3: item }
                            ) : null}
                            onEdit={type === 'material' ? onEdit : (item) => onEdit({ ...item, isCategory: true })}
                            onDelete={type === 'material' ? onDelete : (id) => onDelete(id, true)}
                        >
                            {/* Nested Contents */}
                            {(item.subcategories?.length > 0 || item.materials?.length > 0) && (
                                <>
                                    {renderTree(
                                        [
                                            ...(item.subcategories || []).map(s => ({ ...s, type: 'category' })),
                                            ...(item.materials || []).map(m => ({ ...m, type: 'material' }))
                                        ],
                                        depth + 1,
                                        id
                                    )}
                                </>
                            )}
                        </SortableTreeItem>
                    )
                })}
            </SortableContext>
        )
    }

    return (
        <div className='max-w-5xl mx-auto pb-32'>
            <div className='flex items-center justify-between mb-8'>
                <div>
                    <h2 className='text-2xl font-black text-slate-900'>Library Explorer</h2>
                    <p className='text-sm text-slate-400 font-medium'>Drag items to reorder them within their groups.</p>
                </div>
                <Button
                    onClick={() => onAddClick()}
                    className='bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 gap-2 font-black px-6 rounded-xl shadow-sm'
                >
                    <Plus size={18} className='text-blue-500' /> New Class
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className='space-y-2'>
                    {renderTree(materials?.map(m => ({ ...m, type: 'category' })))}
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className='flex items-center gap-3 p-3 rounded-xl border border-blue-400 bg-white shadow-2xl ring-4 ring-blue-50 scale-105 opacity-90'>
                            <GripVertical size={16} className='text-blue-400' />
                            <div className='w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600'>
                                {activeData.type === 'material' ? <FileText size={16} /> : <Folder size={18} />}
                            </div>
                            <span className='font-bold text-slate-800'>{activeData.title || 'Moving...'}</span>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}

