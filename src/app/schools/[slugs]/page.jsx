'use client'

import React, { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import Navbar from '../../../components/Frontpage/Navbar'
import Header from '../../../components/Frontpage/Header'
import Footer from '../../../components/Frontpage/Footer'
import ImageSection from './components/upperSection'
import ApplyNow from './components/applyNow'
import RelatedSchool from './components/RelatedSchool'
import Loading from '../../../ui/molecules/Loading'
import SchoolOverview from './components/SchoolOverview'
import ShareSection from '@/ui/organisms/common/ShareSection'


const CollegeDetailPage = ({ params }) => {
  const [college, setCollege] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSlugAndCollegeDetails = async () => {
      try {
        const resolvedParams = await params
        const slugs = resolvedParams.slugs
        fetchCollegeDetails(slugs)
      } catch (error) {
        console.error('Error resolving params:', error)
      }
    }
    fetchSlugAndCollegeDetails()
  }, [])

  const fetchCollegeDetails = async (slugs) => {
    if (typeof window === 'undefined') return

    try {
      // Use direct fetch instead of server action to avoid SSR issues
      const response = await fetch(
        `${process.env.baseUrl}/college/${slugs}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch college details: ${response.statusText}`
        )
      }

      const data = await response.json()
      const collegeData = data.item

      if (collegeData) {
        setCollege(collegeData)
      } else {
        setError('No data found')
      }
    } catch (error) {
      console.error('Error fetching college details:', error)
      setError(error.message || 'Failed to load college details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    notFound()
  }

  if (!college) {
    notFound()
  }

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

export default CollegeDetailPage
