import React from 'react'
import HTMLRenderer from '@/ui/HTMLRenderer'

const Description = ({ blog }) => {
  const hasFeatured = !!blog?.featured_image
  const hasContent = !!blog?.content

  if (!hasFeatured && !hasContent) {
    return null
  }

  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='w-1.5 h-6 bg-[#0A6FA7] rounded-full' />
        <h2 className='text-xl font-bold text-gray-900'>Description & Overview</h2>
      </div>

      {hasFeatured && (
        <div className='w-full mb-8'>
          <img
            src={blog.featured_image}
            alt={blog?.title || ''}
            className='w-full h-auto rounded-xl object-cover border border-gray-100 shadow-sm'
          />
        </div>
      )}

      {hasContent && <HTMLRenderer html={blog.content} className='mt-0' />}
    </div>
  )
}

export default Description
