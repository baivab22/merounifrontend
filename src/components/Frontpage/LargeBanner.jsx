import React from 'react'
import Image from 'next/image'

const LargeBanner = () => {
  return (
    <div className='bg-gray-100 py-8'>
      <div className='container mx-auto px-4'>
        <div className='relative w-full h-32 overflow-hidden rounded-md'>
          <Image
            src='https://media.edusanjal.com/bfs/edupatra-banner_RHpsuBl.webp'
            alt='Advertisement'
            fill
            className='object-cover'
          />
        </div>
      </div>
    </div>
  )
}

export default LargeBanner
