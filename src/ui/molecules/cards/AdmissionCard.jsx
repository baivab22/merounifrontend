'use client'
import React from 'react'
import Link from 'next/link'
import { GraduationCap, MapPin, Info, ArrowRight, Building2, Wallet } from 'lucide-react'

const AdmissionCard = ({ admis }) => {
  const college = admis?.collegeAdmissionCollege
  const program = admis?.program
  const collegeImage = college?.featured_img || '/images/logo.png'

  return (
    <div className='group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col h-full bg-gradient-to-br from-white to-gray-50/30'>
      {/* Image Section */}
      <div className='relative aspect-[16/10] overflow-hidden bg-gray-100'>
        <img
          src={collegeImage}
          alt={program?.title || 'Admission'}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
        />
        {/* Overlay Gradient */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity' />

        {/* Top Badges */}
        <div className='absolute top-3 left-3 flex gap-2'>
          <span className='bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-[#0A70A7] uppercase tracking-wider shadow-sm'>
            Admission Open
          </span>
        </div>
      </div>

      <div className='p-5 flex flex-col flex-1 pb-4'>
        {/* College Name as Heading */}
        <h4 className='font-bold text-sm text-gray-800 mb-1 group-hover:text-[#0A70A7] transition-colors line-clamp-1 truncate'>
          {college?.name}
        </h4>

        {/* Program Title as Sub-heading */}
        <Link href={`/admission/${admis.id}`} className='mb-4 block transition-transform active:scale-95'>
          <h3 className='font-bold text-xs text-gray-500 hover:text-[#0A70A7] transition-colors leading-tight line-clamp-1 flex items-center gap-1.5'>
            <GraduationCap className='w-3.5 h-3.5 shrink-0' />
            {program?.title}
          </h3>
        </Link>

        {/* Action Buttons */}
        <div className='mt-auto pt-5 flex items-center gap-2 border-t border-gray-100'>
          <Link
            href={`/admission/${admis.id}`}
            className='flex-1 py-2.5 px-3 bg-[#0A70A7] text-white rounded-md hover:bg-[#085a86] transition-all text-[11px] font-bold flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider'
          >
            View Details
            <ArrowRight className='w-3.5 h-3.5' />
          </Link>

          <Link
            href={`/colleges/${college?.slugs}`}
            className='p-2.5 bg-gray-50 text-gray-500 rounded-md hover:bg-gray-100 hover:text-[#0A70A7] transition-all border border-gray-100'
            title='View College'
          >
            <Building2 className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdmissionCard
