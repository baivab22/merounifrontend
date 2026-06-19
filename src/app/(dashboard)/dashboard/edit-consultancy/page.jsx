'use client'

import FileUpload from '@/app/(dashboard)/dashboard/colleges/FileUpload'
import { authFetch } from '@/app/utils/authFetch'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useToast } from '@/hooks/use-toast'
import { usePageHeading } from '@/contexts/PageHeadingContext'
import {
  fetchCourses,
  fetchCountries,
  fetchDistricts,
  fetchCities
} from '../consultancy/actions'
import {
  Loader2,
  Check,
  Info,
  Image as ImageIcon,
  MapPin,
  BookOpen,
  Link as LinkIcon,
  Phone
} from 'lucide-react'

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className='flex items-center gap-3 mb-6'>
    <div className='w-10 h-10 rounded-md bg-[#387cae]/10 flex items-center justify-center text-[#387cae] shadow-sm border border-[#387cae]/20'>
      <Icon size={20} />
    </div>
    <div>
      <h3 className='text-lg font-bold text-gray-900 leading-tight'>{title}</h3>
      {subtitle && (
        <p className='text-[11px] mt-0.5 font-semibold tracking-wider text-slate-500'>
          {subtitle}
        </p>
      )}
    </div>
  </div>
)

export default function EditConsultancyPage() {
  const { toast } = useToast()
  const { setHeading } = usePageHeading()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [selectedCourses, setSelectedCourses] = useState([])
  const [selectedDestinations, setSelectedDestinations] = useState([])
  const [districtsList, setDistrictsList] = useState([])
  const [citiesList, setCitiesList] = useState([])
  const [countriesList, setCountriesList] = useState([])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors, isDirty }
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
      map_type: '',
      status: 'published',
      id: null
    }
  })

  useEffect(() => {
    setHeading('Edit Consultancy Information')
    return () => setHeading(null)
  }, [setHeading])

  useEffect(() => {
    const loadLocations = async () => {
      const [dList, cList, cityList] = await Promise.all([
        fetchDistricts(),
        fetchCountries(),
        fetchCities()
      ])
      setDistrictsList(dList || [])
      setCountriesList(cList || [])
      setCitiesList(cityList || [])
    }
    loadLocations()
    loadConsultancyData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadConsultancyData = async () => {
    try {
      setLoading(true)
      const response = await authFetch(`${process.env.baseUrl}/consultancy/me`)

      if (!response.ok) {
        throw new Error('Failed to fetch consultancy data')
      }

      const responseData = await response.json()
      const consultancy =
        responseData.consultancy || responseData.item || responseData

      if (!consultancy) {
        toast({
          title: 'Info',
          description: 'No consultancy profile found. Please create one.'
        })
        return
      }

      const parsedDestination = Array.isArray(consultancy.destination)
        ? consultancy.destination
        : typeof consultancy.destination === 'string'
          ? (() => {
              try {
                return JSON.parse(consultancy.destination)
              } catch {
                return []
              }
            })()
          : []

      const destinationForForm = (
        Array.isArray(parsedDestination) ? parsedDestination : []
      )
        .map((d) => {
          const title = typeof d === 'string' ? d : d?.country || d?.title || ''
          return { id: title, title }
        })
        .filter((d) => d.id)

      setSelectedDestinations(destinationForForm)

      let address = { street: '', city: '', district: '', zip: '' }
      try {
        const parsedAddress =
          typeof consultancy.address === 'string'
            ? JSON.parse(consultancy.address)
            : consultancy.address || {}

        if (parsedAddress.state && !parsedAddress.district) {
          parsedAddress.district = parsedAddress.state
        }
        address = {
          street: parsedAddress.street || '',
          city: parsedAddress.city || '',
          district: parsedAddress.district || '',
          zip: parsedAddress.zip || ''
        }
      } catch {
        /* keep default address */
      }

      let parsedContact = ['', '']
      try {
        const contactData = consultancy.contact
          ? typeof consultancy.contact === 'string'
            ? JSON.parse(consultancy.contact)
            : consultancy.contact
          : []
        parsedContact = Array.isArray(contactData) ? contactData : []
        if (parsedContact.length < 2) {
          parsedContact = [
            ...parsedContact,
            ...Array(2 - parsedContact.length).fill('')
          ]
        }
      } catch {
        parsedContact = ['', '']
      }

      const courseData = consultancy.consultancyCourses
        ? consultancy.consultancyCourses.map((c) => ({
            id: c.program?.id || c.id,
            title: c.program?.title || c.title
          }))
        : []

      setSelectedCourses(courseData)

      reset({
        title: consultancy.title || '',
        description: consultancy.description || '',
        website_url: consultancy.website_url || '',
        google_map_url: consultancy.google_map_url || '',
        video_url: consultancy.video_url || '',
        map_type: consultancy.map_type || '',
        pinned: consultancy.pinned || 0,
        featured_image: consultancy.featured_image || '',
        logo: consultancy.logo || '',
        status: consultancy.status || 'published',
        id: consultancy.id,
        destination: destinationForForm.map((d) => d.title),
        address,
        contact: parsedContact,
        courses: courseData.map((c) => c.id)
      })
    } catch (error) {
      console.error('Error loading consultancy data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load consultancy info',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    const newErrors = {}
    if (data.status === 'published' && !data.featured_image) {
      newErrors.featured_image = 'Featured image is required for publishing'
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive'
      })
      return
    }

    setFormErrors({})

    try {
      setSubmitting(true)
      const payload = {
        title: data.title?.trim() || '',
        destination: selectedDestinations.map((d) => d.title).filter(Boolean),
        address: data.address || {},
        featured_image: data.featured_image || '',
        logo: data.logo?.trim() ? data.logo.trim() : null,
        description: data.description?.trim() ? data.description.trim() : null,
        contact: Array.isArray(data.contact)
          ? data.contact.filter((c) => c && c.trim() !== '')
          : [],
        website_url: data.website_url?.trim() ? data.website_url.trim() : null,
        google_map_url: data.google_map_url?.trim()
          ? data.google_map_url.trim()
          : null,
        video_url: data.video_url?.trim() ? data.video_url.trim() : null,
        map_type: data.map_type || null,
        pinned: data.pinned ? 1 : 0,
        courses: Array.isArray(data.courses)
          ? data.courses
          : data.courses
            ? [data.courses]
            : [],
        status: data.status || 'published'
      }

      if (data.id) {
        payload.id = data.id
      }

      const response = await authFetch(`${process.env.baseUrl}/consultancy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save consultancy')
      }

      await response.json()
      reset(getValues())
      toast({
        title: 'Success',
        description: 'Consultancy info updated successfully!'
      })
    } catch (error) {
      console.error('Submit Error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save consultancy',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-10 w-10 animate-spin text-[#387cae]' />
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
            {/* Left column */}
            <div className='lg:col-span-8 space-y-8'>
              <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                <SectionHeader
                  icon={Info}
                  title='Basic Information'
                  subtitle='Primary details of the consultancy'
                />
                <div className='space-y-6'>
                  <div>
                    <Label required>Consultancy Title</Label>
                    <Input
                      placeholder='Enter consultancy name'
                      {...register('title', {
                        required: 'Title is required',
                        minLength: {
                          value: 3,
                          message: 'Title must be at least 3 characters'
                        }
                      })}
                    />
                    {errors.title && (
                      <p className='text-xs text-red-500 mt-1'>
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Description</Label>
                    <TipTapEditor
                      value={watch('description')}
                        onChange={(val) =>
                          setValue('description', val, { shouldDirty: true })
                        }
                      placeholder='Detailed description of services...'
                    />
                  </div>
                </div>
              </div>

              <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                <SectionHeader
                  icon={BookOpen}
                  title="Student's Destination & Courses"
                  subtitle='Geographics and available programs'
                />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                  <div className='space-y-4'>
                    <Label>Student&apos;s Destination (Countries)</Label>
                    <SearchSelectCreate
                      allowCreate
                      onSearch={async (query) => {
                        const all = countriesList
                        if (!query) return all.map((c) => ({ id: c, title: c }))
                        const lower = query.toLowerCase()
                        return all
                          .filter((c) => c.toLowerCase().includes(lower))
                          .map((c) => ({ id: c, title: c }))
                      }}
                      onCreate={(query) => ({ id: query, title: query })}
                      onSelect={(item) => {
                        const current = selectedDestinations || []
                        if (!current.some((d) => d.id === item.id)) {
                          const updated = [...current, item]
                          setSelectedDestinations(updated)
                            setValue(
                              'destination',
                              updated.map((d) => d.title),
                              { shouldDirty: true }
                            )
                        }
                      }}
                      onRemove={(item) => {
                        const updated = selectedDestinations.filter(
                          (d) => d.id !== item.id
                        )
                        setSelectedDestinations(updated)
                            setValue(
                              'destination',
                              updated.map((d) => d.title),
                              { shouldDirty: true }
                            )
                      }}
                      selectedItems={selectedDestinations}
                      placeholder='Add countries...'
                      isMulti
                      displayKey='title'
                    />
                  </div>
                  <div className='space-y-4'>
                    <Label>Courses Offered</Label>
                    <SearchSelectCreate
                      onSearch={fetchCourses}
                      onSelect={(item) => {
                        const current = watch('courses') || []
                        if (!current.includes(item.id)) {
                          setValue('courses', [...current, item.id], {
                            shouldDirty: true
                          })
                          setSelectedCourses((prev) => [...prev, item])
                        }
                      }}
                      onRemove={(item) => {
                        const current = watch('courses') || []
                        setValue(
                          'courses',
                          current.filter((id) => id !== item.id),
                          { shouldDirty: true }
                        )
                        setSelectedCourses((prev) =>
                          prev.filter((c) => c.id !== item.id)
                        )
                      }}
                      selectedItems={selectedCourses}
                      placeholder='Search and add courses...'
                      isMulti
                      displayKey='title'
                    />
                  </div>
                </div>
              </div>

              <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                <SectionHeader
                  icon={MapPin}
                  title='Contact & Location'
                  subtitle='Where to find the consultancy'
                />
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    <div>
                      <Label>Contact Number 1</Label>
                      <div className='relative group'>
                        <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#387cae] transition-colors'>
                          <Phone size={18} />
                        </div>
                        <Input
                          {...register('contact.0')}
                          placeholder='Phone 1'
                          className='pl-10 h-11 rounded-md border-gray-200'
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Contact Number 2</Label>
                      <div className='relative group'>
                        <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#387cae] transition-colors'>
                          <Phone size={18} />
                        </div>
                        <Input
                          {...register('contact.1')}
                          placeholder='Phone 2'
                          className='pl-10 h-11 rounded-md border-gray-200'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    <div>
                      <Label>City</Label>
                      <SearchSelectCreate
                        selectedItems={
                          watch('address.city')
                            ? [
                                {
                                  id: watch('address.city'),
                                  title: watch('address.city')
                                }
                              ]
                            : []
                        }
                        onSearch={async (query) => {
                          const all = citiesList.map((c) => ({
                            id: c,
                            title: c
                          }))
                          if (!query) return all
                          const lower = query.toLowerCase()
                          return all.filter((c) =>
                            c.title.toLowerCase().includes(lower)
                          )
                        }}
                        onSelect={(item) =>
                          setValue('address.city', item.id, { shouldDirty: true })
                        }
                        onRemove={() =>
                          setValue('address.city', '', { shouldDirty: true })
                        }
                        placeholder='Search city...'
                        isMulti={false}
                        displayKey='title'
                        className='h-11'
                      />
                    </div>
                    <div>
                      <Label>District</Label>
                      <SearchSelectCreate
                        selectedItems={
                          watch('address.district')
                            ? [
                                {
                                  id: watch('address.district'),
                                  title: watch('address.district')
                                }
                              ]
                            : []
                        }
                        onSearch={async (query) => {
                          const all = districtsList.map((d) => ({
                            id: d,
                            title: d
                          }))
                          if (!query) return all
                          const lower = query.toLowerCase()
                          return all.filter((d) =>
                            d.title.toLowerCase().includes(lower)
                          )
                        }}
                        onSelect={(item) =>
                          setValue('address.district', item.id, {
                            shouldDirty: true
                          })
                        }
                        onRemove={() =>
                          setValue('address.district', '', { shouldDirty: true })
                        }
                        placeholder='Search district...'
                        isMulti={false}
                        displayKey='title'
                        className='h-11'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                    <div>
                      <Label>Street Address</Label>
                      <Input
                        {...register('address.street')}
                        placeholder='Street, ZIP, etc.'
                        className='h-11 rounded-md border-gray-200'
                      />
                    </div>
                    <div>
                      <Label>Map Type</Label>
                      <Controller
                        name='map_type'
                        control={control}
                        render={({ field }) => (
                          <select
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className='flex h-11 w-full rounded-md border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-[#387cae]/5 focus:border-[#387cae] transition-all'
                          >
                            <option value=''>Select Map Type</option>
                            <option value='embed_map_url'>
                              Embed URL (Iframe)
                            </option>
                            <option value='google_map_url'>
                              Google Map URL (Link)
                            </option>
                          </select>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Map Link/Code</Label>
                    <div className='relative group'>
                      <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#387cae] transition-colors'>
                        <MapPin size={18} />
                      </div>
                      <Input
                        {...register('google_map_url')}
                        placeholder={
                          watch('map_type') === 'embed_map_url'
                            ? 'Paste iframe src...'
                            : 'Paste Google Maps share link...'
                        }
                        className='pl-10 h-11 rounded-md border-gray-200'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className='lg:col-span-4 space-y-8'>
              <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                <SectionHeader
                  icon={ImageIcon}
                  title='Media & Status'
                  subtitle='Logos and visibility'
                />
                <div className='space-y-6'>
                  <div>
                    <Label>Logo</Label>
                    <div className='mt-2'>
                      <FileUpload
                        onUploadComplete={(url) =>
                          setValue('logo', url, { shouldDirty: true })
                        }
                        defaultPreview={watch('logo')}
                      />
                    </div>
                  </div>
                  <div>
                    <Label required>Featured Image</Label>
                    <div className='mt-2'>
                      <FileUpload
                        onUploadComplete={(url) =>
                          setValue('featured_image', url, { shouldDirty: true })
                        }
                        defaultPreview={watch('featured_image')}
                      />
                    </div>
                    <input type='hidden' {...register('featured_image')} />
                    {(errors.featured_image || formErrors.featured_image) && (
                      <p className='text-xs text-red-500 mt-1'>
                        {errors.featured_image?.message ||
                          formErrors.featured_image}
                      </p>
                    )}
                  </div>
                  <input type='hidden' {...register('pinned')} />
                </div>
              </div>

              <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                <SectionHeader
                  icon={LinkIcon}
                  title='Web Links'
                  subtitle='External URLs and videos'
                />
                <div className='space-y-4'>
                  <div>
                    <Label>Website URL</Label>
                    <Input
                      {...register('website_url')}
                      type='url'
                      placeholder='https://...'
                      className='mt-1'
                    />
                  </div>
                  <div>
                    <Label>YouTube Video URL</Label>
                    <Input
                      {...register('video_url')}
                      type='url'
                      placeholder='https://www.youtube.com/watch?v=...'
                      className='mt-1'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='shrink-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 p-6 flex justify-end gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]'>
          <input type='hidden' {...register('status')} />
          <input type='hidden' {...register('id')} />
          <Button
            type='submit'
            disabled={submitting || !isDirty}
            className='bg-[#387cae] hover:bg-[#2d638c] text-white px-8 shadow-md transition-all active:scale-95 disabled:opacity-50'
          >
            {submitting ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Check className='w-4 h-4 mr-2' />
                <span>Update Consultancy</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
