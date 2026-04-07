'use client'
import React from 'react'
import Navbar from '../../../components/Frontpage/Navbar'
import Header from '../../../components/Frontpage/Header'
import Footer from '../../../components/Frontpage/Footer'
import ImageSection from './components/upperSection'
import CollegeOverview from './components/NewCollegeOverview'
import ApplyNow from './components/applyNow'
import RelatedColleges from './components/RelatedColleges'
import ShareSection from '@/ui/organisms/common/ShareSection'
import MobileCategoryPills from './components/MobileCategoryPills'

import StickyCTA from './components/StickyCTA'

const CollegeContent = ({ college }) => {
  return (
    <div className='relative min-h-screen bg-[#F8FAFC]'>
      <Header />
      <Navbar />
      <MobileCategoryPills college={college} />
      <ImageSection college={college} />
      <div className='h-4 md:h-6' />
      <CollegeOverview college={college} />
      <ApplyNow college={college} />
      <RelatedColleges college={college} />

      {/* Share Section - Bottom Center */}
      <ShareSection title={college?.name} type='college' />

      {/* Sticky CTA - Visible on scroll */}
      <StickyCTA college={college} />

      <Footer />
    </div>
  )
}

export default CollegeContent
