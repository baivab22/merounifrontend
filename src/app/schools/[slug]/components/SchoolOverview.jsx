import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OverviewSection from './sections/OverviewSection'
import ProgramSection from './sections/ProgramSection'
import MemberSection from './sections/MemberSection'
import GoogleMap from './GoogleMap'
import GallerySection from './sections/GallerySection'
import FacilitySection from './sections/FacilitySection'
import FaqSection from './sections/FaqSection'

const SchoolOverview = ({ college }) => {
  const overviewRef = useRef(null)
  const programsRef = useRef(null)
  const membersRef = useRef(null)
  const galleryRef = useRef(null)
  const facilityRef = useRef(null)
  const faqsRef = useRef(null)
  const [activeSection, setActiveSection] = useState(0)

  const validMembers = (college.collegeMembers || []).filter(
    (member) =>
      member.name?.trim() ||
      member.role?.trim() ||
      member.contact_number?.trim() ||
      member.description?.trim()
  )

  const hasAddress = !!(
    college?.collegeAddress?.country ||
    college?.collegeAddress?.state ||
    college?.collegeAddress?.district ||
    college?.collegeAddress?.city ||
    college?.collegeAddress?.street ||
    college?.collegeAddress?.postal_code
  )
  const address = college?.collegeAddress || {}
  const hasMap = !!college?.google_map_url

  const allSections = [
    {
      name: 'Overview',
      visible: !!(college?.description || college?.content),
      ref: overviewRef,
      component: <OverviewSection college={college} />
    },
    {
      name: 'Programs',
      visible: college?.collegeCourses?.length > 0,
      ref: programsRef,
      component: <ProgramSection college={college} />
    },
    {
      name: 'Facility',
      visible: college?.facilities?.length > 0,
      ref: facilityRef,
      component: <FacilitySection college={college} />
    },
    {
      name: 'Members',
      visible: validMembers.length > 0,
      ref: membersRef,
      component: <MemberSection validMembers={validMembers} />
    },
    {
      name: 'Gallery',
      visible: college?.collegeGallery?.length > 0,
      ref: galleryRef,
      component: <GallerySection college={college} />
    },
    {
      name: 'FAQs',
      visible: college?.faqs?.length > 0,
      ref: faqsRef,
      component: <FaqSection faqs={college.faqs || []} />
    }
  ]

  const visibleSections = allSections.filter((section) => section.visible)

  const handleScroll = (index) => {
    const target = visibleSections[index].ref.current
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
      const scrollPosition = window.scrollY + 150

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
      {/* Contents — same UX as college detail */}
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
                className={`text-sm font-bold cursor-pointer whitespace-nowrap px-4 py-2.5 md:px-2 transition-all relative flex items-center gap-3 ${
                  activeSection === index
                    ? 'text-[#0A6FA7]'
                    : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    activeSection === index
                      ? 'bg-[#0A6FA7] scale-125 shadow-[0_0_8px_rgba(10,111,167,0.5)]'
                      : 'bg-transparent scale-0'
                  }`}
                />
                {section.name}
              </motion.li>
            ))}
          </ul>
        </aside>
      )}

      {/* Main Content */}
      <div className='flex-1 w-full space-y-10 md:space-y-16'>
        <AnimatePresence mode='wait'>
          {visibleSections?.map((section, index) => (
            <motion.div
              key={index}
              id={section.name.toLowerCase()}
              className='scroll-mt-32'
              ref={section.ref}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              {section.component}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Location — mobile / tablet (below content), matches college */}
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
                    <GoogleMap mapUrl={college.google_map_url} />
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
                      {[address?.street, address?.city].filter(Boolean).join(', ') || '—'}
                    </p>
                    {(address?.district || address?.postal_code || address?.country) && (
                      <p className='text-sm text-gray-500 mt-2 font-medium'>
                        {[address?.district, address?.postal_code, address?.country]
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

      {/* Right sidebar — Map & Address (desktop xl), matches college */}
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
                  <GoogleMap mapUrl={college.google_map_url} />
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
                      {[address?.street, address?.city].filter(Boolean).join(', ') || '—'}
                    </p>
                    {(address?.district || address?.postal_code || address?.country) && (
                      <p className='text-xs text-gray-500 font-medium'>
                        {[address?.district, address?.postal_code, address?.country]
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

export default SchoolOverview
