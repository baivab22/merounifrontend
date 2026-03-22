import React from 'react'
import HTMLRenderer from '@/ui/HTMLRenderer'

const Description = ({ blog }) => {
  return (
    <div className='mb-10'>
      {/* Main Blog Content */}
      <HTMLRenderer html={blog?.content} />
    </div>
  )
}

export default Description

