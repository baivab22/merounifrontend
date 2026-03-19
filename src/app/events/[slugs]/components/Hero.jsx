import React from 'react'
import { FaArrowLeft, FaCalendarAlt, FaHashtag } from 'react-icons/fa'
import Link from 'next/link'
import { formatDate } from '@/utils/date.util'

const Hero = ({ event }) => {
  return (
    <div className='max-w-[1000px] mx-auto px-6 pt-10 lg:pt-14'>
      {/* Navigation */}
      <div className='mb-8'>
        <Link
          href='/events'
          className='group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0A6FA7] transition-all'
        >
          <div className='p-1.5 rounded-full bg-gray-100 group-hover:bg-[#0A6FA7] group-hover:text-white transition-all'>
            <FaArrowLeft className='w-3 h-3' />
          </div>
          <span>Back to Events</span>
        </Link>
      </div>

      <div className='flex flex-col gap-6'>
        {/* Title & Meta */}
        <div className='space-y-6'>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight'>
            {event?.title}
          </h1>

          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-100 pb-8'>
            <div className='flex flex-wrap items-center gap-6 text-sm'>
              <div className='flex items-center gap-2 text-gray-600'>
                <FaCalendarAlt className='text-[#0A6FA7]' />
                <span className='font-medium'>{formatDate(event?.createdAt)}</span>
              </div>
              <div className='w-1 h-1 rounded-full bg-gray-300 hidden sm:block' />
              <div className='flex items-center gap-2 text-gray-600'>
                <FaHashtag className='text-[#0A6FA7]' />
                <span className='font-medium tracking-wide'>
                  ID: {event?.id ? String(event.id).slice(-6).toUpperCase() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image */}
        {event?.image && (
          <div className='w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-gray-100 relative group'>
            <img
              src={event?.image}
              alt={event?.title}
              className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]'
            />
            <div className='absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl'></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Hero
