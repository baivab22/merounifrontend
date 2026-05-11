import React from 'react'
import { FaArrowRight, FaGraduationCap } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const ApplyNow = ({ college }) => {
  const router = useRouter()

  const handleApplyClick = () => {
    if (college?.slug) {
      router.push(`/colleges/apply/${college.slug}`)
    }
  }

  return (
    <div className='relative w-full mb-32 px-4 sm:px-8 md:px-12 lg:px-24 overflow-hidden'>
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className='relative bg-gradient-to-br from-[#0A6FA7] via-[#0A6FA7] to-[#30AD8F] rounded-[2.5rem] shadow-[0_20px_50px_rgba(10,111,167,0.2)] overflow-hidden'
      >
        {/* Decorative background elements */}
        <div className='absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48'></div>
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32'></div>
        
        {/* Animated circles */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className='absolute top-1/2 left-1/4 w-32 h-32 bg-white rounded-full'
        />

        <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 p-10 md:p-16 lg:p-20'>
          {/* Left side - Text content */}
          <div className='flex-1 text-center md:text-left'>
            <div className='flex items-center justify-center md:justify-start gap-4 mb-6'>
              <div className='w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center'>
                <FaGraduationCap className='w-8 h-8 text-white' />
              </div>
              <h3 className='text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight'>
                Ready to Start Your Journey?
              </h3>
            </div>
            <p className='text-base md:text-lg text-white/90 mb-4 max-w-xl'>
              Take the next step toward your future career. Join thousands of students who have chosen excellence at {college?.name}.
            </p>
            
          </div>

          {/* Right side - Action buttons */}
          <div className='flex flex-col sm:flex-row gap-4 items-center flex-shrink-0'>
            {college?.slug && (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApplyClick}
                className='group bg-white text-[#0A6FA7] px-10 py-5 rounded-2xl font-bold text-base shadow-2xl hover:shadow-[0_20px_40px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center'
              >
                <span>Apply Now</span>
                <FaArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
              </motion.button>
            )}

            {college?.website_url && (
              <motion.a
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href={college.website_url}
                target='_blank'
                rel='noopener noreferrer'
                className='group bg-white/10 backdrop-blur-md border-2 border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-base hover:bg-white/20 hover:border-white/40 transition-all duration-300 flex items-center gap-3 min-w-[200px] justify-center'
              >
                <span>Visit Website</span>
                <FaArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
              </motion.a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ApplyNow
