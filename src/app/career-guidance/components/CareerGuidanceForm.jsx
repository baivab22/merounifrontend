'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Phone,
  GraduationCap,
  CheckCircle2,
  CalendarCheck,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  Clock,
  Award
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const COURSES = ['BIT', 'BCA', 'BScCSIT', 'BBA', 'BHM', 'BITM', 'BE']

const benefits = [
  {
    icon: Award,
    title: 'Expert Counselors',
    text: 'Get advice from experienced education professionals.'
  },
  {
    icon: ShieldCheck,
    title: '100% Free & Honest',
    text: 'Unbiased guidance with no hidden charges, ever.'
  },
  {
    icon: Clock,
    title: 'Quick Call Back',
    text: 'Our team reaches out within 24 hours of your request.'
  }
]

export default function CareerGuidanceForm({ initialCourse = '' }) {
  const { toast } = useToast()
  const isInitialOther =
    !!initialCourse && !COURSES.includes(initialCourse)
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    desired_course: isInitialOther ? '' : (initialCourse || '')
  })
  const [isOtherCourse, setIsOtherCourse] = useState(isInitialOther)
  const [otherCourse, setOtherCourse] = useState(
    initialCourse && initialCourse !== 'Other' && !COURSES.includes(initialCourse)
      ? initialCourse
      : ''
  )
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCourseChange = (e) => {
    const value = e.target.value
    setIsOtherCourse(value === 'Other')
    setFormData({
      ...formData,
      desired_course: value === 'Other' ? '' : value
    })
  }

  const handleOtherCourseChange = (e) => {
    const value = e.target.value
    setOtherCourse(value)
    setFormData({ ...formData, desired_course: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`${process.env.baseUrl}/career-guidance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        setIsSuccess(true)
        toast({
          title: 'Request Received!',
          description: 'Our counselor will call you back soon.'
        })
        setTimeout(() => setIsSuccess(false), 8000)
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Something went wrong!',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='min-h-screen bg-[#f6f9fc]'>
      {/* Hero */}
      <section className='relative overflow-hidden bg-gradient-to-br from-[#0A6FA7] via-[#1d5585] to-[#123c61] py-14 md:py-20'>
        <div className='pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#30AD8F]/30 blur-3xl' />
        <div className='pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#60a5fa]/20 blur-3xl' />

        <div className='relative container mx-auto px-4 text-center'>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[44px]'
          >
            Looking for the Best
            <span className='block bg-gradient-to-r from-[#4fe0bb] to-[#7dd3fc] bg-clip-text text-transparent'>
              Career Guidance?
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='mx-auto mt-4 max-w-xl text-base text-blue-100/90 md:text-lg'
          >
            Our expert counselors know exactly what you need! Share your details
            and we&apos;ll help you pick the perfect course for your future.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className='container mx-auto -mt-10 px-4 pb-20 md:-mt-14'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-5'>
          {/* Left info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className='order-2 lg:order-1 lg:col-span-2'
          >
            <div className='lg:pt-20'>
              <h2 className='text-2xl font-bold text-gray-900 md:text-3xl'>
                Why choose MeroUni guidance?
              </h2>
              <p className='mt-3 text-gray-500'>
                Choosing a course decides your career path. Let us help you make
                an informed, confident decision.
              </p>

              <div className='mt-8 space-y-5'>
                {benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className='flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md'
                  >
                    <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A6FA7]/10 to-[#30AD8F]/10 ring-1 ring-[#0A6FA7]/10'>
                      <benefit.icon className='h-5 w-5 text-[#0A6FA7]' />
                    </div>
                    <div>
                      <h3 className='font-bold text-gray-900'>{benefit.title}</h3>
                      <p className='mt-0.5 text-sm text-gray-500'>{benefit.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call us */}
              <div className='mt-8 rounded-2xl bg-gradient-to-br from-[#0A6FA7] to-[#30AD8F] p-6 text-white shadow-lg shadow-[#0A6FA7]/20'>
                <p className='text-sm font-semibold text-white/85'>
                  Prefer to talk right now?
                </p>
                <a
                  href='tel:+9779810212223'
                  className='mt-2 flex items-center gap-3 text-2xl font-bold tracking-tight transition-transform hover:scale-[1.02] md:text-3xl'
                >
                  <span className='flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30'>
                    <PhoneCall className='h-5 w-5 animate-pulse' />
                  </span>
                  +977 9810212223
                </a>
                <p className='mt-2 text-xs text-white/75'>
                  Call us anytime between 9 AM – 6 PM, Sun – Fri
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className='order-1 lg:order-2 lg:col-span-3'
          >
            <div className='relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-[#0A6FA7]/10 ring-1 ring-gray-100'>
              <AnimatePresence mode='wait'>
                {isSuccess ? (
                  <motion.div
                    key='success'
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className='flex flex-col items-center justify-center px-6 py-20 text-center md:py-28'
                  >
                    <div className='relative mb-6'>
                      <span className='absolute inset-0 animate-ping rounded-full bg-[#30AD8F]/30' />
                      <div className='relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#30AD8F] to-[#0A6FA7] shadow-lg shadow-[#30AD8F]/30'>
                        <CheckCircle2 className='h-10 w-10 text-white' />
                      </div>
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900'>
                      Request Received!
                    </h3>
                    <p className='mt-3 max-w-sm text-gray-500'>
                      Thank you for reaching out. Our career counselor will call
                      you back shortly. Meanwhile, feel free to explore our
                      college listings.
                    </p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className='mt-8 rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900'
                    >
                      Submit another request
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key='form'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    onSubmit={handleSubmit}
                    className='px-6 py-8 md:px-10 md:py-10'
                  >
                    <div className='mb-8 flex items-center gap-3'>
                      <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A6FA7] to-[#387cae] shadow-md shadow-[#0A6FA7]/25'>
                        <CalendarCheck className='h-6 w-6 text-white' />
                      </div>
                      <div>
                        <h2 className='text-xl font-bold text-gray-900 md:text-2xl'>
                          Book Your Free Session
                        </h2>
                        <p className='text-sm text-gray-500'>
                          Fill in your details — takes less than a minute
                        </p>
                      </div>
                    </div>

                    <div className='space-y-5'>
                      <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                        <div className='space-y-2'>
                          <label className='ml-1 text-sm font-semibold text-gray-700'>
                            Full Name
                          </label>
                          <div className='relative'>
                            <User className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                            <input
                              type='text'
                              name='fullname'
                              value={formData.fullname}
                              onChange={handleChange}
                              placeholder='e.g. Baivab Bidari'
                              className='w-full rounded-xl border border-gray-200 bg-[#f8fafc] py-3.5 pl-11 pr-4 text-gray-800 outline-none transition-all focus:border-[#0A6FA7] focus:bg-white focus:ring-4 focus:ring-[#0A6FA7]/10'
                              required
                            />
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <label className='ml-1 text-sm font-semibold text-gray-700'>
                            Phone Number
                          </label>
                          <div className='relative'>
                            <Phone className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                            <input
                              type='tel'
                              name='phone'
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder='98XXXXXXXX'
                              className='w-full rounded-xl border border-gray-200 bg-[#f8fafc] py-3.5 pl-11 pr-4 text-gray-800 outline-none transition-all focus:border-[#0A6FA7] focus:bg-white focus:ring-4 focus:ring-[#0A6FA7]/10'
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <label className='ml-1 text-sm font-semibold text-gray-700'>
                          Desired Faculty or Course of Study
                        </label>
                        <div className='relative'>
                          <GraduationCap className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                          <select
                            name='desired_course'
                            value={formData.desired_course}
                            onChange={handleCourseChange}
                            className={`w-full appearance-none rounded-xl border border-gray-200 bg-[#f8fafc] py-3.5 pl-11 pr-10 text-gray-800 outline-none transition-all focus:border-[#0A6FA7] focus:bg-white focus:ring-4 focus:ring-[#0A6FA7]/10 ${
                              formData.desired_course ? '' : 'text-gray-400'
                            }`}
                            required
                          >
                            <option value='' disabled>
                              Select your course
                            </option>
                            {COURSES.map((course) => (
                              <option key={course} value={course}>
                                {course}
                              </option>
                            ))}
                            <option value='Other'>Other</option>
                          </select>
                          <svg
                            className='pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 9l-7 7-7-7'
                            />
                          </svg>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isOtherCourse && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className='space-y-2'
                          >
                            <label className='ml-1 text-sm font-semibold text-gray-700'>
                              Please specify your course
                            </label>
                            <div className='relative'>
                              <GraduationCap className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                              <input
                                type='text'
                                value={otherCourse}
                                onChange={handleOtherCourseChange}
                                placeholder='e.g. BSc Nursing, LLB...'
                                className='w-full rounded-xl border border-gray-200 bg-[#f8fafc] py-3.5 pl-11 pr-4 text-gray-800 outline-none transition-all focus:border-[#0A6FA7] focus:bg-white focus:ring-4 focus:ring-[#0A6FA7]/10'
                                required={isOtherCourse}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        type='submit'
                        disabled={loading}
                        className='group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0A6FA7] to-[#387cae] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#0A6FA7]/25 transition-all hover:shadow-xl hover:shadow-[#0A6FA7]/35 disabled:opacity-70 active:scale-[0.99]'
                      >
                        {loading ? (
                          <div className='flex items-center gap-2'>
                            <div className='h-5 w-5 animate-spin rounded-full border-t-2 border-white' />
                            <span>Booking...</span>
                          </div>
                        ) : (
                          <>
                            <span>Book Session</span>
                            <ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
                          </>
                        )}
                      </button>

                      <p className='text-center text-xs text-gray-400'>
                        By submitting, you agree to be contacted by our
                        counselors. Your information stays 100% private.
                      </p>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
