'use client'
import FileUpload from '@/app/(dashboard)/dashboard/colleges/FileUpload'
import { createOrUpdateConsultancy, fetchCourses, fetchCountries, fetchDistricts } from '@/app/(dashboard)/dashboard/consultancy/actions'
import { Button } from '@/ui/shadcn/button'
import { Checkbox } from '@/ui/shadcn/checkbox'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/ui/shadcn/dialog'
import { Input } from '@/ui/shadcn/input'
import { Textarea } from '@/ui/shadcn/textarea'
import { Label } from '@/ui/shadcn/label'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'
import { Select } from '@/ui/shadcn/select'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useToast } from '@/hooks/use-toast'
import { CITIES } from '@/constants/City'
import { Info, Image as ImageIcon, MapPin, Loader2, Layers, BookOpen, Link as LinkIcon, FileText, Check, Plus } from 'lucide-react'

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

export default function CreateUpdateConsultancy({
    isOpen,
    onClose,
    onSuccess,
    initialData = null
}) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [selectedCourses, setSelectedCourses] = useState([])
    const [selectedDestinations, setSelectedDestinations] = useState([])
    const [districtsList, setDistrictsList] = useState([])

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            title: '',
            destination: [],
            address: {
                street: '',
                city: '',
                district: '',
                zip: ''
            },
            description: '',
            contact: ['', ''],
            website_url: '',
            google_map_url: '',
            video_url: '',
            featured_image: '',
            logo: '',
            pinned: 0,
            courses: [],
            map_type: "",
            meta_description: "",
            status: "published"
        }
    })

    // Initialize data
    useEffect(() => {
        fetchDistricts().then(res => setDistrictsList(res || []));
    }, [])

    // Initialize form when opening
    useEffect(() => {
        if (isOpen && initialData) {
            const consultancy = initialData

            // Handle Courses/Colleges
            if (consultancy.consultancyCourses) {
                const consultData = consultancy.consultancyCourses.map((c) => ({
                    id: c.id,
                    title: c.title
                }))
                setSelectedCourses(consultData)
                setValue('courses', consultData.map((c) => c.id))
            } else {
                setSelectedCourses([])
                setValue('courses', [])
            }

            // Parse Destination
            let parsedDestination = []
            try {
                parsedDestination = Array.isArray(consultancy.destination)
                    ? consultancy.destination
                    : typeof consultancy.destination === 'string'
                        ? JSON.parse(consultancy.destination)
                        : []
            } catch (e) {
                parsedDestination = []
            }

            const destinationForForm = (Array.isArray(parsedDestination) ? parsedDestination : [])
                .map((d) => {
                    const title = typeof d === 'string' ? d : (d?.country || d?.title || '')
                    return { id: title, title: title }
                }).filter(d => d.id)

            setSelectedDestinations(destinationForForm)
            setValue('destination', destinationForForm.map(d => d.title))

            // Parse Address
            let address = { street: '', city: '', district: '', zip: '' }
            try {
                const parsedAddress = typeof consultancy.address === 'string'
                    ? JSON.parse(consultancy.address)
                    : consultancy.address || {}
                
                // Handle migration from state to district
                if (parsedAddress.state && !parsedAddress.district) {
                    parsedAddress.district = parsedAddress.state
                }
                address = { ...address, ...parsedAddress }
            } catch (e) { }

            // Parse Contact
            let parsedContact = ['', '']
            try {
                const contactData = consultancy.contact
                    ? typeof consultancy.contact === 'string'
                        ? JSON.parse(consultancy.contact)
                        : consultancy.contact
                    : []
                parsedContact = Array.isArray(contactData) ? contactData : []
                if (parsedContact.length < 2) {
                    parsedContact = [...parsedContact, ...Array(2 - parsedContact.length).fill('')]
                }
            } catch (e) { }

            reset({
                title: consultancy.title || '',
                description: consultancy.description || '',
                website_url: consultancy.website_url || '',
                google_map_url: consultancy.google_map_url || '',
                video_url: consultancy.video_url || '',
                map_type: consultancy.map_type || '',
                destination: destinationForForm.length ? destinationForForm : [],
                address: address,
                contact: parsedContact,
                pinned: consultancy.pinned || 0,
                featured_image: consultancy.featured_image || '',
                logo: consultancy.logo || '',
                courses: consultancy.consultancyCourses?.map(c => c.id) || [],
                meta_description: consultancy.meta_description || '',
                status: consultancy.status || 'published'
            })
        } else if (isOpen && !initialData) {
            reset({
                title: '',
                video_url: '',
                featured_image: '',
                logo: '',
                pinned: 0,
                courses: [],
                meta_description: '',
                status: 'published'
            })
            setSelectedCourses([])
            setSelectedDestinations([])
        }
    }, [isOpen, initialData, reset, setValue])

    const onSubmit = async (data) => {
        try {
            setLoading(true)
            const payload = {
                ...data,
                title: data.title?.trim(),
                contact: data.contact.filter(Boolean),
                courses: Array.isArray(data.courses) ? data.courses : (data.courses ? [data.courses] : []),
                destination: selectedDestinations.map(d => d.title).filter(Boolean)
            }

            if (initialData?.id) {
                payload.id = initialData.id
            }

            await createOrUpdateConsultancy(payload)
            toast({
                title: 'Success',
                description: initialData ? 'Consultancy updated successfully!' : 'Consultancy created successfully!'
            })
            onSuccess?.()
            onClose()
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to save consultancy',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} closeOnOutsideClick={false} className='max-w-6xl '>
            <DialogHeader className="bg-white border-b border-gray-100 p-6">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="text-[#387cae]" size={24} />
                    {initialData ? 'Edit Consultancy' : 'Add New Consultancy'}
                </DialogTitle>
                <DialogClose onClick={onClose} />
            </DialogHeader>

            <DialogContent className="p-0 bg-gray-50/50 overflow-hidden flex flex-col max-h-[95vh] rounded-2xl border-none shadow-2xl">
                <form id="consultancy-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 sidebar-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6">
                            {/* Left Column (8/12) */}
                            <div className="lg:col-span-8 space-y-8">
                                {/* Basic Information */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={Info} title="Basic Information" subtitle="Primary details of the consultancy" />
                                    <div className='space-y-6'>
                                        <div>
                                            <Label required>Consultancy Title</Label>
                                            <Input placeholder='Enter consultancy name' {...register('title', { required: 'Title is required' })} />
                                            {errors.title && <p className='text-xs text-red-500 mt-1'>{errors.title.message}</p>}
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <TipTapEditor value={watch('description')} onChange={(val) => setValue('description', val)} placeholder='Detailed description of services...' />
                                        </div>
                                        <div>
                                            <Label>Meta Description</Label>
                                            <Textarea {...register('meta_description')} placeholder='SEO Meta description...' className='min-h-[80px]' />
                                        </div>
                                    </div>
                                </div>

                                {/* Destinations & Courses */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={BookOpen} title="Student's Destination & Courses" subtitle="Geographics and available programs" />
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                        <div className='space-y-4'>
                                            <Label>Student's Destination (Countries)</Label>
                                            <SearchSelectCreate
                                                allowCreate={true}
                                                onSearch={async (query) => {
                                                    const all = await fetchCountries();
                                                    if (!query) return all.map(c => ({ id: c, title: c }));
                                                    const lower = query.toLowerCase();
                                                    return all.filter(c => c.toLowerCase().includes(lower)).map(c => ({ id: c, title: c }));
                                                }}
                                                onCreate={(query) => ({ id: query, title: query })}
                                                onSelect={(item) => {
                                                    const current = selectedDestinations || []
                                                    if (!current.some(d => d.id === item.id)) {
                                                        const updated = [...current, item]
                                                        setSelectedDestinations(updated)
                                                        setValue('destination', updated.map(d => d.title))
                                                    }
                                                }}
                                                onRemove={(item) => {
                                                    const updated = selectedDestinations.filter(d => d.id !== item.id)
                                                    setSelectedDestinations(updated)
                                                    setValue('destination', updated.map(d => d.title))
                                                }}
                                                selectedItems={selectedDestinations}
                                                placeholder="Add countries..."
                                                isMulti={true}
                                                displayKey="title"
                                            />
                                        </div>
                                        <div className='space-y-4'>
                                            <Label>Courses Offered</Label>
                                            <SearchSelectCreate
                                                onSearch={fetchCourses}
                                                onSelect={(item) => {
                                                    const current = watch('courses') || []
                                                    if (!current.includes(item.id)) {
                                                        setValue('courses', [...current, item.id])
                                                        setSelectedCourses(prev => [...prev, item])
                                                    }
                                                }}
                                                onRemove={(item) => {
                                                    const current = watch('courses') || []
                                                    setValue('courses', current.filter(id => id !== item.id))
                                                    setSelectedCourses(prev => prev.filter(c => c.id !== item.id))
                                                }}
                                                selectedItems={selectedCourses}
                                                placeholder="Search and add courses..."
                                                isMulti={true}
                                                displayKey="title"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact & Location */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={MapPin} title="Contact & Location" subtitle="Physical address and reach details" />
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        <div className='space-y-4'>
                                            <div className='grid grid-cols-2 gap-4'>
                                                <div>
                                                    <Label>Contact Number 1</Label>
                                                    <Input {...register('contact.0')} placeholder='Phone 1' />
                                                </div>
                                                <div>
                                                    <Label>Contact Number 2</Label>
                                                    <Input {...register('contact.1')} placeholder='Phone 2' />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Map Type</Label>
                                                <Controller
                                                    name='map_type'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                                                            <option value=''>Select Type</option>
                                                            <option value='embed_map_url'>Embed URL</option>
                                                            <option value='google_map_url'>Google Map URL</option>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <Label>Map Link/Code</Label>
                                                <Input {...register('google_map_url')} placeholder='URL or Iframe src' />
                                            </div>
                                        </div>

                                        <div className='space-y-4'>
                                            <div className='grid grid-cols-2 gap-4'>
                                                <div>
                                                    <Label>City</Label>
                                                    <select
                                                        id='address.city'
                                                        {...register('address.city')}
                                                        className='flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:border-[#387cae]'
                                                    >
                                                        <option value=''>Select City</option>
                                                        {CITIES.map((city) => (
                                                            <option key={city} value={city}>{city}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <Label>District</Label>
                                                    <select
                                                        id='address.district'
                                                        {...register('address.district')}
                                                        className='flex h-10 w-full rounded-md border border-gray-200 bg-background px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:border-[#387cae]'
                                                    >
                                                        <option value=''>Select District</option>
                                                        {districtsList.map((district) => (
                                                            <option key={district} value={district}>{district}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Street Address</Label>
                                                <Input {...register('address.street')} placeholder='Street, ZIP, etc.' />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column (4/12) */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Media & Status */}
                                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={ImageIcon} title="Media & Status" subtitle="Logos and visibility" />
                                    <div className='space-y-6'>
                                        <div>
                                            <Label>Logo</Label>
                                            <div className="mt-2">
                                                <FileUpload onUploadComplete={(url) => setValue('logo', url)} defaultPreview={watch('logo')} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label required>Featured Image</Label>
                                            <div className="mt-2">
                                                <FileUpload onUploadComplete={(url) => setValue('featured_image', url)} defaultPreview={watch('featured_image')} />
                                            </div>
                                            <input type="hidden" {...register('featured_image', { required: 'Featured image is required' })} />
                                            {errors.featured_image && <p className='text-xs text-red-500 mt-1'>{errors.featured_image.message}</p>}
                                        </div>
                                        <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-md border'>
                                            <Controller
                                                name='pinned'
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox id='pinned' checked={!!field.value} onCheckedChange={(v) => field.onChange(v ? 1 : 0)} />
                                                )}
                                            />
                                            <Label htmlFor='pinned' className='font-medium cursor-pointer'>Pin this consultancy to top</Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Links & URLs */}
                                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={LinkIcon} title="Web Links" subtitle="External URLs and videos" />
                                    <div className='space-y-4'>
                                        <div>
                                            <Label>Website URL</Label>
                                            <Input {...register('website_url')} type='url' placeholder='https://...' className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>YouTube Video URL</Label>
                                            <Input {...register('video_url')} type='url' placeholder='https://www.youtube.com/watch?v=...' className="mt-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='shrink-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3 z-20'>
                        <Button type='button' variant='outline' onClick={onClose} disabled={loading} className='px-8 border-gray-200 text-gray-600 hover:bg-gray-50'>
                            Cancel
                        </Button>
                        <Button 
                            type='button' 
                            variant='secondary'
                            disabled={loading} 
                            onClick={() => {
                                setValue('status', 'draft', { shouldDirty: true });
                                handleSubmit(onSubmit)();
                            }}
                            className='bg-gray-100 hover:bg-gray-200 text-gray-700 border-none px-6'
                        >
                            <FileText className='w-4 h-4 mr-2' />
                            <span>Save as Draft</span>
                        </Button>
                        <Button 
                            type='button' 
                            onClick={() => {
                                setValue('status', 'published', { shouldDirty: true });
                                handleSubmit(onSubmit)();
                            }}
                            disabled={loading} 
                            className='bg-[#387cae] hover:bg-[#2d638c] text-white px-8 shadow-md transition-all active:scale-95'
                        >
                            {loading ? (
                                <>
                                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    {initialData ? <Check className='w-4 h-4 mr-2' /> : <Plus className='w-4 h-4 mr-2' />}
                                    <span>{initialData ? 'Update Consultancy' : 'Create Consultancy'}</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
