'use client'

import { authFetch } from '@/app/utils/authFetch'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import { Button } from '@/ui/shadcn/button'
import Table from '@/ui/shadcn/DataTable'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/ui/shadcn/dialog'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { Textarea } from '@/ui/shadcn/textarea'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'
import { Award, Edit2, Eye, Plus, Trash2, Info, FileText, Settings, BookOpen, Layers, Check, Loader2, Calendar, MapPin, Clock, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useToast } from '@/hooks/use-toast'
import FileUpload from '../colleges/FileUpload'
import { fetchSkillsCourses } from './action'
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

export default function SkillsCoursesManager() {
    const { toast } = useToast()
    const { setHeading } = usePageHeading()
    const user = useSelector((state) => state.user.data)
    const author_id = user?.id

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        control,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            thumbnail_image: '',
            price: '',
            duration: '',
            is_featured: false,
            author: author_id,
            institution_name: '',
            content: '',
            location: '',
            course_type: 'online',
            class_time: '',
            start_date: '',
            class_days: '',
            seats_available: '',
            status: 'published'
        }
    })

    const [courses, setCourses] = useState([])
    const [tableLoading, setTableLoading] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editing, setEditing] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // View Modal State
    const [viewingCourse, setViewingCourse] = useState(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    })
    const [searchQuery, setSearchQuery] = useState('')
    const searchDebounceRef = useRef(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const [uploadedFiles, setUploadedFiles] = useState({
        thumbnail_image: ''
    })

    useEffect(() => {
        setHeading('Short Term Courses')
        loadCourses()
        return () => {
            setHeading(null)
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setHeading])

    const loadCourses = async (page = 1, explicitSearch, explicitStatus) => {
        const search =
            explicitSearch !== undefined ? explicitSearch : searchQuery
        const status =
            explicitStatus !== undefined ? explicitStatus : statusFilter
        const trimmed = (search || '').trim()
        try {
            setTableLoading(true)
            const response = await fetchSkillsCourses(page, 10, {
                q: trimmed || undefined,
                status: status !== 'all' ? status : undefined
            })
            setCourses(response.items || [])
            setPagination({
                currentPage: response.pagination?.currentPage ?? page,
                totalPages: response.pagination?.totalPages ?? 1,
                total: response.pagination?.totalCount ?? 0
            })
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to load courses',
                variant: 'destructive'
            })
        } finally {
            setTableLoading(false)
        }
    }

    const onSubmit = async (data) => {
        const formattedData = {
            ...data,
            thumbnail_image: uploadedFiles.thumbnail_image || undefined,
            is_featured: data.is_featured === 'true' || data.is_featured === true,
            price: data.price !== '' ? parseFloat(data.price) : undefined,
            seats_available: data.seats_available !== '' ? parseInt(data.seats_available) : undefined
        }

        // Replace any remaining empty strings with undefined so they aren't sent to the API
        Object.keys(formattedData).forEach(key => {
            if (formattedData[key] === '') {
                formattedData[key] = undefined
            }
        })

        try {
            if (editingId) {
                const res = await authFetch(`${process.env.baseUrl}/skills-based-courses/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formattedData)
                })
                if (!res.ok) throw new Error('Update failed')
                toast({
                    title: 'Success',
                    description: 'Course updated successfully',
                })
            } else {
                const res = await authFetch(`${process.env.baseUrl}/skills-based-courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formattedData)
                })
                if (!res.ok) throw new Error('Creation failed')
                toast({
                    title: 'Success',
                    description: 'Course created successfully',
                })
            }
            handleCloseModal()
            loadCourses(pagination.currentPage)
        } catch (err) {
            toast({
                title: 'Error',
                description: err.message || 'Action failed',
                variant: 'destructive'
            })
        }
    }

    const handleCloseModal = () => {
        setIsOpen(false)
        setEditing(false)
        setEditingId(null)
        reset()
        setUploadedFiles({ thumbnail_image: '' })
    }

    const handleEdit = (course) => {
        setEditingId(course.id)
        setEditing(true)
        setIsOpen(true)
        setValue('title', course.title)
        setValue('description', course.description || '')
        setValue('thumbnail_image', course.thumbnail_image || '')
        setValue('price', course.price || '')
        setValue('duration', course.duration || '')
        setValue('is_featured', course.is_featured || false)
        setValue('institution_name', course.institution_name || '')
        setValue('content', course.content || '')
        setValue('location', course.location || '')
        setValue('course_type', course.course_type || 'online')
        setValue('class_time', course.class_time || '')
        setValue('start_date', course.start_date || '')
        setValue('class_days', course.class_days || '')
        setValue('seats_available', course.seats_available || '')
        setValue('status', course.status || 'published')
        setUploadedFiles({ thumbnail_image: course.thumbnail_image || '' })
    }

    const handleDeleteClick = (id) => {
        setDeleteId(id)
        setIsDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        try {
            await authFetch(`${process.env.baseUrl}/skills-based-courses/${deleteId}`, { method: 'DELETE' })
            toast({
                title: 'Success',
                description: 'Course deleted',
            })
            loadCourses(pagination.currentPage)
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Delete failed',
                variant: 'destructive'
            })
        } finally {
            setIsDialogOpen(false)
        }
    }

    const handleSearchInput = (value) => {
        setSearchQuery(value)
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        if (value.trim() === '') {
            loadCourses(pagination.currentPage, '')
            return
        }
        searchDebounceRef.current = setTimeout(
            () => loadCourses(1, value, undefined),
            350
        )
    }

    const handleStatusChange = (status) => {
        setStatusFilter(status)
        loadCourses(1, searchQuery, status)
    }

    const columns = useMemo(() => [
        {
            header: 'Course Information',
            accessorKey: 'title',
            cell: ({ row }) => (
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-md border overflow-hidden flex-shrink-0 bg-gray-50'>
                        {row.original.thumbnail_image ? (
                            <img src={row.original.thumbnail_image} alt="" className='w-full h-full object-cover' />
                        ) : (
                            <div className='w-full h-full flex items-center justify-center text-gray-300'>
                                <Award className='w-5 h-5' />
                            </div>
                        )}
                    </div>
                    <div className='flex flex-col'>
                        <span className="font-semibold text-gray-900 line-clamp-1">{row.original.title}</span>
                        <span className='text-[10px] text-gray-400 uppercase font-bold tracking-wider line-clamp-1'>{row.original.institution_name || 'Individual'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Price',
            accessorKey: 'price',
            cell: ({ getValue }) => (
                getValue() > 0
                    ? <span className="font-bold text-gray-700">Rs. {parseFloat(getValue()).toLocaleString()}</span>
                    : <span className="text-green-600 font-bold text-xs uppercase">Free</span>
            )
        },
        {
            header: 'Mode',
            accessorKey: 'course_type',
            cell: ({ getValue }) => (
                <span className="capitalize text-xs font-medium text-gray-600 px-2 py-0.5 bg-gray-50 rounded border border-gray-100">{getValue() || 'online'}</span>
            )
        },
        {
            header: 'Featured',
            accessorKey: 'is_featured',
            cell: ({ getValue }) => (
                getValue() ? (
                    <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-center w-fit gap-1">
                        <Award className='w-3 h-3' /> Yes
                    </span>
                ) : <span className="text-[10px] text-gray-400 font-bold uppercase">No</span>
            )
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ getValue }) => {
                const status = getValue() || 'published';
                return (
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${status === 'draft'
                        ? 'bg-gray-100 text-gray-600 border-gray-200'
                        : status === 'published'
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                        {status}
                    </span>
                );
            }
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <div className='flex items-center gap-2'>
                    <Button variant="ghost" size="icon" onClick={() => { setViewingCourse(row.original); setIsViewModalOpen(true); }} className='w-8 h-8 text-blue-600 hover:bg-blue-50'><Eye className='w-4 h-4' /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)} className='w-8 h-8 text-amber-600 hover:bg-amber-50'><Edit2 className='w-4 h-4' /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(row.original.id)} className='w-8 h-8 text-red-600 hover:bg-red-50'><Trash2 className='w-4 h-4' /></Button>
                </div>
            )
        }
    ], [])

    return (
        <div className='w-full'>

            <div className='sticky mb-3 top-0 z-30 bg-[#F7F8FA] py-3'>
                <div className='bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-md bg-[#387cae]/10 flex items-center justify-center shrink-0'>
                            <BookOpen size={17} className='text-[#387cae]' strokeWidth={2} />
                        </div>
                        <div>
                            <p className='text-sm font-bold text-gray-800'>Short term courses</p>
                            <p className='text-xs text-gray-400 flex items-center gap-1.5'>
                                {tableLoading ? (
                                    <span className='inline-flex items-center gap-1'>
                                        <Loader2 size={10} className='animate-spin' />
                                        Loading…
                                    </span>
                                ) : (
                                    `${pagination.total} total`
                                )}
                            </p>
                        </div>
                    </div>

                    <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto'>
                        <div className='relative shrink-0 flex-1 sm:flex-initial sm:w-64'>
                            <Search
                                size={13}
                                className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
                            />
                            <input
                                type='text'
                                value={searchQuery}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                placeholder='Search courses…'
                                className='w-full pl-8 pr-3 h-9 rounded-md border border-gray-200 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40 transition'
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className='h-9 shrink-0 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#387cae]/25 focus:border-[#387cae]/40 transition sm:w-[140px]'
                            aria-label='Filter by status'
                        >
                            <option value='all'>All status</option>
                            <option value='published'>Published</option>
                            <option value='draft'>Draft</option>
                        </select>
                        <Button
                            onClick={() => {
                                setIsOpen(true);
                                setEditing(false);
                                reset();

                            }}
                            className='bg-[#387cae] hover:bg-[#387cae]/90 text-white gap-2 h-9 px-4 rounded-md text-sm font-semibold shrink-0'
                        >
                            <Plus className='w-4 h-4' />
                            Add Course
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-md shadow-sm border overflow-hidden">
                <Table
                    loading={tableLoading}
                    data={courses}
                    columns={columns}
                    pagination={pagination}
                    onPageChange={(newPage) =>
                        loadCourses(newPage, undefined, undefined)
                    }
                    showSearch={false}
                />
            </div>

            {/* Form Modal */}
            <Dialog isOpen={isOpen} onClose={handleCloseModal} className='max-w-6xl'>
                <DialogHeader className="bg-white border-b border-gray-100 p-6">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Layers className="text-[#387cae]" size={24} />
                        {editing ? 'Update Course' : 'Create New Short Term Course'}
                    </DialogTitle>
                    <DialogClose onClick={handleCloseModal} />
                </DialogHeader>
                <DialogContent className="p-0 bg-gray-50/50">
                    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col max-h-[calc(100vh-120px)]'>
                        <div className='flex-1 p-8 overflow-y-auto custom-scrollbar sidebar-scrollbar'>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6">
                                {/* Left Column (8/12) */}
                                <div className="lg:col-span-8 space-y-8">
                                    {/* Basic Information */}
                                    <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                        <SectionHeader icon={Info} title="Course Information" subtitle="Primary details of the short term course" />
                                        <div className='space-y-6'>
                                            <div>
                                                <Label htmlFor='title' required>Course Title</Label>
                                                <Input
                                                    id='title'
                                                    placeholder='Enter course title...'
                                                    {...register('title', { required: 'Title is required' })}
                                                    className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
                                                />
                                                {errors.title && <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{errors.title.message}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor='institution_name'>Institution Name</Label>
                                                    <Input
                                                        id='institution_name'
                                                        placeholder='e.g., Global Academy'
                                                        {...register('institution_name')}
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor='price' required>Price (Rs.)</Label>
                                                    <div className='relative'>
                                                        <span className='absolute left-3 top-2.5 text-gray-400 text-sm'>Rs.</span>
                                                        <Input
                                                            id='price'
                                                            type='number'
                                                            placeholder='0 for Free'
                                                            {...register('price')}
                                                            className='pl-10'
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <Label htmlFor='duration' required>Duration</Label>
                                                    <Input
                                                        id='duration'
                                                        placeholder='e.g., 3 Months'
                                                        {...register('duration', { required: 'Duration is required' })}
                                                        className={errors.duration ? 'border-destructive focus-visible:ring-destructive' : ''}
                                                    />
                                                    {errors.duration && <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{errors.duration.message}</p>}
                                                </div>

                                                <div>
                                                    <Label htmlFor='course_type'>Class Mode</Label>
                                                    <select
                                                        id="course_type"
                                                        {...register('course_type')}
                                                        className='w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-[#387cae] focus:outline-none bg-white'
                                                    >
                                                        <option value="online">Online</option>
                                                        <option value="offline">Offline</option>
                                                        <option value="both">Both</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Content */}
                                    <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                        <SectionHeader icon={BookOpen} title="Detailed Content" subtitle="In-depth information about the course curriculum" />
                                        <div className='pt-2'>
                                            <Label className="text-gray-700 font-semibold mb-2.5 block text-sm">Course Body Content</Label>
                                            <Controller
                                                name='content'
                                                control={control}
                                                render={({ field }) => (
                                                    <TipTapEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder='Write detailed course information...'
                                                        height='300px'
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column (4/12) */}
                                <div className="lg:col-span-4 space-y-8">
                                    {/* Logistics & Dates */}
                                    <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                                        <SectionHeader icon={Calendar} title="Schedule & Logistics" subtitle="Timing and availability" />
                                        <div className='space-y-4'>
                                            <div>
                                                <Label htmlFor='start_date' className='flex items-center gap-2'><Calendar size={14} /> Start Date</Label>
                                                <Input id='start_date' type='date' {...register('start_date')} className='mt-1' />
                                            </div>
                                            <div>
                                                <Label htmlFor='class_time' className='flex items-center gap-2'><Clock size={14} /> Class Time</Label>
                                                <Input id='class_time' placeholder='e.g., 7:00 AM - 9:00 AM' {...register('class_time')} className='mt-1' />
                                            </div>
                                            <div>
                                                <Label htmlFor='location' className='flex items-center gap-2'><MapPin size={14} /> Location</Label>
                                                <Input id='location' placeholder='e.g., Bagbazar, Kathmandu' {...register('location')} className='mt-1' />
                                            </div>
                                            <div>
                                                <Label htmlFor='seats_available'>Seats Available</Label>
                                                <Input id='seats_available' type='number' placeholder='e.g., 25' {...register('seats_available')} className='mt-1' />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thumbnail */}
                                    <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                                        <SectionHeader icon={Layers} title="Media" subtitle="Course thumbnail" />
                                        <div className='space-y-4'>
                                            <Label>Thumbnail Image</Label>
                                            <FileUpload
                                                label=''
                                                defaultPreview={uploadedFiles.thumbnail_image}
                                                onUploadComplete={(url) => {
                                                    setUploadedFiles((prev) => ({ ...prev, thumbnail_image: url }))
                                                    setValue('thumbnail_image', url)
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Settings */}
                                    <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                                        <SectionHeader icon={Settings} title="Settings" subtitle="Additional options" />
                                        <div className='space-y-4'>
                                            <div className='flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100'>
                                                <input
                                                    type="checkbox"
                                                    id="is_featured"
                                                    {...register('is_featured')}
                                                    className="w-4 h-4 rounded border-gray-300 text-[#387cae] focus:ring-[#387cae]"
                                                />
                                                <Label htmlFor="is_featured" className="cursor-pointer text-amber-900 font-medium">Feature this course</Label>
                                            </div>
                                            <div className='hidden'>
                                                <input type="hidden" {...register('status')} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className='shrink-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3 z-20'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleCloseModal}
                                className='px-8 border-gray-200 text-gray-600 hover:bg-gray-50'
                            >
                                Cancel
                            </Button>
                            <Button
                                type='button'
                                variant='secondary'
                                disabled={isSubmitting}
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
                                type='submit'
                                onClick={() => {
                                    setValue('status', 'published', { shouldDirty: true });
                                }}
                                disabled={isSubmitting}
                                className='bg-[#387cae] hover:bg-[#2d638c] text-white px-8 shadow-md transition-all active:scale-95'
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        {editing ? <Check className='w-4 h-4 mr-2' /> : <Plus className='w-4 h-4 mr-2' />}
                                        <span>{editing ? 'Update Course' : 'Create Course'}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <Dialog isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} className="max-w-xl">
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Course Details</DialogTitle>
                        <DialogClose onClick={() => setIsViewModalOpen(false)} />
                    </DialogHeader>
                    {viewingCourse && (
                        <div className='space-y-4 text-sm'>
                            {viewingCourse.thumbnail_image && <img src={viewingCourse.thumbnail_image} alt="" className='w-full h-40 object-cover rounded-md border' />}
                            <div className='grid grid-cols-2 gap-4'>
                                <div><p className='font-bold text-gray-400 uppercase text-[10px]'>Title</p><p className='font-bold'>{viewingCourse.title}</p></div>
                                <div><p className='font-bold text-gray-400 uppercase text-[10px]'>Price</p><p className='font-bold text-green-600'>{viewingCourse.price ? `Rs. ${viewingCourse.price}` : 'Free'}</p></div>
                                <div><p className='font-bold text-gray-400 uppercase text-[10px]'>Duration</p><p>{viewingCourse.duration}</p></div>
                                <div><p className='font-bold text-gray-400 uppercase text-[10px]'>Mode</p><p className='capitalize'>{viewingCourse.course_type}</p></div>
                                <div><p className='font-bold text-gray-400 uppercase text-[10px]'>Status</p><p className='capitalize'>{viewingCourse.status || 'published'}</p></div>
                                <div><p className='font-bold text-gray-400 uppercase text-[10px]'>Featured</p><p>{viewingCourse.is_featured ? 'Yes' : 'No'}</p></div>
                            </div>
                            <div><p className='font-bold text-gray-400 uppercase text-[10px]'>Description</p><p>{viewingCourse.description}</p></div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title='Delete Course'
                message='Are you sure?'
            />
        </div>
    )
}
