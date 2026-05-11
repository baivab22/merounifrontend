import React from 'react'
import { FaArrowLeft, FaCalendarAlt, FaHashtag } from 'react-icons/fa'
import Link from 'next/link'
import { formatDate } from '@/utils/date.util'

const Hero = ({ event }) => {
  return (
    <div className='relative px-6 md:px-16 pt-10 md:pt-16 max-w-[1600px] mx-auto'>
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
        {/* Category Badge & Date */}
        <div className='flex items-center gap-3 mb-6'>
          <span className='bg-[#0A6FA7] text-white text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full text-center'>
            Event
          </span>
          <span className='w-1.5 h-1.5 rounded-full bg-gray-300'></span>
          <span className='text-gray-500 text-xs md:text-sm font-medium'>
            {event?.createdAt ? formatDate(event.createdAt) : ''}
          </span>
        </div>

        {/* Title */}
        <h1 className='text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.15] mb-4'>
          {event?.title}
        </h1>

        {/* Image */}
        <div className='w-full mb-12 group'>
          <div className='overflow-hidden rounded-2xl md:rounded-[2.5rem] shadow-2xl shadow-blue-100/50 transition-transform duration-700 hover:scale-[1.01]'>
            <img
              src={event?.image || '/images/events.webp'}
              alt={event?.title || 'Event image'}
              className='w-full h-auto max-h-[600px] object-cover'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
