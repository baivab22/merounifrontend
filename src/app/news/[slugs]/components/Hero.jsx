import { formatDate } from '@/utils/date.util'
import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import Link from 'next/link'

const Hero = ({ news }) => {
  return (
    <div className='relative px-6 md:px-16 pt-10 md:pt-16 max-w-[1600px] mx-auto'>
      {/* Back to News */}
      <div className='mb-8'>
        <Link
          href='/news'
          className='group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0A6FA7] transition-all'
        >
          <div className='p-1.5 rounded-full bg-gray-100 group-hover:bg-[#0A6FA7] group-hover:text-white transition-all'>
            <FaArrowLeft className='w-3 h-3' />
          </div>
          <span>Back to News</span>
        </Link>
      </div>

      {/* Category Badge & Date */}
      <div className='flex items-center gap-3 mb-6'>
        <span className='bg-[#0A6FA7] text-white text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full'>
          News
        </span>
        <span className='w-1.5 h-1.5 rounded-full bg-gray-300'></span>
        <span className='text-gray-500 text-xs md:text-sm font-medium'>
          {news?.createdAt ? formatDate(news.createdAt) : ''}
        </span>
      </div>

      {/* Title */}
      <h1 className='font-black text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-[1.15] mb-8'>
        {news?.title}
      </h1>

      {/* Author Section */}
      {(news?.newsAuthor || news?.author) && (
        <div className='flex items-center gap-4 mb-10'>
          <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-200'>
            {news?.newsAuthor?.firstName?.[0] ||
              news?.author?.firstName?.[0] ||
              'A'}
          </div>
          <div className='flex flex-col'>
            <span className='text-sm md:text-base font-bold text-gray-900'>
              {news?.newsAuthor?.firstName || news?.author?.firstName}{' '}
              {news?.newsAuthor?.lastName || news?.author?.lastName}
            </span>
            <span className='text-[11px] md:text-xs text-gray-500 uppercase tracking-wider font-semibold'>
              Published by MeroUni Team
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hero
