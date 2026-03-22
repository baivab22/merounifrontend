import React from 'react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import EmptyState from '@/ui/shadcn/EmptyState'
import Link from 'next/link'
import Image from 'next/image'
import { getRankingsByDegreeSlug } from '../actions'
import { Trophy, ArrowLeft, Building2, MapPin } from 'lucide-react'
import { cn } from '@/app/lib/utils'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  try {
    const rankingGroup = await getRankingsByDegreeSlug(decodedSlug)

    if (!rankingGroup?.degree) {
      return { title: 'Rankings Not Found | MeroUni' }
    }

    const title = `Top ${rankingGroup.degree.title} Colleges in Nepal | MeroUni`
    const description = rankingGroup.description || `Explore the best colleges offering ${rankingGroup.degree.title} in Nepal. Compare rankings, programs, and facilities.`

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        url: `https://merouni.com/college-rankings/${slug}`,
        type: 'website',
        siteName: 'MeroUni'
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
      }
    }
  } catch (error) {
    return { title: 'College Rankings | MeroUni' }
  }
}

export default async function CollegeRankingDetailPage({ params }) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const rankingGroup = await getRankingsByDegreeSlug(decodedSlug)

  if (!rankingGroup?.degree || !rankingGroup?.rankings?.length) {
    return (
      <div className='min-h-screen flex flex-col'>
        <Header />
        <Navbar />
        <main className='flex-1 flex items-center justify-center p-8 bg-gray-50'>
          <EmptyState
            icon={Trophy}
            title='Rankings Not Found'
            description='We could not find college rankings for this degree.'
            action={{ label: 'Go Back Home', onClick: '/' }}
          />
        </main>
        <Footer />
      </div>
    )
  }

  const { degree, description, rankings } = rankingGroup

  return (
    <div className='min-h-screen flex flex-col bg-gray-50 font-sans'>
      <Header />
      <Navbar />

      <main className='flex-1'>
        {/* Hero Section */}
        <div className='bg-white border-b border-gray-200 py-8 md:py-12'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl'>
            <Link
              href='/'
              className='inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0A6FA7] mb-6 transition-colors'
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Rankings
            </Link>

            <div className='flex items-center gap-4 mb-6'>
              <div className='p-3 rounded-2xl bg-orange-100 text-orange-600 shadow-sm shadow-orange-100/50'>
                <Trophy className='w-6 h-6' />
              </div>
              <h1 className='text-3xl md:text-4xl font-black text-gray-900 leading-tight'>
                Top Colleges for <span className='text-[#0A6FA7]'>{degree.title}</span>
              </h1>
            </div>

            {description && (
              <p className='text-lg text-gray-600 leading-relaxed max-w-3xl border-l-4 border-[#0A6FA7] pl-4 mt-6'>
                {description}
              </p>
            )}

            <div className='flex items-center gap-6 mt-10'>
              <div className='px-4 py-2 rounded-xl bg-blue-50/50 text-blue-700 text-xs font-bold border border-blue-100 uppercase tracking-widest'>
                {rankings.length} Colleges Featured
              </div>
              <Link
                href={`/degree/${degree.slug || ''}`}
                className='text-sm font-bold text-[#0A6FA7] hover:text-[#085a86] transition-colors flex items-center gap-1 group/link'
              >
                <span>View Degree</span>
                <span className='group-hover/link:translate-x-1 transition-transform'>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Rankings List */}
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-6'>
          <div className='space-y-4'>
            {rankings.map((ranking) => {
              const college = ranking.college
              if (!college) return null

              const isTopThree = ranking.rank <= 3

              return (
                <Link
                  key={ranking.id}
                  href={`/colleges/${college.slugs || ''}`}
                  className='group block bg-white rounded-3xl p-6 transition-all duration-300 border border-gray-100 hover:border-[#0A6FA7] hover:shadow-2xl hover:shadow-[#0A6FA7]/10'
                >
                  <div className='flex flex-col sm:flex-row items-center gap-6 md:gap-8'>

                    {/* Rank Badge */}
                    <div className={cn(
                      'flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center font-black text-xl md:text-2xl shadow-sm border',
                      ranking.rank === 1 ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-700 border-yellow-200 shadow-yellow-100' :
                        ranking.rank === 2 ? 'bg-gradient-to-br from-gray-200 to-gray-100 text-gray-700 border-gray-300 shadow-gray-200' :
                          ranking.rank === 3 ? 'bg-gradient-to-br from-orange-200 to-orange-100 text-orange-800 border-orange-300 shadow-orange-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                    )}>
                      #{ranking.rank}
                    </div>

                    {/* College Info */}
                    <div className='flex flex-1 items-center gap-4 md:gap-6 min-w-0'>

                      {/* Logo */}
                      <div className='hidden sm:flex flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-gray-50 bg-white p-2.5 items-center justify-center shadow-sm overflow-hidden group-hover:scale-[1.02] transition-transform duration-300'>
                        {college.college_logo ? (
                          <div className='relative w-full h-full'>
                            <Image
                              src={college.college_logo}
                              alt={`${college.name} logo`}
                              fill
                              className='object-contain'
                            />
                          </div>
                        ) : (
                          <Building2 className='w-8 h-8 text-gray-300' />
                        )}
                      </div>

                      {/* Name & Location */}
                      <div className='flex flex-col flex-1 min-w-0'>
                        <h2 className='text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#0A6FA7] transition-colors truncate'>
                          {college.name}
                        </h2>

                        {college.collegeAddress && (
                          <div className='flex items-center text-sm font-medium text-gray-400 mt-2'>
                            <MapPin className='w-4 h-4 mr-1.5 text-[#0A6FA7]/50' />
                            <span>
                              {college.collegeAddress.city}{college.collegeAddress.state ? `, ${college.collegeAddress.state}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className='hidden lg:flex flex-shrink-0 ml-auto'>
                      <span className='inline-flex items-center justify-center px-8 py-3 rounded-2xl bg-gray-50 text-[#0A6FA7] font-bold text-sm tracking-wide group-hover:bg-[#0A6FA7] group-hover:text-white group-hover:shadow-xl group-hover:shadow-[#0A6FA7]/20 transition-all duration-300'>
                        Explore
                      </span>
                    </div>

                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
