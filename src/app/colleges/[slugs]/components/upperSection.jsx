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
      <div className='w-full px-0 sm:px-4 md:px-8 lg:px-12'>
        <motion.div 
          variants={itemVariants}
          className='w-full relative group overflow-hidden sm:rounded-3xl shadow-2xl'
        >
          {/* Back Button */}
          <div className='absolute top-6 left-6 z-20'>
            <Link
              href='/colleges'
              className='inline-flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/40 backdrop-blur-xl text-white rounded-full text-sm font-semibold transition-all border border-white/20 shadow-lg group/back'
            >
              <FaArrowLeft className='w-3 h-3 group-hover/back:-translate-x-1 transition-transform' />
              <span>Back to Colleges</span>
            </Link>
          </div>

          {/* Featured Image */}
          <div className='relative aspect-[21/9] w-full overflow-hidden'>
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              src={college?.featured_img || '/images/degreeHero.webp'}
              alt='College Photo'
              className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />
          </div>

          {/* Logo & Basic Info Overlay */}
          <div className='absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row items-end md:items-center gap-6'>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className='flex items-center justify-center rounded-3xl bg-white p-1 overflow-hidden w-24 h-24 md:w-32 md:h-32 flex-shrink-0 shadow-2xl border-4 border-white/20 backdrop-blur-md'
            >
              <img
                src={
                  college?.college_logo ||
                  `https://avatar.iran.liara.run/username?username=${college?.name}`
                }
                alt='College Logo'
                className='object-contain w-full h-full rounded-2xl'
              />
            </motion.div>
            
            <div className='flex-1 text-white pb-2'>
              <motion.h1 
                variants={itemVariants}
                className='font-bold text-2xl md:text-4xl lg:text-5xl drop-shadow-lg mb-2'
              >
                {college?.name}
              </motion.h1>
              {hasAddress && (
                <motion.div 
                  variants={itemVariants}
                  className='flex items-center gap-2 text-white/90 font-medium'
                >
                  <FaMapMarkerAlt className='w-4 h-4 text-[#30AD8F]' />
                  <span className='text-sm md:text-lg'>
                    {college?.collegeAddress?.street}, {college?.collegeAddress?.city}
                  </span>
                </motion.div>
              )}
            </div>

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
                  className='bg-white text-[#0A6FA7] px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xl font-bold text-sm hover:bg-[#F8FAFC]'
                >
                  <Eye className='w-4 h-4' />
                  <span>View Brochure</span>
                </a>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Info Cards Section */}
      <div className='px-4 sm:px-8 md:px-12 lg:px-24 w-full -mt-4 relative z-10'>
        <motion.div 
          variants={containerVariants}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'
        >
          {/* Affiliation */}
          {hasUniversity && (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className='bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white shadow-xl shadow-gray-200/50 flex items-center gap-4 group'
            >
              <div className='bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-[#0A6FA7]/10 transition-colors'>
                <FaUniversity className='w-6 h-6 text-[#0A6FA7]' />
              </div>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-gray-400 font-bold'>Affiliation</p>
                <p className='text-sm text-gray-900 font-bold line-clamp-1'>
                  {college.universities.map(u => u.fullname).join(', ')}
                </p>
              </div>
            </motion.div>
          )}

          {/* Contact */}
          {hasContacts && (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className='bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white shadow-xl shadow-gray-200/50 flex items-center gap-4 group'
            >
              <div className='bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-orange-100 transition-colors'>
                <FaPhoneAlt className='w-5 h-5 text-orange-500' />
              </div>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-gray-400 font-bold'>Contact</p>
                <a
                  href={`tel:${college.collegeContacts[0]?.contact_number}`}
                  className='text-sm text-gray-900 font-bold hover:text-[#0A6FA7] transition-colors'
                >
                  {college.collegeContacts[0]?.contact_number}
                </a>
              </div>
            </motion.div>
          )}

          {/* Website */}
          {hasWebsite && (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className='bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white shadow-xl shadow-gray-200/50 flex items-center gap-4 group'
            >
              <div className='bg-sky-50 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-sky-100 transition-colors'>
                <BsGlobe2 className='w-5 h-5 text-sky-500' />
              </div>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-gray-400 font-bold'>Website</p>
                <a
                  href={college.website_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-sm text-gray-900 font-bold hover:text-[#0A6FA7] transition-colors truncate block max-w-[120px]'
                >
                  {college.website_url.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
            </motion.div>
          )}

          {/* Address */}
          {hasAddress && (
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className='bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white shadow-xl shadow-gray-200/50 flex items-center gap-4 group'
            >
              <div className='bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors'>
                <FaMapMarkerAlt className='w-5 h-5 text-[#30AD8F]' />
              </div>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-gray-400 font-bold'>Location</p>
                <p className='text-sm text-gray-900 font-bold line-clamp-1'>
                  {college?.collegeAddress?.city}, {college?.collegeAddress?.country}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ImageSection
