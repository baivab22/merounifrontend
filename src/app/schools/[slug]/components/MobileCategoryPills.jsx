'use client'
import React, { useState, useEffect } from 'react'

const MobileCategoryPills = ({ college }) => {
  const [activeSection, setActiveSection] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScrollState = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScrollState)
    return () => window.removeEventListener('scroll', handleScrollState)
  }, [])

  const validMembers = (college.collegeMembers || []).filter(
    (member) =>
      member.name?.trim() ||
      member.role?.trim() ||
      member.contact_number?.trim() ||
      member.description?.trim()
  )

  const allSections = [
    { name: 'Overview', visible: !!(college?.description || college?.content) },
    { name: 'Programs', visible: college?.collegeCourses?.length > 0 },
    { name: 'Facility', visible: college?.facilities?.length > 0 },
    { name: 'Members', visible: validMembers.length > 0 },
    { name: 'Gallery', visible: college?.collegeGallery?.length > 0 },
    { name: 'FAQs', visible: college?.faqs?.length > 0 }
  ]

  const visibleSections = allSections.filter((section) => section.visible)

  const handleScrollTo = (name) => {
    const id = name.toLowerCase()
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 180
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const handleScrollSpy = () => {
      const scrollPosition = window.scrollY + 200

      for (let i = visibleSections.length - 1; i >= 0; i--) {
        const id = visibleSections[i].name.toLowerCase()
        const element = document.getElementById(id)

        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          const elementBottom = elementTop + rect.height

          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setActiveSection(visibleSections[i].name)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScrollSpy)
    handleScrollSpy()
    return () => window.removeEventListener('scroll', handleScrollSpy)
  }, [visibleSections])

  if (visibleSections.length === 0) return null

  return (
    <div
      className={`md:hidden w-full bg-white z-[50] border-b border-gray-100 ${
        isScrolled
          ? 'fixed top-[120px] left-0 right-0 shadow-sm'
          : 'sticky top-[120px]'
      }`}
    >
      <div className='px-4 sm:px-8'>
        <ul className='flex flex-row gap-2 overflow-x-auto no-scrollbar py-3'>
          {visibleSections.map((section) => (
            <li
              key={section.name}
              onClick={() => handleScrollTo(section.name)}
              className={`text-sm font-medium cursor-pointer whitespace-nowrap px-4 py-1.5 rounded-full transition-all border ${
                activeSection === section.name
                  ? 'bg-[#0A6FA7] text-white border-[#0A6FA7]'
                  : 'bg-gray-50 text-gray-500 border-gray-100 hover:text-gray-800'
              }`}
            >
              {section.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default MobileCategoryPills
