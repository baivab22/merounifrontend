'use client'

import { authFetch } from '@/app/utils/authFetch'
import { Button } from '@/ui/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/ui/shadcn/dialog'
import SearchSelectCreate from '@/ui/shadcn/search-select-create'
import { Building2, Check, FileText, Loader2, Plus, Trash2, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useToast } from '@/hooks/use-toast'

import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { Select } from '@/ui/shadcn/select'
import { Textarea } from '@/ui/shadcn/textarea'
import TipTapEditor from '@/ui/shadcn/tiptap-editor'

const CreateUpdateProgram = ({
  isOpen,
  onClose,
  slug,
  onSuccess,
  preselectedStreamId
}) => {
  const { toast } = useToast()
  const author_id = useSelector((state) => state.user.data?.id)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittingDraft, setSubmittingDraft] = useState(false)

  // Rich text field values (managed outside react-hook-form)
  const [learningOutcomes, setLearningOutcomes] = useState('')
  const [learningOutcomesError, setLearningOutcomesError] = useState(false)

  const [eligibilityCriteria, setEligibilityCriteria] = useState('')
  const [eligibilityCriteriaError, setEligibilityCriteriaError] =
    useState(false)

  const [curriculum, setCurriculum] = useState('')
  const [curriculumError, setCurriculumError] = useState(false)

  // Local state for syllabus management UI
  const [currentYear, setCurrentYear] = useState(1)
  const [currentSemester, setCurrentSemester] = useState(1)
  const [currentCourse, setCurrentCourse] = useState({ id: '', title: '' })

  // Selected university state (restricted to one)
  const [selectedUniversity, setSelectedUniversity] = useState(null)

  // Single-select states for dropdowns
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [selectedDegrees, setSelectedDegrees] = useState([])
  const [selectedScholarship, setSelectedScholarship] = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedStream, setSelectedStream] = useState(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      code: '',
      author: author_id,
      duration: '',
      credits: '',
      level_id: '',
      language: '',
      eligibility_criteria: '',
      fee: '',
      scholarship_id: '',
      curriculum: '',
      delivery_type: 'Full-time',
      delivery_mode: 'On-campus',
      careers: '',
      exam_id: '',
      stream_id: '',
      status: 'published',
      syllabus: [],
      slug: '',
      meta_description: ''
    }
  })

  const {
    fields: syllabusFields,
    append: appendSyllabus,
    remove: removeSyllabus
  } = useFieldArray({ control, name: 'syllabus' })

  const resetForm = () => {
    reset({
      title: '',
      code: '',
      author: author_id,
      duration: '',
      credits: '',
      level_id: '',
      language: '',
      eligibility_criteria: '',
      fee: '',
      scholarship_id: '',
      curriculum: '',
      delivery_type: 'Full-time',
      delivery_mode: 'On-campus',
      careers: '',
      exam_id: '',
      stream_id: '',
      syllabus: [],
      colleges: [],
      slug: '',
      meta_description: ''
    })
    setLearningOutcomes('')
    setLearningOutcomesError(false)
    setEligibilityCriteria('')
    setEligibilityCriteriaError(false)
    setCurriculum('')
    setCurriculumError(false)
    setSelectedUniversity(null)
    setSelectedLevel(null)
    setSelectedDegrees([])
    setSelectedScholarship(null)
    setSelectedExam(null)
    setSelectedStream(null)
    setValue('status', 'published')

    setCurrentYear(1)
    setCurrentSemester(1)
    setCurrentCourse({ id: '', title: '' })
  }

  // Reset and fetch data when opening
  useEffect(() => {
    if (isOpen) {
      if (slug) {
        handleEdit(slug)
      } else {
        resetForm()
        if (preselectedStreamId) {
          handlePreselectStream(preselectedStreamId)
        }
      }
    }
  }, [isOpen, slug, preselectedStreamId])

  const handlePreselectStream = async (id) => {
    try {
      const res = await authFetch(`${process.env.baseUrl}/stream?id=${id}`)
      const data = await res.json()
      const st = data.item || data.data || data
      if (st) {
        setSelectedStream({ id: st.id, name: st.name })
        setValue('stream_id', st.id)
      }
    } catch (err) {
      console.error('Failed to preselect stream', err)
    }
  }

  const handleEdit = async (slug) => {
    setLoading(true)
    try {
      const response = await authFetch(`${process.env.baseUrl}/program/${slug}`)
      if (!response.ok) throw new Error('Failed to fetch program details')
      const program = await response.json()

      setValue('id', program.id)
      setValue('title', program.title || '')
      setValue('duration', program.duration || '')
      setValue('credits', program.credits || '')
      setValue('language', program.language || '')
      setValue('eligibility_criteria', program.eligibility_criteria || '')
      setValue('fee', program.fee || '')
      setValue('curriculum', program.curriculum || '')
      setValue('delivery_type', program.delivery_type || 'Full-time')
      setValue('delivery_mode', program.delivery_mode || 'On-campus')
      setValue('careers', program.careers || '')
      setValue('code', program.code || '')
      setValue('stream_id', program.stream_id || '')

      // Set rich text
      setLearningOutcomes(program.learning_outcomes || '')
      setEligibilityCriteria(program.eligibility_criteria || '')
      setCurriculum(program.curriculum || '')

      // Syllabus
      const enrichedSyllabus = (program.syllabus || []).map((item) => ({
        year: item.year,
        semester: item.semester,
        course_id: item.course_id,
        _title: item.programCourse?.title || '',
        is_elective: item.is_elective || false
      }))
      setValue('syllabus', enrichedSyllabus)

      // Relationship IDs
      setValue(
        'scholarship_id',
        program.scholarship_id ?? program.programscholarship?.id ?? ''
      )
      setValue('exam_id', program.exam_id ?? program.programexam?.id ?? '')
      setValue('level_id', program.level_id ?? program.programlevel?.id ?? '')
      setValue('stream_id', program.stream_id ?? program.stream?.id ?? '')

      // Level
      if (program.level_id || program.programlevel) {
        const lvl = program.programlevel
        if (lvl) setSelectedLevel({ id: lvl.id, title: lvl.title })
      }
      // Degrees (many-to-many)
      if (program.degrees?.length) {
        setSelectedDegrees(
          program.degrees.map((deg) => ({
            id: deg.id,
            title: deg.short_name
              ? `${deg.short_name} – ${deg.title}`
              : deg.title
          }))
        )
      } else {
        setSelectedDegrees([])
      }
      // Scholarship
      if (program.scholarship_id || program.programscholarship) {
        const sch = program.programscholarship
        if (sch) setSelectedScholarship({ id: sch.id, name: sch.name })
      }
      // Exam
      if (program.exam_id || program.programexam) {
        const ex = program.programexam
        if (ex) setSelectedExam({ id: ex.id, title: ex.title })
      }
      // Stream
      if (program.stream_id || program.stream) {
        const st = program.stream
        if (st) setSelectedStream({ id: st.id, name: st.name })
      }

      // University (now restricted to one)
      if (program.universities?.length) {
        const u = program.universities[0]
        setValue('universities', [u.id])
        setSelectedUniversity({
          id: u.id,
          fullname: u.fullname,
          slug: u.slug
        })
      }
      setValue('status', program.status || 'published')
      setValue('slug', program.slug || '')
      setValue('meta_description', program.meta_description || '')
    } catch (error) {
      console.error('Error in handleEdit:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch program details',
        variant: 'destructive'
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  // University search via API
  const onSearchUniversities = async (query) => {
    try {
      const url = query
        ? `${process.env.baseUrl}/university?q=${encodeURIComponent(query)}&limit=20`
        : `${process.env.baseUrl}/university?limit=20`
      const res = await authFetch(url)
      const data = await res.json()
      return (data.items || []).map((u) => ({
        id: u.id,
        fullname: u.fullname,
        logo: u.logo,
        slug: u.slug
      }))
    } catch {
      return []
    }
  }

  const setUniversity = (university) => {
    if (!university) return
    setSelectedUniversity(university)
    setValue('universities', [university.id])
  }

  const removeUniversity = () => {
    setSelectedUniversity(null)
    setValue('universities', [])
  }

  // Generic single-select search helpers
  const onSearchLevels = async (q) => {
    try {
      const res = await authFetch(
        `${process.env.baseUrl}/level?${q ? `q=${encodeURIComponent(q)}&` : ''}limit=50`
      )
      const data = await res.json()
      return (data.items || []).map((l) => ({ id: l.id, title: l.title }))
    } catch {
      return []
    }
  }

  const onSearchDegrees = async (q) => {
    try {
      const res = await authFetch(
        `${process.env.baseUrl}/degree?${q ? `q=${encodeURIComponent(q)}&` : ''}limit=50&status=all`
      )
      const data = await res.json()
      return (data.items || []).map((d) => ({
        id: d.id,
        title: d.short_name ? `${d.short_name} – ${d.title}` : d.title
      }))
    } catch {
      return []
    }
  }

  const onSearchScholarships = async (q) => {
    try {
      const res = await authFetch(
        `${process.env.baseUrl}/scholarship?${q ? `q=${encodeURIComponent(q)}&` : ''}limit=50`
      )
      const data = await res.json()
      return (data.scholarships || data.items || []).map((s) => ({
        id: s.id,
        name: s.name
      }))
    } catch {
      return []
    }
  }

  const onSearchExams = async (q) => {
    try {
      const res = await authFetch(
        `${process.env.baseUrl}/exam?${q ? `q=${encodeURIComponent(q)}&` : ''}limit=50`
      )
      const data = await res.json()
      return (data.items || []).map((e) => ({ id: e.id, title: e.title }))
    } catch {
      return []
    }
  }

  const onSearchStreams = async (q) => {
    try {
      const res = await authFetch(
        `${process.env.baseUrl}/stream?${q ? `q=${encodeURIComponent(q)}&` : ''}limit=50`
      )
      const data = await res.json()
      return (data.items || []).map((s) => ({ id: s.id, name: s.name }))
    } catch {
      return []
    }
  }

  const onSearchCourses = async (q) => {
    try {
      const res = await authFetch(
        `${process.env.baseUrl}/course?${q ? `q=${encodeURIComponent(q)}&` : ''}limit=50`
      )
      const data = await res.json()
      return (data.items || data.courses || []).map((c) => ({
        id: c.id,
        title: c.title
      }))
    } catch {
      return []
    }
  }

  // Syllabus helpers
  const getCurrentSemesterCourses = () =>
    syllabusFields
      .filter((f) => f.year === currentYear && f.semester === currentSemester)
      .map((f) => ({ id: f.course_id, title: f._title || 'Unknown Course' }))

  const handleAddCourse = () => {
    if (!currentCourse.id) return
    const alreadyAdded = syllabusFields.some(
      (f) =>
        f.course_id === currentCourse.id &&
        f.year === currentYear &&
        f.semester === currentSemester
    )
    if (alreadyAdded) {
      toast({
        title: 'Already Added',
        description: 'This course is already in the current semester.',
        variant: 'destructive'
      })
      return
    }
    appendSyllabus({
      year: currentYear,
      semester: currentSemester,
      course_id: currentCourse.id,
      _title: currentCourse.title,
      is_elective: false
    })
    setCurrentCourse({ id: '', title: '' })
  }

  const handleRemoveCourse = (courseId) => {
    const index = syllabusFields.findIndex(
      (f) =>
        f.course_id === courseId &&
        f.year === currentYear &&
        f.semester === currentSemester
    )
    if (index >= 0) removeSyllabus(index)
  }

  const onSubmit = async (data) => {
    const isDraftSave = data.status === 'draft'
    try {
      if (isDraftSave) {
        setSubmittingDraft(true)
      } else {
        setSubmitting(true)
      }
      const cleanedData = Object.fromEntries(
        Object.entries({
          ...data,
          learning_outcomes: learningOutcomes || undefined,
          eligibility_criteria: eligibilityCriteria || undefined,
          curriculum: curriculum || undefined,
          level_id: data.level_id ? Number(data.level_id) : undefined,
          degree_ids: selectedDegrees.map((d) => d.id),
          stream_id: data.stream_id ? Number(data.stream_id) : undefined,
          scholarship_id: data.scholarship_id
            ? Number(data.scholarship_id)
            : undefined,

          exam_id: data.exam_id ? Number(data.exam_id) : undefined,
          credits: data.credits || undefined,
          universities: selectedUniversity ? [selectedUniversity.id] : [],
          syllabus: data.syllabus.map((item) => ({
            year: item.year,
            semester: item.semester,
            course_id: item.course_id,
            is_elective: item.is_elective || false
          }))
        }).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )

      const endpoint = isDraftSave
        ? `${process.env.baseUrl}/program/save-as-draft`
        : `${process.env.baseUrl}/program`

      isDraftSave
        ? (cleanedData.status = 'draft')
        : (cleanedData.status = 'published')

      const response = await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        )
      }
      toast({
        title: 'Success',
        description: slug
          ? 'Program updated successfully!'
          : 'Program created successfully!'
      })
      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      if (
        error.message.includes('timeout') ||
        error.message === 'Operation timeout'
      ) {
        toast({
          title: 'Error',
          description: 'Operation timed out. Please try again.',
          variant: 'destructive'
        })
      } else if (error.name === 'AbortError') {
        toast({
          title: 'Error',
          description: 'Request was aborted.',
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to save program',
          variant: 'destructive'
        })
      }
    } finally {
      setSubmitting(false)
      setSubmittingDraft(false)
    }
  }

  const onSaveDraft = async () => {
    const title = watch('title')
    if (!title?.trim()) {
      toast({
        title: 'Required Field',
        description:
          'Please enter at least the program title to save as a draft',
        variant: 'destructive'
      })
      return
    }
    setValue('status', 'draft')
    await handleSubmit(onSubmit)()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className='max-w-6xl'>
      <DialogContent className='max-w-6xl max-h-[90vh] flex flex-col p-0 bg-gray-50/50'>
        {/* Sticky Header */}
        <DialogHeader className='px-6 py-4 border-b border-gray-100 shrink-0 bg-white'>
          <DialogTitle className='text-lg font-semibold text-gray-900'>
            {slug ? 'Edit Program' : 'Add New Program'}
          </DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>

        {loading ? (
          <div className='flex flex-1 items-center justify-center py-20'>
            <div className='flex flex-col items-center gap-3'>
              <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-[#387cae]' />
              <p className='text-sm text-gray-500'>
                Loading program details...
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col flex-1 min-h-0 relative'
          >
            {/* Scrollable Body */}
            <div className='flex-1 min-h-0 overflow-y-auto p-8 sidebar-scrollbar'>
              <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 pb-6'>
                {/* Left Column (8/12) */}
                <div className='lg:col-span-8 space-y-8'>
                  {/* Basic Information */}
                  <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                    <SectionHeader
                      icon={Info}
                      title='Basic Information'
                      subtitle='Primary program details'
                    />
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div className='space-y-1.5'>
                        <Label required>Program Title</Label>
                        <Input
                          {...register('title', {
                            required: 'Program title is required'
                          })}
                          placeholder='e.g., Bachelor of Computer Science'
                          className={
                            errors.title
                              ? 'border-red-400 focus-visible:ring-red-400'
                              : ''
                          }
                        />
                        {errors.title && (
                          <p className='text-xs text-red-500'>
                            {errors.title.message}
                          </p>
                        )}
                      </div>

                      <div className='space-y-1.5'>
                        <Label>Program Code</Label>
                        <Input
                          {...register('code')}
                          placeholder='e.g., BCS-101'
                        />
                      </div>

                      <div className='space-y-1.5'>
                        <Label>Duration</Label>
                        <Input
                          {...register('duration')}
                          placeholder='e.g., 4 years'
                        />
                      </div>

                      <div className='space-y-1.5'>
                        <Label>Credits</Label>
                        <Input
                          placeholder='e.g., 120-140'
                          {...register('credits')}
                        />
                      </div>

                      <div className='space-y-1.5'>
                        <Label>Level</Label>
                        <input type='hidden' {...register('level_id')} />
                        <SearchSelectCreate
                          onSearch={onSearchLevels}
                          onSelect={(item) => {
                            setSelectedLevel(item)
                            setValue('level_id', item.id)
                          }}
                          onRemove={() => {
                            setSelectedLevel(null)
                            setValue('level_id', '')
                          }}
                          selectedItems={selectedLevel ? [selectedLevel] : []}
                          placeholder='Search level…'
                          displayKey='title'
                          valueKey='id'
                          isMulti={false}
                          allowCreate={false}
                        />
                      </div>

                      <div className='space-y-1.5'>
                        <Label>Degrees</Label>
                        <SearchSelectCreate
                          onSearch={onSearchDegrees}
                          onSelect={(item) => {
                            if (
                              !selectedDegrees.find((d) => d.id === item.id)
                            ) {
                              setSelectedDegrees([
                                ...selectedDegrees,
                                {
                                  id: item.id,
                                  title: item.short_name
                                    ? `${item.short_name} – ${item.title}`
                                    : item.title
                                }
                              ])
                            }
                          }}
                          onRemove={(item) => {
                            const id = item.id ?? item
                            setSelectedDegrees(
                              selectedDegrees.filter((d) => d.id !== id)
                            )
                          }}
                          selectedItems={selectedDegrees}
                          placeholder='Search degrees…'
                          displayKey='title'
                          valueKey='id'
                          isMulti={true}
                          allowCreate={false}
                        />
                      </div>

                      <div className='space-y-1.5'>
                        <Label>Stream</Label>
                        <SearchSelectCreate
                          onSearch={onSearchStreams}
                          onSelect={(item) => {
                            setSelectedStream(item)
                            setValue('stream_id', item.id)
                          }}
                          onRemove={() => {
                            setSelectedStream(null)
                            setValue('stream_id', '')
                          }}
                          selectedItems={selectedStream ? [selectedStream] : []}
                          placeholder='Search stream…'
                          displayKey='name'
                          valueKey='id'
                          isMulti={false}
                          allowCreate={false}
                        />
                      </div>

                      <div className='space-y-1.5'>
                        <Label>Language of Instruction</Label>
                        <Input
                          {...register('language')}
                          placeholder='e.g., English'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detailed Content */}
                  <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                    <SectionHeader
                      icon={FileText}
                      title='Program Details'
                      subtitle='In-depth information'
                    />
                    <div className='space-y-8'>
                      <div className='space-y-2'>
                        <Label>Description / Learning Outcomes</Label>
                        <TipTapEditor
                          value={learningOutcomes}
                          onChange={(html) => {
                            setLearningOutcomes(html)
                            const hasText =
                              html &&
                              html.replace(/<[^>]*>/g, '').trim().length > 0
                            if (hasText) setLearningOutcomesError(false)
                          }}
                          placeholder='Describe the program objectives...'
                          height='250px'
                        />
                        {learningOutcomesError && (
                          <p className='text-xs text-red-500'>
                            Description is recommended.
                          </p>
                        )}
                      </div>

                      <div className='space-y-2'>
                        <Label>Eligibility Criteria</Label>
                        <TipTapEditor
                          value={eligibilityCriteria}
                          onChange={(html) => setEligibilityCriteria(html)}
                          placeholder='Admission requirements...'
                          height='250px'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label>Curriculum Overview</Label>
                        <TipTapEditor
                          value={curriculum}
                          onChange={(html) => setCurriculum(html)}
                          placeholder='Curriculum structure...'
                          height='250px'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Curriculum Structure */}
                  <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                    <SectionHeader
                      icon={Layers}
                      title='Curriculum Structure'
                      subtitle='Year-wise syllabus'
                    />
                    <div className='space-y-6'>
                      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-md border'>
                        {[1, 2, 3, 4].map((year) => (
                          <div key={year} className='space-y-1.5'>
                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center'>
                              Year {year}
                            </p>
                            {[0, 1, 2].map((sem) => (
                              <button
                                key={sem}
                                type='button'
                                onClick={() => {
                                  setCurrentYear(year)
                                  setCurrentSemester(sem)
                                }}
                                className={`w-full py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                                  currentYear === year &&
                                  currentSemester === sem
                                    ? 'bg-[#387cae] text-white shadow-sm'
                                    : 'bg-white border border-gray-200 hover:border-[#387cae]/50 hover:text-[#387cae] text-gray-600'
                                }`}
                              >
                                {sem === 0 ? 'Yearly' : `Sem ${sem}`}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>

                      <div className='flex items-center gap-2 px-4 py-2.5 bg-[#387cae]/5 border border-[#387cae]/20 rounded-md'>
                        <div className='w-2 h-2 rounded-full bg-[#387cae]' />
                        <p className='text-sm font-medium text-[#387cae]'>
                          {currentSemester === 0
                            ? `Year ${currentYear} — Full Year`
                            : `Year ${currentYear} — Semester ${currentSemester}`}
                        </p>
                      </div>

                      <div className='flex gap-2 items-end'>
                        <div className='flex-1 space-y-1.5'>
                          <Label>Add Course</Label>
                          <SearchSelectCreate
                            onSearch={onSearchCourses}
                            onSelect={(item) =>
                              setCurrentCourse({
                                id: item.id,
                                title: item.title
                              })
                            }
                            onRemove={() =>
                              setCurrentCourse({ id: '', title: '' })
                            }
                            selectedItems={
                              currentCourse.id ? [currentCourse] : []
                            }
                            placeholder='Search and select a course…'
                            displayKey='title'
                            valueKey='id'
                            isMulti={false}
                            allowCreate={false}
                          />
                        </div>
                        <Button
                          type='button'
                          onClick={handleAddCourse}
                          disabled={!currentCourse.id}
                          className='bg-[#387cae] hover:bg-[#387cae]/90 text-white'
                        >
                          <Plus className='w-4 h-4 mr-2' /> Add
                        </Button>
                      </div>

                      {getCurrentSemesterCourses().length > 0 ? (
                        <div className='border rounded-md overflow-hidden'>
                          <table className='w-full text-sm'>
                            <thead>
                              <tr className='bg-gray-50 border-b'>
                                <th className='p-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-10'>
                                  #
                                </th>
                                <th className='p-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'>
                                  Course
                                </th>
                                <th className='p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-28'>
                                  Elective
                                </th>
                                <th className='p-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-16'>
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {getCurrentSemesterCourses().map(
                                (course, index) => {
                                  const fieldIndex = syllabusFields.findIndex(
                                    (f) =>
                                      f.course_id === course.id &&
                                      f.year === currentYear &&
                                      f.semester === currentSemester
                                  )
                                  const title =
                                    fieldIndex >= 0
                                      ? watch(
                                          `syllabus.${fieldIndex}._title`
                                        ) ||
                                        course.title ||
                                        'Unknown Course'
                                      : course.title || 'Unknown Course'

                                  return (
                                    <tr
                                      key={course.id}
                                      className='border-t hover:bg-gray-50/60 transition-colors'
                                    >
                                      <td className='p-3 text-gray-400 font-medium'>
                                        {index + 1}.
                                      </td>
                                      <td className='p-3 font-medium text-gray-900'>
                                        {title}
                                      </td>
                                      <td className='p-3 text-center'>
                                        <input
                                          type='checkbox'
                                          checked={
                                            watch(
                                              `syllabus.${fieldIndex}.is_elective`
                                            ) || false
                                          }
                                          onChange={(e) =>
                                            setValue(
                                              `syllabus.${fieldIndex}.is_elective`,
                                              e.target.checked
                                            )
                                          }
                                          className='h-4 w-4 accent-[#387cae] rounded'
                                        />
                                      </td>
                                      <td className='p-3 text-right'>
                                        <Button
                                          type='button'
                                          variant='ghost'
                                          size='icon'
                                          onClick={() =>
                                            handleRemoveCourse(course.id)
                                          }
                                          className='h-8 w-8 text-red-500 hover:bg-red-50'
                                        >
                                          <Trash2 className='w-3.5 h-3.5' />
                                        </Button>
                                      </td>
                                    </tr>
                                  )
                                }
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className='flex flex-col items-center justify-center p-10 bg-gray-50 border border-dashed border-gray-200 rounded-md text-center'>
                          <p className='text-sm text-gray-400'>
                            No courses added for this semester yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column (4/12) */}
                <div className='lg:col-span-4 space-y-8'>
                  {/* Delivery & Fees */}
                  <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                    <SectionHeader
                      icon={Building2}
                      title='Delivery & Fees'
                      subtitle='Logistics and cost'
                    />
                    <div className='space-y-4'>
                      <div>
                        <Label>Delivery Type</Label>
                        <select
                          {...register('delivery_type')}
                          className='w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-[#387cae] focus:outline-none bg-white mt-1'
                        >
                          <option value='Full-time'>Full-time</option>
                          <option value='Part-time'>Part-time</option>
                          <option value='Online'>Online</option>
                          <option value='Hybrid'>Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <Label>Delivery Mode</Label>
                        <select
                          {...register('delivery_mode')}
                          className='w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-[#387cae] focus:outline-none bg-white mt-1'
                        >
                          <option value='On-campus'>On-campus</option>
                          <option value='Remote'>Remote</option>
                          <option value='Blended'>Hybrid / Blended</option>
                        </select>
                      </div>
                      <div>
                        <Label>Fee Structure</Label>
                        <Input
                          {...register('fee')}
                          placeholder='e.g., 5,000 USD per year'
                          className='mt-1'
                        />
                      </div>
                    </div>
                  </div>

                  {/* University Affiliation */}
                  <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                    <SectionHeader
                      icon={Building2}
                      title='Affiliation'
                      subtitle='University & Career'
                    />
                    <div className='space-y-4'>
                      <div>
                        <Label>University</Label>
                        <SearchSelectCreate
                          onSearch={onSearchUniversities}
                          onSelect={setUniversity}
                          onRemove={removeUniversity}
                          selectedItems={
                            selectedUniversity ? [selectedUniversity] : []
                          }
                          placeholder='Search university…'
                          displayKey='fullname'
                          valueKey='id'
                          isMulti={false}
                          allowCreate={false}
                        />
                      </div>
                      <div>
                        <Label>Scholarship</Label>
                        <SearchSelectCreate
                          onSearch={onSearchScholarships}
                          onSelect={(item) => {
                            setSelectedScholarship(item)
                            setValue('scholarship_id', item.id)
                          }}
                          onRemove={() => {
                            setSelectedScholarship(null)
                            setValue('scholarship_id', '')
                          }}
                          selectedItems={
                            selectedScholarship ? [selectedScholarship] : []
                          }
                          placeholder='Search scholarship…'
                          displayKey='name'
                          valueKey='id'
                          isMulti={false}
                          allowCreate={false}
                        />
                      </div>
                      <div>
                        <Label>Entrance Exam</Label>
                        <SearchSelectCreate
                          onSearch={onSearchExams}
                          onSelect={(item) => {
                            setSelectedExam(item)
                            setValue('exam_id', item.id)
                          }}
                          onRemove={() => {
                            setSelectedExam(null)
                            setValue('exam_id', '')
                          }}
                          selectedItems={selectedExam ? [selectedExam] : []}
                          placeholder='Search exam…'
                          displayKey='title'
                          valueKey='id'
                          isMulti={false}
                          allowCreate={false}
                        />
                      </div>
                      <div>
                        <Label>Career Opportunities</Label>
                        <Textarea
                          {...register('careers')}
                          rows={3}
                          placeholder='Career prospects...'
                          className='mt-1 text-sm'
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEO Settings */}
                  <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
                    <SectionHeader
                      icon={Settings}
                      title='SEO Settings'
                      subtitle='Search optimization'
                    />
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='slug'>URL Slug</Label>
                        <Input
                          id='slug'
                          {...register('slug')}
                          placeholder='url-slug-here'
                          className='text-sm'
                        />
                        <p className='text-[10px] text-gray-400 mt-1 italic'>
                          Leave empty to auto-generate from title
                        </p>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='meta_description'>
                          Meta Description
                        </Label>
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

            {/* Footer Actions */}
            <div className='sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-6 flex justify-end gap-3 z-40 shrink-0 rounded-b-3xl'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={submitting || submittingDraft}
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
                  handleSubmit(onSubmit)()
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
                    {slug ? (
                      <Check className='w-4 h-4 mr-2' />
                    ) : (
                      <Plus className='w-4 h-4 mr-2' />
                    )}
                    <span>{slug ? 'Update Program' : 'Publish Program'}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreateUpdateProgram
