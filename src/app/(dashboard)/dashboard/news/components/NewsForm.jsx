'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogClose
} from '@/ui/shadcn/dialog'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { Textarea } from '@/ui/shadcn/textarea'
import FileUpload from '../../colleges/FileUpload'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'
import axios from 'axios'
import { authFetch } from '@/app/utils/authFetch'
import {
  Image as ImageIcon,
  Info,
  Layers,
  Loader2,
  Settings,
  FileText,
  Check,
  Plus
} from 'lucide-react'

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className='flex items-center gap-3 mb-6'>
    <div className='w-10 h-10 rounded-md bg-[#387cae]/10 flex items-center justify-center text-[#387cae] shadow-sm border border-[#387cae]/20'>
      <Icon size={20} />
    </div>
    <div>
      <h3 className='text-lg font-bold text-gray-900 leading-tight'>{title}</h3>
      {subtitle && (
        <p className='text-xs text-gray-400 mt-0.5 font-medium'>{subtitle}</p>
      )}
    </div>
  </div>
)

export default function NewsForm({
  isOpen,
  onClose,
  editing,
  initialData,
  onSubmit,
  submitting,
  colleges = [],
  categories = [],
  loadingColleges = false,
  loadingCategories = false
}) {
  const [uploadedFiles, setUploadedFiles] = useState({
    featured_image: '',
    pdf_file: ''
  })
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [selectedConsultancy, setSelectedConsultancy] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      featured_image: '',
      pdf_file: '',
      status: 'draft',
      visibility: 'private',
      college_id: '',
      school_id: '',
      consultancy_id: '',
      category_id: '',
      meta_description: '',
      slug: ''
    }
  })

  const onSearchColleges = async (query) => {
    try {
      const url = query
        ? `${process.env.baseUrl}/college?q=${query}&limit=1000`
        : `${process.env.baseUrl}/college?limit=1000`
      const response = await authFetch(url)
      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Colleges Search Error:', error)
      return []
    }
  }

  const onSearchSchools = async (query) => {
    try {
      const url = query
        ? `${process.env.baseUrl}/school?q=${query}&limit=1000`
        : `${process.env.baseUrl}/school?limit=1000`
      const response = await authFetch(url)
      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Schools Search Error:', error)
      return []
    }
  }

  const onSearchConsultancies = async (query) => {
    try {
      const url = query
        ? `${process.env.baseUrl}/consultancy?q=${query}&limit=1000`
        : `${process.env.baseUrl}/consultancy?limit=1000`
      const response = await authFetch(url)
      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Consultancies Search Error:', error)
      return []
    }
  }

  const onSearchCategories = async (query) => {
    try {
      const url = query
        ? `${process.env.baseUrl}/category?q=${query}&type=NEWS`
        : `${process.env.baseUrl}/category?type=NEWS`
      const response = await authFetch(url)
      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error('Categories Search Error:', error)
      return []
    }
  }

  const handleSelectCollege = (college) => {
    setSelectedCollege(college)
    setValue('college_id', college.id)
  }

  const handleRemoveCollege = () => {
    setSelectedCollege(null)
    setValue('college_id', '')
  }

  const handleSelectSchool = (school) => {
    setSelectedSchool(school)
    setValue('school_id', school.id)
  }

  const handleRemoveSchool = () => {
    setSelectedSchool(null)
    setValue('school_id', '')
  }

  const handleSelectConsultancy = (consultancy) => {
    setSelectedConsultancy(consultancy)
    setValue('consultancy_id', consultancy.id)
  }

  const handleRemoveConsultancy = () => {
    setSelectedConsultancy(null)
    setValue('consultancy_id', '')
  }

  const handleSelectCategory = (category) => {
    setSelectedCategory(category)
    setValue('category_id', category.id)
    setFormErrors((prev) => ({ ...prev, category_id: '' }))
  }

  const handleRemoveCategory = () => {
    setSelectedCategory(null)
    setValue('category_id', '')
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset({
        title: '',
        description: '',
        featured_image: '',
        pdf_file: '',
        status: 'draft',
        college_id: '',
        school_id: '',
        consultancy_id: '',
        category_id: '',
        meta_description: ''
      })
      setUploadedFiles({ featured_image: '', pdf_file: '' })
      setSelectedCollege(null)
      setSelectedSchool(null)
      setSelectedConsultancy(null)
      setSelectedCategory(null)
      setFormErrors({})
      setValue('slug', '')
    }
  }, [isOpen, reset])

  // Populate form when editing
  useEffect(() => {
    if (editing && initialData && isOpen) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        featured_image: initialData.featured_image || '',
        pdf_file: initialData.pdf_file || '',
        status: initialData.status || 'draft',
        college_id: initialData.college_id || initialData.newsCollege?.id || '',
        school_id: initialData.school_id || initialData.newsSchool?.id || '',
        consultancy_id:
          initialData.consultancy_id || initialData.newsConsultancy?.id || '',
        category_id:
          initialData.category_id || initialData.newsCategory?.id || '',
        meta_description: initialData.meta_description || '',
        slug: initialData.slug || ''
      })
      setUploadedFiles({
        featured_image: initialData.featured_image || '',
        pdf_file: initialData.pdf_file || ''
      })

      // Initialize Selected College
      if (initialData.newsCollege || initialData.college_id) {
        const coll =
          initialData.newsCollege ||
          colleges.find((c) => c.id === initialData.college_id)
        if (coll) setSelectedCollege(coll)
      }

      // Initialize Selected School
      if (initialData.newsSchool || initialData.school_id) {
        const sch = initialData.newsSchool
        if (sch) setSelectedSchool(sch)
      }

      // Initialize Selected Consultancy
      if (initialData.newsConsultancy || initialData.consultancy_id) {
        const cons = initialData.newsConsultancy
        if (cons) setSelectedConsultancy(cons)
      }

      // Initialize Selected Category
      if (initialData.newsCategory || initialData.category_id) {
        const cat =
          initialData.newsCategory ||
          categories.find((c) => c.id === initialData.category_id)
        if (cat) setSelectedCategory(cat)
      }
    }
  }, [editing, initialData, isOpen, reset, colleges, categories])

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
      throw error
    }
  }

  const handleFormSubmit = (data) => {
    // Manual validation for fields not controlled by react-hook-form register
    const newErrors = {}

    // When status is 'published', require category and description
    if (data.status === 'published') {
      if (!data.category_id) {
        newErrors.category_id = 'Category is required for publishing'
      }
      const descriptionText = (data.description || '')
        .replace(/<[^>]*>/g, '')
        .trim()
      if (!descriptionText) {
        newErrors.description = 'Description is required for publishing'
      }
      if (!data.featured_image) {
        newErrors.featured_image = 'Featured image is required for publishing'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors)
      return
    }

    setFormErrors({})
    onSubmit(data)
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className='max-w-6xl'
      closeOnOutsideClick={false}
    >
      <DialogHeader className='bg-white border-b border-gray-100 p-6'>
        <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
          <Layers className='text-[#387cae]' size={24} />
          {editing ? 'Edit News' : 'Create New News Post'}
        </DialogTitle>
        <DialogClose onClick={onClose} />
      </DialogHeader>
      <DialogContent className='p-0 bg-gray-50/50'>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className='flex flex-col max-h-[calc(100vh-120px)]'
        >
          <div className='flex-1 p-8'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10'>
              {/* Left Column - Main Content (8/12) */}
              <div className='lg:col-span-8 space-y-8'>
                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                  <SectionHeader
                    icon={Info}
                    title='News Content'
                    subtitle='Detailed information about the news'
                  />
                  <div className='space-y-6'>
                    <div className='space-y-2'>
                      <Label required htmlFor='title'>
                        News Title
                      </Label>
                      <Input
                        id='title'
                        placeholder='Enter news title...'
                        {...register('title', {
                          required: 'Title is required',
                          minLength: {
                            value: 3,
                            message: 'Title must be at least 3 characters'
                          }
                        })}
                        className={
                          errors.title
                            ? 'border-destructive focus-visible:ring-destructive'
                            : ''
                        }
                      />
                      {errors.title && (
                        <p className='text-xs text-destructive mt-1'>
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                      <div className='space-y-2'>
                        <Label htmlFor='category_id' required>
                          Category
                        </Label>
                        <SearchSelectCreate
                          onSearch={onSearchCategories}
                          onSelect={handleSelectCategory}
                          onRemove={handleRemoveCategory}
                          selectedItems={selectedCategory}
                          placeholder='Select news category...'
                          displayKey='title'
                          valueKey='id'
                          isMulti={false}
                          allowCreate={false}
                        />
                        {formErrors.category_id && (
                          <p className='text-xs text-destructive mt-1'>
                            {formErrors.category_id}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='pt-2'>
                      <Label required>Description / Body</Label>
                      <div
                        className={
                          formErrors.description
                            ? 'ring-2 ring-red-400/40 rounded-md mt-2'
                            : 'mt-2'
                        }
                      >
                        <TipTapEditor
                          showImageUpload={true}
                          onMediaUpload={onMediaUpload}
                          value={watch('description')}
                          onChange={(data) => {
                            setValue('description', data, {
                              shouldDirty: true,
                              shouldValidate: true
                            })
                            const plain = data.replace(/<[^>]*>/g, '').trim()
                            if (plain)
                              setFormErrors((prev) => ({
                                ...prev,
                                description: ''
                              }))
                          }}
                          placeholder='Write the news content here...'
                        />
                      </div>
                      {formErrors.description && (
                        <p className='text-xs text-destructive mt-2'>
                          {formErrors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Associated Section */}
                <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                  <SectionHeader
                    icon={Layers}
                    title='Associated'
                    subtitle='Optionally link this news to an institution'
                  />
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='college_id'>Associated College</Label>
                      <SearchSelectCreate
                        onSearch={onSearchColleges}
                        onSelect={handleSelectCollege}
                        onRemove={handleRemoveCollege}
                        selectedItems={selectedCollege}
                        placeholder='Select college...'
                        displayKey='name'
                        valueKey='id'
                        isMulti={false}
                        allowCreate={false}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='school_id'>Associated School</Label>
                      <SearchSelectCreate
                        onSearch={onSearchSchools}
                        onSelect={handleSelectSchool}
                        onRemove={handleRemoveSchool}
                        selectedItems={selectedSchool}
                        placeholder='Select school...'
                        displayKey='name'
                        valueKey='id'
                        isMulti={false}
                        allowCreate={false}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='consultancy_id'>
                        Associated Consultancy
                      </Label>
                      <SearchSelectCreate
                        onSearch={onSearchConsultancies}
                        onSelect={handleSelectConsultancy}
                        onRemove={handleRemoveConsultancy}
                        selectedItems={selectedConsultancy}
                        placeholder='Select consultancy...'
                        displayKey='title'
                        valueKey='id'
                        isMulti={false}
                        allowCreate={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Media & Settings (4/12) */}
              <div className='lg:col-span-4 space-y-8'>
                {/* Featured Image Section */}
                <div
                  className={`bg-white p-6 rounded-2xl shadow-sm border ${formErrors.featured_image ? 'border-red-300' : 'border-gray-100'}`}
                >
                  <SectionHeader
                    icon={ImageIcon}
                    title='Featured Media'
                    subtitle='Image & optional PDF attachment'
                  />
                  <div
                    className={`p-4 bg-gray-50 rounded-md border border-dashed ${formErrors.featured_image ? 'border-red-300 bg-red-50/30' : 'border-gray-100'}`}
                  >
                    <Label className='text-xs font-semibold tracking-wider mb-3 block'>
                      Featured Image
                    </Label>
                    <FileUpload
                      label=''
                      onUploadComplete={(url) => {
                        setUploadedFiles((prev) => ({
                          ...prev,
                          featured_image: url
                        }))
                        setValue('featured_image', url)
                        setFormErrors((prev) => ({
                          ...prev,
                          featured_image: ''
                        }))
                      }}
                      defaultPreview={uploadedFiles.featured_image}
                    />
                  </div>
                  <div className='p-4 bg-gray-50 rounded-md border border-gray-100 border-dashed mt-4'>
                    <Label className='text-xs font-semibold tracking-wider mb-3 block'>
                      Attachment (PDF)
                    </Label>
                    <FileUpload
                      label=''
                      accept='application/pdf'
                      onUploadComplete={(url) => {
                        setUploadedFiles((prev) => ({ ...prev, pdf_file: url }))
                        setValue('pdf_file', url || '')
                      }}
                      defaultPreview={uploadedFiles.pdf_file}
                    />
                  </div>
                  <input type='hidden' {...register('pdf_file')} />
                  {formErrors.featured_image && (
                    <p className='text-xs text-destructive mt-1'>
                      {formErrors.featured_image}
                    </p>
                  )}
                </div>

                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                  <input type='hidden' {...register('status')} />
                  <SectionHeader
                    icon={Settings}
                    title='SEO Settings'
                    subtitle='Search engine optimization'
                  />
                  <div className='space-y-5'>
                    <div>
                      <Label htmlFor='slug'>URL Slug</Label>
                      <Input
                        id='slug'
                        {...register('slug')}
                        placeholder='url-slug-here'
                        className='text-sm mt-1'
                      />
                      <p className='text-[10px] text-gray-400 mt-1 italic'>
                        Leave empty to auto-generate from title
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='meta_description'>Meta Description</Label>
                      <Textarea
                        id='meta_description'
                        {...register('meta_description')}
                        placeholder='SEO Meta description...'
                        className='min-h-[100px] text-sm mt-1'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3 z-10'>
            <Button type='button' onClick={onClose} variant='outline'>
              Cancel
            </Button>
            <Button
              type='button'
              variant='secondary'
              disabled={submitting}
              onClick={() => {
                setValue('status', 'draft', { shouldDirty: true })
                handleSubmit(handleFormSubmit)()
              }}
              className='bg-gray-100 hover:bg-gray-200 text-gray-700 border-none px-6'
            >
              <FileText className='w-4 h-4 mr-2' />
              <span>Save as Draft</span>
            </Button>
            <Button
              type='button'
              onClick={() => {
                setValue('status', 'published', { shouldDirty: true })
                handleSubmit(handleFormSubmit)()
              }}
              disabled={submitting}
              className='bg-[#387cae] hover:bg-[#2d638c] text-white px-8 shadow-md transition-all active:scale-95'
            >
              {submitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  {editing ? (
                    <Check className='w-4 h-4 mr-2' />
                  ) : (
                    <Plus className='w-4 h-4 mr-2' />
                  )}
                  <span>{editing ? 'Update News' : 'Publish News'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
