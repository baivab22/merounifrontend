'use client'

import { THEME_BLUE } from '@/constants/constants'
import { authFetch } from '@/app/utils/authFetch'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { cn } from '@/app/lib/utils'
import { useToast } from '@/hooks/use-toast'
import FileUpload from '@/app/(dashboard)/dashboard/colleges/FileUpload'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react'

const BLUE_DEEP = '#2d658e'
const PAY_BTN = '#0a6fa7'

const LEVELS = [
  {
    id: 'PLUS2',
    name: '+2 / Grade 12',
    tagline: 'Board exam prep + early career-field access',
    fee: 'Rs. 1,000',
    note: 'INCLUDES FREE EXAM PREP',
    blurb:
      'Free Grade 12 board exam prep for every member, plus early access to career-field trainings.'
  },
  {
    id: 'BACHELORS',
    name: "Bachelor's — Running",
    tagline: 'Course-aligned professional trainings',
    fee: 'Rs. 3,000',
    note: 'RUNNING BACHELOR STUDENTS',
    blurb:
      'Trainings matched to your actual degree, added straight to your resume.'
  },
  {
    id: 'GRADUATE',
    name: 'Graduate',
    tagline: 'Placement-focused upskilling',
    fee: 'Custom fee',
    note: 'PRICED BY FIELD',
    blurb:
      'Placement-weighted upskilling with depth per field, priced to your career.'
  }
]

const FIELDS = [
  {
    id: 'it',
    name: 'Information Technology',
    partner: 'Delivered with partner colleges',
    trainings: [
      { t: 'Web Development Fundamentals', d: 'HTML, CSS, JS basics' },
      { t: 'Python Programming', d: 'Core programming for beginners' },
      {
        t: 'Cybersecurity Essentials',
        d: 'Foundations of safe systems & practices'
      },
      {
        t: 'Digital Marketing',
        d: 'SEO, social media & content basics'
      }
    ]
  },
  {
    id: 'hospitality',
    name: 'Hospitality Management',
    partner: 'Delivered with partner hospitality colleges',
    trainings: [
      {
        t: 'Front Office & Guest Services',
        d: 'Reception & guest handling skills'
      },
      { t: 'Food & Beverage Operations', d: 'F&B service fundamentals' },
      {
        t: 'Hotel Management Software Basics',
        d: 'PMS tools used in real hotels'
      },
      {
        t: 'Communication & Guest Handling',
        d: 'Soft skills for hospitality careers'
      }
    ]
  },
  {
    id: 'business',
    name: 'Business & Management',
    partner: 'Delivered with partner business colleges',
    trainings: [
      {
        t: 'Business Fundamentals',
        d: 'Core concepts for any business path'
      },
      {
        t: 'Digital Marketing for Business',
        d: 'Practical marketing for small business'
      },
      { t: 'Basic Financial Literacy', d: 'Budgeting, accounting basics' },
      {
        t: 'Communication & Presentation Skills',
        d: 'Workplace-ready soft skills'
      }
    ]
  }
]

const PAYMENT_METHODS = [
  { id: 'esewa', label: 'eSewa', hint: 'Mobile wallet' },
  { id: 'khalti', label: 'Khalti', hint: 'Mobile wallet' },
  { id: 'bank', label: 'Bank Transfer', hint: 'Bank slip upload' }
]

const STEPS = [
  { id: 1, label: 'Level', hint: 'Choose your level' },
  { id: 2, label: 'Career field', hint: 'Pick your trainings' },
  { id: 3, label: 'Payment', hint: 'Pay & join' }
]
const MAX_STEP = STEPS.length

const fieldCardClass = (active) =>
  cn(
    'group relative flex w-full flex-col rounded-2xl border-2 p-5 text-left transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#387cae] focus-visible:ring-offset-2',
    active
      ? 'border-[#387cae] bg-[#387cae]/[0.06] shadow-lg shadow-[#387cae]/10'
      : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#387cae]/45 hover:shadow-md'
  )

