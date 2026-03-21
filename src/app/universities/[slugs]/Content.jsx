'use client'
import React from 'react'
import Footer from '../../../components/Frontpage/Footer'
import Header from '../../../components/Frontpage/Header'
import Navbar from '../../../components/Frontpage/Navbar'
import RelatedUniversities from './components/RelatedUniversities'
import ShareSection from '@/ui/organisms/common/ShareSection'
import UpperSection from './components/upperSection'

const UniversityContent = ({ university }) => {
  return (
    <div className='bg-white min-h-screen'>
      <Header />
      <Navbar />
      {!university ? (
        <div className='min-h-screen flex items-center justify-center font-bold'>
            No university data available.
        </div>
      ) : (
        
        <>
          <UpperSection university={university} />
          <RelatedUniversities university={university} />
          <ShareSection title={university?.name} type='university' />
        </>
      )}
      <Footer />
    </div>
  )
}

export default UniversityContent
