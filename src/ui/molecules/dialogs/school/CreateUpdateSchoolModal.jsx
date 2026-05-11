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
  Settings,
  Trash2,
  Users,
  Video
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useToast } from '@/hooks/use-toast'

import {
  createOrUpdateSchool,
  fetchBoards,
  getStreamsByBoards,
  getProgramsByStreams,
  saveDraft
} from '@/app/(dashboard)/dashboard/schools/actions'

import { cn } from '@/app/lib/utils'
import { authFetch } from '@/app/utils/authFetch'
import ConfirmationDialog from '@/ui/molecules/ConfirmationDialog'
import GallerySection from './components/GallerySection'
import { DistrictLists } from '@/constants/district'
import { COUNTRIES } from '@/constants/countries'
import FileUploadWithPreview from './components/MediaUploadWithBranding'
import VideoSection from './components/VideoSection'

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className='flex items-center gap-3 mb-6'>
    <div className='w-10 h-10 rounded-md bg-[#387cae]/10 flex items-center justify-center text-[#387cae] shadow-sm border border-[#387cae]/20'>
      <Icon size={20} />
    </div>
    <div>
      <h3 className='text-lg font-bold text-gray-900 leading-tight'>{title}</h3>
      {subtitle && (
        <p className='text-[11px] mt-0.5 font-semibold tracking-wider'>
          {subtitle}
        </p>
      )}
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
  const [boardStreams, setBoardStreams] = useState([])
  const [loadingStreams, setLoadingStreams] = useState(false)
  const [streamPrograms, setStreamPrograms] = useState([])
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const [filesDirty, setFilesDirty] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({
    college_logo: '',
    featured_img: '',
    images: [],
    videos: []
  })
  const [selectedBoards, setSelectedBoards] = useState([])
  const [selectedStreams, setSelectedStreams] = useState([])
  const [selectedPrograms, setSelectedPrograms] = useState([])

  const [openEmojiPickerIndex, setOpenEmojiPickerIndex] = useState(null)

  // Section Refs for scroll-to-error
  const basicInfoRef = useRef(null)
  const aboutRef = useRef(null)
  const academicRef = useRef(null)
  const locationRef = useRef(null)
  const infrastructureRef = useRef(null)
  const teamRef = useRef(null)
  const faqRef = useRef(null)
  const mediaRef = useRef(null)

  const author_id = useSelector((state) => state.user.data?.id)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    getValues,
    formState: { errors, isDirty, submitCount }
  } = useForm({
    defaultValues: {
      name: '',
      author_id: author_id,
      board_ids: [],
      stream_ids: [],
      institute_type: 'Private',
      institute_level: ['School'],
      programs: [],

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
      status: 'published',
      slug: '',
      meta_description: ''
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

  // Scroll to first error on submit
  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const fieldOrder = [
        { keys: ['name', 'institute_type'], ref: basicInfoRef },
        { keys: ['description', 'content'], ref: aboutRef },
        { keys: ['board_ids', 'stream_ids', 'programs'], ref: academicRef },
        { keys: ['address', 'google_map_url'], ref: locationRef },
        { keys: ['facilities'], ref: infrastructureRef },
        { keys: ['members'], ref: teamRef },
        { keys: ['faqs'], ref: faqRef },
        { keys: ['college_logo', 'featured_img'], ref: mediaRef }
      ]

      const firstErrorField = Object.keys(errors)[0]
      const section = fieldOrder.find((item) =>
        item.keys.some((key) => firstErrorField.startsWith(key))
      )

      if (section?.ref.current) {
        section.ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })

        // Focus the first invalid element if possible
        setTimeout(() => {
          const firstInvalid = section.ref.current.querySelector(
            '[aria-invalid="true"], input.border-red-500, select.border-red-500, textarea.border-red-500'
          )
          if (firstInvalid) firstInvalid.focus()
        }, 500)
      }
    }
  }, [submitCount, errors])

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
      setBoardStreams([])
      setStreamPrograms([])
      setSelectedBoards([])
      setSelectedStreams([])
      setSelectedPrograms([])
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
          setValue('slug', schoolData.slug || schoolData.slug || '')
          setValue(
            'meta_description',
            schoolData.meta_description || schoolData.metaDescription || ''
          )

          console.log('DEBUG: schoolData fetched:', schoolData)

          const boardList = (
            schoolData.boards ||
            schoolData.collegeBoards ||
            []
          )
            .map((b) => {
              const boardObj = b.board || b
              return {
                id: boardObj.id || boardObj.board_id,
                name: boardObj.name || boardObj.title || 'Unknown'
              }
            })
            .filter((b) => b.id)
          setSelectedBoards(boardList)
          setValue(
            'board_ids',
            boardList.map((b) => b.id),
            { shouldValidate: true }
          )

          const streamList = (
            schoolData.streams ||
            schoolData.collegeStreams ||
            []
          )
            .map((s) => {
              const streamObj = s.stream || s
              return {
                id: streamObj.id || streamObj.stream_id,
                name: streamObj.name || streamObj.title || 'Unknown'
              }
            })
            .filter((s) => s.id)
          setSelectedStreams(streamList)
          setValue(
            'stream_ids',
            streamList.map((s) => s.id),
            { shouldValidate: true }
          )

          const schoolPrograms =
            schoolData.schoolPrograms ||
            schoolData.collegePrograms ||
            schoolData.programs ||
            []
          const mappedPrograms = schoolPrograms
            .map((p) => {
              const programObj = p.program || p
              if (programObj && (programObj.id || programObj.program_id)) {
                return {
                  id: programObj.id || programObj.program_id,
                  title: programObj.title || 'Unknown'
                }
              }
              return null
            })
            .filter(Boolean)

          setSelectedPrograms(mappedPrograms)
          setValue(
            'programs',
            mappedPrograms.map((p) => p.id),
            { shouldValidate: true }
          )

          // 5. Address
          const address =
            schoolData.address ||
            schoolData.collegeAddress ||
            schoolData.schoolAddress
          if (address) {
            setValue('address.country', address.country || 'Nepal')
            setValue('address.district', address.district || '')
            setValue('address.city', address.city || '')
            setValue('address.street', address.street || '')
            setValue('address.postal_code', address.postal_code || '')
          }

          setValue('google_map_url', schoolData.google_map_url || '')
          setValue('map_type', schoolData.map_type || '')

          const contacts = (
            schoolData.collegeContacts || schoolData.schoolContacts
          )?.map((contact) => contact.contact_number) || ['', '']
          setValue('contacts', contacts)

          const galleryItems =
            schoolData.collegeGallery ||
            schoolData.schoolGallery ||
            schoolData.gallery ||
            []
          const images = galleryItems
            .filter((img) => img.file_type === 'image' || !img.file_type)
            .map((img) => ({
              url: img.file_url || img.url,
              file_type: 'image'
            }))

          const videos = galleryItems
            .filter((vid) => vid.file_type === 'video')
            .map((vid) => {
              const videoUrl = vid.file_url || vid.url
              const youtubeId = videoUrl?.includes('embed/')
                ? videoUrl.split('embed/')[1].split('?')[0]
                : null
              return {
                url: videoUrl,
                file_type: 'video',
                thumbnail: youtubeId
                  ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
                  : null,
                youtubeId
              }
            })

          setUploadedFiles({
            college_logo:
              schoolData.college_logo || schoolData.school_logo || '',
            featured_img: schoolData.featured_img || '',
            images: images.length === 1 && !images[0].url ? [] : images,
            videos: videos
          })

          setValue(
            'college_logo',
            schoolData.college_logo || schoolData.school_logo || ''
          )
          setValue('featured_img', schoolData.featured_img || '')

          setValue('images', [...images])

          const memberData = (
            schoolData.collegeMembers ||
            schoolData.schoolMembers ||
            []
          ).map((m) => ({
            id: m.id,
            name: m.name || '',
            role: m.role || '',
            image_url: m.image_url || m.image || '',
            description: m.description || '',
            contact_number: m.contact_number || ''
          }))
          setValue('members', memberData)

          if (schoolData.school_broucher || schoolData.college_broucher) {
            setValue(
              'college_broucher',
              schoolData.school_broucher || schoolData.college_broucher
            )
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

  const selectedBoardIds = watch('board_ids') || []
  const selectedStreamIds = watch('stream_ids') || []

  useEffect(() => {
    const fetchStreams = async () => {
      if (!selectedBoardIds || selectedBoardIds.length === 0) {
        setBoardStreams([])
        return
      }
      try {
        setLoadingStreams(true)
        const streamsData = await getStreamsByBoards(selectedBoardIds)
        setBoardStreams(streamsData || [])
      } catch (error) {
        console.error('Error fetching board streams:', error)
      } finally {
        setLoadingStreams(false)
      }
    }
    fetchStreams()
  }, [JSON.stringify(selectedBoardIds)])

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!selectedStreamIds || selectedStreamIds.length === 0) {
        setStreamPrograms([])
        return
      }
      try {
        setLoadingPrograms(true)
        const programsData = await getProgramsByStreams(selectedStreamIds)
        setStreamPrograms(programsData || [])
      } catch (error) {
        console.error('Error fetching stream programs:', error)
      } finally {
        setLoadingPrograms(false)
      }
    }
    fetchPrograms()
  }, [JSON.stringify(selectedStreamIds)])

  const onSearchDistricts = async (query) => {
    const districts = query
      ? DistrictLists.filter((d) =>
          d.toLowerCase().includes(query.toLowerCase())
        )
      : DistrictLists

    return districts.map((d) => ({ title: d, id: d }))
  }

  const onSearchCountries = async (query) => {
    const countries = query
      ? COUNTRIES.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
      : COUNTRIES

    return countries.map((c) => ({ title: c, id: c }))
  }

  const selectedDistrict = watch('address.district')
  const selectedCountry = watch('address.country')

  const onSearchStreams = async (query) => {
    if (!boardStreams) return []
    const filtered = query
      ? boardStreams.filter((s) =>
          s.name?.toLowerCase().includes(query.toLowerCase())
        )
      : boardStreams

    return filtered.map((s) => ({
      id: s.id,
      name: s.name || 'Unknown'
    }))
  }

  const handleSelectStream = (stream) => {
    const currentStreams = getValues('stream_ids') || []
    const streamId = stream.id || stream
    if (!currentStreams.includes(streamId)) {
      setValue('stream_ids', [...currentStreams, streamId], {
        shouldDirty: true
      })
      const currentSelected = selectedStreams || []
      if (!currentSelected.find((s) => s.id === streamId)) {
        setSelectedStreams([...currentSelected, stream])
      }
    }
  }

  const handleRemoveStream = (stream) => {
    const targetId = stream.id || stream
    const currentStreams = getValues('stream_ids') || []
    setValue(
      'stream_ids',
      currentStreams.filter((id) => id !== targetId),
      { shouldDirty: true }
    )
    setSelectedStreams(selectedStreams.filter((s) => s.id !== targetId))
  }

  const onSearchPrograms = async (query) => {
    if (!streamPrograms) return []
    const filtered = query
      ? streamPrograms.filter((p) =>
          p.title?.toLowerCase().includes(query.toLowerCase())
        )
      : streamPrograms

    return filtered.map((p) => ({
      id: p.id,
      title: p.title || 'Unknown'
    }))
  }

  const handleSelectProgram = (program) => {
    const currentPrograms = getValues('programs') || []
    const programId = program.id || program
    if (!currentPrograms.includes(programId)) {
      setValue('programs', [...currentPrograms, programId], {
        shouldDirty: true
      })
      if (!selectedPrograms.find((p) => p.id === programId)) {
        setSelectedPrograms([...selectedPrograms, program])
      }
    }
  }

  const handleRemoveProgram = (program) => {
    const targetId = program.id || program
    const currentPrograms = getValues('programs') || []
    setValue(
      'programs',
      currentPrograms.filter((id) => id !== targetId),
      { shouldDirty: true }
    )
    setSelectedPrograms(selectedPrograms.filter((p) => p.id !== targetId))
  }

  const selectedProgramIds = watch('programs') || []

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

      data.members = (data.members || [])
        .map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          image_url: m.image_url,
          description: m.description,
          contact_number: m.contact_number
        }))
        .filter(
          (m) =>
            m.name || m.role || m.description || m.contact_number || m.image_url
        )
      if (data.members.length === 0) delete data.members

      const boardIds = (data.board_ids || [])
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id))
      if (boardIds.length > 0) data.board_ids = boardIds
      else delete data.board_ids

      const streamIds = (data.stream_ids || [])
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id))
      if (streamIds.length > 0) data.stream_ids = streamIds
      else delete data.stream_ids

      const programsArray = (data.programs || [])
        .map((c) => parseInt(c))
        .filter((c) => !isNaN(c) && c > 0)

      if (programsArray.length > 0) data.programs = programsArray
      else delete data.programs

      data.school_logo = uploadedFiles.college_logo
      data.featured_img = uploadedFiles.featured_img
      data.images = [
        ...(uploadedFiles.images || []),
        ...(uploadedFiles.videos || [])
      ].filter((img) => img.url)

      data.facilities = (data.facilities || []).filter(
        (f) =>
          f.title.trim() !== '' ||
          f.description.trim() !== '' ||
          f.icon.trim() !== ''
      )
      if (data.facilities.length === 0) delete data.facilities

      data.faqs = (data.faqs || []).filter(
        (f) => f.question.trim() !== '' || f.answer.trim() !== ''
      )
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
        description:
          status === 'draft'
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
    <Dialog
      isOpen={isOpen}
      onClose={handleCloseAttempt}
      closeOnOutsideClick={false}
      className='max-w-7xl'
    >
      <DialogHeader className='bg-white border-b border-gray-100 p-6'>
        <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
          <Layers className='text-[#387cae]' size={24} />
          {editSlug ? 'Edit School' : 'Add New School'}
        </DialogTitle>
        <DialogClose onClick={handleCloseAttempt} />
      </DialogHeader>
      <DialogContent className='p-0 bg-gray-50/50'>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col max-h-[calc(100vh-120px)] relative'
        >
          {loadingData && (
            <div className='absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-b-3xl'>
              <div className='bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-gray-100 animate-in fade-in zoom-in duration-300'>
                <div className='relative'>
                  <div className='w-12 h-12 rounded-full border-4 border-gray-100 border-t-[#387cae] animate-spin'></div>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Info size={16} className='text-[#387cae] animate-pulse' />
                  </div>
                </div>
                <div className='text-center'>
                  <h4 className='font-bold text-gray-900'>Loading Details</h4>
                  <p className='text-xs text-gray-500 font-medium'>
                    Please wait a moment...
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className='flex-1 p-6 overflow-y-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8'>
              {/* Left Column - Main Content (8/12) */}
              <div className='lg:col-span-8 space-y-8'>
                {/* Basic Information */}
                <div
                  ref={basicInfoRef}
                  className='bg-white p-8 rounded-2xl border border-gray-100'
                >
                  <SectionHeader
                    icon={Info}
                    title='Basic Information'
                    subtitle='General identity of the school'
                  />
                  <div className='space-y-6'>
                    <div>
                      <Label required={true} htmlFor='name'>
                        School Name
                      </Label>
                      <Input
                        id='name'
                        placeholder='Enter school name...'
                        className='h-12 text-base rounded-md'
                        {...register('name', {
                          required: 'School name is required'
                        })}
                      />
                      {errors.name && (
                        <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
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
                          className='h-11 rounded-md border-gray-200'
                          {...register('website_url')}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* About School */}
                <div
                  ref={aboutRef}
                  className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={FileText}
                    title='About School'
                    subtitle='Detailed description and content'
                  />
                  <div className='space-y-6'>
                    <div>
                      <Label
                        htmlFor='description'
                        required={true}
                        className='mb-1.5'
                      >
                        Short Description
                      </Label>
                      <Textarea
                        id='description'
                        placeholder='Enter a brief summary of the school...'
                        {...register('description', {
                          required: 'Short description is required'
                        })}
                        className='flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all resize-none'
                      />
                      {errors.description && (
                        <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>
                          {errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className='pt-2'>
                      <Label className='mb-2.5'>Full Content Body</Label>
                      <TipTapEditor
                        onMediaUpload={onMediaUpload}
                        showImageUpload={true}
                        value={watch('content')}
                        onChange={(data) =>
                          setValue('content', data, { shouldDirty: true })
                        }
                        placeholder='Start writing about the school here...'
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Details */}
                <div
                  ref={academicRef}
                  className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={GraduationCap}
                    title='Academic Details'
                    subtitle='Affiliation and programs'
                  />
                  <div className='space-y-6'>
                    <div>
                      <Label required={true}>Affiliated Boards</Label>
                      <SearchSelectCreate
                        onSearch={fetchBoards}
                        onSelect={(board) => {
                          const current = getValues('board_ids') || []
                          const newIds = [...new Set([...current, board.id])]
                          setValue('board_ids', newIds, {
                            shouldDirty: true,
                            shouldValidate: true
                          })

                          const currentBoards = selectedBoards || []
                          if (!currentBoards.find((b) => b.id === board.id)) {
                            setSelectedBoards([...currentBoards, board])
                          }
                        }}
                        onRemove={(board) => {
                          const targetId = board.id || board
                          const current = getValues('board_ids') || []
                          const newIds = current.filter((id) => id !== targetId)
                          setValue('board_ids', newIds, {
                            shouldDirty: true,
                            shouldValidate: true
                          })
                          setSelectedBoards(
                            selectedBoards.filter((b) => b.id !== targetId)
                          )
                        }}
                        selectedItems={selectedBoards}
                        placeholder='Search or select boards...'
                        displayKey='name'
                        valueKey='id'
                        isMulti={true}
                        className='w-full'
                        inputSize='sm'
                      />
                      {errors.board_ids && (
                        <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>
                          {errors.board_ids.message}
                        </p>
                      )}
                      <input
                        type='hidden'
                        {...register('board_ids', {
                          required: 'Please select at least one board'
                        })}
                      />
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                      <div>
                        <Label className='mb-3 block'>Available Streams</Label>
                        <SearchSelectCreate
                          onSearch={onSearchStreams}
                          onSelect={handleSelectStream}
                          onRemove={handleRemoveStream}
                          selectedItems={selectedStreams}
                          placeholder='Search or select streams...'
                          displayKey='name'
                          valueKey='id'
                          isMulti={true}
                          className='w-full'
                          isLoading={loadingStreams}
                          inputSize='sm'
                        />
                        {selectedBoardIds.length === 0 && (
                          <p className='text-[10px] text-gray-400 mt-2 font-medium bg-gray-50 p-2 rounded-md border border-dashed border-gray-200'>
                            Please select a board first to view available
                            streams.
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className='mb-3 block'>Available Programs</Label>
                        <SearchSelectCreate
                          onSearch={onSearchPrograms}
                          onSelect={handleSelectProgram}
                          onRemove={handleRemoveProgram}
                          selectedItems={selectedPrograms}
                          placeholder='Search or select programs...'
                          displayKey='title'
                          valueKey='id'
                          isMulti={true}
                          className='w-full'
                          isLoading={loadingPrograms}
                          inputSize='sm'
                        />
                        {selectedStreamIds.length === 0 && (
                          <p className='text-[10px] text-gray-400 mt-2 font-medium bg-gray-50 p-2 rounded-md border border-dashed border-gray-200'>
                            Please select a stream first to view available
                            programs.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location & Access */}
                <div
                  ref={locationRef}
                  className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={MapPin}
                    title='Location & Access'
                    subtitle='How to find the school'
                  />
                  <div className='space-y-6'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                      <div>
                        <Label htmlFor='address.country' required={true}>
                          Country
                        </Label>
                        <SearchSelectCreate
                          onSearch={onSearchCountries}
                          selectedItems={
                            selectedCountry
                              ? { id: selectedCountry, title: selectedCountry }
                              : []
                          }
                          onSelect={(item) =>
                            setValue('address.country', item.id, {
                              shouldDirty: true
                            })
                          }
                          onRemove={() =>
                            setValue('address.country', '', {
                              shouldDirty: true
                            })
                          }
                          placeholder='Search Country...'
                          isMulti={false}
                          className='w-full'
                          inputSize='sm'
                        />
                      </div>
                      <div>
                        <Label htmlFor='address.district'>District</Label>
                        <SearchSelectCreate
                          onSearch={onSearchDistricts}
                          selectedItems={
                            selectedDistrict
                              ? {
                                  id: selectedDistrict,
                                  title: selectedDistrict
                                }
                              : []
                          }
                          onSelect={(item) =>
                            setValue('address.district', item.id, {
                              shouldDirty: true
                            })
                          }
                          onRemove={() =>
                            setValue('address.district', '', {
                              shouldDirty: true
                            })
                          }
                          placeholder='Search District...'
                          isMulti={false}
                          className='w-full'
                          inputSize='sm'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label>City</Label>
                        <Input
                          {...register('address.city')}
                          placeholder='City'
                          className='h-10'
                        />
                      </div>
                      <div>
                        <Label>Street</Label>
                        <Input
                          {...register('address.street')}
                          placeholder='Street'
                          className='h-10'
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Google Maps URL</Label>
                      <div className='relative'>
                        <Input
                          {...register('google_map_url')}
                          placeholder='Paste map link...'
                          className='h-10 pl-10'
                        />
                        <Map
                          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                          size={16}
                        />
                      </div>
                    </div>

                    <div className='pt-4 border-t border-gray-50'>
                      <Label className='mb-3 block'>Contact Numbers</Label>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {[0, 1].map((idx) => (
                          <div key={idx} className='relative group'>
                            <Activity className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-[#387cae] transition-colors' />
                            <Input
                              {...register(`contacts.${idx}`)}
                              placeholder={`Phone Number ${idx + 1}`}
                              className='h-11 pl-10 rounded-md border-gray-200 transition-all focus:ring-4 focus:ring-[#387cae]/5'
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Infrastructure & Features */}
                <div
                  ref={infrastructureRef}
                  className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={Activity}
                    title='Facilities & Infrastructure'
                    subtitle='What the school offers students'
                  />
                  <div className='space-y-6'>
                    <div className='space-y-4'>
                      {facilityFields.map((field, index) => (
                        <div
                          key={field.id}
                          className='group p-6 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#387cae]/30 transition-all shadow-sm'
                        >
                          <div className='flex justify-between items-start mb-4'>
                            <span className='text-[10px] font-black tracking-[0.2em] uppercase text-gray-400'>
                              Facility #{index + 1}
                            </span>
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
                                <Label className='text-[11px] mb-1.5 opacity-70'>
                                  Icon
                                </Label>
                                <div className='relative'>
                                  <Input
                                    {...register(`facilities.${index}.icon`)}
                                    placeholder='Search Lucide icon name...'
                                    className='h-10 pl-10 pr-10'
                                  />
                                  <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                                    <Activity size={16} />
                                  </div>
                                  <button
                                    type='button'
                                    onClick={() =>
                                      setOpenEmojiPickerIndex(
                                        openEmojiPickerIndex === index
                                          ? null
                                          : index
                                      )
                                    }
                                    className='absolute right-3 top-1/2 -translate-y-1/2 hover:text-[#387cae] transition-colors'
                                  >
                                    <HelpCircle size={16} />
                                  </button>

                                  {openEmojiPickerIndex === index && (
                                    <div className='absolute right-0 top-12 z-[100] shadow-2xl border border-gray-100 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2'>
                                      <EmojiPicker
                                        onEmojiClick={(emojiData) => {
                                          setValue(
                                            `facilities.${index}.icon`,
                                            emojiData.emoji,
                                            { shouldDirty: true }
                                          )
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
                                <Label className='text-[11px] mb-1.5 opacity-70'>
                                  Facility Title
                                </Label>
                                <Input
                                  {...register(`facilities.${index}.title`)}
                                  placeholder='e.g., Modern Science Lab'
                                  className='h-10'
                                />
                              </div>
                            </div>
                            <div>
                              <Label className='text-[11px] mb-1.5 opacity-70'>
                                Description
                              </Label>
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
                        onClick={() =>
                          appendFacility({
                            title: '',
                            description: '',
                            icon: ''
                          })
                        }
                        className='w-full h-12 border-dashed border-2 hover:border-[#387cae] hover:bg-[#387cae]/5 text-gray-400 hover:text-[#387cae] transition-all gap-2 font-bold'
                      >
                        <Plus size={16} /> Add New Facility
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Leadership Team */}
                <div
                  ref={teamRef}
                  className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
                >
                  <div className='flex justify-between items-center mb-6'>
                    <SectionHeader
                      icon={Users}
                      title='Leadership Team'
                      subtitle='Key staff and administrators'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='rounded-md border-[#387cae]/20 text-[#387cae] hover:bg-[#387cae]/5'
                      onClick={() =>
                        appendMember({
                          name: '',
                          role: '',
                          image_url: '',
                          description: '',
                          contact_number: ''
                        })
                      }
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add Member
                    </Button>
                  </div>
                  <div className='grid grid-cols-1 gap-6'>
                    {memberFields.map((field, index) => (
                      <div
                        key={field.id}
                        className='group relative p-6 bg-white border border-gray-100 rounded-3xl transition-all hover:shadow-xl hover:shadow-[#387cae]/5 hover:border-[#387cae]/20'
                      >
                        <div className='flex flex-col md:flex-row gap-6 pr-10'>
                          <div className='w-24 shrink-0'>
                            <Label className='text-[10px] font-bold text-gray-400 uppercase mb-3 block text-center'>
                              Photo
                            </Label>
                            <FileUploadWithPreview
                              onUploadComplete={(url) =>
                                setValue(`members.${index}.image_url`, url, {
                                  shouldDirty: true
                                })
                              }
                              onClear={() =>
                                setValue(`members.${index}.image_url`, '', {
                                  shouldDirty: true
                                })
                              }
                              defaultPreview={watch(
                                `members.${index}.image_url`
                              )}
                            />
                            <input
                              type='hidden'
                              {...register(`members.${index}.image_url`)}
                            />
                          </div>
                          <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div>
                              <Label className='text-[10px] font-bold text-gray-400 uppercase mb-1 block'>
                                Full Name
                              </Label>
                              <Input
                                {...register(`members.${index}.name`, {
                                  required: 'Name is required'
                                })}
                                placeholder='Dr. John Doe'
                                className='h-10 rounded-md'
                              />
                            </div>
                            <div>
                              <Label className='text-[10px] font-bold text-slate-500 uppercase mb-1 block'>
                                Role
                              </Label>
                              <Input
                                {...register(`members.${index}.role`, {
                                  required: 'Role is required'
                                })}
                                placeholder='Principal / Professor'
                                className='h-10 rounded-md'
                              />
                            </div>
                            <div className='sm:col-span-2'>
                              <Label className='text-[10px] font-bold text-slate-500 uppercase mb-1 block'>
                                Professional description
                              </Label>
                              <Input
                                {...register(`members.${index}.description`)}
                                placeholder='Achievement and specialization...'
                                className='h-10 rounded-md'
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          className='absolute top-6 right-6 h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 border-gray-100 rounded-md'
                          onClick={() => removeMember(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQs */}
                <div
                  ref={faqRef}
                  className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
                >
                  <div className='flex justify-between items-center mb-6'>
                    <SectionHeader
                      icon={HelpCircle}
                      title='Frequently Asked Questions'
                      subtitle='Common queries about the school'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='rounded-md border-[#387cae]/20 text-[#387cae] hover:bg-[#387cae]/5'
                      onClick={() => appendFaq({ question: '', answer: '' })}
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Add FAQ
                    </Button>
                  </div>
                  <div className='space-y-4'>
                    {faqFields.map((field, index) => (
                      <div
                        key={field.id}
                        className='group relative p-6 bg-white border border-gray-100 rounded-2xl transition-all hover:shadow-lg hover:shadow-[#387cae]/5 hover:border-[#387cae]/20'
                      >
                        <div className='space-y-4 pr-10'>
                          <div>
                            <Label
                              required
                              className='text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block'
                            >
                              Question
                            </Label>
                            <Input
                              {...register(`faqs.${index}.question`)}
                              placeholder='The question...'
                              className='h-11 rounded-md text-gray-800'
                            />
                          </div>
                          <div>
                            <Label
                              required
                              className='text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block'
                            >
                              Answer
                            </Label>
                            <Textarea
                              {...register(`faqs.${index}.answer`)}
                              placeholder='The answer...'
                              className='rounded-md resize-none min-h-[80px]'
                            />
                          </div>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute top-6 right-4 h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors rounded-md'
                          onClick={() => removeFaq(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Media & Settings (4/12) */}
              <div className='lg:col-span-4 space-y-8'>
                {/* Media & Branding */}
                <div
                  ref={mediaRef}
                  className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={ImageIcon}
                    title='Logo & Cover'
                    subtitle='Identity visuals'
                  />
                  <div className='space-y-6'>
                    <div className='p-3 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed hover:bg-white hover:border-[#387cae]/30 transition-all group'>
                      <Label
                        required={true}
                        className='text-[11px] font-black tracking-[0.1em] mb-4 block group-hover:text-[#387cae]'
                      >
                        School Logo
                      </Label>
                      <FileUploadWithPreview
                        label=''
                        onUploadComplete={(url) => {
                          handleSetFiles((prev) => ({
                            ...prev,
                            college_logo: url
                          }))
                          setValue('college_logo', url, {
                            shouldValidate: true
                          })
                        }}
                        defaultPreview={uploadedFiles.college_logo}
                        onClear={() => {
                          handleSetFiles((prev) => ({
                            ...prev,
                            college_logo: ''
                          }))
                          setValue('college_logo', '', { shouldValidate: true })
                        }}
                      />
                    </div>

                    <div className='p-3 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed hover:bg-white hover:border-[#387cae]/30 transition-all group'>
                      <Label
                        required={true}
                        className='text-[11px] font-black mb-3 block group-hover:text-[#387cae]'
                      >
                        Cover Image
                      </Label>
                      <FileUploadWithPreview
                        label=''
                        widthClass='w-full'
                        heightClass='h-40'
                        onUploadComplete={(url) => {
                          handleSetFiles((prev) => ({
                            ...prev,
                            featured_img: url
                          }))
                          setValue('featured_img', url, {
                            shouldValidate: true
                          })
                        }}
                        defaultPreview={uploadedFiles.featured_img}
                        onClear={() => {
                          handleSetFiles((prev) => ({
                            ...prev,
                            featured_img: ''
                          }))
                          setValue('featured_img', '', { shouldValidate: true })
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                  <SectionHeader
                    icon={FileText}
                    title='Brochure'
                    subtitle='PDF documents'
                  />
                  <div className='space-y-4'>
                    <div>
                      <Label
                        htmlFor='college_broucher'
                        className='text-xs font-bold text-gray-400 mb-1.5 block'
                      >
                        Brochure File (PDF)
                      </Label>
                      <FileUploadWithPreview
                        onUploadComplete={(url) =>
                          setValue('college_broucher', url, {
                            shouldDirty: true
                          })
                        }
                        onClear={() =>
                          setValue('college_broucher', '', {
                            shouldDirty: true
                          })
                        }
                        defaultPreview={watch('college_broucher')}
                        accept='.pdf'
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery Section */}
                <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100'>
                  <SectionHeader
                    icon={ImageIcon}
                    title='Image Gallery'
                    subtitle='Visual showcase'
                  />
                  <GallerySection
                    control={control}
                    setValue={setValue}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={handleSetFiles}
                    getValues={getValues}
                  />
                </div>

                {/* Video Section */}
                <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100'>
                  <SectionHeader
                    icon={Video}
                    title='Video Gallery'
                    subtitle='Virtual tours & promos'
                  />
                  <VideoSection
                    control={control}
                    setValue={setValue}
                    uploadedFiles={uploadedFiles}
                    setUploadedFiles={handleSetFiles}
                    getValues={getValues}
                  />
                </div>

                {/* SEO Settings Section */}
                <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100'>
                  <SectionHeader
                    icon={Settings}
                    title='SEO Settings'
                    subtitle='Optimize for search engines'
                  />
                  <div className='space-y-4'>
                    <div className='mb-4'>
                      <Label htmlFor='slug'>URL Slug</Label>
                      <Input id='slug' {...register('slug')} className='mt-1' />
                      <p className='text-[10px] text-gray-400 mt-1 italic'>
                        Leave empty to auto-generate from name
                      </p>
                    </div>
                    <div>
                      <Label htmlFor='meta_description'>
                        SEO Meta Description
                      </Label>
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

          {/* Footer Actions */}
          <div className='sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-6 flex justify-end gap-3 z-40 rounded-b-3xl'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCloseAttempt}
              className='px-8 border-gray-200 text-gray-600 hover:bg-gray-50'
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='secondary'
              disabled={submittingDraft || submitting}
              onClick={onSaveDraft}
              className='bg-gray-100 hover:bg-gray-200 text-gray-700 border-none px-6'
            >
              {submittingDraft ? (
                <Loader2 className='animate-spin mr-2' size={16} />
              ) : (
                <FileText className='w-4 h-4 mr-2' />
              )}
              <span>Save as Draft</span>
            </Button>
            <Button
              type='button'
              onClick={() => {
                setValue('status', 'published', { shouldDirty: true })
                handleSubmit((data) => onSubmit(data))()
              }}
              disabled={submitting || submittingDraft}
              className='bg-[#387cae] hover:bg-[#2d638c] text-white px-8 shadow-md transition-all active:scale-95'
            >
              {submitting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  {editSlug ? (
                    <Check className='w-4 h-4 mr-2' />
                  ) : (
                    <Plus className='w-4 h-4 mr-2' />
                  )}
                  <span>{editSlug ? 'Update School' : 'Create School'}</span>
                </>
              )}
            </Button>
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
        title='Discard Changes?'
        message='You have unsaved changes. Are you sure you want to discard them? This action cannot be undone.'
      />
    </Dialog>
  )
}

export default CreateUpdateSchoolModal