const Dot = ({ active }) => (
  <span
    className={cn(
      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
      active ? 'border-[#387cae] bg-[#387cae]' : 'border-slate-300 bg-white'
    )}
  >
    {active ? (
      <Check size={12} strokeWidth={3} className='text-white' />
    ) : (
      <span className='h-1.5 w-1.5 rounded-full bg-slate-300' />
    )}
  </span>
)

const Eyebrow = ({ children, tone = 'green' }) => (
  <p
    className={cn(
      'text-xs font-semibold uppercase tracking-[0.18em]',
      tone === 'blue' ? 'text-[#387cae]' : 'text-[#1F6F5C]'
    )}
  >
    {children}
  </p>
)

const FieldError = ({ children }) => (
  <p className='flex items-center gap-1.5 text-[13px] font-medium text-red-600'>
    {children}
  </p>
)

const Note = ({ children, icon: Icon = Sparkles, tone = 'blue' }) => (
  <div
    className={cn(
      'flex items-start gap-2.5 rounded-2xl border px-4 py-3.5 text-[13px] leading-relaxed',
      tone === 'blue'
        ? 'border-[#387cae]/20 bg-[#387cae]/[0.05] text-slate-600'
        : 'border-[#1F6F5C]/20 bg-[#1F6F5C]/[0.05] text-slate-600'
    )}
  >
    <Icon
      size={15}
      className={cn('mt-0.5 shrink-0', tone === 'blue' ? 'text-[#387cae]' : 'text-[#1F6F5C]')}
    />
    <span>{children}</span>
  </div>
)

