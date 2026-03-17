import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaFacebook, FaInstagram } from 'react-icons/fa6'
import { TiSocialLinkedinCircular } from 'react-icons/ti'
import { PiXLogoLight } from 'react-icons/pi'
import { MapPin, Mail, Phone } from 'lucide-react'

import { getSiteConfig } from '@/app/actions/siteConfigActions'
import { THEME_BLUE } from '@/constants/constants'
import FooterMobileAccordion from './FooterMobileAccordion'

const Footer = async () => {
  let socialLinks = {}
  let contactInfo = {
    phone: '',
    email: '',
    address: ''
  }

  try {
    const socialRes = await getSiteConfig({ types: 'social_facebook,social_instagram,social_linkedin,social_twitter' })
    if (socialRes?.items && Array.isArray(socialRes.items)) {
      socialRes.items.forEach(item => {
        socialLinks[item.type] = item.value
      })
    }
  } catch (e) {
    console.error('Footer: Error fetching social links:', e)
  }

  try {
    const contactRes = await getSiteConfig({ types: 'contact_phone,contact_email,contact_address' })
    if (contactRes?.items) {
      contactRes.items.forEach(item => {
        if (item.type === 'contact_phone') contactInfo.phone = item.value
        if (item.type === 'contact_email') contactInfo.email = item.value
        if (item.type === 'contact_address') contactInfo.address = item.value
      })
    }
  } catch (e) {
    console.error('Footer: Error fetching contact info:', e)
  }

  const sections = {
    Info: {
      header: 'Info',
      list: [
        { title: 'FAQs', href: '/faqs' },
        { title: 'About Us', href: '/about-us' },
        { title: 'Service Pricing', href: '/service-pricing' },
        { title: 'Membership Pricing', href: '/membership-pricing' },
        { title: 'Promote Your College and School', href: '/promote-college-school' },
        { title: 'Advertising Policy', href: '/advertising-policy' }
      ]
    },
    Materials: {
      header: 'Materials',
      list: [
        { title: 'Class 11 Notes', href: '/materials?q=Class+11+Notes' },
        { title: 'Class 12 Notes', href: '/materials?q=Class+12+Notes' },
        { title: 'IOE Preparation', href: '/materials?q=IOE+Preparation' },
        { title: 'CEE Preparation', href: '/materials?q=CEE+Preparation' }
      ]
    },
    UsefulLinks: {
      header: 'Useful Links',
      list: [
        { title: 'Short-Term Courses', href: '/short-term-courses' },
        { title: 'Vacancies', href: '/vacancies' },
        { title: 'Careers at MeroUni', href: '/career' }
      ]
    }
  }

  const linkClass = 'text-sm text-gray-600 hover:text-[#387cae] transition-colors'
  const headingClass = 'text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4'

  return (
    <footer className='bg-gray-50 border-t border-gray-200/80'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-12'>
        {/* Links grid - desktop */}
        <div className='hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-10 border-b border-gray-200/80'>
          {Object.entries(sections).map(([key, section]) => (
            <div key={key}>
              <h3 className={headingClass}>{section.header}</h3>
              <ul className='space-y-2.5'>
                {section.list.map((item, i) => (
                  <li key={i}>
                    <Link href={item.href || '#'} className={linkClass}>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Us Column */}
          <div>
            <h3 className={headingClass}>Contact Us</h3>
            <ul className='space-y-4'>
              <li className='flex items-start gap-3'>
                <MapPin className='w-5 h-5 shrink-0 mt-0.5' style={{ color: THEME_BLUE }} />
                <span className='text-sm text-gray-600'>
                  {contactInfo.address || 'Putalisadak, Kathmandu'}
                </span>
              </li>
              <li className='flex items-center gap-3'>
                <Phone className='w-5 h-5 shrink-0' style={{ color: THEME_BLUE }} />
                <a href={`tel:${contactInfo.phone || '+9779840747576'}`} className={linkClass}>
                  {contactInfo.phone || '+977 9840747576'}
                </a>
              </li>
              <li className='flex items-center gap-3'>
                <Mail className='w-5 h-5 shrink-0' style={{ color: THEME_BLUE }} />
                <a href={`mailto:${contactInfo.email || 'info@merouni.com'}`} className={linkClass}>
                  {contactInfo.email || 'info@merouni.com'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Links accordion - mobile (Client Component) */}
        <FooterMobileAccordion 
          sections={sections} 
          contactInfo={contactInfo} 
          linkClass={linkClass} 
          headingClass={headingClass} 
        />

        {/* Bottom: logo, socials, legal, copyright */}
        <div className='pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
          <div className='flex flex-col sm:flex-row items-center gap-6'>
            <Link href='/' className='shrink-0'>
              <Image
                src='/images/logo.png'
                width={140}
                height={52}
                alt='MeroUni'
                className='object-contain h-10 w-auto'
              />
            </Link>
            <div className='flex items-center gap-4'>
              {socialLinks.social_facebook && (
                <a
                  href={socialLinks.social_facebook}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-500 hover:text-[#0A6FA7] transition-colors p-1'
                  aria-label='Facebook'
                >
                  <FaFacebook className='w-5 h-5' />
                </a>
              )}
              {socialLinks.social_instagram && (
                <a
                  href={socialLinks.social_instagram}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-500 hover:text-[#0A6FA7] transition-colors p-1'
                  aria-label='Instagram'
                >
                  <FaInstagram className='w-5 h-5' />
                </a>
              )}
              {socialLinks.social_linkedin && (
                <a
                  href={socialLinks.social_linkedin}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-500 hover:text-[#0A6FA7] transition-colors p-1'
                  aria-label='LinkedIn'
                >
                  <TiSocialLinkedinCircular className='w-6 h-6' />
                </a>
              )}
              {socialLinks.social_twitter && (
                <a
                  href={socialLinks.social_twitter}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-500 hover:text-[#0A6FA7] transition-colors p-1'
                  aria-label='X'
                >
                  <PiXLogoLight className='w-5 h-5' />
                </a>
              )}
            </div>
          </div>
          <div className='flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500'>
            <div className='flex items-center gap-6'>
              <Link
                href='/disclaimer'
                className='hover:text-gray-900 transition-colors'
              >
                Disclaimer
              </Link>
              <Link
                href='/privacy-policy'
                className='hover:text-gray-900 transition-colors'
              >
                Privacy Policy
              </Link>
            </div>
            <span className='text-gray-400'>
              &copy; {new Date().getFullYear()} MeroUni. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
