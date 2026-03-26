'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'

const CollegeRankingsClient = ({ rankings = [] }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef(null)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      window.addEventListener('resize', checkScrollButtons)
      return () => {
        container.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [rankings])

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -360 : 360,
      behavior: 'smooth'
    })
    setTimeout(checkScrollButtons, 150)
  }

  if (rankings.length === 0) {
    return null
  }

  return (
    <div className='py-8 md:py-10 bg-white'>
      <div className='mb-6'>
        <h2 className='text-lg md:text-xl font-bold text-gray-900'>
          College Rankings
        </h2>
      </div>

      <div className='relative group'>
          {canScrollLeft && (
            <button
              type='button'
              onClick={() => scroll('left')}
              className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-md border border-gray-200/80 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 md:opacity-100'
              aria-label='Scroll left'
            >
              <ChevronLeft className='w-5 h-5' />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className='flex gap-4 md:gap-5 overflow-x-auto scroll-smooth pb-2 hide-scrollbar'
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {rankings.map((degreeGroup) => {
              if (!degreeGroup?.degree || !degreeGroup?.rankings?.length) {
                return null
              }

              return (
                <div
                  key={degreeGroup.degree.id}
                  className='flex-shrink-0 w-[300px] sm:w-[320px] md:w-[360px] rounded-md border border-gray-200/80 bg-white overflow-hidden hover:border-gray-300 hover:shadow-md transition-all'
                >
                  <div className='px-5 pt-5 pb-3'>
                    <div className='flex items-start gap-2 mb-4'>
                      <div className='p-1.5 rounded-md bg-[#0A6FA7]/10 mt-0.5'>
                        <GraduationCap className='w-4 h-4 text-[#0A6FA7]' />
                      </div>
                      <h3 className='text-base font-semibold text-gray-900 line-clamp-2 h-12 flex items-center'>
                        {degreeGroup.degree.title || 'Degree'}
                      </h3>
                    </div>

                    <ul className='space-y-1.5 min-h-[355px]'>
                      {degreeGroup.rankings.slice(0, 5).map((ranking) => {
                        const college = ranking.college
                        if (!college) return null

                        return (
                          <li key={ranking.id}>
                            <Link
                              href={`/colleges/${college.slugs || ''}`}
                              className='flex items-center gap-3 py-2.5 px-3 rounded-md text-left hover:bg-gray-50 transition-colors -mx-1'
                            >
                              <span className='flex-shrink-0 w-7 h-7 rounded-md bg-gray-100 text-xs font-semibold text-gray-600 flex items-center justify-center'>
                                {ranking.rank}
                              </span>
                              {college.college_logo ? (
                                <div className='relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-50'>
                                  <Image
                                    src={college.college_logo}
                                    alt=''
                                    fill
                                    sizes="48px"
                                    className='object-contain'
                                  />
                                </div>
                              ) : (
                                <div className='w-12 h-12 rounded-md bg-gray-50 flex-shrink-0 flex items-center justify-center text-xs font-medium text-gray-400'>
                                  {college.name?.charAt(0) || '?'}
                                </div>
                              )}
                              <span className='flex-1 min-w-0 text-sm font-medium text-gray-700 truncate'>
                                {college.name || 'College'}
                              </span>
                              <ChevronRight className='w-4 h-4 text-gray-400 flex-shrink-0' />
                            </Link>
                          </li>
                        )
                      })}
                    </ul>

                    <div className='mt-2.5 pt-2 flex items-center justify-end'>
                      <Link
                        href={`/college-rankings/${degreeGroup.degree.slug || ''}`}
                        className='text-xs font-semibold text-[#0A6FA7] hover:text-[#064263] flex items-center transition-colors'
                      >
                        Explore All <ChevronRight className='w-3.5 h-3.5 ml-0.5' />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {canScrollRight && (
            <button
              type='button'
              onClick={() => scroll('right')}
              className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-md border border-gray-200/80 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 md:opacity-100'
              aria-label='Scroll right'
            >
              <ChevronRight className='w-5 h-5' />
            </button>
          )}
        </div>
      </div>
  )
}

export default CollegeRankingsClient
