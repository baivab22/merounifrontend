import React from 'react'
import HTMLRenderer from '@/ui/HTMLRenderer'

const Description = ({ blog }) => {
  return (
    <div className='mb-10'>
      {/* Blog Thumbnail Image */}
      {blog?.featured_image && (
        <div className="w-full mb-8">
          <img
            src={blog.featured_image}
            alt={blog?.title}
            className="w-full h-auto rounded-2xl object-cover shadow-lg border border-gray-100"
          />
        </div>
      )}
      {/* Main Blog Content */}
      <HTMLRenderer html={blog?.content} />
    </div>
  )
}

export default Description

