'use client'

import { useState, useMemo } from 'react'
import { Plus, FileText, GripVertical, Folder, ChevronRight, ChevronDown, BookCopy, Trash2, Edit2 } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/ui/shadcn/button'
import { SortableMaterialCard, OverlayCard } from './MaterialCard'
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

const SortableCategoryHeader = ({ cat, isExpanded, onToggle, totalMaterials, subCount }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `cat-${cat.id}`,
        data: { type: 'category', id: cat.id }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors select-none group/cat',
                isExpanded && 'border-b border-gray-50 bg-slate-50/30'
            )}
            onClick={onToggle}
        >
            <div className='flex items-center gap-3'>
                <div
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                    className='shrink-0 text-slate-200 hover:text-blue-400 cursor-grab active:cursor-grabbing p-1'
                >
                    <GripVertical size={18} />
                </div>
                <div className='w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#387cae] group-hover/cat:scale-110 transition-transform'>
                    {isExpanded ? <ChevronDown size={20} /> : <Folder size={20} />}
                </div>
                <div>
                    <h3 className='font-bold text-slate-800 text-[15px]'>{cat.title}</h3>
                    <p className='text-[11px] text-slate-400 font-semibold uppercase tracking-wider'>
                        {subCount} Subjects • {totalMaterials} Materials
                    </p>
                </div>
            </div>
            <div className='w-8 h-8 rounded-full bg-blue-100/50 flex items-center justify-center text-[#387cae] font-bold text-[10px]'>
                {totalMaterials}
            </div>
        </div>
    )
}

