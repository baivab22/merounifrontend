'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGraduationCap, FaArrowRight } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

const StickyCTA = ({ college }) => {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after user scrolls past the hero section (approx 600px)
      if (window.scrollY > 600) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleApplyClick = () => {
    if (college?.slugs) {
      router.push(`/colleges/apply/${college.slugs}`)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className='fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none'
        >
          <div className='max-w-7xl mx-auto pointer-events-auto'>
            <div className='bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] p-3 md:px-8 md:py-4 flex items-center justify-between gap-4'>
              {/* Left Side: Logo/Info */}
              <div className='flex items-center gap-3 md:gap-4 min-w-0'>
                <div className='hidden xs:flex w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-[#0A6FA7] to-[#30AD8F] items-center justify-center text-white shadow-lg flex-shrink-0'>
                  <FaGraduationCap className='w-5 h-5 md:w-6 md:h-6' />
                </div>
                <div className='min-w-0'>
                  <h4 className='text-xs md:text-sm font-bold text-gray-900 truncate max-w-[150px] sm:max-w-[300px]'>
                    {college?.name}
                  </h4>
                  <div className='flex items-center gap-2 mt-0.5'>
                     <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse'></span>
                     <p className='text-[10px] md:text-xs text-emerald-600 font-medium'>Applications Open</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className='flex items-center gap-2 md:gap-3 flex-shrink-0'>
                {college?.website_url && (
                  <a
                    href={college.website_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hidden sm:flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-[#0A6FA7] hover:bg-gray-50 rounded-xl transition-all'
                  >
                    Visit Website
                  </a>
                )}
                <button
                  onClick={handleApplyClick}
                  className='flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-3.5 bg-[#0A6FA7] hover:bg-[#085e8a] text-white text-xs md:text-sm font-bold rounded-xl md:rounded-2xl shadow-[0_8px_20px_rgba(10,111,167,0.3)] hover:shadow-[0_12px_25px_rgba(10,111,167,0.4)] transition-all active:scale-95 group'
                >
                  <span>Apply Now</span>
                  <FaArrowRight className='w-3 h-3 md:w-3.5 md:h-3.5 group-hover:translate-x-1 transition-transform' />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default StickyCTA
