'use client'
import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../../../components/Frontpage/Navbar'
import Header from '../../../components/Frontpage/Header'
import Footer from '../../../components/Frontpage/Footer'
import ImageSection from './components/upperSection'
import CollegeOverview from './components/NewCollegeOverview'
import RelatedColleges from './components/RelatedColleges'
import ShareSection from '@/ui/organisms/common/ShareSection'
import MobileCategoryPills from './components/MobileCategoryPills'

const CollegeContent = ({ college }) => {
  const [isRelatedVisible, setIsRelatedVisible] = useState(false)
  const relatedRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsRelatedVisible(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before reaching the section
      }
    )

    if (relatedRef.current) {
      observer.observe(relatedRef.current)
    }

    return () => {
      if (relatedRef.current) {
        observer.unobserve(relatedRef.current)
      }
    }
  }, [])

  return (
    <div className='relative min-h-screen bg-[#F8FAFC]'>
      <Header />
      <Navbar />
      <MobileCategoryPills college={college} />
      <ImageSection college={college} />
      <div className='h-4 md:h-6' />
      <CollegeOverview college={college} />

      <div ref={relatedRef}>
        <RelatedColleges college={college} />
      </div>

      {/* Share Section - Hidden when related colleges are visible */}
      <ShareSection
        title={college?.name}
        type='college'
        isVisible={!isRelatedVisible}
      />

      <Footer />
    </div>
  )
}

export default CollegeContent
