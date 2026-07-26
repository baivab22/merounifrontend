'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  X, MapPin, Globe, BookOpen,
  Award, Building, Mail, ExternalLink,
  IndianRupee, Briefcase, Sparkles
} from 'lucide-react'
import { stripHtml } from '@/lib/string.utils'
import { ThemeSelect } from '@/ui/shadcn/ThemeSelect'

const ComparisonCard = ({ college, index, onRemove, selectedProgramSlug = '', onProgramChange }) => {
  const address = college?.collegeAddress || {}
  const programs = college?.collegePrograms || []
  const universities = college?.universities || []
  const facilities = college?.facilities || []

  const selectedProgram = programs.find(
    (p) => p?.program?.slug === selectedProgramSlug
  )

  const programFee = stripHtml(selectedProgram?.fee) || ''
  const programPlacement = stripHtml(selectedProgram?.placement) || ''
  const programScholarship = stripHtml(selectedProgram?.scholarship) || ''

  const collegeFee = stripHtml(college?.fee_structure) || ''
  const collegePlacement = stripHtml(college?.placement) || ''
  const collegeScholarship = stripHtml(college?.scholarship) || ''

  const fee = programFee || collegeFee
  const placement = programPlacement || collegePlacement
  const scholarship = programScholarship || collegeScholarship

  const fullAddress = [
    address.street, address.city, address.district, address.country
  ].filter(Boolean).join(', ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className='relative bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden w-full sm:min-w-[280px] sm:max-w-[340px] sm:flex-shrink-0 flex flex-col snap-center'
    >
      <button
        onClick={() => onRemove(college.slug)}
        className='absolute top-3 right-3 z-10 w-7 h-7 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all group'
      >
        <X className='w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-colors' />
      </button>

      <div className='relative h-32 sm:h-36 bg-gradient-to-br from-[#0A6FA7]/5 to-[#30AD8F]/5 flex items-center justify-center overflow-hidden'>
        {college?.featured_img ? (
          <img src={college.featured_img} alt={college.name} className='w-full h-full object-cover' />
        ) : (
          <div className='flex flex-col items-center gap-2'>
            {college?.college_logo ? (
              <img src={college.college_logo} alt={college.name} className='w-16 h-16 object-contain rounded-xl' />
            ) : (
              <div className='w-16 h-16 rounded-2xl bg-[#0A6FA7]/10 flex items-center justify-center'>
                <span className='text-2xl font-bold text-[#0A6FA7]'>{college?.name?.charAt(0)}</span>
              </div>
            )}
          </div>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent' />
      </div>

      <div className='px-4 pt-4 pb-2 flex flex-col items-center text-center'>
        {college?.college_logo && (
          <div className='w-14 h-14 rounded-xl bg-white border-2 border-white shadow-lg -mt-14 mb-3 overflow-hidden flex-shrink-0'>
            <img
              src={college.college_logo}
              alt={college.name}
              className='w-full h-full object-contain p-0.5'
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            />
            <div className='hidden w-full h-full items-center justify-center text-lg font-bold bg-[#0A6FA7]/10 text-[#0A6FA7]'>
              {college?.name?.charAt(0)}
            </div>
          </div>
        )}

        <Link href={`/colleges/${college.slug}`}>
          <h3 className='font-bold text-sm text-gray-900 hover:text-[#0A6FA7] transition-colors leading-snug'>
            {college.name}
          </h3>
        </Link>

        {fullAddress && (
          <div className='flex items-center gap-1.5 mt-1.5'>
            <MapPin className='w-3 h-3 text-[#30AD8F] flex-shrink-0' />
            <p className='text-[11px] text-gray-500 font-medium truncate max-w-full'>{fullAddress}</p>
          </div>
        )}
      </div>

      <div className='px-4 py-3 space-y-2.5 flex-1'>
        {universities.length > 0 && (
          <DetailRow
            icon={<Building className='w-3.5 h-3.5 text-[#0A6FA7]' />}
            label='University'
            value={universities.map((u) => u.fullname).join(', ')}
          />
        )}

        {college?.website_url && (
          <DetailRow
            icon={<Globe className='w-3.5 h-3.5 text-sky-500' />}
            label='Website'
            value={college.website_url.replace(/^https?:\/\/(www\.)?/, '').substring(0, 28)}
            href={college.website_url}
            external
          />
        )}

        {programs.length > 0 && (
          <div className='px-1'>
            <div className='flex items-start gap-2.5'>
              <div className='w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <BookOpen className='w-3.5 h-3.5 text-purple-500' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-[10px] uppercase tracking-wider text-gray-400 font-bold'>Program</p>
                <div className='mt-1'>
                  <ThemeSelect
                    compact
                    value={selectedProgramSlug}
                    options={programs.map((p) => ({
                      value: p?.program?.slug || '',
                      label: p?.program?.title || 'N/A'
                    }))}
                    onChange={(slug) => onProgramChange?.(college.slug, slug)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}



        {fee ? (
          <DetailRow
            icon={<IndianRupee className='w-3.5 h-3.5 text-green-600' />}
            label='Fee Structure'
            value={fee.length > 80 ? fee.substring(0, 80) + '...' : fee}
          />
        ) : (
          <DetailRow
            icon={<IndianRupee className='w-3.5 h-3.5 text-green-600' />}
            label='Fee Structure'
            value='Not Available'
            muted
          />
        )}

        {placement ? (
          <DetailRow
            icon={<Briefcase className='w-3.5 h-3.5 text-blue-600' />}
            label='Placement'
            value={placement.length > 80 ? placement.substring(0, 80) + '...' : placement}
          />
        ) : (
          <DetailRow
            icon={<Briefcase className='w-3.5 h-3.5 text-blue-600' />}
            label='Placement'
            value='Not Available'
            muted
          />
        )}

        {scholarship ? (
          <DetailRow
            icon={<Sparkles className='w-3.5 h-3.5 text-amber-500' />}
            label='Scholarship'
            value={scholarship.length > 80 ? scholarship.substring(0, 80) + '...' : scholarship}
          />
        ) : (
          <DetailRow
            icon={<Sparkles className='w-3.5 h-3.5 text-amber-500' />}
            label='Scholarship'
            value='Not Available'
            muted
          />
        )}

        {facilities.length > 0 && (
          <div className='px-1'>
            <div className='flex items-start gap-2.5'>
              <div className='w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <Award className='w-3.5 h-3.5 text-pink-500' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-[10px] uppercase tracking-wider text-gray-400 font-bold'>Facilities</p>
                <div className='mt-1 flex flex-wrap gap-1'>
                  {facilities.slice(0, 4).map((f, i) => (
                    <span key={i} className='text-[10px] font-semibold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded-md truncate max-w-full'>
                      {f.icon} {f.title}
                    </span>
                  ))}
                  {facilities.length > 4 && (
                    <span className='text-[10px] font-semibold text-gray-400'>+{facilities.length - 4} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}



        {college?.email && (
          <DetailRow
            icon={<Mail className='w-3.5 h-3.5 text-rose-500' />}
            label='Email'
            value={college.email}
            href={`mailto:${college.email}`}
          />
        )}
      </div>

      <div className='px-4 pb-4 pt-1'>
        <Link
          href={`/colleges/${college.slug}`}
          className='flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0A6FA7]/5 hover:bg-[#0A6FA7] text-[#0A6FA7] hover:text-white text-xs font-bold transition-all duration-300'
        >
          View Details
          <ExternalLink className='w-3 h-3' />
        </Link>
      </div>
    </motion.div>
  )
}

const DetailRow = ({ icon, label, value, href, external, muted }) => {
  const content = (
    <div className='flex items-start gap-2.5'>
      <div className='w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5'>
        {icon}
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[10px] uppercase tracking-wider text-gray-400 font-bold'>{label}</p>
        <p className={`text-xs font-semibold mt-0.5 line-clamp-2 break-words ${muted ? 'text-gray-300' : 'text-gray-700'}`}>
          {value}
        </p>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className='block hover:bg-gray-50 rounded-lg p-1 -mx-1 transition-colors'>
        {content}
      </a>
    )
  }

  return <div className='px-1'>{content}</div>
}

export default ComparisonCard
