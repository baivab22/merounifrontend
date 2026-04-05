'use client'

import { useState, useEffect, useRef } from 'react'
import {
    GripVertical,
    ChevronRight,
    Plus,
    Trash2,
    Edit2,
    Check,
    X,
    BookOpen,
    Loader2
} from 'lucide-react'
import { Button } from '@/ui/shadcn/button'
import { useToast } from '@/hooks/use-toast'

import { authFetch } from '@/app/utils/authFetch'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import { useRouter } from 'next/navigation'
import LinkProgramDialog from '@/ui/molecules/dialogs/LinkProgramDialog'


// --- HELPERS ---

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
    isProgram = false,
    isEditingInline = false,
    onSaveInline,
    onCancelInline
}) => {
    const [tempValue, setTempValue] = useState(item.name || item.title)

    useEffect(() => {
        setTempValue(item.name || item.title)
    }, [isEditingInline, item.name, item.title])

    const badgeCount = type === 'Board'
        ? item.streams?.length || 0
        : item.programs?.length || 0

    const style = {
        borderColor: isSelected ? accentColor : undefined,
        boxShadow: isSelected ? `0 0 0 1px ${accentColor}33` : undefined
    }

    if (isProgram) {
        return (
            <div
                style={style}
                className={`group relative flex items-center gap-3 p-3 mb-2 rounded-xl border transition-all bg-white hover:shadow-sm cursor-pointer ${isSelected ? 'bg-gray-50' : ''}`}
                onClick={() => onClick(item)}
            >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600`}>
                    <BookOpen size={20} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{item.title}</div>
                    <div className="text-[10px] font-mono text-gray-400 truncate mt-0.5">{item.code || 'No code'}</div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                        <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            style={style}
            onClick={() => !isEditingInline && onClick(item)}
            className={`group relative flex items-center gap-3 p-3 mb-2 rounded-xl border transition-all
        ${isSelected ? `bg-gray-50` : 'border-gray-100 bg-white'}
        ${isEditingInline ? 'ring-2 ring-blue-500/20 border-blue-500' : 'cursor-pointer hover:bg-gray-50'}
      `}
        >
            <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs shrink-0`}
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
                {getFirstLetter(item.name)}
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
                    <div className="text-sm font-semibold text-gray-700 truncate">{item.name}</div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {!isEditingInline && (
                    <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                        {badgeCount}
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

export default function BoardDashboard() {
    const { toast } = useToast()
    const { setHeading } = usePageHeading()
    const router = useRouter()

    // State
    const [boards, setBoards] = useState([])
    const [selectedBoard, setSelectedBoard] = useState(null)
    const [selectedStream, setSelectedStream] = useState(null)
    const [programsByStream, setProgramsByStream] = useState({})

    const [loadingBoards, setLoadingBoards] = useState(true)
    const [loadingPrograms, setLoadingPrograms] = useState(false)

    // Actions
    const [isAddingBoard, setIsAddingBoard] = useState(false)
    const [isAddingStream, setIsAddingStream] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [deleteType, setDeleteType] = useState(null) // 'Board', 'Stream', 'Program'
    const [editingInlineId, setEditingInlineId] = useState(null)
    const [inlineInput, setInlineInput] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)


    useEffect(() => {
        setHeading('Board Management')
        fetchInitialData()
        return () => setHeading(null)
    }, [setHeading])

    const fetchInitialData = async () => {
        try {
            setLoadingBoards(true)
            const res = await authFetch(`${process.env.baseUrl}/board?includeStreams=true&limit=100`)
            const data = await res.json()
            setBoards(data.items || [])
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load boards',
                variant: 'destructive'
            })
        } finally {
            setLoadingBoards(false)
        }
    }

    const fetchPrograms = async (streamId) => {
        try {
            setLoadingPrograms(true)
            // Fetch the stream with its associated programs
            const res = await authFetch(`${process.env.baseUrl}/stream/${streamId}`)
            const data = await res.json()
            const updatedPrograms = data.item?.programs || []

            setProgramsByStream(prev => ({
                ...prev,
                [streamId]: updatedPrograms
            }))

            // Synchronize the program count with the selectedBoard and boards state for the badge
            if (selectedBoard) {
                const updatedStreams = selectedBoard.streams.map(s =>
                    s.id === streamId ? { ...s, programs: updatedPrograms } : s
                )
                const updatedBoard = { ...selectedBoard, streams: updatedStreams }
                setSelectedBoard(updatedBoard)
                setBoards(prev => prev.map(b => b.id === selectedBoard.id ? updatedBoard : b))
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load programs',
                variant: 'destructive'
            })
        } finally {
            setLoadingPrograms(false)
        }
    }



    // --- HANDLERS ---

    const handleBoardClick = (item) => {
        if (selectedBoard?.id === item.id) return
        setSelectedBoard(item)
        setSelectedStream(null)
    }

    const handleStreamClick = (item) => {
        if (selectedStream?.id === item.id) return
        setSelectedStream(item)
        if (!programsByStream[item.id]) {
            fetchPrograms(item.id)
        }
    }

    const handleAddSubmit = async (type) => {
        if (!inlineInput.trim()) return
        try {
            const endpoint = type.toLowerCase()
            const payload = { name: inlineInput }
            if (type === 'Stream') payload.board_id = selectedBoard.id

            const res = await authFetch(`${process.env.baseUrl}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const result = await res.json()
            const newItem = result.item || result.data || result

            if (type === 'Board') {
                setBoards(prev => [...prev, { ...newItem, streams: [] }])
                setIsAddingBoard(false)
            } else {
                const updatedBoard = { ...selectedBoard, streams: [...(selectedBoard.streams || []), newItem] }
                setSelectedBoard(updatedBoard)
                setBoards(prev => prev.map(item => item.id === selectedBoard.id ? updatedBoard : item))
                setIsAddingStream(false)
            }
            setInlineInput('')
            toast({ title: 'Success', description: `${type} added successfully` })
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add', variant: 'destructive' })
        }
    }

    const updateTitle = async (id, name, type) => {
        try {
            const endpoint = type.toLowerCase()
            const res = await authFetch(`${process.env.baseUrl}/${endpoint}?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            })
            if (type === 'Board') {
                setBoards(prev => prev.map(i => i.id === id ? { ...i, name } : i))
                if (selectedBoard?.id === id) setSelectedBoard(prev => ({ ...prev, name }))
            } else {
                const updatedStreams = selectedBoard.streams.map(i => i.id === id ? { ...i, name } : i)
                const updatedBoard = { ...selectedBoard, streams: updatedStreams }
                setSelectedBoard(updatedBoard)
                setBoards(prev => prev.map(item => item.id === selectedBoard.id ? updatedBoard : item))
                if (selectedStream?.id === id) setSelectedStream(prev => ({ ...prev, name }))
            }
            setEditingInlineId(null)
            toast({ title: 'Success', description: 'Updated successfully' })
        } catch (error) {
            toast({ title: 'Error', description: 'Update failed', variant: 'destructive' })
        }
    }

    const confirmDelete = (id, type) => {
        setDeleteId(id)
        setDeleteType(type)
        setIsDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const endpoint = deleteType.toLowerCase()
            await authFetch(`${process.env.baseUrl}/${endpoint}?id=${deleteId}`, { method: 'DELETE' })

            if (deleteType === 'Board') {
                setBoards(prev => prev.filter(i => i.id !== deleteId))
                if (selectedBoard?.id === deleteId) {
                    setSelectedBoard(null)
                    setSelectedStream(null)
                }
            } else if (deleteType === 'Stream') {
                const updatedBoard = { ...selectedBoard, streams: selectedBoard.streams.filter(i => i.id !== deleteId) }
                setSelectedBoard(updatedBoard)
                setBoards(prev => prev.map(item => item.id === selectedBoard.id ? updatedBoard : item))
                if (selectedStream?.id === deleteId) setSelectedStream(null)
            } else if (deleteType === 'Program') {
                await authFetch(`${process.env.baseUrl}/stream/${selectedStream.id}/programs/${deleteId}`, { 
                    method: 'DELETE' 
                })
                const updatedPrograms = (programsByStream[selectedStream.id] || []).filter(i => i.id !== deleteId)
                setProgramsByStream(prev => ({
                    ...prev,
                    [selectedStream.id]: updatedPrograms
                }))

                // Synchronize the program count decrement with the selectedBoard and boards state
                const updatedStreams = selectedBoard.streams.map(s =>
                    s.id === selectedStream.id ? { ...s, programs: updatedPrograms } : s
                )
                const updatedBoard = { ...selectedBoard, streams: updatedStreams }
                setSelectedBoard(updatedBoard)
                setBoards(prev => prev.map(b => b.id === selectedBoard.id ? updatedBoard : b))
            }


            toast({ title: 'Success', description: 'Deleted successfully' })
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
        } finally {
            setIsDialogOpen(false)
            setDeleteId(null)
            setDeleteType(null)
        }
    }

    const handleEditProgram = (program) => {
        router.push(`/dashboard/program?id=${program.id}`)
    }

    // --- RENDER ---

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] font-[Figtree] text-gray-800 overflow-hidden bg-gradient-to-br from-[#f0f4f8] to-[#e8eef5]">
            
            {/* Breadcrumb */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <span className="text-gray-900">Boards</span>
                    {selectedBoard && (
                        <>
                            <ChevronRight size={12} />
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setSelectedStream(null)}>
                                {selectedBoard.name}
                            </span>
                        </>
                    )}
                    {selectedStream && (
                        <>
                            <ChevronRight size={12} />
                            <span className="px-2 py-0.5 rounded bg-violet-50 text-violet-600 font-bold">
                                {selectedStream.name}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 flex gap-4 px-6 pb-6 overflow-hidden">
                
                {/* Column 1: Boards */}
                <div className="flex-1 flex flex-col min-w-[300px] bg-[#f8fafc] rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-[#387cae] font-extrabold text-sm uppercase tracking-wider">Boards</h3>
                            <span className="px-2 py-0.5 rounded-full bg-[#387cae]/10 text-[#387cae] text-[10px] font-bold">{boards.length}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {loadingBoards ? (
                            Array(3).fill(0).map((_, i) => <div key={i} className="mb-3"><Skeleton height={48} borderRadius={12} /></div>)
                        ) : (
                            boards.map(item => (
                                <SortableItem
                                    key={item.id}
                                    id={item.id}
                                    item={item}
                                    type="Board"
                                    isSelected={selectedBoard?.id === item.id}
                                    isEditingInline={editingInlineId === item.id}
                                    onSaveInline={(id, val) => updateTitle(id, val, 'Board')}
                                    onCancelInline={() => setEditingInlineId(null)}
                                    onClick={handleBoardClick}
                                    onEdit={(i) => setEditingInlineId(i.id)}
                                    onDelete={(id) => confirmDelete(id, 'Board')}
                                    accentColor="#387cae"
                                />
                            ))
                        )}

                        {isAddingBoard ? (
                            <div className="mt-2 p-1 bg-white rounded-xl border border-blue-200 shadow-sm animate-in slide-in-from-top-2">
                                <input
                                    autoFocus
                                    className="w-full px-3 py-2 text-sm outline-none bg-transparent"
                                    placeholder="Board name..."
                                    value={inlineInput}
                                    onChange={(e) => setInlineInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddSubmit('Board')
                                        if (e.key === 'Escape') setIsAddingBoard(false)
                                    }}
                                />
                                <div className="flex justify-end gap-1 p-1">
                                    <button onClick={() => setIsAddingBoard(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><X size={14} /></button>
                                    <button onClick={() => handleAddSubmit('Board')} className="p-1 bg-blue-500 hover:bg-blue-600 rounded text-white shadow-sm"><Check size={14} /></button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setIsAddingBoard(true); setInlineInput(''); }}
                                className="w-full mt-2 py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all text-sm font-medium"
                            >
                                <Plus size={16} /> Add Board
                            </button>
                        )}
                    </div>
                </div>

                {/* Column 2: Streams */}
                <div className={`flex-1 flex flex-col min-w-[300px] bg-[#f8fafc] rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ${!selectedBoard ? 'opacity-50 pointer-events-none translate-x-4' : 'opacity-100'}`}>
                    <div className="p-4 border-b border-gray-100 bg-white/50">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-violet-600 font-extrabold text-sm uppercase tracking-wider">Streams</h3>
                            <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-bold">
                                {selectedBoard?.streams?.length || 0}
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">Of {selectedBoard?.name || '...'}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {selectedBoard?.streams?.map(item => (
                            <SortableItem
                                key={item.id}
                                id={item.id}
                                item={item}
                                type="Stream"
                                isSelected={selectedStream?.id === item.id}
                                isEditingInline={editingInlineId === item.id}
                                onSaveInline={(id, val) => updateTitle(id, val, 'Stream')}
                                onCancelInline={() => setEditingInlineId(null)}
                                onClick={handleStreamClick}
                                onEdit={(i) => setEditingInlineId(i.id)}
                                onDelete={(id) => confirmDelete(id, 'Stream')}
                                accentColor="#7c3aed"
                            />
                        ))}

                        {isAddingStream ? (
                            <div className="mt-2 p-1 bg-white rounded-xl border border-violet-200 shadow-sm animate-in slide-in-from-top-2">
                                <input
                                    autoFocus
                                    className="w-full px-3 py-2 text-sm outline-none bg-transparent"
                                    placeholder="Stream name..."
                                    value={inlineInput}
                                    onChange={(e) => setInlineInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddSubmit('Stream')
                                        if (e.key === 'Escape') setIsAddingStream(false)
                                    }}
                                />
                                <div className="flex justify-end gap-1 p-1">
                                    <button onClick={() => setIsAddingStream(false)} className="p-1 hover:bg-gray-100 rounded text-gray-400"><X size={14} /></button>
                                    <button onClick={() => handleAddSubmit('Stream')} className="p-1 bg-violet-500 hover:bg-violet-600 rounded text-white shadow-sm"><Check size={14} /></button>
                                </div>
                            </div>
                        ) : selectedBoard && (
                            <button
                                onClick={() => { setIsAddingStream(true); setInlineInput(''); }}
                                className="w-full mt-2 py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50/50 transition-all text-sm font-medium"
                            >
                                <Plus size={16} /> Add Stream
                            </button>
                        )}
                    </div>
                </div>

                {/* Column 3: Programs */}
                <div className={`flex-[1.5] flex flex-col min-w-[400px] bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden transition-all duration-500 ${!selectedStream ? 'opacity-50 pointer-events-none translate-x-8' : 'opacity-100'}`}>
                    <div className="p-4 border-b border-gray-100 bg-white">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-gray-900 font-extrabold text-sm uppercase tracking-wider">Programs</h3>
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold">
                                </span>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={() => setIsLinkDialogOpen(true)} 
                                className="bg-gray-900 text-white rounded-lg px-3 py-1 text-xs gap-1.5 h-8"
                            >
                                <Plus size={14} /> Add Program
                            </Button>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">In {selectedStream?.name || '...'}</p>
                    </div>


                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
                        {loadingPrograms ? (
                            Array(4).fill(0).map((_, i) => <div key={i} className="mb-3"><Skeleton height={60} borderRadius={12} /></div>)
                        ) : (
                            programsByStream[selectedStream?.id]?.map(item => (
                                <SortableItem
                                    key={item.id}
                                    id={item.id}
                                    item={item}
                                    type="Program"
                                    isProgram={true}
                                    accentColor="#111827"
                                    onClick={handleEditProgram}
                                    onEdit={handleEditProgram}
                                    onDelete={(id) => confirmDelete(id, 'Program')}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleDelete}
                title={`Delete ${deleteType}`}
                message={`Are you sure you want to delete this ${deleteType?.toLowerCase()}? This action cannot be undone.`}
            />

            <LinkProgramDialog
                isOpen={isLinkDialogOpen}
                onClose={() => setIsLinkDialogOpen(false)}
                stream={{
                    ...selectedStream,
                    programs: programsByStream[selectedStream?.id] || []
                }}
                onLinked={() => fetchPrograms(selectedStream.id)}
            />
        </div>

    )
}
