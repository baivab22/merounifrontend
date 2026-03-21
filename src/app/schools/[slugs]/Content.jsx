'use client'
import React from 'react'
import Navbar from '../../../components/Frontpage/Navbar'
import Header from '../../../components/Frontpage/Header'
import Footer from '../../../components/Frontpage/Footer'
import ImageSection from './components/upperSection'
import ApplyNow from './components/applyNow'
import RelatedSchool from './components/RelatedSchool'
import SchoolOverview from './components/SchoolOverview'
import ShareSection from '@/ui/organisms/common/ShareSection'

const SchoolContent = ({ college }) => {
  return (
    <div>
      <Header />
      <Navbar />
      <ImageSection college={college} />
      <div className='h-4 md:h-6' />
      <SchoolOverview college={college} />
      <ApplyNow college={college} />
      <RelatedSchool school={college} />
      <ShareSection 
        title={college?.name}
        type='School'
      />
      <Footer />
    </div>
  )
}

export default SchoolContent
