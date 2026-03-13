'use client'

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Loader2, FileText } from 'lucide-react';
import { authFetch } from '@/app/utils/authFetch';
import { cn } from '@/app/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/shadcn/dialog';
import { Button } from '@/ui/shadcn/button';
import { Input } from '@/ui/shadcn/input';
import { Label } from '@/ui/shadcn/label';
import SearchSelectCreate from '@/ui/shadcn/search-select-create';
import FileUpload from '../../colleges/FileUpload';

export default function MaterialFormDialog({ isOpen, onClose, editing, editId, authorId, onSuccess, initialContext }) {
    const [formLoading, setFormLoading] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState({ image: '', file: '' })
    const [selectedL1, setSelectedL1] = useState(null)
    const [selectedL2, setSelectedL2] = useState(null)
    const [selectedL3, setSelectedL3] = useState(null)
    const [subCategories, setSubCategories] = useState([])
    const [topics, setTopics] = useState([])
    const [loadingL2, setLoadingL2] = useState(false)
    const [loadingL3, setLoadingL3] = useState(false)
    const [fileError, setFileError] = useState(false)

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            order_no: '',
            author: authorId,
            file: '',
            image: '',
            category_id: '',
            sub_category_id: ''
        }
    })

    useEffect(() => {
        if (isOpen) {
            reset({
                title: '',
                description: '',
                order_no: '',
                author: authorId,
                file: '',
                image: '',
                category_id: ''
            })
            setUploadedFiles({ image: '', file: '' })
            const ctxL3 = initialContext?.l3 || null;
            const ctxL2 = initialContext?.l2 || ctxL3?.parent || null;
            const ctxL1 = initialContext?.l1 || ctxL2?.parent || null;

            setSelectedL1(ctxL1)
            setSelectedL2(ctxL2)
            setSelectedL3(ctxL3)

            setSubCategories([])
            setTopics([])
            setFileError(false)
        }
    }, [isOpen, editing, editId, authorId, reset, initialContext])

    // Load subjects whenever class changes
    useEffect(() => {
        if (selectedL1?.id) {
            fetchChildren(selectedL1.id, setSubCategories, setLoadingL2)
        } else {
            setSubCategories([])
            setSelectedL2(null)
        }
    }, [selectedL1])

    // Load topics whenever subject changes
    useEffect(() => {
        if (selectedL2?.id) {
            fetchChildren(selectedL2.id, setTopics, setLoadingL3)
        } else {
            setTopics([])
            setSelectedL3(null)
        }
    }, [selectedL2])

    const fetchMaterialDetails = async (id) => {
        try {
            setFormLoading(true)
            const response = await authFetch(`${process.env.baseUrl}/material/${id}`)
            const data = await response.json()
            const material = data.material

            setValue('title', material.title)
            setValue('description', material.description || '')
            setValue('order_no', material.order_no || '')

            // Hierarchy reconstruction
            // Assuming the API returns the category trail or we have to work with what's there
            if (material.category) {
                if (material.category.parent?.parent) {
                    // Level 3 (Topic)
                    setSelectedL1({ id: material.category.parent.parent.id, title: material.category.parent.parent.title })
                    setSelectedL2({ id: material.category.parent.id, title: material.category.parent.title })
                    setSelectedL3({ id: material.category.id, title: material.category.title })
                } else if (material.category.parent) {
                    // Level 2 (Subject)
                    setSelectedL1({ id: material.category.parent.id, title: material.category.parent.title })
                    setSelectedL2({ id: material.category.id, title: material.category.title })
                    setSelectedL3(null)
                } else {
                    // Level 1 (Class)
                    setSelectedL1({ id: material.category.id, title: material.category.title })
                    setSelectedL2(null)
                    setSelectedL3(null)
                }
            }

            setUploadedFiles({ image: material.image || '', file: material.file || '' })
        } catch {
            toast.error('Failed to fetch material details')
            onClose()
        } finally {
            setFormLoading(false)
        }
    }

    const fetchChildren = async (parentId, setter, loadingSetter) => {
        if (!parentId) return
        try {
            loadingSetter(true)
            const response = await authFetch(`${process.env.baseUrl}/category/sub/${parentId}`)
            const data = await response.json()
            setter(data.items || data || [])
        } catch {
            setter([])
        } finally {
            loadingSetter(false)
        }
    }

    const onCreateCategory = async (title, parentId = null) => {
        try {
            const response = await authFetch(`${process.env.baseUrl}/category`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    type: 'MATERIAL',
                    parent_id: parentId
                })
            })
            if (!response.ok) throw new Error('Failed to create category')
            const data = await response.json()
            toast.success(`Category "${title}" created`)
            return data.item || data
        } catch (error) {
            toast.error(error.message)
            return null
        }
    }



    const fetchCategoriesSearch = async (query) => {
        try {
            const response = await authFetch(
                `${process.env.baseUrl}/category?type=MATERIAL&parent_id=null&limit=100${query ? `&q=${query}` : ''}`
            )
            const data = await response.json()
            return data.items || []
        } catch { return [] }
    }

    const onSubmit = async (data) => {
        if (!uploadedFiles.file?.trim()) { setFileError(true); return }
        setFileError(false)
        setFormLoading(true)
        try {
            const payload = {
                title: data.title?.trim(),
                description: data.description?.trim() || null,
                order_no: data.order_no ? parseInt(data.order_no, 10) : null,
                image: uploadedFiles.image || null,
                file: uploadedFiles.file,
                category_id: selectedL3?.id || selectedL2?.id || selectedL1?.id || null
            }
            const url = editing
                ? `${process.env.baseUrl}/material?id=${editId}`
                : `${process.env.baseUrl}/material`
            const method = editing ? 'PUT' : 'POST'
            const response = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!response.ok) throw new Error('Failed to save material')
            toast.success(editing ? 'Material updated successfully!' : 'Material created successfully!')
            onSuccess()
            onClose()
        } catch (error) {
            toast.error(error.message || 'Failed to save material')
        } finally {
            setFormLoading(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} className='max-w-xl'>
            <DialogContent className='max-w-xl p-0 overflow-hidden bg-white'>
                <DialogHeader className='p-6 border-b border-gray-100'>
                    <DialogTitle className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                        <div className='w-10 h-10 rounded-md bg-[#387cae]/10 flex items-center justify-center text-[#387cae]'>
                            <FileText size={20} />
                        </div>
                        {editing ? 'Edit Content' : 'Add New Material'}
                    </DialogTitle>
                    <DialogDescription className='text-xs font-medium text-gray-500'>
                        {editing ? 'Update existing material details and files.' : 'Fill in the information below to publish new educational content.'}
                    </DialogDescription>
                    <DialogClose onClick={onClose} />
                </DialogHeader>

                <div className='p-8'>
                    <form id='material-form' onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                        <div className='grid grid-cols-1 gap-8'>
                            {/* Basic Info */}
                            <div className='space-y-6'>
                                <div className='space-y-3'>
                                    <Label required className='text-[11px] font-bold uppercase tracking-wider text-slate-500'>Title</Label>
                                    <Input
                                        {...register('title', {
                                            required: 'Title is required',
                                            minLength: { value: 3, message: 'Title must be at least 3 characters long' }
                                        })}
                                        placeholder='Enter a descriptive title'
                                        className={cn('h-11 rounded-md border-gray-200 bg-gray-50/50 focus:bg-white transition-all', errors.title && 'border-red-500 focus:ring-red-500/10')}
                                    />
                                    {errors.title && <p className='text-[10px] font-bold text-red-500 uppercase mt-1'>{errors.title.message}</p>}
                                </div>

                                <div className='space-y-3'>
                                    <Label className='text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2'>
                                        Description
                                    </Label>
                                    <textarea
                                        {...register('description')}
                                        placeholder='Enter material description (optional)'
                                        className='flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm transition-all focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#387cae]/20 focus-visible:border-[#387cae] placeholder:text-muted-foreground'
                                    />
                                </div>
                            </div>

                            {/* Classification */}
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-dashed'>
                                <div className='space-y-3'>
                                    <Label className='text-[11px] font-bold uppercase tracking-wider text-slate-500'>Level 1: Class</Label>
                                    <SearchSelectCreate
                                        onSearch={fetchCategoriesSearch}
                                        onCreate={(q) => onCreateCategory(q, null)}
                                        onSelect={(item) => {
                                            setSelectedL1(item)
                                            setSelectedL2(null)
                                            setSelectedL3(null)
                                        }}
                                        onRemove={() => {
                                            setSelectedL1(null)
                                            setSelectedL2(null)
                                            setSelectedL3(null)
                                        }}
                                        selectedItems={selectedL1}
                                        placeholder='E.g. Class 12'
                                        isMulti={false}
                                        displayKey='title'
                                        allowCreate={true}
                                    />
                                </div>

                                <div className='space-y-3'>
                                    <Label className='text-[11px] font-bold uppercase tracking-wider text-slate-500'>Level 2: Subject</Label>
                                    <SearchSelectCreate
                                        onSearch={async (q) => {
                                            if (!selectedL1) return []
                                            return subCategories.filter(s => s.title.toLowerCase().includes(q.toLowerCase()))
                                        }}
                                        onCreate={(q) => onCreateCategory(q, selectedL1?.id)}
                                        onSelect={(item) => {
                                            setSelectedL2(item)
                                            setSelectedL3(null)
                                        }}
                                        onRemove={() => {
                                            setSelectedL2(null)
                                            setSelectedL3(null)
                                        }}
                                        selectedItems={selectedL2}
                                        placeholder={selectedL1 ? 'E.g. Physics' : 'Select Class first'}
                                        isMulti={false}
                                        displayKey='title'
                                        isLoading={loadingL2}
                                        allowCreate={!!selectedL1}
                                    />
                                </div>

                                <div className='space-y-3'>
                                    <Label className='text-[11px] font-bold uppercase tracking-wider text-slate-500'>Level 3: Topic</Label>
                                    <SearchSelectCreate
                                        onSearch={async (q) => {
                                            if (!selectedL2) return []
                                            return topics.filter(t => t.title.toLowerCase().includes(q.toLowerCase()))
                                        }}
                                        onCreate={(q) => onCreateCategory(q, selectedL2?.id)}
                                        onSelect={setSelectedL3}
                                        onRemove={() => setSelectedL3(null)}
                                        selectedItems={selectedL3}
                                        placeholder={selectedL2 ? 'E.g. Rotational Dynamics' : 'Select Subject first'}
                                        isMulti={false}
                                        displayKey='title'
                                        isLoading={loadingL3}
                                        allowCreate={!!selectedL2}
                                    />
                                </div>

                                <div className='space-y-3 md:col-span-3'>
                                    <Label className='text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2'>
                                        Display Priority (Order Number)
                                    </Label>
                                    <Input
                                        type='number'
                                        {...register('order_no')}
                                        placeholder='Enter order (e.g. 1)'
                                        className='h-11 rounded-md border-gray-200 bg-gray-50/50 focus:bg-white transition-all w-full md:w-1/3'
                                    />
                                    <p className='text-[10px] font-medium text-slate-400'>Lower numbers appear first within the same topic.</p>
                                </div>
                            </div>

                            {/* Assets */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-dashed'>
                                <div className='space-y-3'>
                                    <Label required className='text-[11px] font-bold uppercase tracking-wider text-slate-500'>Material File</Label>
                                    <FileUpload
                                        accept='application/pdf,image/*'
                                        onUploadComplete={(url) => {
                                            setUploadedFiles((prev) => ({ ...prev, file: url }))
                                            if (url) setFileError(false)
                                        }}
                                        defaultPreview={uploadedFiles.file}
                                    />
                                    {fileError && <p className='text-[10px] font-bold text-red-500 uppercase'>File is required</p>}
                                </div>

                                <div className='space-y-3'>
                                    <Label className='text-[11px] font-bold uppercase tracking-wider text-slate-500'>
                                        Thumbnail <span className='text-slate-400 normal-case font-medium'>(Optional)</span>
                                    </Label>
                                    <FileUpload
                                        onUploadComplete={(url) => setUploadedFiles((prev) => ({ ...prev, image: url }))}
                                        defaultPreview={uploadedFiles.image}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className='p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3'>
                    <Button type='button' variant='outline' onClick={onClose} className='h-11 px-6 rounded-md border-gray-200 font-bold text-slate-600'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        form='material-form'
                        disabled={formLoading}
                        className='bg-[#387cae] hover:bg-[#387cae]/90 text-white min-w-[140px] h-11 px-8 rounded-md font-bold shadow-lg shadow-[#387cae]/20'
                    >
                        {formLoading ? <Loader2 size={16} className='animate-spin mr-2' /> : null}
                        {formLoading ? 'Publishing…' : editing ? 'Update Content' : 'Publish Material'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
