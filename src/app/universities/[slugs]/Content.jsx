'use client'
import React from 'react'
import Footer from '../../../components/Frontpage/Footer'
import Header from '../../../components/Frontpage/Header'
import Navbar from '../../../components/Frontpage/Navbar'
import RelatedUniversities from './components/RelatedUniversities'
import ShareSection from '@/ui/organisms/common/ShareSection'
import UpperSection from './components/upperSection'
import UniversityOverview from './components/UniversityOverview'

const UniversityContent = ({ university }) => {
  return (
    <div>
      <Header />
      <Navbar />
      {!university ? (
        <div className='min-h-screen flex items-center justify-center font-bold'>
          No university data available.
        </div>
      ) : (
        <>
          <UpperSection university={university} />
          <div className='h-4 md:h-6' />
          <UniversityOverview university={university} />
          <RelatedUniversities university={university} />

          {/* Share Section - Bottom Center */}
          <ShareSection title={university?.fullname} type='university' />
        </>
      )}
      <Footer />
    </div>
  )
}

export default UniversityContent
