'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/utils/date.util'

/**
 * Reusable blog card. Accepts either a `blog` object or flat props.
 */
const BlogCard = ({
  blog: blogProp,
  image: imageProp,
  date: dateProp,
  title: titleProp,
  description: descriptionProp,
  slug: slugProp
}) => {
  const slug = blogProp?.slug ?? slugProp
  const image =
    blogProp?.featuredImage ?? blogProp?.featured_image ?? imageProp ?? '/images/logo.png'
  const title = blogProp?.title ?? titleProp ?? ''
  const description = blogProp?.description ?? descriptionProp ?? ''
  
  // Use the utility to format the date
  const rawDate = blogProp?.createdAt ?? blogProp?.created_at ?? blogProp?.date ?? dateProp
  const date = (rawDate && rawDate !== dateProp) ? formatDate(rawDate) : (dateProp || '')


  return (
    <div className='group bg-white rounded-md shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-100 overflow-hidden h-full flex flex-col'>
      <div className='aspect-video relative overflow-hidden bg-gray-100'>
        <img
          src={image}
          alt={`${title} thumbnail`}
          className='w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500'
        />
        <div className='absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300' />
      </div>

      <div className='p-5 flex flex-col flex-grow'>
        <div className='flex justify-between items-center mb-3'>
          <span className='bg-blue-50 text-[#0A70A7] text-xs font-semibold px-2.5 py-1 rounded-full'>
            Blog
          </span>
          {date && (
            <span className='text-gray-400 text-xs font-medium'>{date}</span>
          )}
        </div>

        <h2 className='text-lg font-semibold text-gray-800 mb-3 leading-tight line-clamp-2 group-hover:text-[#0A70A7] transition-colors'>
          {title}
        </h2>

        <p className='text-gray-600 text-sm mb-4 line-clamp-3 flex-grow'>
          {description}
        </p>

        <div className='pt-4 mt-auto border-t border-gray-100 flex items-center justify-between'>
          <Link
            href={`/blogs/${slug}`}
            className='flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#0A70A7] transition-all duration-300'
          >
            <span>View details</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BlogCard
