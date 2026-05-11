import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OverviewSection from './sections/OverviewSection'
import ProgramSection from './sections/ProgramSection'
import LevelSection from './sections/LevelSection'
import MemberSection from './sections/MemberSection'
import GallerySection from './sections/GallerySection'
import GoogleMap from './GoogleMap'

const UniversityOverview = ({ university }) => {
  const overviewRef = useRef(null)
  const programsRef = useRef(null)
  const levelsRef = useRef(null)
  const membersRef = useRef(null)
  const galleryRef = useRef(null)

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
      visible:
        university?.gallery?.length > 0 || university?.videos?.length > 0,
      ref: galleryRef,
      component: <GallerySection university={university} />
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
    <section className='px-4 sm:px-8 md:px-12 lg:px-24 mb-32 flex flex-col md:flex-row gap-8 lg:gap-16 w-full items-start'>
      {/* Sidebar Navigation */}
      {visibleSections.length > 0 && (
        <aside className='w-full md:w-48 lg:w-56 md:sticky md:top-32 flex-shrink-0'>
          <div className='hidden md:flex items-center gap-3 mb-8 px-1'>
            <div className='w-1.5 h-6 bg-gradient-to-b from-[#0A6FA7] to-[#30AD8F] rounded-full' />
            <p className='text-xs font-bold uppercase tracking-widest text-gray-400'>Contents</p>
          </div>

          <ul className='hidden md:flex md:flex-col gap-1 md:overflow-y-auto no-scrollbar md:pb-0'>
            {visibleSections?.map((section, index) => (
              <motion.li
                key={index}
                whileHover={{ x: 4 }}
                onClick={() => handleScroll(index)}
                className={`text-sm font-bold cursor-pointer whitespace-nowrap px-4 py-2.5 md:px-2 transition-all relative flex items-center gap-3 ${activeSection === index
                    ? 'text-[#0A6FA7]'
                    : 'text-gray-400 hover:text-gray-900'
                  }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  activeSection === index ? 'bg-[#0A6FA7] scale-125 shadow-[0_0_8px_rgba(10,111,167,0.5)]' : 'bg-transparent scale-0'
                }`} />
                {section.name}
              </motion.li>
            ))}
          </ul>

          {/* Mobile Navigation Pills */}
          <ul className='flex flex-row md:hidden gap-2 overflow-x-auto no-scrollbar pb-4 border-b border-gray-100'>
            {visibleSections?.map((section, index) => (
              <li
                key={index}
                onClick={() => handleScroll(index)}
                className={`text-xs font-bold cursor-pointer whitespace-nowrap px-4 py-2 rounded-full transition-all ${
                  activeSection === index
                    ? 'bg-[#0A6FA7] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {section.name}
              </li>
            ))}
          </ul>
        </aside>
      )}

      {/* Main Content */}
      <div className='flex-1 w-full space-y-24 md:space-y-32'>
        <AnimatePresence mode='wait'>
          {visibleSections?.map((section, index) => (
            <motion.div
              key={index}
              id={section.name.toLowerCase()}
              className='scroll-mt-32'
              ref={section.ref}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              {section.component}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Mobile/Tablet Map & Address */}
        {(hasMap || hasAddress) && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='xl:hidden w-full pt-8'
          >
            <div className='bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl shadow-gray-200/50'>
              {hasMap && (
                <div className='mb-10'>
                  <p className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3'>
                    <span className='w-1.5 h-4 bg-[#30AD8F] rounded-full' />
                    Location Map
                  </p>
                  <div className='w-full h-56 rounded-3xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50'>
                    <GoogleMap mapUrl={university.map} />
                  </div>
                </div>
              )}
              {hasAddress && (
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3'>
                    <span className='w-1.5 h-4 bg-[#0A6FA7] rounded-full' />
                    Office Address
                  </p>
                  <div className='bg-gray-50/50 p-6 rounded-3xl border border-gray-100'>
                    <p className='text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2'>
                      Street & City
                    </p>
                    <p className='text-base text-gray-900 font-bold leading-snug'>
                      {[university?.street, university?.city]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </p>
                    {(university?.state ||
                      university?.postal_code ||
                      university?.country) && (
                      <p className='text-sm text-gray-500 mt-2 font-medium'>
                        {[
                          university?.state,
                          university?.postal_code,
                          university?.country
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Right sidebar - Map & Address (desktop xl only) */}
      {(hasMap || hasAddress) && (
        <aside className='w-full md:w-64 lg:w-80 md:sticky md:top-32 flex-shrink-0 hidden xl:block'>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className='bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl shadow-gray-200/50'
          >
            {hasMap && (
              <div className='mb-10'>
                <p className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3'>
                  <span className='w-1.5 h-4 bg-[#30AD8F] rounded-full' />
                  Location Map
                </p>
                <div className='w-full h-56 rounded-3xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50'>
                  <GoogleMap mapUrl={university.map} />
                </div>
              </div>
            )}
            {hasAddress && (
              <div>
                <p className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-3'>
                  <span className='w-1.5 h-4 bg-[#0A6FA7] rounded-full' />
                  Office Address
                </p>
                <div className='bg-gray-50/50 p-6 rounded-3xl border border-gray-100'>
                  <p className='text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2'>
                    Street & City
                  </p>
                  <div className='space-y-1'>
                    <p className='text-sm text-gray-900 font-bold leading-normal'>
                      {[university?.street, university?.city]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </p>
                    {(university?.state ||
                      university?.postal_code ||
                      university?.country) && (
                      <p className='text-xs text-gray-500 font-medium'>
                        {[
                          university?.state,
                          university?.postal_code,
                          university?.country
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </aside>
      )}
    </section>
  )
}

export default UniversityOverview
