'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GraduationCap, ArrowRight, Headset } from 'lucide-react'

const COURSES = ['BIT', 'BCA', 'BScCSIT', 'BBA', 'BHM', 'BITM', 'BE', 'Other']

const AskExpertModal = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleNavigate = (course) => {
    setIsOpen(false)
    const query = course ? `?course=${encodeURIComponent(course)}` : ''
    router.push(`/career-guidance${query}`)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className='fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6'
          role='dialog'
          aria-modal='true'
        >
          {/* Backdrop */}
          <div
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            onClick={handleClose}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className='relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-[0_25px_60px_rgba(2,32,71,0.25)]'
          >
            {/* Top accent */}
            <div className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0A6FA7] via-[#387cae] to-[#30AD8F]' />

            {/* Close */}
            <button
              onClick={handleClose}
              aria-label='Close'
              className='absolute right-3.5 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700'
            >
              <X className='h-5 w-5' />
            </button>

            {/* Header */}
            <div className='px-7 pb-5 pt-8'>
              <div className='flex items-center gap-2.5'>
                <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A6FA7]/10'>
                  <Headset className='h-5 w-5 text-[#0A6FA7]' />
                </span>
                <span className='text-[11px] font-bold uppercase tracking-[0.18em] text-[#0A6FA7]'>
                  Free Expert Counseling
                </span>
              </div>

              <h2 className='mt-4 text-[26px] font-bold leading-snug text-gray-900'>
                Which courses are you
                <br />
                interested in?
              </h2>
              <p className='mt-2 text-sm leading-relaxed text-gray-500'>
                Tap your course below and our counselors will get you started on
                the right path — no spam, just honest guidance.
              </p>
            </div>

            {/* Course options */}
            <div className='px-7'>
              <div className='grid grid-cols-3 gap-2.5 sm:grid-cols-4'>
                {COURSES.map((course) => (
                  <motion.button
                    key={course}
                    type='button'
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleNavigate(course)}
                    className='group flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-all hover:border-[#0A6FA7]/40 hover:bg-[#0A6FA7]/5'
                  >
                    {course}
                    <ArrowRight className='h-4 w-4 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#0A6FA7]' />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className='px-7 pb-7 pt-5'>
              <button
                type='button'
                onClick={() => handleNavigate('')}
                className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A6FA7] px-6 py-3.5 text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(10,111,167,0.35)] transition-all hover:bg-[#085e8a] hover:shadow-[0_10px_30px_rgba(10,111,167,0.4)] active:scale-[0.99]'
              >
                <GraduationCap className='h-5 w-5' />
                Ask an Expert
              </button>
              <p className='mt-3 text-center text-xs text-gray-400'>
                Not sure? Our experts will help you decide.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AskExpertModal
