'use client'

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Loader2, FileText, AlignLeft, Hash } from 'lucide-react';
import { authFetch } from '@/app/utils/authFetch';
import { cn } from '@/app/lib/utils';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/ui/shadcn/dialog';
import { Button } from '@/ui/shadcn/button';
import { Input } from '@/ui/shadcn/input';
import { Label } from '@/ui/shadcn/label';
import SearchSelectCreate from '@/ui/shadcn/search-select-create';
import FileUpload from '../../colleges/FileUpload';

export default function MaterialFormDialog({ isOpen, onClose, editing, editId, authorId, onSuccess }) {
    const [formLoading, setFormLoading] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState({ image: '', file: '' })
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [selectedSubCategory, setSelectedSubCategory] = useState(null)
    const [subCategories, setSubCategories] = useState([])
    const [subLoading, setSubLoading] = useState(false)
    const [selectedTags, setSelectedTags] = useState([])
    const [fileError, setFileError] = useState(false)

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            order_no: '',
            author: authorId,
            tags: [],
            file: '',
            image: '',
            category_id: '',
            sub_category_id: ''
        }
    })

    useEffect(() => {
        if (isOpen) {
            if (editing && editId) {
                fetchMaterialDetails(editId)
            } else {
                reset({
                    title: '',
                    description: '',
                    order_no: '',
                    author: authorId,
                    tags: [],
                    file: '',
                    image: '',
                    category_id: '',
                    sub_category_id: ''
                })
                setUploadedFiles({ image: '', file: '' })
                setSelectedCategory(null)
                setSelectedSubCategory(null)
                setSubCategories([])
                setSelectedTags([])
            }
            setFileError(false)
        }
    }, [isOpen, editing, editId, authorId, reset])

    // Load subcategories whenever category changes
    useEffect(() => {
        if (selectedCategory?.id) {
            fetchSubCategories(selectedCategory.id)
        } else {
            setSubCategories([])
            setSelectedSubCategory(null)
        }
    }, [selectedCategory])

    const fetchMaterialDetails = async (id) => {
        try {
            setFormLoading(true)
            const response = await authFetch(`${process.env.baseUrl}/material/${id}`)
            const data = await response.json()
            const material = data.material

            setValue('title', material.title)
            setValue('description', material.description || '')
            setValue('order_no', material.order_no || '')
            setSelectedTags(material.tagDetails ? material.tagDetails.map(t => ({ id: t.id, title: t.title })) : [])
            setSelectedCategory(material.category ? { id: material.category.id, title: material.category.title } : null)
            setSelectedSubCategory(material.sub_category ? { id: material.sub_category.id, title: material.sub_category.title } : null)
            setUploadedFiles({ image: material.image || '', file: material.file || '' })
        } catch {
            toast.error('Failed to fetch material details')
            onClose()
        } finally {
            setFormLoading(false)
        }
    }

    const fetchSubCategories = async (categoryId) => {
        try {
            setSubLoading(true)
            const response = await authFetch(`${process.env.baseUrl}/category/sub/${categoryId}`)
            const data = await response.json()
            setSubCategories(data.items || data || [])
        } catch {
            setSubCategories([])
        } finally {
            setSubLoading(false)
        }
    }

    const fetchTags = async (query) => {
        try {
            const response = await authFetch(`${process.env.baseUrl}/tag?q=${query}`)
            const data = await response.json()
            return data.items || []
        } catch { return [] }
    }

    const fetchCategoriesSearch = async (query) => {
        try {
            const response = await authFetch(
                `${process.env.baseUrl}/category?type=MATERIAL&limit=100${query ? `&q=${query}` : ''}`
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
                tags: selectedTags.map(t => t.id),
                image: uploadedFiles.image || null,
                file: uploadedFiles.file,
                category_id: selectedCategory?.id ? parseInt(selectedCategory.id, 10) : null,
                sub_category_id: selectedSubCategory?.id ? parseInt(selectedSubCategory.id, 10) : null
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
        <Dialog isOpen={isOpen} onClose={onClose} className='max-w-2xl'>
            <DialogContent className='max-w-2xl p-0'>
                <DialogHeader className='px-6 py-4 border-b bg-slate-50/50 rounded-t-lg'>
                    <DialogTitle className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-md bg-[#387cae] flex items-center justify-center text-white'>
                            <FileText size={18} />
                        </div>
                        {editing ? 'Edit Material' : 'Add New Material'}
                    </DialogTitle>
                    <DialogClose onClick={onClose} />
                </DialogHeader>

                <div className='p-6'>
                    <form id='material-form' onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6'>
                            <div className='space-y-2'>
                                <Label required className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Title</Label>
                                <Input
                                    {...register('title', {
                                        required: 'Title is required',
                                        minLength: { value: 3, message: 'Title must be at least 3 characters long' }
                                    })}
                                    placeholder='Enter a descriptive title'
                                    className={cn('h-11', errors.title && 'border-red-500 focus:ring-red-500/10')}
                                />
                                {errors.title && <p className='text-[10px] font-bold text-red-500 uppercase mt-1'>{errors.title.message}</p>}
                            </div>

                            <div className='space-y-2'>
                                <Label className='text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2'>
                                    <AlignLeft size={14} /> Description
                                </Label>
                                <textarea
                                    {...register('description')}
                                    placeholder='Enter material description (optional)'
                                    className='flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#387cae]/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Category</Label>
                                    <SearchSelectCreate
                                        onSearch={fetchCategoriesSearch}
                                        onSelect={(item) => {
                                            setSelectedCategory(item)
                                            setSelectedSubCategory(null)
                                        }}
                                        onRemove={() => {
                                            setSelectedCategory(null)
                                            setSelectedSubCategory(null)
                                        }}
                                        selectedItems={selectedCategory}
                                        placeholder='Select Category'
                                        isMulti={false}
                                        displayKey='title'
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Subcategory</Label>
                                    <select
                                        disabled={!selectedCategory || subLoading}
                                        value={selectedSubCategory?.id || ''}
                                        onChange={(e) => {
                                            const sub = subCategories.find(s => s.id.toString() === e.target.value)
                                            setSelectedSubCategory(sub ? { id: sub.id, title: sub.title } : null)
                                        }}
                                        className='flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#387cae]/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                    >
                                        <option value="">{subLoading ? 'Loading...' : 'Select Subcategory'}</option>
                                        {subCategories.map(sub => (
                                            <option key={sub.id} value={sub.id}>{sub.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2'>
                                        <Hash size={14} /> Order Number
                                    </Label>
                                    <Input
                                        type='number'
                                        {...register('order_no')}
                                        placeholder='Priority (e.g. 1)'
                                        className='h-11'
                                    />
                                    <p className='text-[10px] text-slate-400'>Lower numbers appear first.</p>
                                </div>

                                <div className='space-y-2'>
                                    <Label className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Tags</Label>
                                    <SearchSelectCreate
                                        onSearch={fetchTags}
                                        onSelect={(item) => {
                                            if (!selectedTags.find(t => t.id === item.id)) {
                                                setSelectedTags([...selectedTags, item])
                                            }
                                        }}
                                        onRemove={(item) => setSelectedTags(selectedTags.filter(t => t.id !== item.id))}
                                        selectedItems={selectedTags}
                                        placeholder='Add tags…'
                                        isMulti={true}
                                        displayKey='title'
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-dashed'>
                            <div className='space-y-3'>
                                <Label required className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Material File</Label>
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
                                <Label className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                                    Thumbnail <span className='text-slate-400 normal-case font-medium'>(Optional)</span>
                                </Label>
                                <FileUpload
                                    onUploadComplete={(url) => setUploadedFiles((prev) => ({ ...prev, image: url }))}
                                    defaultPreview={uploadedFiles.image}
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className='sticky bottom-0 bg-white border-t p-4 px-6 flex justify-end gap-3 rounded-b-lg'>
                    <Button type='button' variant='outline' onClick={onClose} className='h-11 px-6'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        form='material-form'
                        disabled={formLoading}
                        className='bg-[#387cae] hover:bg-[#387cae]/90 text-white min-w-[140px] h-11 px-6 font-bold shadow-lg shadow-[#387cae]/20'
                    >
                        {formLoading ? <Loader2 size={16} className='animate-spin mr-2' /> : null}
                        {formLoading ? 'Processing…' : editing ? 'Update Content' : 'Publish Material'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
