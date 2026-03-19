import { authFetch } from '@/app/utils/authFetch'
import { Button } from '@/ui/shadcn/button'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/ui/shadcn/dialog'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'
import axios from 'axios'
import { Calendar, Image as ImageIcon, Info, Layers, Loader2, MapPin, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useToast } from '@/hooks/use-toast'
import FileUpload from '../../colleges/FileUpload'
import { Textarea } from '@/ui/shadcn/textarea'

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-6 font-primary">
        <div className="w-10 h-10 rounded-md bg-[#387cae]/10 flex items-center justify-center text-[#387cae] shadow-sm border border-[#387cae]/20">
            <Icon size={20} />
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5 font-medium">{subtitle}</p>}
        </div>
    </div>
)

const EventFormModal = ({
    isOpen,
    onClose,
    isEditing,
    initialData,
    categories,
    onSave,
    submitting,
}) => {
    const { toast } = useToast()
    const [uploadedImage, setUploadedImage] = useState('')
    const [selectedCollege, setSelectedCollege] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [imageError, setImageError] = useState('')

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        getValues,
        clearErrors,
        trigger,
        formState: { errors, submitCount }
    } = useForm({
        defaultValues: {
            title: '',
            category_id: '',
            college_id: null,
            content: '',
            image: '',
            event_host: {
                start_date: '',
                end_date: '',
                time: '',
                host: '',
                location: '',
                map_url: '',
                event_organizer: ''
            },
            is_featured: false,
            meta_description: ''
        }
    })

    // Refs for scroll-to-error
    const titleRef = useRef(null)
    const categoryRef = useRef(null)
    const hostRef = useRef(null)
    const startDateRef = useRef(null)
    const endDateRef = useRef(null)
    const contentRef = useRef(null)
    const imageRef = useRef(null)

    // Scroll to first error after submit attempt
    useEffect(() => {
        if (submitCount === 0) return
        const fieldOrder = [
            { key: 'title', ref: titleRef },
            { key: 'category_id', ref: categoryRef },
            { key: 'event_host.host', ref: hostRef },
            { key: 'event_host.start_date', ref: startDateRef },
            { key: 'event_host.end_date', ref: endDateRef },
            { key: 'content', ref: contentRef }
        ]
        for (const { key, ref } of fieldOrder) {
            const keys = key.split('.')
            let hasError = errors
            for (const k of keys) {
                hasError = hasError?.[k]
            }

            if (hasError && ref.current) {
                ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
                const input = ref.current.querySelector('input, textarea, [contenteditable]')
                if (input) input.focus()
                return
            }
        }

        if (imageError && imageRef.current) {
            imageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [submitCount, errors, imageError])

    useEffect(() => {
        if (isOpen) {
            clearErrors()
            if (isEditing && initialData) {
                let eventHost = initialData.event_host
                if (typeof eventHost === 'string') {
                    try { eventHost = JSON.parse(eventHost) } catch { eventHost = {} }
                }

                const catId = String(initialData.category?.id || initialData.category_id || '')

                reset({
                    title: initialData.title || '',
                    category_id: catId,
                    college_id: initialData.college?.id || initialData.college_id || null,
                    content: initialData.content || '',
                    image: initialData.image || '',
                    event_host: {
                        start_date: eventHost?.start_date || '',
                        end_date: eventHost?.end_date || '',
                        time: eventHost?.time || '',
                        host: eventHost?.host || '',
                        location: eventHost?.location || '',
                        map_url: eventHost?.map_url || '',
                        event_organizer: eventHost?.event_organizer || ''
                    },
                    is_featured: initialData.is_featured === 1 || initialData.is_featured === true || initialData.is_featured === '1',
                    meta_description: initialData.meta_description || ''
                })
                setUploadedImage(initialData.image || '')

                // Handle Category Initialization for SearchSelect
                if (initialData.category) {
                    setSelectedCategory(initialData.category)
                } else if (initialData.category_id && categories.length > 0) {
                    const cat = categories.find(c => String(c.id) === String(initialData.category_id))
                    if (cat) setSelectedCategory(cat)
                } else {
                    setSelectedCategory(null)
                }

                // Handle College Initialization (Optional)
                if (initialData.college) {
                    setSelectedCollege(initialData.college)
                } else {
                    setSelectedCollege(null)
                }

                // Force validation check to clear "required" errors if data is present
                if (catId) {
                    setTimeout(() => trigger('category_id'), 100)
                }

            } else {
                reset({
                    title: '',
                    category_id: '',
                    college_id: null,
                    content: '',
                    image: '',
                    event_host: {
                        start_date: '',
                        end_date: '',
                        time: '',
                        host: '',
                        location: '',
                        map_url: '',
                        event_organizer: ''
                    },
                    is_featured: false,
                    meta_description: ''
                })
                setUploadedImage('')
                setSelectedCategory(null)
                setSelectedCollege(null)
            }
            setImageError('')
        }
    }, [isOpen, isEditing, initialData, reset, setValue, clearErrors, trigger, categories])

    const searchCollege = async (query) => {
        try {
            const url = query && query.length >= 1
                ? `${process.env.baseUrl}/college?q=${query}&limit=50`
                : `${process.env.baseUrl}/college?limit=50`
            const response = await authFetch(url)
            const data = await response.json()
            return data.items || []
        } catch (error) {
            console.error('College Search Error:', error)
            return []
        }
    }

    const searchCategory = async (query) => {
        try {
            const filtered = categories.filter((c) =>
                c.title.toLowerCase().includes((query || '').toLowerCase())
            )
            return filtered
        } catch (error) {
            return categories
        }
    }

    const handleSelectCategory = (category) => {
        setSelectedCategory(category)
        setValue('category_id', category.id, { shouldValidate: true })
    }

    const handleRemoveCategory = () => {
        setSelectedCategory(null)
        setValue('category_id', '', { shouldValidate: true })
    }

    const handleSelectCollege = (college) => {
        setSelectedCollege(college)
        setValue('college_id', college.id, { shouldValidate: true })
    }

    const handleRemoveCollege = () => {
        setSelectedCollege(null)
        setValue('college_id', null, { shouldValidate: true })
    }

    const onMediaUpload = async (file) => {
        const formData = new FormData()
        formData.append('title', file.name)
        formData.append('altText', file.name)
        formData.append('description', '')
        formData.append('file', file)
        formData.append('authorId', '1')

        try {
            const response = await axios.post(
                `${process.env.mediaUrl}${process.env.version}/media/upload`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            return response.data?.media?.url
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to upload image',
                variant: 'destructive'
            })
            throw error
        }
    }

    const onSubmitForm = (data) => {
        if (!uploadedImage) {
            setImageError('Featured image is required')
            if (imageRef.current) {
                imageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            return
        }

        const contentPlain = (data.content || '').replace(/<[^>]*>/g, '').trim()
        if (!contentPlain) {
            toast({
                title: 'Error',
                description: 'Content is required',
                variant: 'destructive'
            })
            return
        }

        const finalData = {
            ...data,
            is_featured: Number(data.is_featured),
            image: uploadedImage
        }
        onSave(finalData)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} className='max-w-6xl'>
            <DialogHeader className="bg-white border-b border-gray-100 p-6">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="text-[#387cae]" size={24} />
                    {isEditing ? 'Edit Event' : 'Create New Event'}
                </DialogTitle>
                <DialogClose onClick={onClose} />
            </DialogHeader>
            <DialogContent className="p-0 bg-gray-50/50">
                <form
                    onSubmit={handleSubmit(onSubmitForm)}
                    className='flex flex-col max-h-[calc(100vh-120px)]'
                >
                    <div className='flex-1 p-8 overflow-y-auto custom-scrollbar'>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6">
                            {/* Left Column (8/12) */}
                            <div className="lg:col-span-8 space-y-8">
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={Info} title="Basic Information" subtitle="Primary event details" />
                                    <div className='space-y-6'>
                                        <div ref={titleRef}>
                                            <Label required={true} htmlFor='title'>Event Title</Label>
                                            <Input
                                                id='title'
                                                placeholder='Enter event title...'
                                                {...register('title', { required: 'Title is required' })}
                                            />
                                            {errors.title && (
                                                <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{errors.title.message}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div ref={categoryRef}>
                                                <Label required={true} htmlFor='category_id'>Category</Label>
                                                <SearchSelectCreate
                                                    onSearch={searchCategory}
                                                    onSelect={handleSelectCategory}
                                                    onRemove={handleRemoveCategory}
                                                    selectedItems={selectedCategory}
                                                    placeholder="Select category..."
                                                    displayKey="title"
                                                    valueKey="id"
                                                    isMulti={false}
                                                    allowCreate={false}
                                                />
                                                <input type="hidden" {...register('category_id', { required: 'Category is required' })} />
                                                {errors.category_id && (
                                                    <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{errors.category_id.message}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor='college_id'>Associated College</Label>
                                                <SearchSelectCreate
                                                    onSearch={searchCollege}
                                                    onSelect={handleSelectCollege}
                                                    onRemove={handleRemoveCollege}
                                                    selectedItems={selectedCollege}
                                                    placeholder="Search college..."
                                                    displayKey="name"
                                                    valueKey="id"
                                                    isMulti={false}
                                                    allowCreate={false}
                                                />
                                                <input type="hidden" {...register('college_id')} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Host & Schedule Section */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={Calendar} title="Host & Schedule" subtitle="Time and location management" />
                                    <div className='space-y-6'>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div ref={hostRef}>
                                                <Label required={true} htmlFor='host'>Host Organizer</Label>
                                                <Input
                                                    id='host'
                                                    placeholder='Event host name...'
                                                    {...register('event_host.host', { required: 'Host name is required' })}
                                                />
                                                {errors.event_host?.host && (
                                                    <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{errors.event_host.host.message}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor='event_organizer'>Primary Organizer (Contact Person)</Label>
                                                <Input
                                                    id='event_organizer'
                                                    placeholder='e.g., Sujan Thapa'
                                                    {...register('event_host.event_organizer')}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <div ref={startDateRef}>
                                                <Label required={true}>Start Date</Label>
                                                <Input
                                                    type='date'
                                                    {...register('event_host.start_date', { required: 'Start date is required' })}
                                                />
                                                {errors.event_host?.start_date && (
                                                    <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{errors.event_host.start_date.message}</p>
                                                )}
                                            </div>
                                            <div ref={endDateRef}>
                                                <Label required={true}>End Date</Label>
                                                <Input
                                                    type='date'
                                                    {...register('event_host.end_date', { required: 'End date is required' })}
                                                />
                                                {errors.event_host?.end_date && (
                                                    <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{errors.event_host.end_date.message}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label>Time</Label>
                                                <Input type='time' {...register('event_host.time')} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor='location' className="flex items-center gap-1.5"><MapPin size={14} /> Physical Location</Label>
                                                <Input
                                                    id='location'
                                                    placeholder='Kathmandu, Nepal'
                                                    {...register('event_host.location')}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor='map_url' className="flex items-center gap-1.5"><MapPin size={14} /> Map Location URL</Label>
                                                <Input
                                                    id='map_url'
                                                    placeholder='https://google.com/maps/...'
                                                    {...register('event_host.map_url')}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Content */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={Info} title="Event Content" subtitle="Detailed information and schedule" />
                                    <div className="pt-2" ref={contentRef}>
                                        <Label required={true} className="text-gray-700 font-semibold mb-2.5 block text-sm">Long Content Body</Label>
                                        <TipTapEditor
                                            onMediaUpload={onMediaUpload}
                                            showImageUpload={true}
                                            value={getValues('content')}
                                            onChange={(data) => {
                                                setValue('content', data, { shouldValidate: true })
                                            }}
                                            placeholder='Detail the event schedule, speakers, etc...'
                                            height='350px'
                                        />
                                        <input type="hidden" {...register('content', { required: 'Content is required' })} />
                                        {errors.content && (
                                            <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{errors.content.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (4/12) */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Image Upload Area */}
                                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={ImageIcon} title="Media" subtitle="Featured Image" />
                                    <div className="p-4 bg-gray-50 rounded-md border border-gray-100 border-dashed" ref={imageRef}>
                                        <Label required={true} className="text-xs font-semibold tracking-wider mb-3 block">Featured Event Image</Label>
                                        <FileUpload
                                            label=''
                                            autoUpload={true}
                                            onFileSelect={() => setImageError('')}
                                            onUploadComplete={(url) => {
                                                setUploadedImage(url)
                                                setValue('image', url)
                                                if (url) setImageError('')
                                            }}
                                            defaultPreview={uploadedImage}
                                        />
                                        {imageError && (
                                            <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{imageError}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Settings Section */}
                                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={Settings} title="Settings" subtitle="Additional options" />
                                    <div className='space-y-6'>
                                        <div className="flex items-center justify-between p-4 bg-[#387cae]/5 rounded-md border border-[#387cae]/10">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="is_featured"
                                                    {...register('is_featured')}
                                                    className="w-5 h-5 rounded border-gray-300 text-[#387cae] focus:ring-[#387cae]"
                                                />
                                                <Label htmlFor="is_featured" className="text-sm font-bold text-[#387cae] cursor-pointer">
                                                    Mark as Featured
                                                </Label>
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor='meta_description'>SEO Meta Description</Label>
                                            <Textarea
                                                id='meta_description'
                                                {...register('meta_description')}
                                                placeholder='Meta description for SEO...'
                                                className='min-h-[100px] resize-none'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3 z-10 rounded-b-lg'>
                        <Button
                            type='button'
                            onClick={onClose}
                            variant='outline'
                        >
                            Cancel
                        </Button>
                        <Button
                            type='submit'
                            disabled={submitting}
                            className="bg-[#387cae] hover:bg-[#387cae]/90 text-white min-w-[120px]"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            <span>
                                {submitting
                                    ? (isEditing ? 'Syncing...' : 'Submitting...')
                                    : (isEditing ? 'Update Event' : 'Create Event')}
                            </span>
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EventFormModal