const MembershipForm = () => {
  const { toast } = useToast()
  const user = useSelector((state) => state.user?.data)
  const searchParams = useSearchParams()
  const preselectedPlan = searchParams.get('plan')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null
    const hasUser = user !== null && user !== undefined
    setIsLoggedIn(!!(token || hasUser))
  }, [user])

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    membership_type: '',
    student_name: '',
    student_email: '',
    student_phone_no: '',
    institution: '',
    career_field: '',
    selected_trainings: [],
    payment_method: '',
    membership_fee: ''
  })

  useEffect(() => {
    const valid = LEVELS.some((l) => l.id === preselectedPlan)
    if (valid) {
      const level = LEVELS.find((l) => l.id === preselectedPlan)
      setFormData((prev) => ({
        ...prev,
        membership_type: level.id,
        membership_fee: level.fee
      }))
    }
  }, [preselectedPlan])

  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData((prev) => ({
        ...prev,
        student_name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
        student_email: user?.email || '',
        student_phone_no: user?.phoneNo || ''
      }))
    }
  }, [isLoggedIn, user])

  const [paymentProof, setPaymentProof] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [studentId, setStudentId] = useState(null)

  const selectedLevel = useMemo(
    () => LEVELS.find((l) => l.id === formData.membership_type),
    [formData.membership_type]
  )
  const selectedField = useMemo(
    () => FIELDS.find((f) => f.id === formData.career_field),
    [formData.career_field]
  )

  const set = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  const clearError = (key) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: '' } : prev))

  const validateStep = (n) => {
    const newErrors = {}
    if (n === 1) {
      if (!formData.membership_type)
        newErrors.membership_type = 'Please select your level'
      if (!formData.student_name && !isLoggedIn)
        newErrors.student_name = 'Name is required'
      if (!formData.student_phone_no && !isLoggedIn)
        newErrors.student_phone_no = 'Phone number is required'
    }
    if (n === 2) {
      if (!formData.career_field)
        newErrors.career_field = 'Please pick a career field'
      else if (
        formData.career_field !== 'unsure' &&
        formData.selected_trainings.length === 0
      )
        newErrors.career_field = 'Select at least one training'
    }
    if (n === 3) {
      if (!formData.payment_method)
        newErrors.payment_method = 'Please select a payment method'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, MAX_STEP))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 1))

  const pickLevel = (level) => {
    setFormData((prev) => ({
      ...prev,
      membership_type: level.id,
      membership_fee: level.fee
    }))
    clearError('membership_type')
  }

  const pickField = (field) => {
    setFormData((prev) => ({
      ...prev,
      career_field: field,
      selected_trainings: []
    }))
    clearError('career_field')
  }

  const toggleTraining = (title) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.selected_trainings)
        ? prev.selected_trainings
        : []
      return {
        ...prev,
        selected_trainings: current.includes(title)
          ? current.filter((t) => t !== title)
          : [...current, title]
      }
    })
    clearError('career_field')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    set(name, value)
    clearError(name)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(step)) return

    setIsSubmitting(true)
    try {
      const isStudentRole = !!(
        (
          typeof user?.role === 'string'
            ? (() => {
                try {
                  return JSON.parse(user.role)
                } catch {
                  return {}
                }
              })()
            : user?.role
        )?.student
      )

      const basePayload = {
        membership_type: formData.membership_type,
        career_field: formData.career_field || null,
        selected_trainings: formData.selected_trainings,
        institution: formData.institution || null,
        payment_method: formData.payment_method || null,
        membership_fee: formData.membership_fee || null,
        payment_proof_url: paymentProof || null
      }

      let endpoint
      let payload

      if (isLoggedIn && isStudentRole) {
        endpoint = `${process.env.baseUrl}/student-member/apply`
        payload = basePayload
      } else {
        endpoint = `${process.env.baseUrl}/student-member/guest-apply`
        payload = {
          student_name: formData.student_name,
          student_email: formData.student_email,
          student_phone_no: formData.student_phone_no,
          ...basePayload
        }
      }

      const response = await authFetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: 'Error',
          description:
            data?.error || data?.message || 'Failed to submit. Please try again.',
          variant: 'destructive'
        })
        setIsSubmitting(false)
        return
      }

      setStudentId(data?.membership?.id ?? null)
      setStep(4)
      setIsSubmitted(true)
      toast({
        title: 'Success',
        description: 'Membership application submitted successfully!'
      })
    } catch (error) {
      console.error('Membership submission error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = (n) => {
    if (n === 1)
      return !!(
        formData.membership_type &&
        (formData.student_name || isLoggedIn) &&
        (formData.student_phone_no || isLoggedIn)
      )
    if (n === 2)
      return !!(
        formData.career_field &&
        (formData.career_field === 'unsure' ||
          formData.selected_trainings.length > 0)
      )
    if (n === 3) return !!formData.payment_method
    return true
  }

  const renderStepper = () => (
    <nav aria-label='Membership steps' className='relative z-10 mt-7'>
      <ol className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
        {STEPS.map((s, index) => {
          const done = step > s.id
          const current = step === s.id
          return (
            <li key={s.id} className='min-w-0 flex-1'>
              <div
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'relative flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all duration-300 sm:px-3.5',
                  current && 'border-white bg-white shadow-lg shadow-black/10',
                  done && 'border-white/25 bg-white/10',
                  !current && !done && 'border-white/15 bg-white/[0.04]'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300',
                    done && 'bg-[#7fd1b8] text-[#0f3b30]',
                    current && 'bg-[#eaf2f8] text-[#2d658e]',
                    !done && !current && 'border border-white/30 text-white/70'
                  )}
                >
                  {done ? <Check size={14} strokeWidth={3} /> : s.id}
                </span>
                <span className='min-w-0'>
                  <span
                    className={cn(
                      'block text-[13px] font-semibold leading-tight transition-colors duration-300 sm:text-sm',
                      current
                        ? 'text-[#2d658e]'
                        : done
                          ? 'text-white'
                          : 'text-white/70'
                    )}
                  >
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      'mt-0.5 block text-[11px] leading-tight transition-colors duration-300',
                      current ? 'text-slate-500' : 'text-white/55'
                    )}
                  >
                    {s.hint}
                  </span>
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden='true'
                    className={cn(
                      'absolute -right-2.5 top-1/2 hidden h-px w-2.5 -translate-y-1/2 rounded-full transition-colors duration-300 sm:block',
                      done ? 'bg-[#7fd1b8]' : 'bg-white/25'
                    )}
                  />
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )

  const stepActions = (nextLabel = 'Continue', handle = handleNext) => (
    <div className='mt-9 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center'>
      {step > 1 ? (
        <button
          type='button'
          onClick={handleBack}
          disabled={isSubmitting}
          className='inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40'
        >
          <ChevronLeft size={16} />
          Back
        </button>
      ) : (
        <Link
          href='/membership-pricing'
          className='inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800'
        >
          <ChevronLeft size={16} />
          Back to pricing
        </Link>
      )}
      <Button
        type='button'
        disabled={!canProceed(step) || isSubmitting}
        onClick={handle}
        className='h-12 rounded-xl px-7 text-[15px] font-semibold text-white shadow-lg shadow-[#387cae]/25 transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none'
        style={{
          backgroundColor: nextLabel === 'Pay & join' ? PAY_BTN : THEME_BLUE
        }}
      >
        {nextLabel}
        <ChevronRight size={17} className='ml-2' />
      </Button>
    </div>
  )

  if (isSubmitted) {
    const fieldLabel =
      formData.career_field === 'unsure'
        ? 'Deciding later'
        : selectedField?.name || formData.career_field || '—'
    return (
      <div className='w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-2xl shadow-slate-200/70 animate-in fade-in zoom-in duration-500 md:px-10'>
        <div className='flex flex-col items-center justify-center'>
          <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50'>
            <CheckCircle2 className='h-9 w-9 text-emerald-600' />
          </div>
          <h2 className='mb-3 font-poppins text-2xl font-bold tracking-tight text-slate-900 md:text-3xl'>
            Welcome to MeroUni Membership
          </h2>
          <p className='mb-7 max-w-lg text-[15px] leading-relaxed text-slate-500'>
            {selectedLevel?.name} membership request received. Our team will
            confirm your payment and activate your member library shortly.
          </p>

          <div className='mb-8 w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-left'>
            <div className='grid grid-cols-1 gap-3 text-sm'>
              <Row label='Member' value={formData.student_name || user?.firstName} />
              <Row label='Level' value={selectedLevel?.name} />
              <Row label='Career field' value={fieldLabel} />
              <Row
                label='Trainings'
                value={formData.selected_trainings.length || '—'}
              />
              <Row
                label='Fee'
                value={
                  formData.membership_fee
                    ? `${formData.membership_fee}${
                        formData.payment_method
                          ? ` via ${
                              PAYMENT_METHODS.find(
                                (p) => p.id === formData.payment_method
                              )?.label || formData.payment_method
                            }`
                          : ''
                      }`
                    : '—'
                }
              />
              {studentId && <Row label='Application ID' value={`#${studentId}`} />}
            </div>
            {(selectedLevel?.id === 'PLUS2' ||
              selectedLevel?.id === 'BACHELORS' ||
              selectedLevel?.id === 'GRADUATE') && (
              <div className='mt-5'>
                <Note tone='green' icon={Sparkles}>
                  <strong className='font-semibold text-slate-800'>
                    {selectedLevel?.id === 'PLUS2'
                      ? 'Your free Grade 12 exam prep'
                      : 'Your selected trainings'}
                  </strong>{' '}
                  {selectedLevel?.id === 'PLUS2'
                    ? 'is included — you can start in your member dashboard.'
                    : "will open for your cohort once payment is confirmed."}
                </Note>
              </div>
            )}
          </div>

          <div className='flex flex-col items-center justify-center gap-3 sm:flex-row'>
            <Link href='/' className='w-full sm:w-auto'>
              <Button
                variant='outline'
                className='h-12 w-full min-w-[150px] rounded-xl text-sm font-semibold sm:w-auto'
              >
                Go Home
              </Button>
            </Link>
            <Link
              href={isLoggedIn ? '/dashboard' : '/membership-pricing'}
              className='w-full sm:w-auto'
            >
              <Button
                className='h-12 w-full min-w-[150px] rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 sm:w-auto'
                style={{ backgroundColor: THEME_BLUE }}
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80'>
      {/* Header */}
      <div
        className='relative overflow-hidden px-6 py-7 text-white sm:px-10 sm:py-9'
        style={{
          background: `linear-gradient(125deg, ${THEME_BLUE} 0%, #2c7a9a 52%, ${BLUE_DEEP} 100%)`
        }}
      >
        <div className='pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-white/10 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[#ffd27a]/10 blur-3xl' />
        <div
          className='pointer-events-none absolute inset-0 opacity-[0.07]'
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '18px 18px'
          }}
        />

        <div className='relative z-10'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <span className='inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white'>
              <Sparkles size={13} className='text-[#ffd27a]' />
              MeroUni Membership
            </span>
            <span className='inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white/90'>
              <Clock size={13} className='text-[#ffd27a]' />
              Takes about 2 minutes
            </span>
          </div>

          <h2 className='mt-4 font-poppins text-[26px] font-bold leading-[1.15] tracking-tight sm:text-3xl md:text-[34px]'>
            Set up your <span className='text-[#ffd27a]'>membership</span>
          </h2>
          <p className='mt-2.5 max-w-2xl text-[14px] leading-relaxed text-white/80 sm:text-[15px]'>
            Your level, then your field of interest, then payment — in that
            order.
          </p>

          {renderStepper()}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* STEP 1 — LEVEL & IDENTITY */}
        <div className={cn('px-7 py-8 sm:px-10 sm:py-10', step !== 1 && 'hidden')}>
          <Eyebrow>
            Step 1 of {MAX_STEP} — your level
          </Eyebrow>
          <h3 className='mb-2 mt-2 font-poppins text-xl font-bold tracking-tight text-slate-900 sm:text-2xl'>
            Which level are you applying for?
          </h3>
          <p className='mb-6 text-[15px] leading-relaxed text-slate-500'>
            You can add another level later from your member dashboard.
          </p>

          <div
            role='radiogroup'
            aria-label='Membership level'
            className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3'
          >
            {LEVELS.map((level, index) => {
              const active = formData.membership_type === level.id
              return (
                <button
                  key={level.id}
                  type='button'
                  role='radio'
                  aria-checked={active}
                  onClick={() => pickLevel(level)}
                  className={fieldCardClass(active)}
                >
                  <span className='absolute right-4 top-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400'>
                    LVL-0{index + 1}
                  </span>
                  <p className='pr-12 text-[15px] font-bold leading-snug text-slate-900'>
                    {level.name}
                  </p>
                  <p className='mt-1.5 text-[13px] leading-relaxed text-slate-500'>
                    {level.tagline}
                  </p>
                  <p className='mt-4 text-base font-bold text-[#1F6F5C]'>
                    {level.fee}
                  </p>
                  <span className='absolute bottom-4 right-4'>
                    <Dot active={active} />
                  </span>
                </button>
              )
            })}
          </div>
          {errors.membership_type && (
            <div className='mb-6'>
              <FieldError>{errors.membership_type}</FieldError>
            </div>
          )}

          {selectedLevel && (
            <div className='mb-8'>
              <Note tone='blue' icon={Sparkles}>
                <strong className='font-semibold text-slate-800'>
                  {selectedLevel.note}:
                </strong>{' '}
                {selectedLevel.blurb}
              </Note>
            </div>
          )}

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label
                htmlFor='student_name'
                className='text-sm font-semibold text-slate-700'
              >
                Full Name
              </Label>
              <Input
                id='student_name'
                name='student_name'
                placeholder='Your full name'
                value={formData.student_name}
                onChange={handleChange}
                disabled={isLoggedIn}
                className={cn(
                  'h-12 rounded-xl px-4 text-[15px]',
                  errors.student_name &&
                    'border-red-400 focus-visible:ring-red-400/30'
                )}
              />
              {errors.student_name && <FieldError>{errors.student_name}</FieldError>}
            </div>
            <div className='space-y-2'>
              <Label
                htmlFor='student_phone_no'
                className='text-sm font-semibold text-slate-700'
              >
                Phone Number
              </Label>
              <Input
                id='student_phone_no'
                name='student_phone_no'
                type='tel'
                placeholder='98XXXXXXXX'
                value={formData.student_phone_no}
                onChange={handleChange}
                disabled={isLoggedIn}
                className={cn(
                  'h-12 rounded-xl px-4 text-[15px]',
                  errors.student_phone_no &&
                    'border-red-400 focus-visible:ring-red-400/30'
                )}
              />
              {errors.student_phone_no && (
                <FieldError>{errors.student_phone_no}</FieldError>
              )}
            </div>
          </div>

          <div className='mt-5 grid grid-cols-1 gap-5 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label
                htmlFor='student_email'
                className='text-sm font-semibold text-slate-700'
              >
                Email <span className='font-normal text-slate-400'>(optional)</span>
              </Label>
              <Input
                id='student_email'
                name='student_email'
                type='email'
                placeholder='you@email.com'
                value={formData.student_email}
                onChange={handleChange}
                disabled={isLoggedIn}
                className='h-12 rounded-xl px-4 text-[15px]'
              />
            </div>
            <div className='space-y-2'>
              <Label
                htmlFor='institution'
                className='text-sm font-semibold text-slate-700'
              >
                {formData.membership_type === 'PLUS2'
                  ? 'School / +2 college'
                  : formData.membership_type === 'BACHELORS'
                    ? 'College & program'
                    : 'Institution (graduated)'}
              </Label>
              <Input
                id='institution'
                name='institution'
                placeholder='Name of your institution'
                value={formData.institution}
                onChange={handleChange}
                className='h-12 rounded-xl px-4 text-[15px]'
              />
            </div>
          </div>

          {stepActions('Continue to career field')}
        </div>

        {/* STEP 2 — CAREER FIELD & TRAININGS */}
        <div className={cn('px-7 py-8 sm:px-10 sm:py-10', step !== 2 && 'hidden')}>
          <Eyebrow>
            Step 2 of {MAX_STEP} — pick a field
          </Eyebrow>
          <h3 className='mb-2 mt-2 font-poppins text-xl font-bold tracking-tight text-slate-900 sm:text-2xl'>
            What field do you want to train in?
          </h3>
          <p className='mb-6 text-[15px] leading-relaxed text-slate-500'>
            Each training is run by a qualified trainer from a partner college —
            at zero training cost to you.
          </p>

          <div
            role='radiogroup'
            aria-label='Career field'
            className='grid grid-cols-1 gap-4 sm:grid-cols-3'
          >
            {FIELDS.map((field) => {
              const active = formData.career_field === field.id
              return (
                <button
                  key={field.id}
                  type='button'
                  role='radio'
                  aria-checked={active}
                  onClick={() => pickField(field.id)}
                  className={fieldCardClass(active)}
                >
                  <p className='text-[15px] font-bold leading-snug text-slate-900'>
                    {field.name}
                  </p>
                  <p className='mt-1.5 text-[12px] leading-relaxed text-slate-500'>
                    {field.partner}
                  </p>
                  <div className='mt-4 flex items-center justify-between gap-3'>
                    <span className='rounded-full bg-[#1F6F5C]/10 px-2.5 py-1 text-[11px] font-semibold text-[#1F6F5C]'>
                      {field.trainings.length} free trainings
                    </span>
                    <Dot active={active} />
                  </div>
                </button>
              )
            })}
          </div>

          <button
            type='button'
            role='radio'
            aria-checked={formData.career_field === 'unsure'}
            onClick={() => pickField('unsure')}
            className={cn(
              fieldCardClass(formData.career_field === 'unsure'),
              'mt-4 flex-row items-center gap-3 py-4'
            )}
          >
            <Dot active={formData.career_field === 'unsure'} />
            <span className='text-[15px] font-semibold text-slate-800'>
              Not sure yet — decide after my exam / later
            </span>
          </button>

          {errors.career_field && (
            <div className='mt-3'>
              <FieldError>{errors.career_field}</FieldError>
            </div>
          )}

          {selectedField && (
            <div className='mt-8 animate-in fade-in slide-in-from-top-3 duration-200'>
              <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
                <div>
                  <Eyebrow tone='blue'>Select your trainings</Eyebrow>
                  <p className='mt-1 text-[15px] font-semibold text-slate-800'>
                    Pick one or more — you can change this later
                  </p>
                </div>
                <span className='rounded-full bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-600'>
                  {formData.selected_trainings.length} selected
                </span>
              </div>

              <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
                {selectedField.trainings.map((tr) => {
                  const checked = formData.selected_trainings.includes(tr.t)
                  return (
                    <label
                      key={tr.t}
                      className={cn(
                        'flex cursor-pointer items-start gap-3.5 rounded-2xl border-2 px-4 py-4 transition-all duration-150',
                        checked
                          ? 'border-[#387cae] bg-[#387cae]/[0.06] shadow-sm'
                          : 'border-slate-200 hover:border-[#387cae]/45 hover:shadow-sm'
                      )}
                    >
                      <input
                        type='checkbox'
                        checked={checked}
                        onChange={() => toggleTraining(tr.t)}
                        className='peer sr-only'
                      />
                      <span
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                          'peer-focus-visible:ring-2 peer-focus-visible:ring-[#387cae] peer-focus-visible:ring-offset-2',
                          checked
                            ? 'border-[#387cae] bg-[#387cae]'
                            : 'border-slate-300 bg-white'
                        )}
                      >
                        <Check
                          size={13}
                          strokeWidth={3}
                          className={checked ? 'text-white' : 'text-transparent'}
                        />
                      </span>
                      <span className='min-w-0'>
                        <span className='block text-[15px] font-semibold leading-snug text-slate-900'>
                          {tr.t}
                        </span>
                        <span className='mt-1 block text-[13px] leading-relaxed text-slate-500'>
                          {tr.d}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>

              <div className='mt-5'>
                <Note tone='green' icon={CheckCircle2}>
                  Taking a training never obligates you to enroll at the college
                  delivering it.
                </Note>
              </div>
            </div>
          )}

          {formData.career_field === 'unsure' && (
            <div className='mt-6'>
              <Note tone='green' icon={CheckCircle2}>
                No problem — you can pick a field anytime from your member
                dashboard once you&rsquo;re in.
              </Note>
            </div>
          )}

          {stepActions('Continue to payment')}
        </div>

        {/* STEP 3 — PAYMENT */}
        <div className={cn('px-7 py-8 sm:px-10 sm:py-10', step !== 3 && 'hidden')}>
          <Eyebrow>
            Step 3 of {MAX_STEP} — payment
          </Eyebrow>
          <h3 className='mb-2 mt-2 font-poppins text-xl font-bold tracking-tight text-slate-900 sm:text-2xl'>
            Confirm and pay
          </h3>
          <p className='mb-7 text-[15px] leading-relaxed text-slate-500'>
            Pay with your preferred method and upload the proof (optional) so we
            can activate your membership faster.
          </p>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-8'>
            <div>
              <Label required className='mb-3 block text-sm font-semibold text-slate-700'>
                Payment method
              </Label>
              <div
                role='radiogroup'
                aria-label='Payment method'
                className='grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1'
              >
                {PAYMENT_METHODS.map((method) => {
                  const active = formData.payment_method === method.id
                  return (
                    <button
                      key={method.id}
                      type='button'
                      role='radio'
                      aria-checked={active}
                      onClick={() => {
                        set('payment_method', method.id)
                        clearError('payment_method')
                      }}
                      className={cn(
                        fieldCardClass(active),
                        'flex-row items-center gap-3.5 py-4'
                      )}
                    >
                      <Dot active={active} />
                      <span>
                        <span className='block text-[15px] font-semibold text-slate-900'>
                          {method.label}
                        </span>
                        <span className='mt-0.5 block text-[13px] text-slate-500'>
                          {method.hint}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
              {errors.payment_method && (
                <div className='mt-3'>
                  <FieldError>{errors.payment_method}</FieldError>
                </div>
              )}

              <div className='mt-7 space-y-2'>
                <p className='text-sm font-semibold text-slate-700'>
                  Payment proof
                </p>
                <FileUpload
                  label=''
                  autoUpload={true}
                  authorId={user?.id != null ? String(user.id) : '1'}
                  onUploadComplete={(url) => setPaymentProof(url || '')}
                  defaultPreview={paymentProof}
                  accept='image/*,application/pdf'
                />
                <p className='text-[13px] leading-relaxed text-slate-500'>
                  Optional, but helps us verify your payment faster (screenshot or
                  bank slip).
                </p>
              </div>
            </div>

            <aside className='lg:sticky lg:top-8 lg:self-start'>
              <div
                className='rounded-2xl border border-slate-200 p-6'
                style={{
                  background: `linear-gradient(160deg, ${THEME_BLUE}/0.06 0%, #ffffff 60%)`
                }}
              >
                <Eyebrow tone='blue'>Order summary</Eyebrow>
                <p className='mt-3 font-poppins text-3xl font-bold tracking-tight text-slate-900'>
                  {formData.membership_fee || selectedLevel?.fee || '—'}
                </p>
                <p className='mt-1 text-[13px] font-medium text-slate-500'>
                  {selectedLevel?.name || 'Select a level to continue'}
                </p>

                <span className='mt-4 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600'>
                  {selectedLevel?.note || selectedLevel?.name || 'One-time fee'}
                </span>

                <dl className='mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm'>
                  <div className='flex items-center justify-between gap-4'>
                    <dt className='text-slate-500'>Career field</dt>
                    <dd className='text-right font-semibold text-slate-800'>
                      {formData.career_field === 'unsure'
                        ? 'Deciding later'
                        : selectedField?.name || '—'}
                    </dd>
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <dt className='text-slate-500'>Trainings</dt>
                    <dd className='text-right font-semibold text-slate-800'>
                      {formData.selected_trainings.length || '—'}
                    </dd>
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <dt className='text-slate-500'>Payment</dt>
                    <dd className='text-right font-semibold text-slate-800'>
                      {PAYMENT_METHODS.find(
                        (p) => p.id === formData.payment_method
                      )?.label || '—'}
                    </dd>
                  </div>
                </dl>

                {formData.selected_trainings.length > 0 && (
                  <ul className='mt-5 space-y-2 border-t border-slate-200 pt-4'>
                    {formData.selected_trainings.map((t) => (
                      <li
                        key={t}
                        className='flex items-start gap-2 text-[13px] leading-relaxed text-slate-600'
                      >
                        <Check
                          size={14}
                          strokeWidth={3}
                          className='mt-0.5 shrink-0 text-[#1F6F5C]'
                        />
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>

          {stepActions('Pay & join', handleSubmit)}
        </div>
      </form>
    </div>
  )
}

const Row = ({ label, value }) => (
  <div className='flex items-center justify-between gap-4 py-1'>
    <p className='text-slate-500'>{label}</p>
    <p className='text-right font-semibold text-slate-800'>{value || '—'}</p>
  </div>
)

export default MembershipForm
