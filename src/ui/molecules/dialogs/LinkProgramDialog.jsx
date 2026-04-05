'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/ui/shadcn/dialog'

import { Button } from '@/ui/shadcn/button'
import { Checkbox } from '@/ui/shadcn/checkbox'
import { Input } from '@/ui/shadcn/input'
import { Search, Loader2 } from 'lucide-react'
import { authFetch } from '@/app/utils/authFetch'
import { useToast } from '@/hooks/use-toast'

const LinkProgramDialog = ({ isOpen, onClose, stream, onLinked }) => {
    const [programs, setPrograms] = useState([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedIds, setSelectedIds] = useState([])
    const { toast } = useToast()

    useEffect(() => {
        if (isOpen && stream) {
            fetchPrograms()
            setSelectedIds(stream.programs?.map(p => p.id) || [])
        }
    }, [isOpen, stream])

    const fetchPrograms = async () => {
        setLoading(true)
        try {
            const response = await authFetch(`${process.env.baseUrl}/program?limit=100`)
            const data = await response.json()
            setPrograms(data.items || [])
        } catch (error) {
            console.error('Error fetching programs:', error)
            toast({
                title: 'Error',
                description: 'Failed to fetch programs.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = (id) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        )
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const response = await authFetch(`${process.env.baseUrl}/stream/${stream.id}/programs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ programIds: selectedIds }),
            })

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Programs linked successfully.',
                })
                onLinked()
                onClose()
            } else {
                const data = await response.json()
                throw new Error(data.message || 'Failed to link programs.')
            }
        } catch (error) {
            console.error('Error linking programs:', error)
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setSubmitting(false)
        }
    }

    const filteredPrograms = programs.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Dialog isOpen={isOpen} onClose={onClose} className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Link Programs to {stream?.name}</DialogTitle>
                <DialogClose onClick={onClose} />
            </DialogHeader>

            <DialogContent className="py-4 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search programs..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="h-[300px] border rounded-md p-2 overflow-y-auto custom-scrollbar bg-white">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : filteredPrograms.length > 0 ? (
                        <div className="space-y-2">
                            {filteredPrograms.map((program) => (
                                <div
                                    key={program.id}
                                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                                    onClick={() => handleToggle(program.id)}
                                >
                                    <Checkbox
                                        checked={selectedIds.includes(program.id)}
                                        onCheckedChange={() => handleToggle(program.id)}
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        {program.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            No programs found.
                        </div>
                    )}
                </div>
            </DialogContent>

            <DialogFooter className="px-6 py-4 border-t bg-gray-50/50">
                <Button variant="outline" onClick={onClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
        </Dialog>
    )
}

export default LinkProgramDialog
