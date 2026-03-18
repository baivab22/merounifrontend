import React from 'react'
import HTMLRenderer from '@/ui/HTMLRenderer'

const Description = ({ blog }) => {
  return (
    <div className='mb-10'>
      {/* Blog Introduction/Description */}
      {blog?.description && (
        <HTMLRenderer
          html={blog.description}
          className="mb-10 [&_p]:text-gray-700 [&_p]:text-lg md:[&_p]:text-xl"
        />
      )}

      {/* Main Blog Content */}
      <HTMLRenderer html={blog?.content} />
    </div>
  )
}

export default Description

