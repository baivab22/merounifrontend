'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useForm, useFieldArray } from 'react-hook-form'
import axios from 'axios'
import { useSelector } from 'react-redux'
import EmojiPicker from 'emoji-picker-react'
import { authFetch } from '@/app/utils/authFetch'
import { useToast } from '@/hooks/use-toast'
import { usePageHeading } from '@/contexts/PageHeadingContext'

// Actions and UI controls
import {
  fetchUniversities,
  getProgramsByDegreeIds,
  getDegreesByUniversity,
  fetchDistricts,
  fetchCountries,
  fetchCities,
  fetchAllDegrees
} from '../colleges/actions'

// Lucide Icons
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

// Shadcn UI components
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { Textarea } from '@/ui/shadcn/textarea'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'
import GallerySection from '@/ui/molecules/dialogs/college/components/GallerySection'
import VideoSection from '@/ui/molecules/dialogs/college/components/VideoSection'
import FileUploadWithPreview from '@/ui/molecules/dialogs/college/components/MediaUploadWithBranding'

const TipTapEditor = dynamic(() => import('@/ui/shadcn/tiptap-editor'), {
  ssr: false
})

/** Stable comparison for affiliated university IDs (user-driven changes vs programmatic load). */
const universitySelectionKey = (ids) =>
  [...new Set((ids || []).map((id) => Number(id)).filter((n) => !isNaN(n)))]
    .sort((a, b) => a - b)
    .join(',')

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className='flex items-center gap-3 mb-6'>
    <div className='w-10 h-10 rounded-md bg-[#387cae]/10 flex items-center justify-center text-[#387cae] shadow-sm border border-[#387cae]/20'>
      <Icon size={20} />
    </div>
    <div>
      <h3 className='text-lg font-bold text-gray-900 leading-tight'>{title}</h3>
      {subtitle && (
        <p className='text-[11px] mt-0.5 font-semibold tracking-wider text-gray-500'>
          {subtitle}
        </p>
      )}
    </div>
  </div>
)

