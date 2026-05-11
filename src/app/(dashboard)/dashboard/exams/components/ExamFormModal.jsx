'use client'

import { useToast } from '@/hooks/use-toast'
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
import { Select } from '@/ui/shadcn/select'
import { Textarea } from '@/ui/shadcn/textarea'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'
import {
  Calendar,
  ClipboardList,
  Coins,
  FileText,
  Info,
  Layers,
  Loader2,
  Settings,
  Check,
  Plus
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { fetchCategory, fetchLevel, fetchUniversities } from '../actions'
import MultiFileUpload from './MultiFileUpload'

/** Dot-paths for all leaf validation errors (react-hook-form shape). */
function collectErrorPaths(err, prefix = '') {
  if (!err || typeof err !== 'object') return []
  if (typeof err.message === 'string' && err.message) {
    return prefix ? [prefix] : []
  }
  const paths = []
  for (const key of Object.keys(err)) {
    const p = prefix ? `${prefix}.${key}` : key
    paths.push(...collectErrorPaths(err[key], p))
  }
  return paths
}

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

const ExamFormModal = ({
  isOpen,
  onClose,
  editingId,
  initialData,
  onSave,
  submitting,
  author_id
}) => {
  const { toast } = useToast()
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const basicInfoRef = useRef(null)
  const examStructureRef = useRef(null)
  const pastQuestionRef = useRef(null)
  const affiliationRef = useRef(null)
  const datesRef = useRef(null)
  const feesRef = useRef(null)
  const seoRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors, submitCount }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      level_id: '',
      affiliation: '',
      syllabus: '',
      pastQuestion: '',
      exam_type: 'Written',
      full_marks: '',
      pass_marks: '',
      questions_count: '',
      question_type: 'MCQ',
      duration: '',
      normal_fee: '',
      late_fee: '',
      exam_date: '',
      opening_date: '',
      closing_date: '',
      category_id: '',
      meta_description: '',
      status: 'published',
      conducted_by: '',
      slug: ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (editingId && initialData) {
        // Formatted dates for <input type="date" />
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

        const universities =
          initialData.affiliation ||
          initialData.universities ||
          (initialData.university ? [initialData.university] : [])

        reset({
          title: initialData.title || '',
          description: initialData.description || '',
          level_id: initialData.level_id || '',
          affiliation: Array.isArray(universities)
            ? universities
                .map((u) => (typeof u === 'object' ? u.id : u))
                .join(',')
            : universities
              ? universities.id
              : '',
          syllabus: Array.isArray(initialData.syllabus)
            ? initialData.syllabus.join(',')
            : initialData.syllabus || '',
          pastQuestion: Array.isArray(initialData.pastQuestion)
            ? initialData.pastQuestion.join(',')
            : initialData.pastQuestion || '',
          exam_type: initialData.exam_type || 'Written',
          full_marks: initialData.full_marks || '',
          pass_marks: initialData.pass_marks || '',
          questions_count: initialData.questions_count || '',
          question_type: initialData.question_type || 'MCQ',
          duration: initialData.duration || '',
          normal_fee: initialData.normal_fee || '',
          late_fee: initialData.late_fee || '',
          exam_date: formatInputDate(initialData.exam_date),
          opening_date: formatInputDate(initialData.opening_date),
          closing_date: formatInputDate(initialData.closing_date),
          category_id:
            initialData.category_id || initialData.category?.id || '',
          meta_description: initialData.meta_description || '',
          status: initialData.status || 'published',
          conducted_by: initialData.conducted_by || '',
          slug: initialData.slug || initialData.slug || ''
        })

        setSelectedLevel(initialData.level || null)
        setSelectedUniversity(universities.length > 0 ? universities : null)
        setSelectedCategory(initialData.category || null)
      } else {
        reset({
          title: '',
          description: '',
          level_id: '',
          affiliation: '',
          syllabus: '',
          pastQuestion: '',
          exam_type: 'Written',
          full_marks: '',
          pass_marks: '',
          questions_count: '',
          question_type: 'MCQ',
          duration: '',
          normal_fee: '',
          late_fee: '',
          exam_date: '',
          opening_date: '',
          closing_date: '',
          category_id: '',
          meta_description: '',
          status: 'published',
          conducted_by: '',
          slug: ''
        })
        setSelectedLevel(null)
        setSelectedUniversity(null)
        setSelectedCategory(null)
      }
    }
  }, [isOpen, editingId, initialData, reset])

  const errorSectionOrder = [
    {
      keys: ['title', 'description', 'conducted_by', 'level_id', 'category_id'],
      ref: basicInfoRef
    },
    {
      keys: [
        'full_marks',
        'pass_marks',
        'duration',
        'questions_count',
        'question_type',
        'exam_type'
      ],
      ref: examStructureRef
    },
    { keys: ['pastQuestion'], ref: pastQuestionRef },
    { keys: ['affiliation'], ref: affiliationRef },
    { keys: ['opening_date', 'closing_date', 'exam_date'], ref: datesRef },
    { keys: ['normal_fee', 'late_fee'], ref: feesRef },
    { keys: ['meta_description', 'status'], ref: seoRef }
  ]

  useEffect(() => {
    if (submitCount === 0) return
    const paths = collectErrorPaths(errors)
    if (paths.length === 0) return

    const section = errorSectionOrder.find((item) =>
      paths.some((path) =>
        item.keys.some((key) => path === key || path.startsWith(`${key}.`))
      )
    )

    if (section?.ref.current) {
      section.ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
      setTimeout(() => {
        const root = section.ref.current
        if (!root) return
        const firstInvalid = root.querySelector(
          '[aria-invalid="true"], input.border-red-500, select.border-red-500, textarea.border-red-500, .border-red-500'
        )
        if (firstInvalid && typeof firstInvalid.focus === 'function') {
          firstInvalid.focus({ preventScroll: true })
        }
      }, 400)
    }
  }, [submitCount, errors])

  const onSubmitForm = async (data) => {
    // Date validation
    if (
      data.opening_date &&
      data.closing_date &&
      new Date(data.opening_date) >= new Date(data.closing_date)
    ) {
      toast({
        title: 'Invalid Dates',
        description: 'Opening date must be before closing date',
        variant: 'destructive'
      })
      return
    }
    if (
      data.closing_date &&
      data.exam_date &&
      new Date(data.closing_date) >= new Date(data.exam_date)
    ) {
      toast({
        title: 'Invalid Dates',
        description: 'Closing date must be before exam date',
        variant: 'destructive'
      })
      return
    }

    const formattedData = {
      ...data,
      author: author_id,
      affiliation: data.affiliation
        ? data.affiliation
            .split(',')
            .map((id) => parseInt(id))
            .filter((id) => !isNaN(id))
        : [],
      pastQuestion: data.pastQuestion
        ? data.pastQuestion.split(',').filter(Boolean)
        : [],
      full_marks: data.full_marks ? Number(data.full_marks) : undefined,
      pass_marks: data.pass_marks ? Number(data.pass_marks) : undefined,
      questions_count: data.questions_count
        ? Number(data.questions_count)
        : undefined,
      normal_fee: data.normal_fee ? Number(data.normal_fee) : undefined,
      late_fee: data.late_fee ? Number(data.late_fee) : undefined,
      category_id: data.category_id || undefined,
      ...(editingId && { id: editingId })
    }

    // Filter and clean
    Object.keys(formattedData).forEach((key) => {
      if (formattedData[key] === null || formattedData[key] === '') {
        formattedData[key] = undefined
      }
    })

    onSave(formattedData)
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className='max-w-6xl '>
      <DialogHeader className='bg-white border-b border-gray-100 p-6'>
        <DialogTitle className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
          <Layers className='text-[#387cae]' size={24} />
          {editingId ? 'Edit Exam' : 'Add New Exam'}
        </DialogTitle>
        <DialogClose onClick={onClose} />
      </DialogHeader>

      <DialogContent className='p-0 bg-gray-50/50 overflow-hidden flex flex-col max-h-[95vh] rounded-2xl border-none shadow-2xl'>
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className='flex flex-col flex-1 overflow-hidden'
        >
          {/* Scrollable Content Area with premium sidebar-scrollbar styling */}
          <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-8 sidebar-scrollbar'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6'>
              {/* Left Column - Main Details (8/12) */}
              <div className='lg:col-span-8 space-y-8'>
                {/* Basic Info Section */}
                <div
                  ref={basicInfoRef}
                  className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={Info}
                    title='Basic Information'
                    subtitle='Primary details of the entrance exam'
                  />
                  <div className='space-y-6'>
                    <div>
                      <Label required={true} htmlFor='title'>
                        Exam Title
                      </Label>
                      <Input
                        id='title'
                        placeholder='e.g. CMAT, KUUMAT, CEE...'
                        {...register('title', {
                          required: 'Exam title is required'
                        })}
                        className={errors.title ? 'border-red-500' : ''}
                      />
                      {errors.title && (
                        <p className='text-xs text-red-500 mt-1'>
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor='description'>Description</Label>
                      <TipTapEditor
                        value={watch('description')}
                        onChange={(val) =>
                          setValue('description', val, { shouldValidate: true })
                        }
                        placeholder='Write a detailed description about the exam...'
                      />
                    </div>

                    <div>
                      <Label htmlFor='conducted_by'>Conducted By</Label>
                      <Input
                        id='conducted_by'
                        placeholder='e.g. Tribhuvan University, IOM...'
                        {...register('conducted_by')}
                      />
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                      <div>
                        <Label required={true}>Education Level</Label>
                        <SearchSelectCreate
                          onSearch={fetchLevel}
                          onSelect={(item) => {
                            setSelectedLevel(item)
                            setValue('level_id', item.id, {
                              shouldValidate: true
                            })
                          }}
                          onRemove={() => {
                            setSelectedLevel(null)
                            setValue('level_id', '', { shouldValidate: true })
                          }}
                          selectedItems={selectedLevel}
                          placeholder='Select level...'
                          isMulti={false}
                          displayKey='title'
                        />
                        <input
                          type='hidden'
                          {...register('level_id', {
                            required: 'Level is required'
                          })}
                        />
                        {errors.level_id && (
                          <p className='text-xs text-red-500 mt-1'>
                            {errors.level_id.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label>Exam Category</Label>
                        <SearchSelectCreate
                          onSearch={fetchCategory}
                          onSelect={(item) => {
                            setSelectedCategory(item)
                            setValue('category_id', item.id)
                          }}
                          onRemove={() => {
                            setSelectedCategory(null)
                            setValue('category_id', '')
                          }}
                          selectedItems={selectedCategory}
                          placeholder='Select category...'
                          isMulti={false}
                          displayKey='title'
                        />
                        <input type='hidden' {...register('category_id')} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exam Structure Section */}
                <div
                  ref={examStructureRef}
                  className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={ClipboardList}
                    title='Exam Structure'
                    subtitle='Format, marks and duration'
                  />
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
                    <div>
                      <Label htmlFor='full_marks'>Full Marks</Label>
                      <Input
                        type='number'
                        id='full_marks'
                        {...register('full_marks')}
                        placeholder='e.g. 100'
                      />
                    </div>
                    <div>
                      <Label htmlFor='pass_marks'>Pass Marks</Label>
                      <Input
                        type='number'
                        id='pass_marks'
                        {...register('pass_marks')}
                        placeholder='e.g. 40'
                      />
                    </div>
                    <div>
                      <Label htmlFor='duration'>Duration</Label>
                      <Input
                        id='duration'
                        {...register('duration')}
                        placeholder='e.g. 2 Hours'
                      />
                    </div>
                    <div>
                      <Label htmlFor='questions_count'>Questions Count</Label>
                      <Input
                        type='number'
                        id='questions_count'
                        {...register('questions_count')}
                        placeholder='e.g. 100'
                      />
                    </div>
                    <div>
                      <Label htmlFor='question_type'>Question Type</Label>
                      <Select id='question_type' {...register('question_type')}>
                        <option value='MCQ'>MCQ</option>
                        <option value='Written'>Written</option>
                        <option value='Practical'>Practical</option>
                        <option value='Mixed'>Mixed</option>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor='exam_type'>Exam Mode</Label>
                      <Select id='exam_type' {...register('exam_type')}>
                        <option value='Written'>Written</option>
                        <option value='Online'>Online</option>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Past Question Documents */}
                <div
                  ref={pastQuestionRef}
                  className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={FileText}
                    title='Past Question Documents'
                    subtitle='Upload past exam papers'
                  />
                  <div>
                    <MultiFileUpload
                      label='Upload Documents'
                      initialFiles={watch('pastQuestion')}
                      onUploadComplete={(urls) => {
                        setValue('pastQuestion', urls.join(','))
                      }}
                      authorId={author_id}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column - Dates, Fees & Meta (4/12) */}
              <div className='lg:col-span-4 space-y-8'>
                {/* Affiliation Section */}
                <div
                  ref={affiliationRef}
                  className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={Settings}
                    title='Affiliation'
                    subtitle='University or Board'
                  />
                  <div className='space-y-4'>
                    <Label>University / Board (Multiple)</Label>
                    <SearchSelectCreate
                      onSearch={fetchUniversities}
                      onSelect={(item) => {
                        const current = Array.isArray(selectedUniversity)
                          ? selectedUniversity
                          : selectedUniversity
                            ? [selectedUniversity]
                            : []
                        if (current.some((i) => i.id === item.id)) return
                        const updated = [...current, item]
                        setSelectedUniversity(updated)
                        setValue(
                          'affiliation',
                          updated.map((i) => i.id).join(',')
                        )
                      }}
                      onRemove={(item) => {
                        const current = Array.isArray(selectedUniversity)
                          ? selectedUniversity
                          : []
                        const updated = current.filter((i) => i.id !== item.id)
                        setSelectedUniversity(
                          updated.length > 0 ? updated : null
                        )
                        setValue(
                          'affiliation',
                          updated.map((i) => i.id).join(',')
                        )
                      }}
                      selectedItems={selectedUniversity}
                      placeholder='Select affiliations...'
                      isMulti={true}
                      displayKey='fullname'
                    />
                    <input type='hidden' {...register('affiliation')} />
                  </div>
                </div>

                {/* Dates Section */}
                <div
                  ref={datesRef}
                  className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={Calendar}
                    title='Important Dates'
                    subtitle='Application and exam schedule'
                  />
                  <div className='space-y-4'>
                    <div>
                      <Label
                        htmlFor='opening_date'
                        className='text-xs font-semibold uppercase text-gray-400'
                      >
                        Opening Date
                      </Label>
                      <Input
                        type='date'
                        id='opening_date'
                        {...register('opening_date')}
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor='closing_date'
                        className='text-xs font-semibold uppercase text-gray-400'
                      >
                        Closing Date
                      </Label>
                      <Input
                        type='date'
                        id='closing_date'
                        {...register('closing_date')}
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor='exam_date'
                        className='text-xs font-semibold uppercase text-gray-400'
                      >
                        Exam Date
                      </Label>
                      <Input
                        type='date'
                        id='exam_date'
                        {...register('exam_date')}
                        className='mt-1 border-[#387cae]/30'
                      />
                    </div>
                  </div>
                </div>

                {/* Fees Section */}
                <div
                  ref={feesRef}
                  className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={Coins}
                    title='Application Fees'
                    subtitle='Normal and late fee details'
                  />
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='normal_fee'>Normal Fee</Label>
                      <div className='relative'>
                        <span className='absolute left-3 top-2.5 text-gray-400 text-sm'>
                          Rs.
                        </span>
                        <Input
                          type='number'
                          id='normal_fee'
                          {...register('normal_fee')}
                          className='pl-10'
                          placeholder='0.00'
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor='late_fee'>Late Fee</Label>
                      <div className='relative'>
                        <span className='absolute left-3 top-2.5 text-gray-400 text-sm'>
                          Rs.
                        </span>
                        <Input
                          type='number'
                          id='late_fee'
                          {...register('late_fee')}
                          className='pl-10 text-red-500'
                          placeholder='0.00'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Settings Section */}
                <div
                  ref={seoRef}
                  className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'
                >
                  <SectionHeader
                    icon={Settings}
                    title='SEO Settings'
                    subtitle='Optimize for search engines'
                  />
                  <div className='space-y-6'>
                    <div className='mb-4'>
                      <Label htmlFor='slug'>URL Slug</Label>
                      <Input id='slug' {...register('slug')} className='mt-1' />
                      <p className='text-[10px] text-gray-400 mt-1 italic'>
                        Leave empty to auto-generate from title
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

          <div className='shrink-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3 z-20'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='px-8 border-gray-200 text-gray-600 hover:bg-gray-50'
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='secondary'
              disabled={submitting}
              onClick={() => {
                // Since we unmounted the select, setValue manages it directly
                setValue('status', 'draft', { shouldDirty: true })
                handleSubmit(onSubmitForm)()
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
                handleSubmit(onSubmitForm)()
              }}
              disabled={submitting}
              className='bg-[#387cae] hover:bg-[#2d638c] text-white px-8 shadow-md transition-all active:scale-95'
            >
              {submitting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  {editingId ? (
                    <Check className='w-4 h-4 mr-2' />
                  ) : (
                    <Plus className='w-4 h-4 mr-2' />
                  )}
                  <span>{editingId ? 'Update Exam' : 'Create Exam'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ExamFormModal
