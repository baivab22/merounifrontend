import React from 'react'
import { IoIosGlobe } from 'react-icons/io'
import { FaUniversity, FaPhoneAlt, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa'
import { BsGlobe2 } from 'react-icons/bs'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const ImageSection = ({ college }) => {
  const hasAddress =
    college?.collegeAddress?.street || college?.collegeAddress?.city
  const hasContacts =
    college?.collegeContacts && college.collegeContacts.length > 0
  const hasWebsite = !!college?.website_url
  const hasUniversity = college?.universities && college.universities.length > 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  }

  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={containerVariants}
      className='flex flex-col items-center relative gap-4 md:gap-6 lg:gap-8'
    >
      {/* Hero Section */}
      <div className='w-full'>
        <div className='w-full relative'>
          <div className='absolute top-6 left-6 md:left-24 z-20'>
            <Link
              href='/colleges'
              className='inline-flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white rounded-full text-sm font-medium transition-all shadow-lg border border-white/20 group/back'
            >
              <FaArrowLeft className='w-3 h-3 group-hover/back:-translate-x-1 transition-transform' />
              <span>Back to Colleges</span>
            </Link>
          </div>
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            src={college?.featured_img || '/images/degreeHero.webp'}
            alt='College Photo'
            className='w-full h-auto max-h-[456px] max-xl:max-h-[380px] max-sm:max-h-[300px] object-contain rounded-md block'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-md pointer-events-none' />
        </div>

        {/* Info Bar with Popping Logo */}
        <motion.div 
          variants={itemVariants}
          className='flex flex-row min-h-[80px] md:h-[100px] bg-white items-center p-4 px-4 sm:px-8 md:px-14 lg:px-24 gap-4 sm:gap-6 shadow-sm relative z-10'
        >
          {/* Popping Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className='flex items-center justify-center rounded-2xl bg-white -translate-y-10 sm:-translate-y-12 md:-translate-y-16 overflow-hidden w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex-shrink-0 shadow-xl border-4 border-white transition-transform duration-300'
          >
            {college?.college_logo ? (
              <img
                src={college.college_logo}
                alt='College Logo'
                className='object-cover w-full h-full rounded-md aspect-square'
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              className={`${college?.college_logo ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-4xl sm:text-5xl md:text-6xl font-bold bg-[#387cae]/10 text-[#387cae]`}
            >
              {college?.name?.charAt(0) || '?'}
            </div>
          </motion.div>

          {/* Name & Basic Info */}
          <div className='flex-1 min-w-0 -mt-2'>
            <h1 className='font-bold text-xl md:text-3xl text-gray-900 truncate leading-tight'>
              {college?.name}
            </h1>
            {hasAddress && (
              <div className='flex flex-row items-center gap-1.5 mt-1 text-gray-600'>
                <span className='flex-shrink-0'>
                  <IoIosGlobe className='w-4 h-4 sm:w-5 sm:h-5 text-[#30AD8F]' />
                </span>
                <p className='text-sm md:text-base text-gray-600 truncate font-medium'>
                  {college?.collegeAddress?.street}
                  {college?.collegeAddress?.street && college?.collegeAddress?.city ? ', ' : ''}
                  {college?.collegeAddress?.city}
                </p>
              </div>
            )}
          </div>

          {/* View Brochure Button */}
          {college?.college_broucher && (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='flex-shrink-0'
            >
              <a
                href={college.college_broucher}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-[#0A6FA7] hover:bg-[#085e8a] text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg text-sm font-bold active:scale-95'
              >
                <Eye className='w-4 h-4' />
                <span className='hidden sm:inline'>View Brochure</span>
                <span className='sm:hidden'>Brochure</span>
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Info Cards Section */}
      <div className='px-4 sm:px-8 md:px-12 lg:px-24 w-full mt-4 md:mt-6'>
        <motion.div 
          variants={containerVariants}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5'
        >
          {/* Affiliation */}
          {hasUniversity && (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className='bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-4 sm:p-5 flex flex-col items-center justify-center text-center border border-gray-50 hover:border-[#30AD8F]/20 group'
            >
              <div className='bg-blue-50 p-2 sm:p-3 rounded-xl mb-3 group-hover:bg-[#0A6FA7]/10 transition-colors duration-300'>
                <FaUniversity className='w-4 h-4 sm:w-6 sm:h-6 text-[#0A6FA7]' />
              </div>
              <p className='text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1'>Affiliation</p>
              <p className='text-xs sm:text-sm text-gray-700 line-clamp-1 font-bold'>
                {college.universities.map(u => u.fullname).join(', ')}
              </p>
            </motion.div>
          )}

          {/* Contact */}
          {hasContacts && (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className='bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-4 sm:p-5 flex flex-col items-center justify-center text-center border border-gray-50 hover:border-[#30AD8F]/20 group'
            >
              <div className='bg-orange-50 p-2 sm:p-3 rounded-xl mb-3 group-hover:bg-orange-100 transition-colors duration-300'>
                <FaPhoneAlt className='w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-500' />
              </div>
              <p className='text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1'>Contact</p>
              <a
                href={`tel:${college.collegeContacts[0]?.contact_number}`}
                className='text-xs sm:text-sm text-gray-700 font-bold hover:text-[#0A6FA7] transition-colors'
              >
                {college.collegeContacts[0]?.contact_number}
              </a>
            </motion.div>
          )}

          {/* Website */}
          {hasWebsite && (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className='bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-4 sm:p-5 flex flex-col items-center justify-center text-center border border-gray-50 hover:border-[#30AD8F]/20 group'
            >
              <div className='bg-sky-50 p-2 sm:p-3 rounded-xl mb-3 group-hover:bg-sky-100 transition-colors duration-300'>
                <BsGlobe2 className='w-3.5 h-3.5 sm:w-5 sm:h-5 text-sky-500' />
              </div>
              <p className='text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1'>Website</p>
              <a
                href={college.website_url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs sm:text-sm text-gray-700 font-bold hover:text-[#0A6FA7] transition-colors line-clamp-1 break-all'
              >
                {college.website_url.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </motion.div>
          )}

          {/* Address */}
          {hasAddress && (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className='bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30_rgba(0,0,0,0.06)] transition-all duration-300 p-4 sm:p-5 flex flex-col items-center justify-center text-center border border-gray-50 hover:border-[#30AD8F]/20 group'
            >
              <div className='bg-emerald-50 p-2 sm:p-3 rounded-xl mb-3 group-hover:bg-[#30AD8F]/10 transition-colors duration-300'>
                <FaMapMarkerAlt className='w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#30AD8F]' />
              </div>
              <p className='text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1'>Location</p>
              <p className='text-xs sm:text-sm text-gray-700 line-clamp-1 font-bold'>
                {college?.collegeAddress?.city}, {college?.collegeAddress?.country}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ImageSection
