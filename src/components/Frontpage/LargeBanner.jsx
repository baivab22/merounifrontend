import React from 'react'
import Image from 'next/image'

const LargeBanner = () => {
  return (
    <div className='bg-transparent py-4 md:py-6'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='relative w-full h-24 sm:h-28 md:h-32 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shadow-sm'>
          <Image
            src='https://media.edusanjal.com/bfs/edupatra-banner_RHpsuBl.webp'
            alt='Advertisement'
            fill
            sizes="100vw"
            className='object-contain transition-transform duration-500 hover:scale-[1.01]'
            priority
          />
        </div>
      </div>
    </div>
  )
}

export default LargeBanner
