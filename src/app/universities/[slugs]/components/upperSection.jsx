import React from 'react'
import { MdDateRange } from 'react-icons/md'
import { FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa'
import { BsGlobe2 } from 'react-icons/bs'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'

const UpperSection = ({ university }) => {
  return (
    <div className='flex flex-col items-center w-full'>
      {/* Top Section */}
      <div className='w-full relative'>
        <div className='absolute top-6 left-6 md:left-24 z-10'>
          <Link
            href='/universities'
            className='inline-flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white rounded-full text-sm font-medium transition-all shadow-lg border border-white/20'
          >
            <FaArrowLeft className='w-3 h-3' />
            <span>Back to Universities</span>
          </Link>
        </div>
        <img
          src={
            university?.featured_image !== ''
              ? university?.featured_image
              : '/images/degreeHero.webp'
          }
          alt={university?.fullname || 'University Image'}
          className='h-[25vh] w-full md:h-[400px] object-cover bg-gray-200'
        />
        <div className='flex flex-row lg:h-[95px] bg-[#30AD8F] bg-opacity-5 items-center p-0 px-8 sm:px-14 md:px-24'>
          <div className='flex items-center justify-center rounded-full bg-white -translate-y-8 overflow-hidden w-24 h-24 md:w-32 md:h-32 shadow-sm border-4 border-white'>
            <img
              src={
                university?.logo ||
                `https://avatar.iran.liara.run/username?username=${university?.fullname}`
              }
              alt='uni logo'
              className='object-cover w-full h-full rounded-full aspect-square'
            />
          </div>
          <div className='ml-4'>
            <h2 className='font-bold text-lg lg:text-3xl lg:leading-[50px] text-gray-900'>
              {university?.fullname || ''}
            </h2>
          </div>
        </div>
      </div>

      {/* Key Facts Section - 4 Cards Layout */}
      <div className='px-4 sm:px-8 md:px-12 lg:px-24 w-full mt-12 mb-12'>
        <div className='grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-3 sm:gap-4 md:gap-5'>
          {/* Established */}
          <div className='bg-white rounded-xl sm:rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-3 sm:p-5 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-[#30AD8F]/20 group w-full sm:w-[200px] md:w-[220px]'>
            <div className='bg-blue-50 p-2 sm:p-3 rounded-lg sm:rounded-2xl mb-2 sm:mb-4 group-hover:bg-[#0A6FA7]/10 transition-colors duration-300'>
              <MdDateRange className='w-4 h-4 sm:w-6 sm:h-6 text-[#0A6FA7]' />
            </div>
            <p className='text-[9px] sm:text-xs uppercase tracking-wider text-gray-400 sm:text-gray-500 font-bold sm:font-medium mb-1'>
              Established
            </p>
            <p className='text-[11px] sm:text-sm text-gray-700 line-clamp-1 sm:line-clamp-2 font-bold sm:font-medium'>
              {university?.date_of_establish || 'N/A'}
            </p>
          </div>

          {/* Contact */}
          <div className='bg-white rounded-xl sm:rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-3 sm:p-5 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-[#30AD8F]/20 group w-full sm:w-[200px] md:w-[220px]'>
            <div className='bg-orange-50 p-2 sm:p-3 rounded-lg sm:rounded-2xl mb-2 sm:mb-4 group-hover:bg-orange-100 transition-colors duration-300'>
              <FaPhoneAlt className='w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-500' />
            </div>
            <p className='text-[9px] sm:text-xs uppercase tracking-wider text-gray-400 sm:text-gray-500 font-bold sm:font-medium mb-1'>
              Contact
            </p>
            <a
              href={`tel:${university?.contact?.phone_number || ''}`}
              className='block text-[11px] sm:text-sm text-gray-700 hover:text-[#0A6FA7] transition-colors font-bold sm:font-medium'
            >
              {university?.contact?.phone_number || 'N/A'}
            </a>
          </div>

          {/* Website */}
          <div className='bg-white rounded-xl sm:rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-3 sm:p-5 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-[#30AD8F]/20 group w-full sm:w-[200px] md:w-[220px]'>
            <div className='bg-sky-50 p-2 sm:p-3 rounded-lg sm:rounded-2xl mb-2 sm:mb-4 group-hover:bg-sky-100 transition-colors duration-300'>
              <BsGlobe2 className='w-3.5 h-3.5 sm:w-5 sm:h-5 text-sky-500' />
            </div>
            <p className='text-[9px] sm:text-xs uppercase tracking-wider text-gray-400 sm:text-gray-500 font-bold sm:font-medium mb-1'>
              Website
            </p>
            <a
              href={university?.contact?.website_url || '#'}
              target='_blank'
              rel='noopener noreferrer'
              className='text-[11px] sm:text-sm text-gray-700 hover:text-[#0A6FA7] transition-colors line-clamp-1 break-all font-bold sm:font-medium'
            >
              {university?.contact?.website_url ? university.contact.website_url.replace(/^https?:\/\/(www\.)?/, '') : 'N/A'}
            </a>
          </div>

          {/* Address */}
          <div className='bg-white rounded-xl sm:rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-3 sm:p-5 flex flex-col items-center justify-center text-center border border-gray-100 hover:border-[#30AD8F]/20 group w-full sm:w-[200px] md:w-[220px]'>
            <div className='bg-emerald-50 p-2 sm:p-3 rounded-lg sm:rounded-2xl mb-2 sm:mb-4 group-hover:bg-[#30AD8F]/10 transition-colors duration-300'>
              <FaMapMarkerAlt className='w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#30AD8F]' />
            </div>
            <p className='text-[9px] sm:text-xs uppercase tracking-wider text-gray-400 sm:text-gray-500 font-bold sm:font-medium mb-1'>
              Address
            </p>
            <p className='text-[11px] sm:text-sm text-gray-700 line-clamp-1 sm:line-clamp-2 font-bold sm:font-medium'>
              {[university?.city, university?.country].filter(Boolean).join(', ') || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpperSection