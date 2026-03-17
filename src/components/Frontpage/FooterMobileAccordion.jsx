'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MapPin, Mail, Phone } from 'lucide-react'
import { THEME_BLUE } from '@/constants/constants'

const FooterMobileAccordion = ({ sections, contactInfo, linkClass, headingClass }) => {
  const [openSections, setOpenSections] = useState({})

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className='md:hidden space-y-0 pb-6 border-b border-gray-200/80'>
      {Object.entries(sections).map(([key, section], index) => (
        <div
          key={key}
          className='border-b border-gray-200/80 last:border-b-0'
        >
          <button
            type='button'
            onClick={() => toggleSection(index)}
            className='w-full flex items-center justify-between py-4 text-left'
            aria-expanded={openSections[index]}
          >
            <span className={headingClass + ' mb-0'}>{section.header}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform ${openSections[index] ? 'rotate-180' : ''}`}
            />
          </button>
          {openSections[index] && (
            <ul className='space-y-3 pb-4'>
              {section.list.map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.href || '#'}
                    className={linkClass}
                    onClick={() => setOpenSections({})}
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* Contact Us Accordion */}
      <div className='border-b border-gray-200/80 last:border-b-0'>
        <button
          type='button'
          onClick={() => toggleSection('contact')}
          className='w-full flex items-center justify-between py-4 text-left'
          aria-expanded={openSections['contact']}
        >
          <span className={headingClass + ' mb-0'}>Contact Us</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${openSections['contact'] ? 'rotate-180' : ''}`}
          />
        </button>
        {openSections['contact'] && (
          <ul className='space-y-4 pb-4'>
            <li className='flex items-start gap-3'>
              <MapPin className='w-4 h-4 shrink-0 mt-0.5' style={{ color: THEME_BLUE }} />
              <span className='text-sm text-gray-600'>
                {contactInfo.address || 'Putalisadak, Kathmandu'}
              </span>
            </li>
            <li className='flex items-center gap-3'>
              <Phone className='w-4 h-4 shrink-0' style={{ color: THEME_BLUE }} />
              <a href={`tel:${contactInfo.phone || '+9779840747576'}`} className={linkClass}>
                {contactInfo.phone || '+977 9840747576'}
              </a>
            </li>
            <li className='flex items-center gap-3'>
              <Mail className='w-4 h-4 shrink-0' style={{ color: THEME_BLUE }} />
              <a href={`mailto:${contactInfo.email || 'info@merouni.com'}`} className={linkClass}>
                {contactInfo.email || 'info@merouni.com'}
              </a>
            </li>
          </ul>
        )}
      </div>
    </div>
  )
}

export default FooterMobileAccordion