const SortableSubCategoryHeader = ({ sub, isExpanded, onToggle, matCount, parentId }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: `sub-${sub.id}`,
        data: { type: 'subcategory', id: sub.id, parentId }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onToggle}
            className='flex items-center gap-2 mb-3 cursor-pointer group/sub'
        >
            <div
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className='shrink-0 text-slate-200 hover:text-emerald-400 cursor-grab active:cursor-grabbing p-1'
            >
                <GripVertical size={14} />
            </div>
            {isExpanded ? <ChevronDown size={14} className='text-[#387cae]' /> : <ChevronRight size={14} className='text-slate-400' />}
            <div className='w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center'>
                <BookCopy size={16} />
            </div>
            <div>
                <h4 className='text-sm font-bold text-slate-700 group-hover/sub:text-[#387cae] transition-colors'>{sub.title}</h4>
                <p className='text-[10px] text-slate-400'>{matCount} materials available</p>
            </div>
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
    searchQuery,
    filterCategory
}) {
    const [activeId, setActiveId] = useState(null)
    const [activeType, setActiveType] = useState(null)
    const [expandedCats, setExpandedCats] = useState({})
    const [expandedSubs, setExpandedSubs] = useState({})

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const groupedData = useMemo(() => {
        const categories = {}
        materials.forEach(m => {
            const catId = m.category?.id || 'uncategorized'
            const catTitle = m.category?.title || 'Uncategorized'
            const subId = m.sub_category?.id || 'none'
            const subTitle = m.sub_category?.title || 'General / No Subcategory'

            if (!categories[catId]) {
                categories[catId] = { id: catId, title: catTitle, subcategories: {} }
            }
            if (!categories[catId].subcategories[subId]) {
                categories[catId].subcategories[subId] = { id: subId, title: subTitle, items: [] }
            }
            categories[catId].subcategories[subId].items.push(m)
        })
        return Object.values(categories)
    }, [materials])

    const toggleCat = (id) => setExpandedCats(prev => ({ ...prev, [id]: !prev[id] }))
    const toggleSub = (id) => setExpandedSubs(prev => ({ ...prev, [id]: !prev[id] }))

    const handleDragStart = (event) => {
        const { active } = event
        setActiveId(active.id)
        setActiveType(active.data.current?.type)
    }

    const handleDragEnd = (event) => {
        const { active, over } = event
        setActiveId(null)
        setActiveType(null)

        if (!over || active.id === over.id) return

        const type = active.data.current?.type
        if (type === 'material') {
            onReorder(active.data.current.id, over.data.current.id)
        } else if (type === 'subcategory') {
            onSubCategoryReorder(active.data.current.id, over.data.current.id, active.data.current.parentId)
        } else if (type === 'category') {
            onCategoryReorder(active.data.current.id, over.data.current.id)
        }
    }

    if (loading) {
        return (
            <div className='flex flex-col gap-1'>
                {[...Array(5)].map((_, i) => <CardSkeleton key={i} i={i} />)}
            </div>
        )
    }

    if (materials.length === 0) {
        return (
            <div className='bg-white border border-dashed border-gray-200 rounded-2xl py-20 text-center shadow-sm'>
                <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100'>
                    <FileText className='w-8 h-8 text-gray-300' />
                </div>
                <p className='text-gray-500 font-bold text-sm'>
                    {searchQuery || filterCategory ? 'No items found matching your filters.' : 'Your material library is empty.'}
                </p>
                {!searchQuery && !filterCategory && (
                    <Button
                        onClick={onAddClick}
                        className='mt-5 bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 font-bold px-6 shadow-lg shadow-[#387cae]/10'
                    >
                        <Plus size={16} /> Add Material
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className='space-y-4 pb-20'>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => { setActiveId(null); setActiveType(null); }}
            >
                <SortableContext
                    items={groupedData.map(c => `cat-${c.id}`)}
                    strategy={verticalListSortingStrategy}
                >
                    {groupedData.map(cat => {
                        const totalMaterials = Object.values(cat.subcategories).reduce((sum, s) => sum + s.items.length, 0)
                        const subCount = Object.keys(cat.subcategories).length

                        return (
                            <div key={cat.id} className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group/cat'>
                                <SortableCategoryHeader
                                    cat={cat}
                                    isExpanded={expandedCats[cat.id]}
                                    onToggle={() => toggleCat(cat.id)}
                                    totalMaterials={totalMaterials}
                                    subCount={subCount}
                                />

                                {expandedCats[cat.id] && (
                                    <div className='p-2 md:p-4 space-y-4 bg-white'>
                                        <SortableContext
                                            items={Object.values(cat.subcategories).map(s => `sub-${s.id}`)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {Object.values(cat.subcategories).map(sub => (
                                                <div key={sub.id} className='ml-4 border-l-2 border-slate-100 pl-4'>
                                                    <SortableSubCategoryHeader
                                                        sub={sub}
                                                        isExpanded={expandedSubs[`${cat.id}-${sub.id}`]}
                                                        onToggle={() => toggleSub(`${cat.id}-${sub.id}`)}
                                                        matCount={sub.items.length}
                                                        parentId={cat.id}
                                                    />

                                                    {expandedSubs[`${cat.id}-${sub.id}`] && (
                                                        <SortableContext
                                                            items={sub.items.map(m => m.id)}
                                                            strategy={verticalListSortingStrategy}
                                                        >
                                                            <div className='space-y-2 ml-4'>
                                                                {sub.items.map(material => (
                                                                    <SortableMaterialCard
                                                                        key={material.id}
                                                                        material={material}
                                                                        onEdit={onEdit}
                                                                        onDelete={onDelete}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </SortableContext>
                                                    )}
                                                </div>
                                            ))}
                                        </SortableContext>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </SortableContext>

                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: { active: { opacity: '0.5' } }
                    })
                }}>
                    {activeId && activeType === 'material' ? (
                        <OverlayCard material={materials.find(m => m.id === activeId)} />
                    ) : activeId && activeType === 'category' ? (
                        <div className='bg-white border-2 border-blue-400 p-4 rounded-2xl shadow-2xl opacity-90 scale-105'>
                            <div className='flex items-center gap-3'>
                                <Folder size={20} className='text-blue-500' />
                                <span className='font-bold text-slate-800'>Moving Category...</span>
                            </div>
                        </div>
                    ) : activeId && activeType === 'subcategory' ? (
                        <div className='bg-white border-2 border-emerald-400 p-3 rounded-xl shadow-2xl opacity-90 scale-105'>
                            <div className='flex items-center gap-3'>
                                <BookCopy size={16} className='text-emerald-500' />
                                <span className='font-bold text-slate-800 text-sm'>Moving Subject...</span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
