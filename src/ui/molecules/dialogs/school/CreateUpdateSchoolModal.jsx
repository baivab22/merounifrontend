import { Button } from '@/ui/shadcn/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/ui/shadcn/dialog'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'
import { Textarea } from '@/ui/shadcn/textarea'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'
import axios from 'axios'
import EmojiPicker from 'emoji-picker-react'
import {
    Activity,
    Check,
    FileText,
    GraduationCap,
    HelpCircle,
    Image as ImageIcon,
    Info,
    Layers,
    Loader2,
    Map,
    MapPin,
    Plus,
    Trash2,
    Users,
    Video
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useToast } from '@/hooks/use-toast'

import {
    createOrUpdateSchool,
    fetchUniversities,
    getProgramsByUniversity,
    saveDraft
} from '@/app/(dashboard)/dashboard/schools/actions'
import { cn } from '@/app/lib/utils'
import { authFetch } from '@/app/utils/authFetch'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import GallerySection from './components/GallerySection'
import { DistrictLists } from '@/constants/district'
import FileUploadWithPreview from './components/MediaUploadWithBranding'
import VideoSection from './components/VideoSection'

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-md bg-[#387cae]/10 flex items-center justify-center text-[#387cae] shadow-sm border border-[#387cae]/20">
            <Icon size={20} />
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
            {subtitle && <p className="text-[11px] mt-0.5 font-semibold tracking-wider">{subtitle}</p>}
        </div>
    </div>
)


