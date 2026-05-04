'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
    GripVertical,
    ChevronRight,
    MoreVertical,
    Plus,
    FileText,
    Trash2,
    Edit2,
    Check,
    X,
    FileIcon,
    Loader2,
    FileDown,
    ExternalLink,
    ChevronDown,
    AlertCircle
} from 'lucide-react'
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
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useToast } from '@/hooks/use-toast'
import { authFetch } from '@/app/utils/authFetch'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import * as yup from 'yup'
import FileUpload from '../colleges/FileUpload'
import { Label } from '@/ui/shadcn/label'
import { Input } from '@/ui/shadcn/input'
import { Textarea } from '@/ui/shadcn/textarea'

// --- HELPERS ---

const truncateUrl = (url) => {
    if (!url) return ''
    try {
        const u = new URL(url)
        return u.hostname + u.pathname.substring(0, 15) + (u.pathname.length > 15 ? '...' : '')
    } catch (e) {
        return url.substring(0, 30) + (url.length > 30 ? '...' : '')
    }
}

const getFirstLetter = (title) => {
    return title ? title.charAt(0).toUpperCase() : '?'
}

// --- COMPONENTS ---

const SortableItem = ({
    id,
    item,
    type,
    isSelected,
    onClick,
    onEdit,
    onDelete,
    accentColor,
    isMaterial = false,
    isEditingInline = false,
    onSaveInline,
    onCancelInline
}) => {
    const [tempValue, setTempValue] = useState(item.title)

    useEffect(() => {
        if (isEditingInline) setTempValue(item.title)
    }, [isEditingInline, item.title])

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id, disabled: isEditingInline })

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.3 : 1,
        borderColor: isSelected ? accentColor : undefined,
        boxShadow: isSelected ? `0 0 0 1px ${accentColor}33` : undefined
    }

    const badgeCount = type === 'L1'
        ? item.subcategories?.length || 0
        : item.children_count || item.materials_count || 0

    if (isMaterial) {
        // ... (Keep existing Material L3 logic, but ensure attributes/listeners are handled)
        const materialStyle = {
            ...style,
            borderColor: isDragging ? accentColor : undefined
        }
        return (
            <div
                ref={setNodeRef}
                style={materialStyle}
                className={`group relative flex items-center gap-3 p-3 mb-2 rounded-xl border transition-all bg-white hover:shadow-sm`}
            >
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600">
                    <GripVertical size={16} />
                </div>

                <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600`}>
                    <FileText size={20} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{item.title}</div>
                    <div className="text-[10px] font-mono text-gray-400 truncate mt-0.5">{item.file_url}</div>
                </div>

                {item.image && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                        <Edit2 size={14} />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => !isEditingInline && onClick(item)}
            className={`group relative flex items-center gap-3 p-3 mb-2 rounded-xl border transition-all
        ${isSelected ? `bg-gray-50` : 'border-gray-100 bg-white'}
        ${isEditingInline ? 'ring-2 ring-blue-500/20 border-blue-500' : 'cursor-pointer hover:bg-gray-50'}
      `}
        >
            {!isEditingInline && (
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
                    <GripVertical size={16} />
                </div>
            )}

            <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs shrink-0`}
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
                {getFirstLetter(item.title)}
            </div>

            <div className="flex-1 min-w-0">
                {isEditingInline ? (
                    <input
                        autoFocus
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onSaveInline(item.id, tempValue)
                            if (e.key === 'Escape') onCancelInline()
                        }}
                        onBlur={() => onCancelInline()}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-sm font-semibold text-gray-700 bg-transparent outline-none"
                    />
                ) : (
                    <div className="text-sm font-semibold text-gray-700 truncate">{item.title}</div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {!isEditingInline && (
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                        {badgeCount} {type === 'L1' ? '' : 'files'}
                    </span>
                )}

                {isEditingInline ? (
                    <div className="flex gap-1">
                        <button
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onSaveInline(item.id, tempValue); }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                            <Check size={14} />
                        </button>
                    </div>
                ) : isSelected ? (
                    <ChevronRight size={14} style={{ color: accentColor }} />
                ) : (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1 text-gray-400 hover:text-blue-600">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// --- MAIN PAGE ---

export default function MaterialDashboard() {
    const { toast } = useToast()
    const { setHeading } = usePageHeading()

    // State
    const [l1List, setL1List] = useState([])
    const [selectedL1, setSelectedL1] = useState(null)
    const [selectedL2, setSelectedL2] = useState(null)
    const [materialsBySubject, setMaterialsBySubject] = useState({})

    const [loadingL1, setLoadingL1] = useState(true)
    const [loadingMaterials, setLoadingMaterials] = useState(false)
    const [activeId, setActiveId] = useState(null)
    const [activeType, setActiveType] = useState(null)
    const [activeItem, setActiveItem] = useState(null)

    // Drag related
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Forms
    const [editingItem, setEditingItem] = useState(null)
    const [isAddingL1, setIsAddingL1] = useState(false)
    const [isAddingL2, setIsAddingL2] = useState(false)
    const [isAddingL3, setIsAddingL3] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [deleteType, setDeleteType] = useState(null) // 'L1', 'L2', 'L3'
    const [editingInlineId, setEditingInlineId] = useState(null)
    const [inlineInput, setInlineInput] = useState('')

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            title: '',
            file_url: '',
            description: ''
        }
    })

    useEffect(() => {
        setHeading('Material Management')
        fetchInitialData()
        return () => setHeading(null)
    }, [setHeading])

    const fetchInitialData = async () => {
        try {
            setLoadingL1(true)
            const res = await authFetch(`${process.env.baseUrl}/materials?type=MATERIAL&depth=2`)
            const data = await res.json()
            setL1List(data.data || [])
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load classes',
                variant: 'destructive'
            })
        } finally {
            setLoadingL1(false)
        }
    }

    const fetchMaterials = async (subjectId) => {
        try {
            setLoadingMaterials(true)
            const res = await authFetch(`${process.env.baseUrl}/materials/topic/${subjectId}`)
            const data = await res.json()
            setMaterialsBySubject(prev => ({
                ...prev,
                [subjectId]: data.materials || data.items || data.data || []
            }))
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load materials',
                variant: 'destructive'
            })
        } finally {
            setLoadingMaterials(false)
        }
    }

    // --- ACTIONS ---

    const handleL1Click = (item) => {
        if (selectedL1?.id === item.id) return
        setSelectedL1(item)
        setSelectedL2(null)
    }

    const handleL2Click = (item) => {
        if (selectedL2?.id === item.id) return
        setSelectedL2(item)
        if (!materialsBySubject[item.id]) {
            fetchMaterials(item.id)
        }
    }

    const onDragStart = (event) => {
        const { active } = event
        setActiveId(active.id)

        let list = []
        let currentType = null
        if (l1List.some(i => i.id === active.id)) {
            list = l1List
            currentType = 'L1'
        } else if (selectedL1?.subcategories?.some(i => i.id === active.id)) {
            list = selectedL1.subcategories
            currentType = 'L2'
        } else if (selectedL2 && materialsBySubject[selectedL2.id]?.some(i => i.id === active.id)) {
            list = materialsBySubject[selectedL2.id]
            currentType = 'L3'
        }

        const item = list.find(i => i.id === active.id)
        setActiveItem(item)
        setActiveType(currentType)
    }

    const handleDragEnd = async (event) => {
        const { active, over } = event
        const type = activeType

        setActiveId(null)
        setActiveType(null)
        setActiveItem(null)

        if (!over || active.id === over.id) return

        let list = []
        let parent_id = null

        if (type === 'L1') {
            list = [...l1List]
        } else if (type === 'L2') {
            list = [...(selectedL1?.subcategories || [])]
            parent_id = selectedL1.id
        } else if (type === 'L3') {
            list = [...(materialsBySubject[selectedL2.id] || [])]
            parent_id = selectedL2.id
        }

        const oldIndex = list.findIndex(item => item.id === active.id)
        const newIndex = list.findIndex(item => item.id === over.id)
        const newList = arrayMove(list, oldIndex, newIndex)

        // Optimistic update
        if (type === 'L1') setL1List(newList)
        else if (type === 'L2') {
            const updatedL1 = { ...selectedL1, subcategories: newList }
            setSelectedL1(updatedL1)
            setL1List(prev => prev.map(item => item.id === selectedL1.id ? updatedL1 : item))
        } else if (type === 'L3') {
            setMaterialsBySubject(prev => ({ ...prev, [selectedL2.id]: newList }))
        }

        try {
            const endpoint = type === 'L3' ? 'material-order' : 'category-order'
            await authFetch(`${process.env.baseUrl}/materials/${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: 'MATERIAL',
                    parent_id,
                    positions: newList.map(item => item.id)
                })
            })
            toast({
                title: 'Success',
                description: 'Order saved successfully'
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to sync order',
                variant: 'destructive'
            })
            // Revert if needed? Usually better to just show error.
        }
    }

    const handleAddSubmit = async (type) => {
        if (type === 'L1' || type === 'L2') {
            if (!inlineInput.trim()) return
            try {
                const res = await authFetch(`${process.env.baseUrl}/category`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: inlineInput,
                        type: 'MATERIAL',
                        parent_id: type === 'L2' ? selectedL1.id : null
                    })
                })
                const newItemJson = await res.json()
                console.log(newItemJson, "WOW");
                const newItem = newItemJson?.data;

                if (type === 'L1') {
                    setL1List(prev => [...prev, { ...newItem, subcategories: [] }])
                    setIsAddingL1(false)
                } else {
                    const updatedL1 = { ...selectedL1, subcategories: [...(selectedL1.subcategories || []), newItem] }
                    setSelectedL1(updatedL1)
                    setL1List(prev => prev.map(item => item.id === selectedL1.id ? updatedL1 : item))
                    setIsAddingL2(false)
                }
                setInlineInput('')
                toast({
                    title: 'Success',
                    description: `${type === 'L1' ? 'Class' : 'Subject'} added successfully`
                })
            } catch (error) {
                console.log(error, "DONDONE")
                toast({
                    title: 'Error',
                    description: 'Failed to add',
                    variant: 'destructive'
                })
            }
        }
    }

    const onMaterialSubmit = async (data) => {
        console.log("onMaterialSubmit: Initializing...", { data, selectedL2 });

        if (!selectedL2?.id) {
            console.warn("onMaterialSubmit: Missing selectedL2.id");
            toast.error("Subject ID is missing. Please re-select a subject.");
            return;
        }

        try {
            const payload = {
                title: (data.title || '').trim(),
                file_url: data.file_url,
                description: (data.description || '').trim(),
                category_id: selectedL2.id
            }
            console.log("onMaterialSubmit: Prepared Payload:", payload);

            const base = (process.env.baseUrl || '').replace(/\/+$/, '');
            const url = editingItem ? `${base}/materials/${editingItem.id}` : `${base}/materials`
            console.log("onMaterialSubmit: Fetching URL:", url, "Method:", editingItem ? 'PUT' : 'POST');

            const res = await authFetch(url, {
                method: editingItem ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            console.log("onMaterialSubmit: Server Raw Response:", res);

            let result = {};
            try {
                result = await res.json();
                console.log("onMaterialSubmit: Parsed JSON Result:", result);
            } catch (jsonErr) {
                console.error("onMaterialSubmit: Failed to parse JSON", jsonErr);
            }

            if (!res.ok) {
                const errorDetail = result?.message || result?.error || `HTTP ${res.status}`;
                throw new Error(errorDetail);
            }

            const savedItem = result?.data || result;

            setMaterialsBySubject(prev => {
                const current = prev[selectedL2.id] || []
                if (editingItem) {
                    return { ...prev, [selectedL2.id]: current.map(i => i.id === editingItem.id ? savedItem : i) }
                }
                return { ...prev, [selectedL2.id]: [...current, savedItem] }
            })

            // Update file counts in the subject list if it's a new addition
            if (!editingItem) {
                console.log("Updating counts for addition. Current subcategories:", selectedL1?.subcategories);
                const updateCategoryCounts = (cat) => {
                    if (!cat || String(cat.id) !== String(selectedL1?.id)) return cat;
                    return {
                        ...cat,
                        subcategories: (cat.subcategories || []).map(sub => {
                            if (String(sub.id) === String(selectedL2?.id)) {
                                const currentCount = Math.max(
                                    Number(sub.children_count || 0),
                                    Number(sub.materials_count || 0)
                                );
                                const newCount = currentCount + 1;
                                console.log(`Subject ${sub.title} count incrementing to ${newCount}`);
                                return {
                                    ...sub,
                                    children_count: newCount,
                                    materials_count: newCount
                                }
                            }
                            return sub;
                        })
                    };
                };

                setSelectedL1(prev => updateCategoryCounts(prev));
                setL1List(prevList => prevList.map(cat => updateCategoryCounts(cat)));
                setSelectedL2(prev => {
                    const currentCount = Math.max(
                        Number(prev?.children_count || 0),
                        Number(prev?.materials_count || 0)
                    );
                    const newCount = currentCount + 1;
                    console.log(`selectedL2 count incrementing to ${newCount}`);
                    return {
                        ...prev,
                        children_count: newCount,
                        materials_count: newCount
                    };
                });
            }

            const successStatus = editingItem ? 'updated' : 'added';
            setIsAddingL3(false)
            setEditingItem(null)
            reset({ title: '', file_url: '', description: '' })
            toast({
                title: 'Success',
                description: `Material ${successStatus} successfully`
            })
        } catch (error) {
            console.error("onMaterialSubmit Error:", error);
            toast({
                title: 'Error',
                description: error.message || 'Error occurred while saving material',
                variant: 'destructive'
            })
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const url = deleteType === 'L3'
                ? `${process.env.baseUrl}/materials/${deleteId}`
                : `${process.env.baseUrl}/category?category_id=${deleteId}`

            await authFetch(url, {
                method: 'DELETE'
            })

            if (deleteType === 'L1') {
                setL1List(prev => prev.filter(i => i.id !== deleteId))
                if (selectedL1?.id === deleteId) {
                    setSelectedL1(null)
                    setSelectedL2(null)
                }
            } else if (deleteType === 'L2') {
                setSelectedL1(prev => {
                    if (!prev) return prev;
                    return { ...prev, subcategories: (prev.subcategories || []).filter(i => i.id !== deleteId) };
                });
                setL1List(prev => prev.map(item => {
                    if (item.id === selectedL1?.id) {
                        return { ...item, subcategories: (item.subcategories || []).filter(i => i.id !== deleteId) };
                    }
                    return item;
                }));
                if (selectedL2?.id === deleteId) setSelectedL2(null)
            } else if (deleteType === 'L3') {
                console.log("Deleting L3 Material. ID:", deleteId);
                setMaterialsBySubject(prev => ({
                    ...prev,
                    [selectedL2?.id]: (prev[selectedL2?.id] || []).filter(i => i.id !== deleteId)
                }))

                const updateCategoryCounts = (cat) => {
                    if (!cat || String(cat.id) !== String(selectedL1?.id)) return cat;
                    return {
                        ...cat,
                        subcategories: (cat.subcategories || []).map(sub => {
                            if (String(sub.id) === String(selectedL2?.id)) {
                                const currentCount = Math.max(
                                    Number(sub.children_count || 0),
                                    Number(sub.materials_count || 0)
                                );
                                const newCount = Math.max(0, currentCount - 1);
                                console.log(`Subject ${sub.title} count decrementing to ${newCount}`);
                                return {
                                    ...sub,
                                    children_count: newCount,
                                    materials_count: newCount
                                }
                            }
                            return sub;
                        })
                    };
                };

                setSelectedL1(prev => updateCategoryCounts(prev));
                setL1List(prevList => prevList.map(cat => updateCategoryCounts(cat)));
                setSelectedL2(prev => {
                    const currentCount = Math.max(
                        Number(prev?.children_count || 0),
                        Number(prev?.materials_count || 0)
                    );
                    const newCount = Math.max(0, currentCount - 1);
                    console.log(`selectedL2 count decrementing to ${newCount}`);
                    return {
                        ...prev,
                        children_count: newCount,
                        materials_count: newCount
                    };
                });
            }

            toast.info('Item deleted')
        } catch (error) {
            toast.error('Failed to delete')
        } finally {
            setDeleteId(null)
            setDeleteType(null)
        }
    }
    const handleEdit = (item, type) => {
        if (type === 'L3') {
            setEditingItem(item)
            reset({
                title: item.title,
                file_url: item.file_url || '',
                description: item.description || ''
            })
            setIsAddingL3(true)
        } else {
            setEditingInlineId(item.id)
        }
    }

    const updateTitle = async (id, title, type) => {
        try {
            const res = await authFetch(`${process.env.baseUrl}/category?category_id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            })
            const updatedResponse = await res.json()
            const updatedData = updatedResponse?.data || updatedResponse
            if (type === 'L1') {
                setL1List(prev => prev.map(i => i.id === id ? { ...i, title: updatedData.title } : i))
                if (selectedL1?.id === id) setSelectedL1(prev => ({ ...prev, title: updatedData.title }))
            } else if (type === 'L2') {
                const updatedSub = selectedL1.subcategories.map(i => i.id === id ? { ...i, title: updatedData.title } : i)
                const updatedL1 = { ...selectedL1, subcategories: updatedSub }
                setSelectedL1(updatedL1)
                setL1List(prev => prev.map(item => item.id === selectedL1.id ? updatedL1 : item))
                if (selectedL2?.id === id) setSelectedL2(prev => ({ ...prev, title: updatedData.title }))
            }
            setEditingInlineId(null)
            toast.success('Title updated ✓')
        } catch (error) {
            toast.error('Update failed')
        }
    }

    // --- RENDERING ---

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] font-sans text-gray-800 overflow-hidden bg-gradient-to-br from-[#f0f4f8] to-[#e8eef5]">

            {/* Breadcrumb / Top Bar */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <span className="text-gray-900">Materials</span>
                    {selectedL1 && (
                        <>
                            <ChevronRight size={12} />
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => { setSelectedL2(null) }}>
                                {selectedL1.title}
                            </span>
                        </>
                    )}
                    {selectedL2 && (
                        <>
                            <ChevronRight size={12} />
                            <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-600 font-bold">
                                {selectedL2.title}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Main 3-Column Content */}
                <div className="flex-1 flex gap-4 px-6 pb-6 overflow-hidden">

                    {/* Column 1 — Classes */}
                    <div className="flex-1 flex flex-col min-w-[300px] bg-[#f8fafc] rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-[#387cae] font-extrabold text-sm uppercase tracking-wider">Classes</h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#387cae]/10 text-[#387cae] text-[10px] font-bold">
                                    {l1List.length}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">Level 1 Hierarchy</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" onMouseEnter={() => setActiveType('L1')}>
                            {loadingL1 ? (
                                Array(5).fill(0).map((_, i) => (
                                    <div key={i} className="mb-3"><Skeleton height={48} borderRadius={12} /></div>
                                ))
                            ) : (
                                <SortableContext items={l1List.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {l1List.map(item => (
                                        <SortableItem
                                            key={item.id}
                                            id={item.id}
                                            item={item}
                                            type="L1"
                                            isSelected={selectedL1?.id === item.id}
                                            isEditingInline={editingInlineId === item.id}
                                            onSaveInline={(id, val) => updateTitle(id, val, 'L1')}
                                            onCancelInline={() => setEditingInlineId(null)}
                                            onClick={handleL1Click}
                                            onEdit={(i) => handleEdit(i, 'L1')}
                                            onDelete={(id) => { setDeleteId(id); setDeleteType('L1'); }}
                                            accentColor="#387cae"
                                        />
                                    ))}
                                </SortableContext>
                            )}

                            {isAddingL1 ? (
                                <div className="mt-2 p-1 bg-white rounded-xl border border-blue-200 shadow-sm animate-in slide-in-from-top-2">
                                    <input
                                        autoFocus
                                        className="w-full px-3 py-2 text-sm outline-none bg-transparent"
                                        placeholder="Class name..."
                                        value={inlineInput}
                                        onChange={(e) => setInlineInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddSubmit('L1')
                                            if (e.key === 'Escape') setIsAddingL1(false)
                                        }}
                                    />
                                    <div className="flex justify-end gap-1 p-1">
                                        <button onClick={() => setIsAddingL1(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><X size={14} /></button>
                                        <button onClick={() => handleAddSubmit('L1')} className="p-1 bg-blue-500 hover:bg-blue-600 rounded text-white shadow-sm"><Check size={14} /></button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setIsAddingL1(true); setIsAddingL2(false); setInlineInput(''); }}
                                    className="w-full mt-2 py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all text-sm font-medium"
                                >
                                    <Plus size={16} /> Add Class
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Column 2 — Subjects */}
                    <div className={`flex-1 flex flex-col min-w-[300px] bg-[#f8fafc] rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ${!selectedL1 ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-[#7c6ab5] font-extrabold text-sm uppercase tracking-wider">Subjects</h3>
                                <span className="px-2 py-0.5 rounded-full bg-[#7c6ab5]/10 text-[#7c6ab5] text-[10px] font-bold">
                                    {selectedL1?.subcategories?.length || 0}
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">in {selectedL1?.title || '...'}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" onMouseEnter={() => setActiveType('L2')}>
                            {selectedL1 && (
                                <SortableContext items={(selectedL1.subcategories || []).map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {selectedL1.subcategories?.map(item => {
                                        // Use materialsBySubject length as the source of truth if it has been loaded
                                        const actualCount = materialsBySubject[item.id]
                                            ? materialsBySubject[item.id].length
                                            : (item.children_count || item.materials_count || 0);

                                        return (
                                            <SortableItem
                                                key={item.id}
                                                id={item.id}
                                                item={{ ...item, children_count: actualCount, materials_count: actualCount }}
                                                type="L2"
                                                isSelected={selectedL2?.id === item.id}
                                                isEditingInline={editingInlineId === item.id}
                                                onSaveInline={(id, val) => updateTitle(id, val, 'L2')}
                                                onCancelInline={() => setEditingInlineId(null)}
                                                onClick={handleL2Click}
                                                onEdit={(i) => handleEdit(i, 'L2')}
                                                onDelete={(id) => { setDeleteId(id); setDeleteType('L2'); }}
                                                accentColor="#7c6ab5"
                                            />
                                        );
                                    })}
                                </SortableContext>
                            )}

                            {isAddingL2 ? (
                                <div className="mt-2 p-1 bg-white rounded-xl border border-violet-200 shadow-sm animate-in slide-in-from-top-2">
                                    <input
                                        autoFocus
                                        className="w-full px-3 py-2 text-sm outline-none bg-transparent"
                                        placeholder="Subject name..."
                                        value={inlineInput}
                                        onChange={(e) => setInlineInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddSubmit('L2')
                                            if (e.key === 'Escape') setIsAddingL2(false)
                                        }}
                                    />
                                    <div className="flex justify-end gap-1 p-1">
                                        <button onClick={() => setIsAddingL2(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><X size={14} /></button>
                                        <button onClick={() => handleAddSubmit('L2')} className="p-1 bg-violet-500 hover:bg-violet-600 rounded text-white shadow-sm"><Check size={14} /></button>
                                    </div>
                                </div>
                            ) : selectedL1 && (
                                <button
                                    onClick={() => { setIsAddingL2(true); setIsAddingL1(false); setInlineInput(''); }}
                                    className="w-full mt-2 py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50/50 transition-all text-sm font-medium"
                                >
                                    <Plus size={16} /> Add Subject
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Column 3 — Materials */}
                    <div className={`flex-[1.5] flex flex-col min-w-[350px] bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden transition-all duration-300 ${!selectedL2 ? 'opacity-50 grayscale pointer-events-none filter blur-[1px]' : 'opacity-100'}`}>
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-[#387cae] font-extrabold text-lg tracking-tight leading-none mb-1">{selectedL2?.title || 'Materials'}</h3>
                                <p className="text-xs text-gray-400 font-medium">{materialsBySubject[selectedL2?.id]?.length || 0} files available</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsAddingL3(true)
                                    setEditingItem(null)
                                    reset({ title: '', file_url: '', description: '' })
                                }}
                                className="flex items-center gap-2 bg-[#387cae] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#2d648c] transition-all shadow-lg shadow-blue-500/10 active:scale-95"
                            >
                                <Plus size={16} /> Add Material
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" onMouseEnter={() => setActiveType('L3')}>
                            {isAddingL3 && (
                                <form onSubmit={handleSubmit(onMaterialSubmit, (err) => console.log("Material Form Validation Errors:", err))} className="mb-6 p-4 bg-gray-50 rounded-2xl border border-blue-100 animate-in zoom-in-95">
                                    <div className="space-y-4">
                                        <div>
                                            <Label required className="">Title</Label>
                                            <Input
                                                {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Minimum 3 characters' } })}
                                                autoFocus
                                                placeholder="e.g. Rotational Dynamics Notes"
                                            />
                                            {errors.title && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{errors.title.message}</p>}
                                        </div>
                                        <div>
                                            <Label className="">File</Label>
                                            <Controller
                                                name="file_url"
                                                control={control}
                                                render={({ field }) => (
                                                    <FileUpload
                                                        label="Upload Material File"
                                                        defaultPreview={field.value}
                                                        accept="application/pdf,image/*,.docx,.doc"
                                                        onUploadComplete={(url) => field.onChange(url)}
                                                        autoUpload={true}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Textarea
                                                {...register('description')}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white min-h-[80px]"
                                                placeholder="Brief description (optional)..."
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsAddingL3(false)
                                                    setEditingItem(null)
                                                    reset()
                                                }}
                                                className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="flex items-center gap-2 px-6 py-2 bg-[#387cae] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-[#2d648c] disabled:opacity-50"
                                            >
                                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                                {editingItem ? 'Save Changes' : 'Publish Material'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {loadingMaterials ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="mb-4"><Skeleton height={80} borderRadius={16} /></div>
                                ))
                            ) : selectedL2 && (
                                <SortableContext items={(materialsBySubject[selectedL2.id] || []).map(i => i.id)} strategy={verticalListSortingStrategy}>
                                    {materialsBySubject[selectedL2.id]?.map(item => (
                                        <SortableItem
                                            key={item.id}
                                            id={item.id}
                                            item={item}
                                            type="L3"
                                            isMaterial={true}
                                            onEdit={(i) => handleEdit(i, 'L3')}
                                            onDelete={(id) => { setDeleteId(id); setDeleteType('L3'); }}
                                            accentColor="#387cae"
                                        />
                                    ))}
                                </SortableContext>
                            )}

                            {selectedL2 && (!materialsBySubject[selectedL2.id] || materialsBySubject[selectedL2.id].length === 0) && !isAddingL3 && !loadingMaterials && (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100">
                                    <FileDown size={48} strokeWidth={1} className="mb-4 text-gray-200" />
                                    <p className="text-sm font-medium">No materials yet in this subject</p>
                                    <p className="text-[10px] mt-1 uppercase tracking-widest font-bold">Start adding files above</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DragOverlay adjustScale={false} dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: {
                                opacity: '0.5',
                            },
                        },
                    }),
                }}>
                    {activeId ? (
                        <div className="shadow-2xl opacity-90 scale-105 transition-transform pointer-events-none">
                            <SortableItem
                                id={activeId}
                                item={activeItem}
                                type={activeType}
                                isSelected={false}
                                isMaterial={activeType === 'L3'}
                                accentColor={activeType === 'L2' ? "#7c6ab5" : "#387cae"}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <ConfirmationDialog
                open={!!deleteId}
                onClose={() => { setDeleteId(null); setDeleteType(null); }}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900&display=swap');
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
        </div>
    )
}
