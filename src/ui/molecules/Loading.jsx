import React from 'react'
import Image from 'next/image'
import CircularLoader from './CircularLoader'

const Loader = ({ fullPage = true }) => {
  return (
    <div className={`flex flex-col justify-center items-center gap-4 ${fullPage ? 'h-screen' : 'py-12'}`}>
      <div className='relative w-24 h-12 md:w-32 md:h-16 animate-pulse'>
        <Image 
          src='/images/logo.png' 
          alt='MeroUni' 
          fill 
          className='object-contain' 
          priority
        />
      </div>
      <CircularLoader size='w-8 h-8' />
    </div>
  )
}

export default Loader
