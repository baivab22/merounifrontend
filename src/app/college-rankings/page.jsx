import React from 'react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { getAllRankings } from './actions'
import { Trophy, ChevronRight, GraduationCap, Building2 } from 'lucide-react'

export const metadata = {
  title: 'College Rankings in Nepal | Compare Top Colleges',
  description:
    'Explore and compare top-ranked colleges in Nepal across various courses including BBA, MBA, Engineering, Medical, and more. Make informed decisions with MeroUni rankings.',
  openGraph: {
    title: 'College Rankings in Nepal | Compare Top Colleges',
    description:
      'Explore and compare top-ranked colleges in Nepal across various courses including BBA, MBA, Engineering, Medical, and more.',
    url: 'https://merouni.com/college-rankings',
    type: 'website',
    siteName: 'MeroUni'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'College Rankings in Nepal | Compare Top Colleges',
    description:
      'Explore and compare top-ranked colleges in Nepal across various courses including BBA, MBA, Engineering, Medical, and more.'
  }
}

export default async function CollegeRankingsPage() {
  const rankings = await getAllRankings()

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <Header />
      <Navbar />

      <main className='flex-1 py-10 md:py-16'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl'>
          {/* Hero Section */}
          <div className='text-center mb-12 md:mb-16'>
            <div className='inline-flex items-center justify-center p-3 rounded-2xl bg-[#0A6FA7]/10 text-[#0A6FA7] mb-6'>
              <Trophy className='w-8 h-8' />
            </div>
            <h1 className='text-3xl md:text-5xl font-black text-gray-900 mb-4'>
              College <span className='text-[#0A6FA7]'>Rankings</span>
            </h1>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Compare top colleges in Nepal categorized by academic programs.
              Find the best institution for your future career.
            </p>
          </div>

          {/* Rankings Grid */}
          {rankings.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
              {rankings.map((group) => {
                const { degree, rankings: degreeRankings } = group
                if (!degree) return null

                return (
                  <div
                    key={degree.id}
                    className='group bg-white rounded-3xl border border-gray-100 p-6 hover:border-[#0A6FA7] hover:shadow-2xl hover:shadow-[#0A6FA7]/10 transition-all duration-300'
                  >
                    <div className='flex items-start justify-between mb-6'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-xl bg-gray-50 group-hover:bg-[#0A6FA7]/10 transition-colors'>
                          <GraduationCap className='w-5 h-5 text-[#0A6FA7]' />
                        </div>
                        <h2 className='text-xl font-bold text-gray-900 group-hover:text-[#0A6FA7] transition-colors line-clamp-3 min-h-[4.5rem]'>
                          {degree.title}
                        </h2>
                      </div>
                    </div>

                    <div className='space-y-4 mb-8'>
                      {degreeRankings.slice(0, 3).map((r) => (
                        <div key={r.id} className='flex items-center gap-3'>
                          <span className='w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500'>
                            #{r.rank}
                          </span>
                          <span className='text-sm font-medium text-gray-700 truncate'>
                            {r.college?.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href={`/college-rankings/${group.slug || degree.slug || ''}`}
                      className='inline-flex items-center justify-center w-full py-3 px-6 rounded-2xl bg-gray-50 text-[#0A6FA7] font-bold text-sm group-hover:bg-[#0A6FA7] group-hover:text-white transition-all duration-300'
                    >
                      View All Rankings
                      <ChevronRight className='w-4 h-4 ml-2' />
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className='bg-white rounded-3xl p-12 text-center border border-gray-100'>
              <Building2 className='w-12 h-12 text-gray-200 mx-auto mb-4' />
              <p className='text-gray-500 font-medium'>
                No rankings available at the moment.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
