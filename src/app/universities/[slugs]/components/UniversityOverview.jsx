import React, { useRef, useState, useEffect } from 'react'
import OverviewSection from './sections/OverviewSection'
import ProgramSection from './sections/ProgramSection'
import LevelSection from './sections/LevelSection'
import MemberSection from './sections/MemberSection'
import GallerySection from './sections/GallerySection'
import VideoSection from './sections/VideoSection'
import GoogleMap from './GoogleMap'

const UniversityOverview = ({ university }) => {
  const overviewRef = useRef(null)
  const programsRef = useRef(null)
  const levelsRef = useRef(null)
  const membersRef = useRef(null)
  const galleryRef = useRef(null)
  const videosRef = useRef(null)

  const [activeSection, setActiveSection] = useState(0)

  const validMembers = (university?.members || []).filter(
    (member) =>
      member.name?.trim() ||
      member.role?.trim() ||
      member.phone?.trim() ||
      member.email?.trim()
  )

  const hasAddress = !!(
    university?.country ||
    university?.state ||
    university?.city ||
    university?.street ||
    university?.postal_code
  )
  const hasMap = !!university?.map

  const allSections = [
    {
      name: 'Overview',
      visible: !!university?.description,
      ref: overviewRef,
      component: <OverviewSection university={university} />
    },
    {
      name: 'Programs',
      visible: university?.programs?.length > 0,
      ref: programsRef,
      component: <ProgramSection university={university} />
    },
    {
      name: 'Levels',
      visible: university?.levels?.length > 0,
      ref: levelsRef,
      component: <LevelSection university={university} />
    },
    {
      name: 'Members',
      visible: validMembers.length > 0,
      ref: membersRef,
      component: <MemberSection university={university} />
    },
    {
      name: 'Gallery',
      visible: university?.gallery?.length > 0,
      ref: galleryRef,
      component: <GallerySection university={university} />
    },
    {
      name: 'Videos',
      visible: university?.videos?.length > 0,
      ref: videosRef,
      component: <VideoSection university={university} />
    }
  ]

  const visibleSections = allSections.filter((section) => section.visible)

  const handleScroll = (index) => {
    const target = visibleSections[index].ref.current
    if (!target) return
    const headerOffset = 100
    const elementPosition = target.getBoundingClientRect().top + window.scrollY
    const offsetPosition = elementPosition - headerOffset

    setActiveSection(index)
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 120

      for (let i = visibleSections.length - 1; i >= 0; i--) {
        const section = visibleSections[i]
        const element = section.ref.current

        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          const elementBottom = elementTop + rect.height

          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setActiveSection(i)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScrollSpy)
    handleScrollSpy()

    return () => {
      window.removeEventListener('scroll', handleScrollSpy)
    }
  }, [visibleSections])

  return (
    <section className='px-4 sm:px-8 md:px-12 lg:px-24 mb-20 flex flex-col md:flex-row gap-8 lg:gap-16 w-full items-start'>
      {/* Sidebar Navigation */}
      {visibleSections.length > 0 && (
        <aside className='w-full md:w-48 lg:w-56 md:sticky md:top-32 flex-shrink-0'>
          <div className='hidden md:flex items-center gap-2 mb-6'>
            <div className='w-1 h-5 bg-[#0A6FA7] rounded-full' />
            <p className='text-sm font-medium text-gray-900'>University Details</p>
          </div>

          <ul className='flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar pb-4 md:pb-0 border-b md:border-b-0 border-gray-100'>
            {visibleSections?.map((section, index) => (
              <li
                key={index}
                onClick={() => handleScroll(index)}
                className={`text-sm font-medium cursor-pointer whitespace-nowrap px-4 py-2 md:px-0 md:py-2.5 transition-all relative group ${
                  activeSection === index
                    ? 'text-[#0A6FA7]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {section.name}
                {activeSection === index && (
                  <span className='absolute bottom-0 left-4 right-4 h-0.5 bg-[#0A6FA7] md:hidden'></span>
                )}
                {activeSection === index && (
                  <span className='absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-4 bg-[#0A6FA7] rounded-full hidden md:block'></span>
                )}
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Main Content */}
      <div className='flex-1 w-full space-y-16 md:space-y-24'>
        {visibleSections?.map((section, index) => (
          <div key={index} className='scroll-mt-32' ref={section.ref}>
            {section.component}
          </div>
        ))}

        {/* Mobile/Tablet Map & Address */}
        {(hasMap || hasAddress) && (
          <div className='xl:hidden w-full pt-4'>
            <div className='bg-gray-50/30 rounded-3xl p-6 border border-gray-100/50'>
              {hasMap && (
                <div className='mb-6'>
                  <p className='text-sm font-medium text-gray-900 mb-4 flex items-center gap-2'>
                    <span className='w-1 h-4 bg-[#30AD8F] rounded-full' />
                    Location Map
                  </p>
                  <div className='w-full h-44 rounded-2xl overflow-hidden border border-white bg-white'>
                    <GoogleMap mapUrl={university.map} />
                  </div>
                </div>
              )}
              {hasAddress && (
                <div>
                  <p className='text-sm font-medium text-gray-900 mb-4 flex items-center gap-2'>
                    <span className='w-1 h-4 bg-[#0A6FA7] rounded-full' />
                    University Address
                  </p>
                  <div className='space-y-3'>
                    <div className='bg-white/80 p-4 rounded-2xl border border-gray-100'>
                      <p className='text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1'>
                        Street & City
                      </p>
                      <p className='text-sm text-gray-700 leading-snug font-medium'>
                        {[university?.street, university?.city]
                          .filter(Boolean)
                          .join(', ') || '—'}
                      </p>
                      {(university?.state || university?.postal_code || university?.country) && (
                        <p className='text-xs text-gray-500 mt-1 font-medium'>
                          {[university?.state, university?.postal_code, university?.country]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Map & Address Sidebar */}
      {(hasMap || hasAddress) && (
        <aside className='w-full md:w-64 lg:w-72 md:sticky md:top-32 flex-shrink-0 hidden xl:block'>
          <div className='bg-gray-50/30 rounded-3xl p-6 border border-gray-100/50 shadow-sm'>
            {hasMap && (
              <div className='mb-8'>
                <p className='text-sm font-medium text-gray-900 mb-4 flex items-center gap-2'>
                  <span className='w-1 h-4 bg-[#30AD8F] rounded-full' />
                  Location Map
                </p>
                <div className='w-full h-44 rounded-2xl overflow-hidden border border-white bg-white shadow-sm'>
                  <GoogleMap mapUrl={university.map} />
                </div>
              </div>
            )}
            {hasAddress && (
              <div>
                <p className='text-sm font-medium text-gray-900 mb-4 flex items-center gap-2'>
                  <span className='w-1 h-4 bg-[#0A6FA7] rounded-full' />
                  University Address
                </p>
                <div className='space-y-3'>
                  <div className='bg-white/80 p-4 rounded-2xl border border-gray-100 shadow-sm'>
                    <p className='text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1'>
                      Street & City
                    </p>
                    <p className='text-sm text-gray-700 leading-snug font-medium'>
                      {[university?.street, university?.city]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </p>
                    {(university?.state || university?.postal_code || university?.country) && (
                      <p className='text-xs text-gray-500 mt-1 font-medium'>
                        {[university?.state, university?.postal_code, university?.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </section>
  )
}

export default UniversityOverview
