'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from '@bprogress/next/app'
import { GraduationCap, MapPin, ArrowRight, Building2 } from 'lucide-react'

const AdmissionCard = ({ admis }) => {
  const router = useRouter()
  const college = admis?.collegeAdmissionCollege
  const program = admis?.program
  const collegeImage = college?.featured_img || '/images/logo.png'

  const addressObj = college?.collegeAddress || college?.address
  const location = addressObj
    ? [addressObj.street || addressObj.city, addressObj.district]
        .filter(Boolean)
        .join(', ')
    : ''

  const logo = college?.college_logo || '/images/logo.png'

  const rawLevel = college?.institute_level
  let levelArr = rawLevel
  if (typeof rawLevel === 'string') {
    try {
      levelArr = JSON.parse(rawLevel)
    } catch {
      levelArr = null
    }
  }
  const isSchoolInstitute =
    college?.institute_type === 'School' ||
    (Array.isArray(levelArr) && levelArr.includes('School'))

  const handleCardClick = () => {
    router.push(`/admission/${admis.id}`)
  }

  const profileHref =
    college?.slugs != null
      ? isSchoolInstitute
        ? `/schools/${college.slugs}`
        : `/colleges/${college.slugs}`
      : '#'

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
      className='group bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full'
    >
      <div className='relative w-full aspect-[16/9] overflow-hidden bg-gray-100'>
        <Image
          src={collegeImage || '/images/logo.png'}
          alt={program?.title || college?.name || 'Admission'}
          fill
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
          className='object-cover group-hover:scale-[1.03] transition-transform duration-500'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60' />

        <div className='absolute top-3 left-3 flex gap-2 z-10'>
          <span className='bg-white/95 px-2.5 py-1 rounded-md text-[10px] font-bold text-[#0A70A7] uppercase tracking-wider shadow-sm backdrop-blur-sm'>
            Admission Open
          </span>
        </div>
      </div>

      <div className='p-5 flex flex-col flex-1 min-w-0'>
        <div className='flex items-start gap-3 mb-4'>
          <div className='relative w-10 h-10 flex-shrink-0 rounded-md bg-gray-50 border border-gray-100 overflow-hidden shadow-sm hidden sm:block'>
            <img
              src={logo}
              alt=''
              className='w-full h-full object-contain p-1'
            />
          </div>
          <div className='flex-1 min-w-0'>
            <h3 className='text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#0A70A7] transition-colors mb-2'>
              {college?.name}
            </h3>
            {location ? (
              <div className='flex items-center gap-1 text-[11px] font-medium text-gray-500'>
                <MapPin className='w-3 h-3 text-[#0A70A7] flex-shrink-0' />
                <span className='truncate'>{location}</span>
              </div>
            ) : null}
          </div>
        </div>

        {program?.title && (
          <div className='flex flex-wrap gap-1.5 mb-5'>
            <Link
              href={`/admission/${admis.id}`}
              onClick={(e) => e.stopPropagation()}
              className='text-[10px] bg-[#0A70A7]/5 text-[#0A70A7] px-2 py-0.5 rounded-md border border-[#0A70A7]/10 font-bold whitespace-nowrap hover:bg-[#0A70A7] hover:text-white transition-colors inline-flex items-center gap-1'
            >
              <GraduationCap className='w-3 h-3 shrink-0' />
              <span className='line-clamp-1 max-w-[220px]'>
                {program.title}
              </span>
            </Link>
          </div>
        )}

        <div className='mt-auto pt-4 flex items-center gap-2 border-t border-gray-100'>
          <Link
            href={`/admission/${admis.id}`}
            onClick={(e) => e.stopPropagation()}
            className='flex-1 py-2 px-3 bg-[#0A70A7] text-white rounded-lg hover:bg-[#085a86] transition-all text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider'
          >
            View Details
            <ArrowRight className='w-3.5 h-3.5' />
          </Link>
          <Link
            href={profileHref}
            onClick={(e) => e.stopPropagation()}
            className='flex-1 py-2 px-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-[10px] font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider border border-gray-200/50'
          >
            <Building2 className='w-3.5 h-3.5' />
            {isSchoolInstitute ? 'School' : 'College'}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdmissionCard
