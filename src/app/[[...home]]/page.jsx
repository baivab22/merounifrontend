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

export const metadata = {
  title: 'Merouni: Search, Compare and Choose Your Best Education Path',
  description: 'Explore Nepal’s colleges, courses, scholarships and education opportunities on Merouni. Compare options, track admissions & results, and get smart guidance to shape your academic and career journey.',
  openGraph: {
    title: 'Merouni: Search, Compare and Choose Your Best Education Path',
    description: 'Explore Nepal’s colleges, courses, scholarships and education opportunities on Merouni. Compare options, track admissions & results, and get smart guidance to shape your academic and career journey.',
    url: 'https://merouni.com',
    type: 'website',
    siteName: 'MeroUni',
    images: [
      {
        url: 'https://merouni.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'MeroUni',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Merouni: Search, Compare and Choose Your Best Education Path',
    description: 'Explore Nepal’s colleges, courses, scholarships and education opportunities on Merouni.',
    images: ['https://merouni.com/images/logo.png'],
  }
}

const Page = async () => {
  let banners = []

  try {
    const response = await fetch(`${process.env.baseUrl}/banner?type=FRONT_PAGE&limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
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
            <div className='flex flex-col md:w-3/4 w-full sm:w-full'>
              <FeaturedAdmission />
            </div>

            {/* Desktop Side Banner */}
            <div className='w-full md:w-1/4 hidden md:block mt-4 md:mt-6'>
              <SideBanner banners={banners} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Side Banner */}
      <div className='w-full md:w-1/4 block md:hidden mt-4 px-4'>
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