const EditCollegePage = () => {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [allDegrees, setAllDegrees] = useState([])
  const [districts, setDistricts] = useState([])
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])

  // Dynamic linked selectors state
  const [selectedUniversities, setSelectedUniversities] = useState([])
  const [universityPrograms, setUniversityPrograms] = useState([])
  const [universityDegrees, setUniversityDegrees] = useState([])
  const [loadingPrograms, setLoadingPrograms] = useState(false)
  const [loadingDegrees, setLoadingDegrees] = useState(false)
  const [openEmojiPickerIndex, setOpenEmojiPickerIndex] = useState(null)

  // Media files state
  const [uploadedFiles, setUploadedFiles] = useState({
    college_logo: '',
    featured_img: '',
    images: [],
    videos: []
  })

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
    setError,
    clearErrors,
    formState: { errors, submitCount, isDirty }
  } = useForm({
    defaultValues: {
      name: '',
      author_id: author_id,
      university_id: [],
      institute_type: 'Private',
      institute_level: ['College'],
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
        country: '',
        district: '',
        city: '',
        street: '',
        postal_code: ''
      },
      google_map_url: '',
      map_type: '',
      contacts: ['', ''],
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

  // Scroll to first error on submit
  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const fieldOrder = [
        { keys: ['name', 'university_id'], ref: basicInfoRef },
        { keys: ['description', 'content'], ref: aboutRef },
        { keys: ['degrees', 'programs'], ref: academicRef },
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

  useEffect(() => {
    setHeading('Edit College Information')
    const loadInitialResources = async () => {
      try {
        const [dList, cList, cityList] = await Promise.all([
          fetchDistricts(),
          fetchCountries(),
          fetchCities()
        ])
        setDistricts(dList || [])
        setCountries(cList || [])
        setCities(cityList || [])
      } catch (err) {
        console.error('Error loading location resources:', err)
      }
    }

    const loadData = async () => {
      await loadDegrees()
      await loadCollegeData()
    }

    loadInitialResources()
    loadData()
  }, [register])

  const loadDegrees = async () => {
    try {
      const data = await fetchAllDegrees()
      setAllDegrees(data || [])
    } catch (err) {
      console.error('Error loading degrees:', err)
    }
  }

  const loadCollegeData = async () => {
    try {
      setLoading(true)
      const response = await authFetch(
        `${process.env.baseUrl}/college/institution/my-college`,
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (!response.ok) throw new Error('Failed to fetch college details')

      let collegeData = await response.json()
      collegeData = collegeData.item

      if (!collegeData) {
        toast({
          title: 'Error',
          description: 'College data not found',
          variant: 'destructive'
        })
        return
      }

      // Basic Info
      setValue('id', collegeData.id)
      setValue('name', collegeData.name)
      setValue('institute_type', collegeData.institute_type)
      setValue(
        'institute_level',
        typeof collegeData.institute_level === 'string'
          ? JSON.parse(collegeData.institute_level || '[]')
          : collegeData.institute_level || []
      )
      setValue('description', collegeData.description)
      setValue('content', collegeData.content || '')
      setValue('website_url', collegeData.website_url)

      // Affiliated Universities hydration
      const uniList =
        collegeData.universities ||
        (collegeData.university ? [collegeData.university] : [])
      setSelectedUniversities(uniList)

      const uniIds = (
        collegeData.university_id
          ? Array.isArray(collegeData.university_id)
            ? collegeData.university_id
            : [collegeData.university_id]
          : uniList.map((u) => u.id)
      )
        .map(Number)
        .filter((id) => !isNaN(id))

      setValue('university_id', uniIds.map(String), { shouldValidate: true })

      // Degrees Offered hydration
      if (collegeData.degrees && Array.isArray(collegeData.degrees)) {
        const degreeIds = collegeData.degrees.map((degree) => String(degree.id))
        setValue('degrees', degreeIds)
      }

      // Available Programs hydration
      const collegePrograms =
        collegeData.collegePrograms || collegeData.collegeCourses || []
      const programIds = collegePrograms
        .map((program) => program.program_id || program.program?.id)
        .filter((id) => id !== undefined)

      setValue('programs', [...new Set(programIds)])

      // Pre-populate university programs
      const initialPrograms = collegePrograms
        .map((cc) => ({
          id: cc.program_id || cc.program?.id,
          title: cc.program?.title || 'Unknown'
        }))
        .filter((p) => p.id)

      if (initialPrograms.length > 0) {
        setUniversityPrograms(initialPrograms)
      }

      // Address hydration
      if (collegeData.collegeAddress) {
        setValue('address.country', collegeData.collegeAddress.country)
        setValue('address.district', collegeData.collegeAddress.district)
        setValue('address.city', collegeData.collegeAddress.city)
        setValue('address.street', collegeData.collegeAddress.street)
        setValue('address.postal_code', collegeData.collegeAddress.postal_code)
      }

      setValue('google_map_url', collegeData.google_map_url || '')
      setValue('map_type', collegeData.map_type || '')

      // Contact numbers hydration
      const contacts = collegeData.collegeContacts?.map(
        (contact) => contact.contact_number
      ) || ['', '']
      setValue('contacts', contacts)

      // Media Asset hydration
      const galleryItems =
        collegeData.collegeGallery || collegeData.gallery || []
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
        college_logo: collegeData.college_logo || '',
        featured_img: collegeData.featured_img || '',
        images: images.length === 1 && !images[0].url ? [] : images,
        videos: videos
      })

      setValue('college_logo', collegeData.college_logo || '', {
        shouldValidate: true
      })
      setValue('featured_img', collegeData.featured_img || '', {
        shouldValidate: true
      })
      setValue('images', [...images])

      // Team directory hydration
      const memberData = (collegeData.collegeMembers || []).map((m) => ({
        id: m.id,
        name: m.name || '',
        role: m.role || '',
        image_url: m.image_url || m.image || '',
        description: m.description || '',
        contact_number: m.contact_number || ''
      }))
      setValue('members', memberData)

      // Facilities hydration
      const facilityData = collegeData.collegeFacility?.length
        ? collegeData.collegeFacility.map((f) => ({
            title: f.title || '',
            description: f.description || '',
            icon: f.icon || ''
          }))
        : collegeData.facilities?.length
          ? collegeData.facilities.map((f) => ({
              title: f.title || '',
              description: f.description || '',
              icon: f.icon || ''
            }))
          : []
      setValue('facilities', facilityData)

      // FAQs hydration
      const faqData = collegeData.faqs?.length
        ? collegeData.faqs.map((f) => ({
            question: f.question || '',
            answer: f.answer || ''
          }))
        : []
      setValue('faqs', faqData)

      // Brochure hydration
      if (collegeData.college_broucher) {
        setValue('college_broucher', collegeData.college_broucher)
      }
    } catch (err) {
      console.error('Error loading college data:', err)
      toast({
        title: 'Error',
        description: 'Failed to load college data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Dynamic selector values (fall back to selectedUniversities when form IDs are missing)
  const watchedUniIds = watch('university_id')
  const selectedUniIds = useMemo(() => {
    const fromForm = Array.isArray(watchedUniIds)
      ? watchedUniIds
      : watchedUniIds
        ? [watchedUniIds]
        : []
    if (fromForm.length > 0) return fromForm.map(String)
    return (selectedUniversities || [])
      .map((u) => u?.id)
      .filter((id) => id != null && id !== '')
      .map(String)
  }, [watchedUniIds, selectedUniversities])
  const selectedDegreeIdsArray = watch('degrees') || []

  // Keep form university_id in sync after hydration (e.g. when API returns universities without ids)
  useEffect(() => {
    if (loading) return
    const formIds = getValues('university_id') || []
    if (formIds.length > 0) return
    const idsFromSelection = (selectedUniversities || [])
      .map((u) => u?.id)
      .filter((id) => id != null && id !== '')
      .map(String)
    if (idsFromSelection.length > 0) {
      setValue('university_id', idsFromSelection, { shouldValidate: true })
    }
  }, [loading, selectedUniversities, getValues, setValue])

  // Load affiliated degrees based on selected universities
  useEffect(() => {
    const fetchDegrees = async () => {
      if (!selectedUniIds || selectedUniIds.length === 0) {
        setUniversityDegrees([])
        return
      }
      try {
        setLoadingDegrees(true)
        const degreeData = await getDegreesByUniversity(selectedUniIds)
        setUniversityDegrees(degreeData || [])
      } catch (error) {
        console.error('Error fetching university degrees:', error)
      } finally {
        setLoadingDegrees(false)
      }
    }
    fetchDegrees()
  }, [JSON.stringify(selectedUniIds)])

  // Load programs based on selected degrees and universities
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!selectedDegreeIdsArray || selectedDegreeIdsArray.length === 0) {
        setUniversityPrograms([])
        return
      }
      try {
        setLoadingPrograms(true)
        const programItems = await getProgramsByDegreeIds(
          selectedDegreeIdsArray,
          selectedUniIds
        )
        setUniversityPrograms(programItems || [])
      } catch (error) {
        console.error('Error fetching programs by degree:', error)
      } finally {
        setLoadingPrograms(false)
      }
    }
    fetchPrograms()
  }, [JSON.stringify(selectedDegreeIdsArray), JSON.stringify(selectedUniIds)])

  // Location search functions
  const onSearchDistricts = async (query) => {
    const filtered = query
      ? districts.filter((d) => d.toLowerCase().includes(query.toLowerCase()))
      : districts

    return filtered.map((d) => ({ title: d, id: d }))
  }

  const onSearchCountries = async (query) => {
    const filtered = query
      ? countries.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
      : countries

    return filtered.map((c) => ({ title: c, id: c }))
  }

  const onSearchCities = async (query) => {
    const filtered = query
      ? cities.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
      : cities

    return filtered.map((c) => ({ title: c, id: c }))
  }

  const selectedDistrict = watch('address.district')
  const selectedCountry = watch('address.country')
  const selectedCity = watch('address.city')

  // Search selectors for programs and degrees
  const onSearchPrograms = async (query) => {
    if (!universityPrograms) return []
    const filtered = query
      ? universityPrograms.filter((p) =>
          p.title?.toLowerCase().includes(query.toLowerCase())
        )
      : universityPrograms

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
    }
  }

  const handleRemoveProgram = (program) => {
    const currentPrograms = getValues('programs') || []
    const programId = program.id || program
    setValue(
      'programs',
      currentPrograms.filter((id) => id !== programId),
      { shouldDirty: true }
    )
  }

  const selectedProgramIds = watch('programs') || []
  const selectedPrograms = Array.isArray(universityPrograms)
    ? universityPrograms
        .filter((p) => selectedProgramIds.map(String).includes(String(p.id)))
        .map((p) => ({ id: p.id, title: p.title }))
    : []

  const onSearchDegrees = async (query) => {
    const degreesToFilter =
      universityDegrees.length > 0 ? universityDegrees : allDegrees || []
    return query
      ? degreesToFilter.filter((d) =>
          d.title?.toLowerCase().includes(query.toLowerCase())
        )
      : degreesToFilter
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
    setValue(
      'degrees',
      currentDegrees.filter((id) => id !== degreeId),
      { shouldDirty: true }
    )
  }

  const selectedDegreeIds = watch('degrees') || []
  const selectedDegrees = (
    universityDegrees.length > 0 ? universityDegrees : allDegrees || []
  )
    .filter((d) => selectedDegreeIds.includes(String(d.id)))
    .map((d) => ({ id: d.id, title: d.title }))

  const handleSetFiles = (updater) => {
    setUploadedFiles(updater)
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

  const onSubmit = async (data) => {
    // Sync absolute source-of-truth values into form data payload
    const finalUniIds = selectedUniversities
      ? selectedUniversities
          .map((u) => parseInt(u.id))
          .filter((id) => !isNaN(id))
      : []

    if (finalUniIds.length === 0) {
      setError('university_id', {
        type: 'manual',
        message: 'Please select at least one university'
      })
      if (basicInfoRef.current) {
        basicInfoRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
      return
    }

    data.university_id = finalUniIds
    data.college_logo = uploadedFiles?.college_logo
    data.featured_img = uploadedFiles?.featured_img

    try {
      setSubmitting(true)

      // Filter out empty members
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

      // Map degrees
      data.degrees = (data.degrees || [])
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id))

      // Map programs
      const programsArray = (data.programs || [])
        .map((c) => parseInt(c))
        .filter((c) => !isNaN(c) && c > 0)
      if (programsArray.length > 0) data.programs = programsArray
      else delete data.programs

      // Image & video payloads
      data.college_logo = uploadedFiles.college_logo
      data.featured_img = uploadedFiles.featured_img
      data.images = [
        ...(uploadedFiles.images || []),
        ...(uploadedFiles.videos || [])
      ].filter((img) => img.url)

      // Filter empty facilities
      data.facilities = (data.facilities || []).filter(
        (f) =>
          f.title.trim() !== '' ||
          f.description.trim() !== '' ||
          f.icon.trim() !== ''
      )
      if (data.facilities.length === 0) delete data.facilities

      // Filter empty FAQs
      data.faqs = (data.faqs || []).filter(
        (f) => f.question.trim() !== '' || f.answer.trim() !== ''
      )
      if (data.faqs.length === 0) delete data.faqs

      // Ensure author ID
      data.author_id = author_id

      const response = await authFetch(
        `${process.env.baseUrl}/college/institution/my-college`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update college')
      }

      reset(data)

      toast({
        title: 'Success',
        description: 'College updated successfully!'
      })
    } catch (err) {
      console.error('Error updating college:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to update college',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='p-4 flex flex-col min-h-screen bg-gray-50/50 relative'>
        <div className='absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center'>
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
      </div>
    )
  }

  return (
    <div className='flex flex-col h-[calc(100dvh-8.5rem)] max-h-[calc(100dvh-8.5rem)]'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex flex-col flex-1 min-h-0 rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm overflow-hidden'
      >
        <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-8 sidebar-scrollbar'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6'>
            {/* Left Column - Main Content (8/12) */}
            <div className='lg:col-span-8 space-y-8'>
              {/* Basic Information */}
              <div
                ref={basicInfoRef}
                className='bg-white p-8 rounded-2xl border border-gray-100 shadow-sm'
              >
                <SectionHeader
                  icon={Info}
                  title='Basic Information'
                  subtitle='General identity of the college'
                />
                <div className='space-y-6'>
                  <div>
                    <Label required={true} htmlFor='name'>
                      College Name
                    </Label>
                    <Input
                      id='name'
                      placeholder='Enter college name...'
                      className='h-12 text-base rounded-md mt-1'
                      {...register('name', {
                        required: 'College name is required'
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
                        className='flex h-11 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all mt-1'
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
                        className='h-11 rounded-md border-gray-200 mt-1'
                        {...register('website_url')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* About College */}
              <div
                ref={aboutRef}
                className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
              >
                <SectionHeader
                  icon={FileText}
                  title='About College'
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
                      placeholder='Enter a brief summary of the college...'
                      {...register('description', {
                        required: 'Short description is required'
                      })}
                      className='flex min-h-[100px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all resize-none mt-1'
                    />
                    {errors.description && (
                      <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className='pt-2'>
                    <Label className='mb-2.5 block'>Full Content Body</Label>
                    <TipTapEditor
                      onMediaUpload={onMediaUpload}
                      showImageUpload={true}
                      value={watch('content')}
                      onChange={(data) =>
                        setValue('content', data, { shouldDirty: true })
                      }
                      placeholder='Start writing about the college here...'
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
                    <Label required={true} className='block mb-1'>
                      Affiliated Universities
                    </Label>
                    <SearchSelectCreate
                      onSearch={fetchUniversities}
                      onSelect={(uni) => {
                        const current = getValues('university_id') || []
                        const newIds = [...new Set([...current, uni.id])]
                        if (
                          universitySelectionKey(newIds) !==
                          universitySelectionKey(current)
                        ) {
                          setValue('degrees', [], { shouldDirty: true })
                          setValue('programs', [], { shouldDirty: true })
                        }
                        setValue('university_id', newIds.map(String), {
                          shouldDirty: true,
                          shouldValidate: true
                        })
                        clearErrors('university_id')

                        const currentUnis = selectedUniversities || []
                        if (!currentUnis.find((u) => u.id === uni.id)) {
                          const updatedUnis = [...currentUnis, uni]
                          setSelectedUniversities(updatedUnis)
                        }
                      }}
                      onRemove={(uni) => {
                        const targetId = uni.id || uni
                        const current = getValues('university_id') || []
                        const newIds = current.filter((id) => id !== targetId)
                        if (
                          universitySelectionKey(newIds) !==
                          universitySelectionKey(current)
                        ) {
                          setValue('degrees', [], { shouldDirty: true })
                          setValue('programs', [], { shouldDirty: true })
                        }
                        setValue('university_id', newIds.map(String), {
                          shouldDirty: true,
                          shouldValidate: true
                        })
                        if (newIds.length === 0) {
                          setError('university_id', {
                            type: 'manual',
                            message: 'Please select at least one university'
                          })
                        } else {
                          clearErrors('university_id')
                        }

                        const updatedUnis = selectedUniversities.filter(
                          (u) => u.id !== targetId
                        )
                        setSelectedUniversities(updatedUnis)
                      }}
                      selectedItems={selectedUniversities}
                      placeholder='Search or select universities...'
                      displayKey='fullname'
                      valueKey='id'
                      isMulti={true}
                      className='w-full'
                      renderItem={(item) => (
                        <div className='flex items-center gap-3'>
                          {item.logo ? (
                            <img
                              src={item.logo}
                              alt={item.fullname}
                              className='w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0'
                            />
                          ) : (
                            <div className='w-7 h-7 rounded-full bg-[#387cae]/10 flex items-center justify-center shrink-0'>
                              <span className='text-xs font-bold text-[#387cae]'>
                                {item.fullname?.charAt(0)?.toUpperCase() || 'C'}
                              </span>
                            </div>
                          )}
                          <span className='text-sm font-medium text-gray-800'>
                            {item.fullname}
                          </span>
                        </div>
                      )}
                      renderSelected={(item) => (
                        <div className='flex items-center gap-3'>
                          {item.logo ? (
                            <img
                              src={item.logo}
                              alt={item.fullname}
                              className='w-7 h-7 rounded-full object-cover border border-gray-200 shrink-0'
                            />
                          ) : (
                            <div className='w-7 h-7 rounded-full bg-[#387cae]/10 flex items-center justify-center shrink-0'>
                              <span className='text-xs font-bold text-[#387cae]'>
                                {item.fullname?.charAt(0)?.toUpperCase() || 'C'}
                              </span>
                            </div>
                          )}
                          <span className='text-sm font-semibold text-gray-900 truncate'>
                            {item.fullname}
                          </span>
                        </div>
                      )}
                      inputSize='sm'
                    />
                    {errors.university_id && (
                      <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>
                        {errors.university_id.message}
                      </p>
                    )}
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                    <div>
                      <Label className='mb-3 block'>Degrees Offered</Label>
                      <SearchSelectCreate
                        onSearch={onSearchDegrees}
                        onSelect={handleSelectDegree}
                        onRemove={handleRemoveDegree}
                        selectedItems={selectedDegrees}
                        placeholder={
                          selectedUniIds.length === 0
                            ? 'Select university first...'
                            : 'Search or select degrees...'
                        }
                        displayKey='title'
                        valueKey='id'
                        isMulti={true}
                        className='w-full'
                        inputSize='sm'
                        isLoading={loadingDegrees}
                        isDisabled={selectedUniIds.length === 0}
                      />
                    </div>

                    <div>
                      <Label className='mb-3 block'>Available Programs</Label>
                      <SearchSelectCreate
                        onSearch={onSearchPrograms}
                        onSelect={handleSelectProgram}
                        onRemove={handleRemoveProgram}
                        selectedItems={selectedPrograms}
                        placeholder={
                          selectedDegreeIds.length === 0
                            ? 'Select degree first...'
                            : 'Search or select programs...'
                        }
                        displayKey='title'
                        valueKey='id'
                        isMulti={true}
                        className='w-full'
                        isLoading={loadingPrograms}
                        inputSize='sm'
                        isDisabled={selectedDegreeIds.length === 0}
                      />
                      {selectedUniIds.length === 0 ? (
                        <p className='text-[10px] text-gray-400 mt-2 font-medium bg-gray-50 p-2 rounded-md border border-dashed border-gray-200'>
                          Please select a university first to view available
                          degrees.
                        </p>
                      ) : (
                        selectedDegreeIds.length === 0 && (
                          <p className='text-[10px] text-gray-400 mt-2 font-medium bg-gray-50 p-2 rounded-md border border-dashed border-gray-200'>
                            Please select at least one degree to view available
                            programs.
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location & Contact */}
              <div
                ref={locationRef}
                className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
              >
                <SectionHeader
                  icon={MapPin}
                  title='Location & Contact'
                  subtitle='Where to find the college'
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
                        className='w-full mt-1'
                        inputSize='sm'
                      />
                      {errors.address?.country && (
                        <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>
                          {errors.address.country.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='address.district' required={true}>
                        District
                      </Label>
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
                        className='w-full mt-1'
                        inputSize='sm'
                      />
                      {errors.address?.district && (
                        <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>
                          {errors.address.district.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    <div>
                      <Label htmlFor='address.city' required={true}>
                        City
                      </Label>
                      <SearchSelectCreate
                        onSearch={onSearchCities}
                        selectedItems={
                          selectedCity
                            ? { id: selectedCity, title: selectedCity }
                            : []
                        }
                        onSelect={(item) =>
                          setValue('address.city', item.id, {
                            shouldDirty: true
                          })
                        }
                        onRemove={() =>
                          setValue('address.city', '', {
                            shouldDirty: true
                          })
                        }
                        placeholder='Search City...'
                        isMulti={false}
                        className='w-full mt-1'
                        inputSize='sm'
                      />
                      {errors.address?.city && (
                        <p className='text-xs font-semibold text-red-500 mt-2 ml-1'>
                          {errors.address.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='address.street'>Street Address</Label>
                      <Input
                        id='address.street'
                        {...register('address.street')}
                        placeholder='e.g. Putalisadak'
                        className='h-11 rounded-md border-gray-200 mt-1'
                      />
                    </div>
                  </div>

                  <div className='pt-2 space-y-6'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                      <div>
                        <Label
                          htmlFor='map_type'
                          className='flex items-center gap-2 mb-1'
                        >
                          Map Type
                        </Label>
                        <select
                          id='map_type'
                          {...register('map_type')}
                          className='flex h-11 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all mt-1'
                        >
                          <option value=''>Select Map Type</option>
                          <option value='google_map_url'>
                            Google Map URL (Share Link)
                          </option>
                          <option value='embed_map_url'>
                            Embed Map URL (Iframe Src)
                          </option>
                        </select>
                      </div>
                      <div className='flex-1'>
                        <Label
                          htmlFor='google_map_url'
                          className='flex items-center gap-2 mb-1'
                        >
                          <Map size={14} className='text-[#387cae]' />
                          Map Link / URL
                        </Label>
                        <div className='relative group mt-1'>
                          <div className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#387cae] transition-colors'>
                            <MapPin size={18} />
                          </div>
                          <Input
                            id='google_map_url'
                            {...register('google_map_url')}
                            placeholder={
                              watch('map_type') === 'embed_map_url'
                                ? 'Paste iframe src...'
                                : 'Paste Google Maps share link...'
                            }
                            className='h-11 pl-12 rounded-md bg-gray-50/30 border-gray-200 transition-all focus:ring-4 focus:ring-[#387cae]/5 focus:bg-white'
                          />
                        </div>
                      </div>
                    </div>
                    <p className='text-[10px] text-gray-400 -mt-2 ml-1 flex items-center gap-1.5 font-medium'>
                      <Info size={12} />
                      This interactive map will be visible to students on the
                      college profile.
                    </p>
                  </div>

                  <div>
                    <Label className='mb-3 block'>Contact Numbers</Label>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      {[0, 1].map((index) => (
                        <div key={index} className='relative group'>
                          <Activity className='absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-[#387cae] transition-colors' />
                          <Input
                            placeholder={`Phone Number ${index + 1}`}
                            className='h-11 pl-10 rounded-md border-gray-200 transition-all focus:ring-4 focus:ring-[#387cae]/5'
                            {...register(`contacts[${index}]`)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div
                ref={infrastructureRef}
                className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
              >
                <div className='flex justify-between items-center mb-6'>
                  <SectionHeader
                    icon={Activity}
                    title='Facilities'
                    subtitle='Amenities and services'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='rounded-md border-[#387cae]/20 text-[#387cae] hover:bg-[#387cae]/5'
                    onClick={() =>
                      appendFacility({ title: '', description: '', icon: '' })
                    }
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Add Facility
                  </Button>
                </div>
                {facilityFields.length === 0 && (
                  <p className='text-sm text-gray-500 mb-4'>
                    No facilities added yet. Click &quot;Add Facility&quot; to
                    begin.
                  </p>
                )}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {facilityFields.map((field, index) => (
                    <div
                      key={field.id}
                      className='group relative p-5 bg-white border border-gray-100 rounded-md transition-all hover:shadow-xl hover:shadow-[#387cae]/5 hover:border-[#387cae]/20'
                    >
                      <div className='space-y-4 pr-8'>
                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <Label className='text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block'>
                              Title
                            </Label>
                            <Input
                              {...register(`facilities[${index}].title`, {
                                required: 'Title is required'
                              })}
                              placeholder='e.g. WiFi'
                              className='h-9 text-xs rounded-md'
                            />
                            {errors?.facilities?.[index]?.title && (
                              <p className='text-[10px] font-semibold text-red-500 mt-1 ml-1'>
                                {errors.facilities[index].title.message}
                              </p>
                            )}
                          </div>
                          <div className='relative'>
                            <Label className='text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block'>
                              Icon / Emoji
                            </Label>
                            <div
                              className='h-9 w-full flex items-center justify-between border border-gray-200 rounded-md px-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors'
                              onClick={() =>
                                setOpenEmojiPickerIndex(
                                  openEmojiPickerIndex === index ? null : index
                                )
                              }
                            >
                              <span className='text-xs'>
                                {watch(`facilities[${index}].icon`) || 'Select'}
                              </span>
                              <Plus size={12} className='text-gray-400' />
                            </div>

                            {openEmojiPickerIndex === index && (
                              <div className='absolute top-full left-0 mt-2 z-[100] shadow-2xl rounded-md overflow-hidden border border-gray-100'>
                                <div className='bg-white p-2 border-b flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase'>
                                  <span>Select Icon</span>
                                  <button
                                    type='button'
                                    onClick={() =>
                                      setOpenEmojiPickerIndex(null)
                                    }
                                    className='hover:text-red-500'
                                  >
                                    Close
                                  </button>
                                </div>
                                <EmojiPicker
                                  onEmojiClick={(emojiData) => {
                                    setValue(
                                      `facilities[${index}].icon`,
                                      emojiData.emoji,
                                      { shouldDirty: true }
                                    )
                                    setOpenEmojiPickerIndex(null)
                                  }}
                                  width={280}
                                  height={350}
                                  previewConfig={{ showPreview: false }}
                                  skinTonesDisabled
                                  searchDisabled={false}
                                />
                              </div>
                            )}
                            <input
                              type='hidden'
                              {...register(`facilities[${index}].icon`, {
                                required: 'Icon is required'
                              })}
                            />
                            {errors?.facilities?.[index]?.icon && (
                              <p className='text-[10px] font-semibold text-red-500 mt-1 ml-1'>
                                {errors.facilities[index].icon.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className='text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block'>
                            Description
                          </Label>
                          <Input
                            {...register(`facilities[${index}].description`)}
                            placeholder='Details...'
                            className='h-9 text-xs rounded-md'
                          />
                        </div>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='absolute top-4 right-4 h-7 w-7 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors rounded-md'
                        onClick={() => removeFacility(index)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div
                ref={teamRef}
                className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
              >
                <div className='flex justify-between items-center mb-6'>
                  <SectionHeader
                    icon={Users}
                    title='Team Members'
                    subtitle='Faculty and staff directory'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='rounded-md border-[#387cae]/20 text-[#387cae] hover:bg-[#387cae]/5'
                    onClick={() =>
                      appendMember({
                        id: null,
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
                {memberFields.length === 0 && (
                  <p className='text-sm text-gray-500 mb-4'>
                    No team members yet. Click &quot;Add Member&quot; to add
                    profiles (optional).
                  </p>
                )}
                {memberFields.length > 0 && (
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
                                setValue(`members[${index}].image_url`, url, {
                                  shouldDirty: true
                                })
                              }
                              onClear={() =>
                                setValue(`members[${index}].image_url`, '', {
                                  shouldDirty: true
                                })
                              }
                              defaultPreview={watch(
                                `members[${index}].image_url`
                              )}
                            />
                            <input
                              type='hidden'
                              {...register(`members[${index}].image_url`)}
                            />
                          </div>
                          <div className='flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            <div>
                              <Label className='text-[10px] font-bold text-gray-400 uppercase mb-1 block'>
                                Full Name
                              </Label>
                              <Input
                                {...register(`members[${index}].name`, {
                                  required: 'Name is required'
                                })}
                                placeholder='Dr. John Doe'
                                className='h-10 rounded-md'
                              />
                              {errors?.members?.[index]?.name && (
                                <p className='text-[10px] font-semibold text-red-500 mt-1 ml-1'>
                                  {errors.members[index].name.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className='text-[10px] font-bold text-slate-500 uppercase mb-1 block'>
                                Role
                              </Label>
                              <select
                                {...register(`members[${index}].role`, {
                                  required: 'Role is required'
                                })}
                                className='flex h-10 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all'
                              >
                                <option value=''>Select Role</option>
                                <option value='Principal'>Principal</option>
                                <option value='Professor'>Professor</option>
                                <option value='Lecturer'>Lecturer</option>
                                <option value='Admin'>Admin</option>
                                <option value='Staff'>Staff</option>
                              </select>
                              {errors?.members?.[index]?.role && (
                                <p className='text-[10px] font-semibold text-red-500 mt-1 ml-1'>
                                  {errors.members[index].role.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <Label className='text-[10px] font-bold text-slate-500 uppercase mb-1 block'>
                                Contact (Phone)
                              </Label>
                              <Input
                                {...register(
                                  `members[${index}].contact_number`
                                )}
                                placeholder='98XXXXXXXX'
                                className='h-10 rounded-md'
                              />
                            </div>
                            <div className='sm:col-span-3'>
                              <Label className='text-[10px] font-bold text-slate-500 uppercase mb-1 block'>
                                Professional description
                              </Label>
                              <Input
                                {...register(`members[${index}].description`, {
                                  required: 'Description is required'
                                })}
                                placeholder='Achievement and specialization...'
                                className='h-10 rounded-md'
                              />
                              {errors?.members?.[index]?.description && (
                                <p className='text-[10px] font-semibold text-red-500 mt-1 ml-1'>
                                  {errors.members[index].description.message}
                                </p>
                              )}
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
                )}
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
                    subtitle='Common queries about the college'
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
                {faqFields.length === 0 && (
                  <p className='text-sm text-gray-500 mb-4'>
                    No FAQs yet. Click &quot;Add FAQ&quot; to add one
                    (optional).
                  </p>
                )}
                {faqFields.length > 0 && (
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
                              {...register(`faqs[${index}].question`, {
                                required: 'Question is required'
                              })}
                              placeholder='e.g. What are the admission requirements?'
                              className='h-11 rounded-md text-gray-800'
                            />
                            {errors?.faqs?.[index]?.question && (
                              <p className='text-[10px] font-semibold text-red-500 mt-1 ml-1'>
                                {errors.faqs[index].question.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label
                              required
                              className='text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block'
                            >
                              Answer
                            </Label>
                            <Textarea
                              {...register(`faqs[${index}].answer`, {
                                required: 'Answer is required'
                              })}
                              placeholder='Provide a detailed answer...'
                              rows={2}
                              className='rounded-md resize-none min-h-[80px]'
                            />
                            {errors?.faqs?.[index]?.answer && (
                              <p className='text-[10px] font-semibold text-red-500 mt-1 ml-1'>
                                {errors.faqs[index].answer.message}
                              </p>
                            )}
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
                )}
              </div>
            </div>

            {/* Right Column - Media Sidebar (4/12) */}
            <div className='lg:col-span-4 space-y-8'>
              {/* Media & Branding */}
              <div
                ref={mediaRef}
                className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'
              >
                <SectionHeader
                  icon={ImageIcon}
                  title='Logo & Cover'
                  subtitle='Identity visuals'
                />
                <div className='space-y-6'>
                  <div className='p-4 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed hover:bg-white hover:border-[#387cae]/30 transition-all group'>
                    <Label
                      required={true}
                      className='text-[11px] font-black tracking-[0.1em] mb-4 block group-hover:text-[#387cae]'
                    >
                      College Logo
                    </Label>
                    <FileUploadWithPreview
                      label=''
                      required={true}
                      onUploadComplete={(url) => {
                        handleSetFiles((prev) => ({
                          ...prev,
                          college_logo: url
                        }))
                        setValue('college_logo', url, {
                          shouldValidate: true,
                          shouldDirty: true
                        })
                        clearErrors('college_logo')
                      }}
                      defaultPreview={uploadedFiles.college_logo}
                      onClear={() => {
                        handleSetFiles((prev) => ({
                          ...prev,
                          college_logo: ''
                        }))
                        setValue('college_logo', '', {
                          shouldValidate: true,
                          shouldDirty: true
                        })
                        setError('college_logo', {
                          type: 'manual',
                          message: 'College logo is required'
                        })
                      }}
                    />
                    {errors.college_logo && (
                      <p className='text-[10px] font-semibold text-red-500 mt-2'>
                        {errors.college_logo.message}
                      </p>
                    )}
                    <input
                      type='hidden'
                      {...register('college_logo', {
                        required: 'College logo is required'
                      })}
                    />
                  </div>

                  <div className='p-4 bg-gray-50/50 rounded-2xl border border-gray-100 border-dashed hover:bg-white hover:border-[#387cae]/30 transition-all group'>
                    <Label
                      required={true}
                      className='text-[11px] font-black mb-3 block group-hover:text-[#387cae]'
                    >
                      Cover Image
                    </Label>
                    <FileUploadWithPreview
                      label=''
                      required={true}
                      widthClass='w-full'
                      heightClass='h-40'
                      onUploadComplete={(url) => {
                        handleSetFiles((prev) => ({
                          ...prev,
                          featured_img: url
                        }))
                        setValue('featured_img', url, {
                          shouldValidate: true,
                          shouldDirty: true
                        })
                        clearErrors('featured_img')
                      }}
                      defaultPreview={uploadedFiles.featured_img}
                      onClear={() => {
                        handleSetFiles((prev) => ({
                          ...prev,
                          featured_img: ''
                        }))
                        setValue('featured_img', '', {
                          shouldValidate: true,
                          shouldDirty: true
                        })
                        setError('featured_img', {
                          type: 'manual',
                          message: 'Featured image is required'
                        })
                      }}
                    />
                    {errors.featured_img && (
                      <p className='text-[10px] font-semibold text-red-500 mt-2 text-center'>
                        {errors.featured_img.message}
                      </p>
                    )}
                    <input
                      type='hidden'
                      {...register('featured_img', {
                        required: 'Featured image is required'
                      })}
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
              <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
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
              <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                <SectionHeader
                  icon={Video}
                  title='Video Gallery'
                  subtitle='Virtual tours & promo'
                />
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
        </div>

        <div className='shrink-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-6 flex justify-end items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]'>
          {Object.keys(errors).length > 0 && (
            <div className='text-red-500 text-sm font-semibold mr-auto pl-2'>
              Please fix form errors before submitting
            </div>
          )}
          <Button
            type='submit'
            disabled={submitting || !isDirty}
            className='bg-[#387cae] hover:bg-[#2d638c] text-white px-8 shadow-md transition-all active:scale-95 rounded-md h-11'
          >
            {submitting ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Check className='w-4 h-4 mr-2' />
                <span>Update College</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditCollegePage
