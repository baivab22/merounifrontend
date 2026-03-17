import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import BannerLayout from '@/components/Frontpage/BannerLayout'
import SideBanner from '@/components/Frontpage/SideBanner'
import FeaturedAdmission from '@/components/Frontpage/FeaturedAdmission'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import ScrollToTop from '@/ui/molecules/common/ScrollToTop'

// Dynamically import below-the-fold components
const DisciplineList = dynamic(() => import('@/components/Frontpage/DisciplineList'))
const Event = dynamic(() => import('@/components/Frontpage/Event'))
const FeaturedDegree = dynamic(() => import('@/components/Frontpage/FeaturedDegree'))
const CollegeRankings = dynamic(() => import('@/components/Frontpage/CollegeRankings'))
const Footer = dynamic(() => import('@/components/Frontpage/Footer'))

const Page = async () => {
  let banners = []

  try {
    const response = await fetch(`${process.env.baseUrl}/banner?type=FRONT_PAGE&limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (response.ok) {
      const data = await response.json()
      banners = data.items || []
    }
  } catch (error) {
    console.error('Error fetching banners:', error)
  }

  return (
    <div className='min-h-screen bg-white'>
      <Header />
      <Navbar />

      <div className='py-2 md:py-4'>
        <div className='container px-4 sm:px-6 md:px-8 mx-auto'>
          {/* Main Banner */}
          <BannerLayout banners={banners} />

          <div className='flex gap-4 md:gap-6'>
            {/* Featured Admission Section */}
            <div className='flex flex-col md:w-4/5 w-full sm:w-full'>
              <FeaturedAdmission />
            </div>

            {/* Desktop Side Banner */}
            <div className='w-full md:w-1/5 hidden md:block mt-4 md:mt-6'>
              <SideBanner banners={banners} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Side Banner */}
      <div className='w-full md:w-1/5 block md:hidden mt-4 px-4'>
        <SideBanner banners={banners} />
      </div>

      {/* Below the fold sections in original order */}
      <div className='container mx-auto px-4 sm:px-6 md:px-8 mb-20'>
        <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-md my-8" />}>
          <CollegeRankings />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-md my-8" />}>
          <Event />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-md my-8" />}>
          <FeaturedDegree />
        </Suspense>

        <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded-2xl my-8" />}>
          <DisciplineList />
        </Suspense>
      </div>

      {/* Footer - Dynamic */}
      <Suspense fallback={<div className="h-64 bg-gray-100" />}>
        <Footer />
      </Suspense>

      <ScrollToTop />
    </div>
  )
}

export default Page
