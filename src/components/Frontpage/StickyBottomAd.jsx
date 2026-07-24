'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'


const HIDDEN_PREFIXES = [
  '/dashboard',
  '/sign-in',
  '/forgot-password',
  '/verify-otp',
  '/reset-password',
]

const LISTING_SECTIONS = [
  'blogs',
  'news',
  'events',
  'colleges',
  'top-colleges',
  'schools',
  'universities',
  'degree',
  'programs',
  'courses',
  'scholarship',
  'exams',
  'consultancy',
  'career',
  'vacancies',
  'vacancy',
  'short-term-courses',
  'admission',
  'materials',
  'watch',
]

export default function StickyBottomAd() {
  const pathname = usePathname()

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length >= 2 && LISTING_SECTIONS.includes(segments[0])) return null

  return (
    <div className='fixed bottom-0 left-1/2 -translate-x-1/2 z-50 pointer-events-auto pb-3 px-4 w-[95%] flex justify-center md:w-[40%]'>
      <div className='relative w-full'>
        <a href='https://www.padmashreecollege.edu.np/' target='_blank' rel='noopener noreferrer'>
          <Image
            src='/images/bottomcentralad.gif'
            alt='Advertisement'
            width={600}
            height={150}
            className='w-full h-auto rounded-lg shadow-lg'
            unoptimized
            priority
          />
        </a>
      </div>
    </div>
  )
}