const CreateUpdateSchoolModal = ({
    isOpen,
    handleCloseModal: onSystemClose,
    editSlug,
    onSuccess,
    allDegrees
}) => {
    const { toast } = useToast()
    const [submitting, setSubmitting] = useState(false)
    const [submittingDraft, setSubmittingDraft] = useState(false)
    const [loadingData, setLoadingData] = useState(false)
    const [showCloseConfirm, setShowCloseConfirm] = useState(false)
    const [universityPrograms, setUniversityPrograms] = useState([])
    const [loadingPrograms, setLoadingPrograms] = useState(false)
    const [filesDirty, setFilesDirty] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState({
        college_logo: '',
        featured_img: '',
        images: [],
        videos: []
    })
    const [selectedUniversities, setSelectedUniversities] = useState([])
    const [openEmojiPickerIndex, setOpenEmojiPickerIndex] = useState(null)

    const author_id = useSelector((state) => state.user.data?.id)


    const {
        register,
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        getValues,
        formState: { errors, isDirty }
    } = useForm({
        defaultValues: {
            name: '',
            author_id: author_id,
            university_id: [],
            institute_type: 'Private',
            institute_level: ['School'],
            programs: [],
            degrees: [],
            description: '',
            content: '',
            website_url: '',
            college_logo: '',
            featured_img: '',
            images: [],
            college_broucher: '',
            facilities: [],
            address: {
                country: 'Nepal',
                district: '',
                city: '',
                street: '',
                postal_code: ''
            },
            google_map_url: '',
            map_type: '',
            contacts: [],
            members: [],
            faqs: [],
            status: 'published'
        }
    })

    const {
        fields: faqFields,
        append: appendFaq,
        remove: removeFaq
    } = useFieldArray({ control, name: 'faqs' })

    const {
        fields: memberFields,
        append: appendMember,
        remove: removeMember
    } = useFieldArray({ control, name: 'members' })

    const {
        fields: facilityFields,
        append: appendFacility,
        remove: removeFacility
    } = useFieldArray({ control, name: 'facilities' })

    const handleSetFiles = (updater) => {
        setUploadedFiles(updater)
        if (!loadingData) setFilesDirty(true)
    }

    const handleCloseAttempt = () => {
        if (isDirty || filesDirty) {
            setShowCloseConfirm(true)
        } else {
            onSystemClose()
        }
    }

    useEffect(() => {
        if (!isOpen) {
            reset()
            setUploadedFiles({
                college_logo: '',
                featured_img: '',
                images: [],
                videos: []
            })
            setFilesDirty(false)
            setUniversityPrograms([])
            setSelectedUniversities([])
            setOpenEmojiPickerIndex(null)
        }
    }, [isOpen, reset])

    useEffect(() => {
        if (isOpen && editSlug) {
            const fetchSchoolData = async () => {
                try {
                    setLoadingData(true)
                    const response = await authFetch(
                        `${process.env.baseUrl}/school/${editSlug}`,
                        { headers: { 'Content-Type': 'application/json' } }
                    )

                    if (!response.ok) throw new Error('Failed to fetch school data')

                    let schoolData = await response.json()
                    schoolData = schoolData.item

                    setValue('id', schoolData.id)
                    setValue('name', schoolData.name)
                    setValue('institute_type', schoolData.institute_type)
                    setValue(
                        'institute_level',
                        typeof schoolData.institute_level === 'string'
                            ? JSON.parse(schoolData.institute_level || '[]')
                            : schoolData.institute_level || []
                    )
                    setValue('description', schoolData.description)
                    setValue('content', schoolData.content)
                    setValue('website_url', schoolData.website_url)
                    setValue('status', schoolData.status || 'published')

                    const uniList = schoolData.universities || (schoolData.university ? [schoolData.university] : [])
                    setSelectedUniversities(uniList)

                    const uniIds = (schoolData.university_id
                        ? (Array.isArray(schoolData.university_id) ? schoolData.university_id : [schoolData.university_id])
                        : uniList.map(u => u.id)
                    ).map(Number).filter(id => !isNaN(id))

                    setValue('university_id', uniIds)

                    if (schoolData.degrees && Array.isArray(schoolData.degrees)) {
                        const degreeIds = schoolData.degrees.map((degree) => String(degree.id))
                        setValue('degrees', degreeIds)
                    }

                    const schoolPrograms = schoolData.schoolPrograms || schoolData.collegePrograms || []
                    const programIds = schoolPrograms
                        .map((program) => program.program_id || program.program?.id)
                        .filter((id) => id !== undefined)

                    setValue('programs', [...new Set(programIds)])

                    const initialPrograms = schoolPrograms
                        .map(cc => ({
                            id: cc.program_id || cc.program?.id,
                            title: cc.program?.title || 'Unknown'
                        }))
                        .filter(p => p.id)

                    if (initialPrograms.length > 0) {
                        setUniversityPrograms(initialPrograms)
                    }

                    if (schoolData.collegeAddress || schoolData.schoolAddress) {
                        const address = schoolData.collegeAddress || schoolData.schoolAddress
                        setValue('address.country', address.country)
                        setValue('address.district', address.district)
                        setValue('address.city', address.city)
                        setValue('address.street', address.street)
                        setValue('address.postal_code', address.postal_code)
                    }

                    setValue('google_map_url', schoolData.google_map_url || '')
                    setValue('map_type', schoolData.map_type || '')

                    const contacts = (schoolData.collegeContacts || schoolData.schoolContacts)?.map(
                        (contact) => contact.contact_number
                    ) || ['', '']
                    setValue('contacts', contacts)

                    const galleryItems = schoolData.collegeGallery || schoolData.schoolGallery || schoolData.gallery || []
                    const images = galleryItems
                        .filter(img => img.file_type === 'image' || !img.file_type)
                        .map((img) => ({ url: img.file_url || img.url, file_type: 'image' }))

                    const videos = galleryItems
                        .filter(vid => vid.file_type === 'video')
                        .map((vid) => {
                            const videoUrl = vid.file_url || vid.url
                            const youtubeId = videoUrl?.includes('embed/')
                                ? videoUrl.split('embed/')[1].split('?')[0]
                                : null
                            return {
                                url: videoUrl,
                                file_type: 'video',
                                thumbnail: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null,
                                youtubeId
                            }
                        })

                    setUploadedFiles({
                        college_logo: schoolData.college_logo || schoolData.school_logo || '',
                        featured_img: schoolData.featured_img || '',
                        images: images.length === 1 && !images[0].url ? [] : images,
                        videos: videos
                    })

                    setValue('college_logo', schoolData.college_logo || schoolData.school_logo || '')
                    setValue('featured_img', schoolData.featured_img || '')

                    setValue('images', [...images])

                    const memberData = (schoolData.collegeMembers || schoolData.schoolMembers || []).map(m => ({
                        id: m.id,
                        name: m.name || '',
                        role: m.role || '',
                        image_url: m.image_url || m.image || '',
                        description: m.description || '',
                        contact_number: m.contact_number || ''
                    }))
                    setValue('members', memberData)

                    if (schoolData.school_broucher || schoolData.college_broucher) {
                        setValue('college_broucher', schoolData.school_broucher || schoolData.college_broucher)
                    }

                    const facilityData = schoolData.facilities?.length
                        ? schoolData.facilities.map((f) => ({
                            title: f.title || '',
                            description: f.description || '',
                            icon: f.icon || ''
                        }))
                        : []
                    setValue('facilities', facilityData)

                    const faqData = schoolData.faqs?.length
                        ? schoolData.faqs.map((f) => ({
                            question: f.question || '',
                            answer: f.answer || ''
                        }))
                        : [{ question: '', answer: '' }]
                    setValue('faqs', faqData)

                } catch (error) {
                    console.error('Error fetching school data:', error)
                    toast({
                        title: 'Error',
                        description: 'Failed to load school details',
                        variant: 'destructive'
                    })
                } finally {
                    setLoadingData(false)
                }
            }
            fetchSchoolData()
        }
    }, [isOpen, editSlug, setValue])

    const selectedUniIds = watch('university_id') || []

    useEffect(() => {
        const fetchPrograms = async () => {
            if (!selectedUniIds || selectedUniIds.length === 0) {
                setUniversityPrograms([])
                return
            }
            try {
                setLoadingPrograms(true)
                const universityData = await getProgramsByUniversity(selectedUniIds)
                setUniversityPrograms(universityData || [])
            } catch (error) {
                console.error('Error fetching university programs:', error)
            } finally {
                setLoadingPrograms(false)
            }
        }
        fetchPrograms()
    }, [JSON.stringify(selectedUniIds)])

    const onSearchPrograms = async (query) => {
        if (!universityPrograms) return []
        const filtered = query
            ? universityPrograms.filter(p => p.title?.toLowerCase().includes(query.toLowerCase()))
            : universityPrograms

        return filtered.map(p => ({
            id: p.id,
            title: p.title || 'Unknown'
        }))
    }

    const handleSelectProgram = (program) => {
        const currentPrograms = getValues('programs') || []
        const programId = program.id || program
        if (!currentPrograms.includes(programId)) {
            setValue('programs', [...currentPrograms, programId], { shouldDirty: true })
        }
    }

    const handleRemoveProgram = (program) => {
        const currentPrograms = getValues('programs') || []
        const programId = program.id || program
        setValue('programs', currentPrograms.filter(id => id !== programId), { shouldDirty: true })
    }

    const selectedProgramIds = watch('programs') || []
    const selectedPrograms = Array.isArray(universityPrograms)
        ? universityPrograms
            .filter(p => selectedProgramIds.map(String).includes(String(p.id)))
            .map(p => ({ id: p.id, title: p.title }))
        : []

    const onSearchDegrees = async (query) => {
        if (!allDegrees) return []
        return query
            ? allDegrees.filter(d => d.title?.toLowerCase().includes(query.toLowerCase()))
            : allDegrees
    }

    const handleSelectDegree = (degree) => {
        const currentDegrees = getValues('degrees') || []
        const degreeId = String(degree.id || degree)
        if (!currentDegrees.includes(degreeId)) {
            setValue('degrees', [...currentDegrees, degreeId], { shouldDirty: true })
        }
    }

    const handleRemoveDegree = (degree) => {
        const currentDegrees = getValues('degrees') || []
        const degreeId = String(degree.id || degree)
        setValue('degrees', currentDegrees.filter(id => id !== degreeId), { shouldDirty: true })
    }

    const selectedDegreeIds = watch('degrees') || []
    const selectedDegrees = allDegrees
        ? allDegrees
            .filter(d => selectedDegreeIds.includes(String(d.id)))
            .map(d => ({ id: d.id, title: d.title }))
        : []

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
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            )
            return response.data?.media?.url
        } catch (error) {
            console.error('Image upload failed:', error)
            toast({
                title: 'Error',
                description: 'Failed to upload image',
                variant: 'destructive'
            })
            throw error
        }
    }

    const handleSave = async (data, status = 'published') => {
        try {
            status === 'draft' ? setSubmittingDraft(true) : setSubmitting(true)

            data.author_id = author_id

            data.members = (data.members || []).map(m => ({
                id: m.id,
                name: m.name,
                role: m.role,
                image_url: m.image_url,
                description: m.description,
                contact_number: m.contact_number
            })).filter(m => m.name || m.role || m.description || m.contact_number || m.image_url)
            if (data.members.length === 0) delete data.members

            const uniIds = (data.university_id || []).map(id => parseInt(id)).filter(id => !isNaN(id))
            if (uniIds.length > 0) data.university_id = uniIds
            else delete data.university_id

            data.degrees = (data.degrees || []).map(id => parseInt(id)).filter(id => !isNaN(id))

            const programsArray = (data.programs || []).map(c => parseInt(c)).filter(c => !isNaN(c) && c > 0)
            if (programsArray.length > 0) data.programs = programsArray
            else delete data.programs

            data.school_logo = uploadedFiles.college_logo
            data.featured_img = uploadedFiles.featured_img
            data.images = [...(uploadedFiles.images || []), ...(uploadedFiles.videos || [])].filter(img => img.url)

            data.facilities = (data.facilities || []).filter(f => f.title.trim() !== '' || f.description.trim() !== '' || f.icon.trim() !== '')
            if (data.facilities.length === 0) delete data.facilities

            data.faqs = (data.faqs || []).filter(f => f.question.trim() !== '' || f.answer.trim() !== '')
            if (data.faqs.length === 0) delete data.faqs

            data.status = status
            if (editSlug && data.id) {
                data.school_id = data.id
            }


            if (status === 'draft') {
                await saveDraft(data)
            } else {
                await createOrUpdateSchool(data)
            }

            toast({
                title: 'Success',
                description: status === 'draft'
                    ? 'Draft saved successfully!'
                    : editSlug
                        ? 'School updated successfully!'
                        : 'School created successfully!'
            })
            onSuccess?.()
            onSystemClose()
        } catch (error) {
            console.log('Submission error:', error)
            toast({
                title: 'Error',
                description: error.message || 'Failed to submit data',
                variant: 'destructive'
            })
        } finally {
            setSubmitting(false)
            setSubmittingDraft(false)
        }
    }

    const onSubmit = async (data) => {
        await handleSave(data, 'published')
    }

    const onSaveDraft = async () => {
        const data = getValues()
        if (!data.name || !data.name.trim()) {
            toast({
                title: 'Error',
                description: 'School name is required even for drafts',
                variant: 'destructive'
            })
            return
        }
        await handleSave(data, 'draft')
    }
    return (
        <Dialog isOpen={isOpen} onClose={handleCloseAttempt} closeOnOutsideClick={false} className='max-w-7xl'>
            <DialogHeader className="bg-white border-b border-gray-100 p-6">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Layers className="text-[#387cae]" size={24} />
                    {editSlug ? 'Edit School' : 'Add New School'}
                </DialogTitle>
                <DialogClose onClick={handleCloseAttempt} />
            </DialogHeader>
            <DialogContent className="p-0 bg-gray-50/50">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='flex flex-col max-h-[calc(100vh-120px)] relative'
                >
                    {loadingData && (
                        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-b-3xl">
                            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-gray-100 animate-in fade-in zoom-in duration-300">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-[#387cae] animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Info size={16} className="text-[#387cae] animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h4 className="font-bold text-gray-900">Loading Details</h4>
                                    <p className="text-xs text-gray-500 font-medium">Please wait a moment...</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className='flex-1 p-8 overflow-y-auto'>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8">
                            {/* Left Column - Main Content (8/12) */}
                            <div className="lg:col-span-8 space-y-8">
                                {/* Basic Information */}
                                <div className='bg-white p-8 rounded-2xl border border-gray-100'>
                                    <SectionHeader icon={Info} title="Basic Information" subtitle="General identity of the school" />
                                    <div className='space-y-6'>
                                        <div>
                                            <Label required={true} htmlFor='name'>School Name</Label>
                                            <Input
                                                id='name'
                                                placeholder='Enter school name...'
                                                className="h-12 text-base rounded-md"
                                                {...register('name', { required: 'School name is required' })}
                                            />
                                            {errors.name && (
                                                <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{errors.name.message}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor='institute_type'>Institute Type</Label>
                                                <select
                                                    id='institute_type'
                                                    {...register('institute_type')}
                                                    className='flex h-11 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all'
                                                >
                                                    <option value='Private'>Private</option>
                                                    <option value='Public'>Public</option>
                                                </select>
                                            </div>

                                            <div>
                                                <Label htmlFor='website_url'>Website URL</Label>
                                                <Input
                                                    id='website_url'
                                                    placeholder='https://example.com'
                                                    className="h-11 rounded-md border-gray-200"
                                                    {...register('website_url')}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* About School */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={FileText} title="About School" subtitle="Detailed description and content" />
                                    <div className='space-y-6'>
                                        <div>
                                            <Label htmlFor='description' required={true} className="mb-1.5">Short Description</Label>
                                            <Textarea
                                                id='description'
                                                placeholder='Enter a brief summary of the school...'
                                                {...register('description', { required: 'Short description is required' })}
                                                className='flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all resize-none'
                                            />
                                            {errors.description && (
                                                <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{errors.description.message}</p>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <Label className="mb-2.5">Full Content Body</Label>
                                            <TipTapEditor
                                                onMediaUpload={onMediaUpload}
                                                showImageUpload={true}
                                                value={watch('content')}
                                                onChange={(data) => setValue('content', data, { shouldDirty: true })}
                                                placeholder='Start writing about the school here...'
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Academic Details */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={GraduationCap} title="Academic Details" subtitle="Affiliation and programs" />
                                    <div className='space-y-6'>
                                        <div>
                                            <Label required={true}>Affiliated Universities</Label>
                                            <SearchSelectCreate
                                                onSearch={fetchUniversities}
                                                onSelect={(uni) => {
                                                    const current = getValues('university_id') || []
                                                    const newIds = [...new Set([...current, uni.id])]
                                                    setValue('university_id', newIds, { shouldDirty: true, shouldValidate: true })

                                                    const currentUnis = selectedUniversities || []
                                                    if (!currentUnis.find(u => u.id === uni.id)) {
                                                        const updatedUnis = [...currentUnis, uni]
                                                        setSelectedUniversities(updatedUnis)
                                                    }
                                                }}
                                                onRemove={(uni) => {
                                                    const targetId = uni.id || uni
                                                    const current = getValues('university_id') || []
                                                    const newIds = current.filter(id => id !== targetId)
                                                    setValue('university_id', newIds, { shouldDirty: true, shouldValidate: true })

                                                    const updatedUnis = selectedUniversities.filter(u => u.id !== targetId)
                                                    setSelectedUniversities(updatedUnis)
                                                }}
                                                selectedItems={selectedUniversities}
                                                placeholder="Search or select universities..."
                                                displayKey="fullname"
                                                valueKey="id"
                                                isMulti={true}
                                                className="w-full"
                                                renderItem={(item) => (
                                                    <div className="flex items-center gap-3">
                                                        {item.logo ? (
                                                            <img
                                                                src={item.logo}
                                                                alt={item.fullname}
                                                                className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full bg-[#387cae]/10 flex items-center justify-center shrink-0">
                                                                <span className="text-xs font-bold text-[#387cae]">
                                                                    {item.fullname?.charAt(0)?.toUpperCase() || 'C'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-medium text-gray-800">{item.fullname}</span>
                                                    </div>
                                                )}
                                                renderSelected={(item) => (
                                                    <div className="flex items-center gap-3">
                                                        {item.logo ? (
                                                            <img
                                                                src={item.logo}
                                                                alt={item.fullname}
                                                                className="w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full bg-[#387cae]/10 flex items-center justify-center shrink-0">
                                                                <span className="text-xs font-bold text-[#387cae]">
                                                                    {item.fullname?.charAt(0)?.toUpperCase() || 'C'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <span className="text-sm font-semibold text-gray-900 truncate">{item.fullname}</span>
                                                    </div>
                                                )}
                                                inputSize='sm'
                                            />
                                            {errors.university_id && (
                                                <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>{errors.university_id.message}</p>
                                            )}
                                            <input type="hidden" {...register('university_id', { required: 'Please select at least one university' })} />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <div>
                                                <Label className="mb-3 block">Degrees Offered</Label>
                                                <SearchSelectCreate
                                                    onSearch={onSearchDegrees}
                                                    onSelect={handleSelectDegree}
                                                    onRemove={handleRemoveDegree}
                                                    selectedItems={selectedDegrees}
                                                    placeholder="Search or select degrees..."
                                                    displayKey="title"
                                                    valueKey="id"
                                                    isMulti={true}
                                                    className="w-full"
                                                    inputSize='sm'
                                                />
                                            </div>

                                            <div>
                                                <Label className="mb-3 block">Available Programs</Label>
                                                <SearchSelectCreate
                                                    onSearch={onSearchPrograms}
                                                    onSelect={handleSelectProgram}
                                                    onRemove={handleRemoveProgram}
                                                    selectedItems={selectedPrograms}
                                                    placeholder="Search or select programs..."
                                                    displayKey="title"
                                                    valueKey="id"
                                                    isMulti={true}
                                                    className="w-full"
                                                    isLoading={loadingPrograms}
                                                    inputSize='sm'
                                                />
                                                {selectedUniIds.length === 0 && (
                                                    <p className='text-[10px] text-gray-400 mt-2 font-medium bg-gray-50 p-2 rounded-md border border-dashed border-gray-200'>
                                                        Please select a university first to view available programs.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Media & Gallery */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={ImageIcon} title="Media & Gallery" subtitle="Visual content for the school" />
                                    <div className='space-y-10'>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                                            <FileUploadWithPreview
                                                label='School Logo'
                                                onUploadComplete={(url) => {
                                                    handleSetFiles(prev => ({ ...prev, college_logo: url }))
                                                    setValue('college_logo', url, { shouldValidate: true })
                                                }}
                                                defaultPreview={uploadedFiles.college_logo}
                                                onClear={() => {
                                                    handleSetFiles(prev => ({ ...prev, college_logo: '' }))
                                                    setValue('college_logo', '', { shouldValidate: true })
                                                }}
                                            />
                                            <FileUploadWithPreview
                                                label='Featured Image'
                                                onUploadComplete={(url) => {
                                                    handleSetFiles(prev => ({ ...prev, featured_img: url }))
                                                    setValue('featured_img', url, { shouldValidate: true })
                                                }}
                                                defaultPreview={uploadedFiles.featured_img}
                                                onClear={() => {
                                                    handleSetFiles(prev => ({ ...prev, featured_img: '' }))
                                                    setValue('featured_img', '', { shouldValidate: true })
                                                }}
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-gray-50">
                                            <GallerySection
                                                control={control}
                                                setValue={setValue}
                                                uploadedFiles={uploadedFiles}
                                                setUploadedFiles={handleSetFiles}
                                                getValues={getValues}
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-gray-50">
                                            <VideoSection
                                                control={control}
                                                setValue={setValue}
                                                uploadedFiles={uploadedFiles}
                                                setUploadedFiles={handleSetFiles}
                                                getValues={getValues}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Infrastructure & Features */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={Activity} title="Facilities & Infrastructure" subtitle="What the school offers students" />
                                    <div className='space-y-6'>
                                        <div className='space-y-4'>
                                            {facilityFields.map((field, index) => (
                                                <div key={field.id} className='group p-6 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#387cae]/30 transition-all shadow-sm'>
                                                    <div className='flex justify-between items-start mb-4'>
                                                        <span className='text-[10px] font-black tracking-[0.2em] uppercase text-gray-400'>Facility #{index + 1}</span>
                                                        <Button
                                                            type='button'
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => removeFacility(index)}
                                                            className='h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full'
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                                        <div className='space-y-4'>
                                                            <div>
                                                                <Label className="text-[11px] mb-1.5 opacity-70">Icon</Label>
                                                                <div className="relative">
                                                                    <Input
                                                                        {...register(`facilities.${index}.icon`)}
                                                                        placeholder='Search Lucide icon name...'
                                                                        className='h-10 pl-10 pr-10'
                                                                    />
                                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                                        <Activity size={16} />
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setOpenEmojiPickerIndex(openEmojiPickerIndex === index ? null : index)}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-[#387cae] transition-colors"
                                                                    >
                                                                        <HelpCircle size={16} />
                                                                    </button>

                                                                    {openEmojiPickerIndex === index && (
                                                                        <div className="absolute right-0 top-12 z-[100] shadow-2xl border border-gray-100 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                                            <EmojiPicker
                                                                                onEmojiClick={(emojiData) => {
                                                                                    setValue(`facilities.${index}.icon`, emojiData.emoji, { shouldDirty: true })
                                                                                    setOpenEmojiPickerIndex(null)
                                                                                }}
                                                                                width={300}
                                                                                height={400}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Label className="text-[11px] mb-1.5 opacity-70">Facility Title</Label>
                                                                <Input
                                                                    {...register(`facilities.${index}.title`)}
                                                                    placeholder='e.g., Modern Science Lab'
                                                                    className='h-10'
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-[11px] mb-1.5 opacity-70">Description</Label>
                                                            <Textarea
                                                                {...register(`facilities.${index}.description`)}
                                                                placeholder='Describe the facility...'
                                                                className='min-h-[100px] resize-none'
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                type='button'
                                                variant='outline'
                                                onClick={() => appendFacility({ title: '', description: '', icon: '' })}
                                                className='w-full h-12 border-dashed border-2 hover:border-[#387cae] hover:bg-[#387cae]/5 text-gray-400 hover:text-[#387cae] transition-all gap-2 font-bold'
                                            >
                                                <Plus size={16} /> Add New Facility
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Sidebar (4/12) */}
                            <div className="lg:col-span-4 space-y-8">
                                {/* Contact and Map */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={MapPin} title="Location & Access" subtitle="How to find the school" />
                                    <div className='space-y-6'>
                                        <div>
                                            <Label>District</Label>
                                            <select
                                                {...register('address.district')}
                                                className='flex h-11 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all'
                                            >
                                                <option value="">Select District</option>
                                                {DistrictLists.map(d => (
                                                    <option key={d} value={d}>{d}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>City</Label>
                                                <Input {...register('address.city')} placeholder='City' className="h-10" />
                                            </div>
                                            <div>
                                                <Label>Street</Label>
                                                <Input {...register('address.street')} placeholder='Street' className="h-10" />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Google Maps URL</Label>
                                            <div className="relative">
                                                <Input
                                                    {...register('google_map_url')}
                                                    placeholder='Paste map link...'
                                                    className="h-10 pl-10"
                                                />
                                                <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            </div>
                                        </div>

                                        <div className='pt-4 border-t border-gray-50'>
                                            <Label className="mb-3 block">Contact Numbers</Label>
                                            <div className='space-y-3'>
                                                {[0, 1].map((idx) => (
                                                    <div key={idx} className="relative">
                                                        <Input
                                                            {...register(`contacts.${idx}`)}
                                                            placeholder={`Phone #${idx + 1}`}
                                                            className="h-10 pl-10"
                                                        />
                                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Team Members */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={Users} title="Leadership Team" subtitle="Key staff and administrators" />
                                    <div className='space-y-4'>
                                        {memberFields.map((field, index) => (
                                            <div key={field.id} className='relative p-5 rounded-xl border border-gray-100 bg-gray-50/50 group'>
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => removeMember(index)}
                                                    className='absolute top-3 right-3 h-7 w-7 p-0 text-red-00 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                                                >
                                                    <Trash2 size={13} />
                                                </Button>
                                                <div className="flex gap-4 items-start">
                                                    <div className="w-16 h-16 rounded-lg bg-gray-200 border-2 border-white shadow-sm overflow-hidden shrink-0">
                                                        {watch(`members.${index}.image_url`) ? (
                                                            <img src={watch(`members.${index}.image_url`)} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                                                <Users size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <Input {...register(`members.${index}.name`)} placeholder='Full Name' className='h-9 text-xs' />
                                                        <Input {...register(`members.${index}.role`)} placeholder='Position' className='h-9 text-xs' />
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <FileUploadWithPreview
                                                        label=''
                                                        onUploadComplete={(url) => setValue(`members.${index}.image_url`, url, { shouldDirty: true })}
                                                        defaultPreview={watch(`members.${index}.image_url`)}
                                                        onClear={() => setValue(`members.${index}.image_url`, '', { shouldDirty: true })}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={() => appendMember({ name: '', role: '', image_url: '', description: '', contact_number: '' })}
                                            className='w-full border-dashed hover:bg-white hover:border-[#387cae] hover:text-[#387cae] transition-all text-xs font-bold gap-2'
                                        >
                                            <Plus size={12} /> Add Team Member
                                        </Button>
                                    </div>
                                </div>

                                {/* FAQs */}
                                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                                    <SectionHeader icon={HelpCircle} title="Frequently Asked" subtitle="Common queries about the school" />
                                    <div className='space-y-4'>
                                        {faqFields.map((field, index) => (
                                            <div key={field.id} className='p-5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3'>
                                                <div className="flex justify-between items-center">
                                                    <span className='text-[10px] font-bold text-[#387cae] uppercase tracking-wider'>Question #{index + 1}</span>
                                                    <Button type='button' variant='ghost' size='sm' onClick={() => removeFaq(index)} className='h-6 w-6 p-0 text-red-400 hover:text-red-500'>
                                                        <Trash2 size={12} />
                                                    </Button>
                                                </div>
                                                <Input {...register(`faqs.${index}.question`)} placeholder='The question...' className='h-9 text-xs' />
                                                <Textarea {...register(`faqs.${index}.answer`)} placeholder='The answer...' className='min-h-[80px] text-xs' />
                                            </div>
                                        ))}
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={() => appendFaq({ question: '', answer: '' })}
                                            className='w-full border-dashed text-xs font-bold gap-2'
                                        >
                                            <Plus size={12} /> Add New FAQ
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className='sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 z-40 rounded-b-3xl'>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-2">Status:</span>
                            <select
                                {...register('status')}
                                className="bg-gray-100 border-none rounded-full px-4 py-1.5 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-[#387cae]/20 transition-all cursor-pointer"
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                        <div className='flex gap-4 w-full sm:w-auto'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={onSaveDraft}
                                disabled={submittingDraft || submitting}
                                className='flex-1 sm:flex-none h-11 px-8 rounded-md font-bold'
                            >
                                {submittingDraft ? <Loader2 className="animate-spin mr-2" size={16} /> : 'Save as Draft'}
                            </Button>
                            <Button
                                type='submit'
                                disabled={submitting || submittingDraft}
                                className='flex-1 sm:flex-none h-11 px-10 rounded-md bg-[#387cae] hover:bg-[#387cae]/90 text-white font-bold shadow-lg shadow-[#387cae]/20 transition-all'
                            >
                                {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : (editSlug ? 'Update School' : 'Create School')}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>

            <ConfirmationDialog
                open={showCloseConfirm}
                onClose={() => setShowCloseConfirm(false)}
                onConfirm={() => {
                    setShowCloseConfirm(false)
                    onSystemClose()
                }}
                title="Discard Changes?"
                message="You have unsaved changes. Are you sure you want to discard them? This action cannot be undone."
            />
        </Dialog>
    )
}

export default CreateUpdateSchoolModal
