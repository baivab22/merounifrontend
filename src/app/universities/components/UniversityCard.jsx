'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Info, GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'

const UniversityCard = ({ university }) => {
  const router = useRouter()

  const {
    fullname,
    city,
    state,
    slugs,
    featured_image,
    logo: logoProp,
    type_of_institute
  } = university

  const logo = logoProp || '/images/logo.png'


  const location = [city, state].filter(Boolean).join(', ')
  const image = featured_image || "/images/logo.png";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => router.push(`/universities/${slugs}`)}
      className='group bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full'
    >
      {/* Banner / Featured Image */}
      <div className='relative w-full aspect-[16/9] overflow-hidden bg-gray-100'>
        <img
          src={image}
          className='w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500'
          alt={fullname}
          onError={(e) => {
            e.target.onerror = null
            e.target.src = 'https://placehold.co/600x400?text=No+Image'
          }}
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60'></div>

        <div className='absolute top-3 left-3 flex gap-2'>
          <div className='bg-white/95 px-2.5 py-1 rounded-md text-[10px] font-bold text-[#0A70A7] uppercase tracking-wider shadow-sm backdrop-blur-sm'>
            {type_of_institute || 'University'}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className='p-5 flex flex-col flex-1 min-w-0'>
        {/* Logo and Title Header */}
        <div className='flex items-start gap-3 mb-4'>
          {logo && (
            <div className='relative w-10 h-10 flex-shrink-0 rounded-md bg-gray-50 border border-gray-100 overflow-hidden shadow-sm'>
              <img src={logo} alt='' className='w-full h-full object-contain p-1' />
            </div>
          )}
          <div className='flex-1 min-w-0'>
            <h3 className='text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#0A70A7] transition-colors mb-1'>
              {fullname}
            </h3>
            {location && (
              <div className='flex items-center gap-1 text-[11px] font-medium text-gray-500'>
                <MapPin className='w-3 h-3 text-[#0A70A7] flex-shrink-0' />
                <span className='truncate'>{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-auto pt-4 flex items-center gap-2 border-t border-gray-100'>
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/universities/${slugs}#programs`)
            }}
            className='flex-1 py-2 px-3 bg-[#0A70A7] text-white rounded-lg hover:bg-[#085a86] transition-all text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider'
          >
            <GraduationCap className='w-3.5 h-3.5' />
            Programs
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/universities/${slugs}`)
            }}
            className='flex-1 py-2 px-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-[10px] font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider border border-gray-200/50'
          >
            <Info className='w-3.5 h-3.5' />
            Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default UniversityCard
