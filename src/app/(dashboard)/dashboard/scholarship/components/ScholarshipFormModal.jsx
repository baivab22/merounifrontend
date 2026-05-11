'use client'

import { Button } from '@/ui/shadcn/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/ui/shadcn/dialog'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'
import { Textarea } from '@/ui/shadcn/textarea'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'
import { Calendar, Coins, FileText, Info, GraduationCap, Loader2, Check, Plus, Image as ImageIcon, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import FileUpload from '../../colleges/FileUpload'
import { fetchCategories } from '../actions'

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-md bg-[#387cae]/10 flex items-center justify-center text-[#387cae] shadow-sm border border-[#387cae]/20">
            <Icon size={20} />
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5 font-medium">{subtitle}</p>}
        </div>
    </div>
)

const ScholarshipFormModal = ({
    isOpen,
    onClose,
    editingId,
    initialData,
    onSave,
    submitting,
    author_id
}) => {
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [uploadedFiles, setUploadedFiles] = useState({ featured_image: '' })

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: '',
            description: '',
            categoryId: '',
            amount: '',
            applicationDeadline: '',
            contactInfo: '',
            meta_description: '',
            status: 'published',
            slug: ''
        }
    })

    useEffect(() => {
        if (isOpen) {
            if (editingId && initialData) {
                const formatInputDate = (dateStr) => {
                    if (!dateStr) return ''
                    try {
                        const date = new Date(dateStr)
                        if (isNaN(date.getTime())) return ''
                        return date.toISOString().split('T')[0]
                    } catch (e) {
                        return ''
                    }
                }

                reset({
                    name: initialData.name || '',
                    description: initialData.description || '',
                    categoryId: initialData.categoryId || '',
                    amount: initialData.amount != null ? String(initialData.amount) : '',
                    applicationDeadline: formatInputDate(initialData.applicationDeadline),
                    contactInfo: initialData.contactInfo || '',
                    meta_description: initialData.meta_description || '',
                    status: initialData.status || 'published',
                    slug: initialData.slug || ''
                })

                setUploadedFiles({
                    featured_image: initialData.featured_image || ''
                })

                setSelectedCategory(initialData.scholarshipCategory ? {
                    id: initialData.scholarshipCategory.id,
                    title: initialData.scholarshipCategory.title
                } : null)
            } else {
                reset({
                    name: '',
                    description: '',
                    categoryId: '',
                    amount: '',
                    applicationDeadline: '',
                    contactInfo: '',
                    meta_description: '',
                    status: 'published',
                    slug: ''
                })
                setUploadedFiles({ featured_image: '' })
                setSelectedCategory(null)
            }
        }
    }, [isOpen, editingId, initialData, reset])

    const onSubmitForm = async (data) => {
        const payload = {
            ...data,
            author: author_id,
            featured_image: uploadedFiles.featured_image || ''
        }
        onSave(payload)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} className='max-w-6xl'>
            <DialogHeader className="bg-white border-b border-gray-100 p-6">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="text-[#387cae]" size={24} />
                    {editingId ? 'Edit Scholarship' : 'Add New Scholarship'}
                </DialogTitle>
                <DialogClose onClick={onClose} />
            </DialogHeader>

            <DialogContent className="p-0 bg-gray-50/50 overflow-hidden flex flex-col max-h-[95vh] rounded-2xl border-none shadow-2xl">
                <form
                    onSubmit={handleSubmit(onSubmitForm)}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <div className="flex-1 overflow-y-auto p-8 sidebar-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6">
                            {/* Left Column (8/12) */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={Info} title="Basic Information" subtitle="Primary details of the scholarship" />
                                    <div className='space-y-6'>
                                        <div>
                                            <Label required={true} htmlFor='name'>Scholarship Name</Label>
                                            <Input
                                                id='name'
                                                placeholder='e.g. Merit-based Scholarship 2024'
                                                {...register('name', { required: 'Scholarship name is required' })}
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                                        </div>

                                        <div>
                                            <Label required={true}>Category</Label>
                                            <SearchSelectCreate
                                                onSearch={fetchCategories}
                                                onSelect={(item) => {
                                                    setSelectedCategory(item)
                                                    setValue('categoryId', item.id, { shouldValidate: true })
                                                }}
                                                onRemove={() => {
                                                    setSelectedCategory(null)
                                                    setValue('categoryId', '', { shouldValidate: true })
                                                }}
                                                selectedItems={selectedCategory}
                                                placeholder="Select category..."
                                                isMulti={false}
                                                displayKey="title"
                                            />
                                            <input type="hidden" {...register('categoryId', { required: 'Category is required' })} />
                                            {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor='description'>Description</Label>
                                            <TipTapEditor
                                                value={watch('description')}
                                                onChange={(val) => setValue('description', val)}
                                                placeholder='Write a detailed description...'
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={Coins} title="Amount & Contact" subtitle="Scholarship value and how to apply" />
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                                        <div>
                                            <Label htmlFor='amount'>Amount / Value</Label>
                                            <Input
                                                id='amount'
                                                placeholder='e.g. 50,000 or Full tuition'
                                                {...register('amount')}
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Label required={true} htmlFor='contactInfo'>Contact Information</Label>
                                            <Input
                                                id='contactInfo'
                                                placeholder='Phone, email, or office location...'
                                                {...register('contactInfo', { required: 'Contact info is required' })}
                                                className={errors.contactInfo ? 'border-red-500' : ''}
                                            />
                                            {errors.contactInfo && <p className="text-xs text-red-500 mt-1">{errors.contactInfo.message}</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (4/12) */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={ImageIcon} title="Thumbnail logo" subtitle="Shown on listings and detail views (optional)" />
                                    <div className='p-4 bg-gray-50 rounded-md border border-gray-100 border-dashed'>
                                        <Label className='text-xs font-semibold tracking-wider mb-3 block'>Logo / cover image</Label>
                                        <FileUpload
                                            label=''
                                            autoUpload={true}
                                            authorId={author_id != null ? String(author_id) : '1'}
                                            onUploadComplete={(url) => {
                                                setUploadedFiles((prev) => ({ ...prev, featured_image: url || '' }))
                                            }}
                                            defaultPreview={uploadedFiles.featured_image}
                                        />
                                    </div>
                                </div>

                                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={Calendar} title="Status & Deadline" subtitle="Availability and schedule" />
                                    <div className='space-y-4'>
                                        <div>
                                            <Label required={true} htmlFor='applicationDeadline' className='text-xs font-semibold uppercase text-gray-400'>Application Deadline</Label>
                                            <Input
                                                id='applicationDeadline'
                                                type="date"
                                                {...register('applicationDeadline', { required: 'Deadline is required' })}
                                                className={`mt-1 ${errors.applicationDeadline ? 'border-red-500' : ''}`}
                                            />
                                            {errors.applicationDeadline && <p className="text-xs text-red-500 mt-1">{errors.applicationDeadline.message}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={Settings} title="SEO Settings" subtitle="Search engine optimization" />
                                    <div className='space-y-4'>
                                        <div>
                                            <Label htmlFor='slug'>URL Slug</Label>
                                            <Input
                                                id='slug'
                                                {...register('slug')}
                                                placeholder='url-slug-here'
                                                className='text-sm'
                                            />
                                            <p className='text-[10px] text-gray-400 mt-1 italic'>
                                                Leave empty to auto-generate from name
                                            </p>
                                        </div>
                                        <div>
                                            <Label htmlFor='meta_description'>Meta Description</Label>
                                            <Textarea
                                                id='meta_description'
                                                {...register('meta_description')}
                                                placeholder='SEO meta description...'
                                                className='min-h-[100px] text-sm'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='shrink-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3 z-20'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onClose}
                            className='px-8 border-gray-200 text-gray-600 hover:bg-gray-50'
                        >
                            Cancel
                        </Button>
                        <button
                            type='button'
                            onClick={() => {
                                setValue('status', 'draft', { shouldDirty: true });
                                handleSubmit(onSubmitForm)();
                            }}
                            disabled={submitting}
                            className='bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2 rounded-md transition-all flex items-center gap-2'
                        >
                            <FileText size={18} />
                            <span>Save as Draft</span>
                        </button>
                        <Button
                            type='button'
                            onClick={() => {
                                setValue('status', 'published', { shouldDirty: true });
                                handleSubmit(onSubmitForm)();
                            }}
                            disabled={submitting}
                            className='bg-[#387cae] hover:bg-[#2d638c] text-white px-8 shadow-md transition-all active:scale-95 flex items-center gap-2'
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    {editingId ? <Check size={18} /> : <Plus size={18} />}
                                    <span>{editingId ? 'Update Scholarship' : 'Create Scholarship'}</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ScholarshipFormModal
