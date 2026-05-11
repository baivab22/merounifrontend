'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Award, ArrowRight, DollarSign, Clock, MapPin } from 'lucide-react'

const formatDeadline = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getTimeLeft = (deadline) => {
  if (!deadline) return null
  const now = new Date()
  const end = new Date(deadline)
  const diff = end - now
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 0) return 'Expired'
  if (days === 0) return 'Ends Today'
  if (days === 1) return 'Ends Tomorrow'
  if (days <= 7) return `${days} Days Left`
  return null
}

const ScholarshipCard = ({ scholarship }) => {
  const deadlineDisplay = formatDeadline(scholarship.applicationDeadline)
  const timeLeft = getTimeLeft(scholarship.applicationDeadline)
  const isExpired = scholarship.applicationDeadline
    ? new Date(scholarship.applicationDeadline) < new Date()
    : false

  const image = scholarship.image || scholarship.featured_image || 'https://placehold.co/600x400?text=Scholarship'
  const logo = scholarship.logo || scholarship.institute?.logo
  const instituteName = scholarship.institute?.name || scholarship.organization || 'Educational Institute'

  return (
    <Link 
      href={`/scholarship/${scholarship.slug || scholarship.id}`}
      className='group block h-full focus:outline-none'
    >
      <article className='bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col hover:border-gray-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500'>
        {/* Image Section */}
        <div className='relative w-full aspect-[16/9] bg-gray-100 overflow-hidden'>
          <Image
            src={image}
            alt={scholarship.name}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-700'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60' />
          
          {/* Status Badges */}
          <div className='absolute top-4 left-4 flex gap-2'>
            {isExpired ? (
              <span className='px-3 py-1 rounded-md bg-red-500/90 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider shadow-sm'>
                Expired
              </span>
            ) : timeLeft ? (
              <span className='px-3 py-1 rounded-md bg-amber-500/90 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider shadow-sm'>
                {timeLeft}
              </span>
            ) : (
              <span className='px-3 py-1 rounded-md bg-[#0A70A7]/90 backdrop-blur-sm text-[10px] font-bold text-white uppercase tracking-wider shadow-sm'>
                Active
              </span>
            )}
          </div>

          {/* Amount Badge if exists */}
          {scholarship.amount && (
            <div className='absolute bottom-4 right-4'>
              <span className='px-3 py-1.5 rounded-lg bg-white/95 text-xs font-extrabold text-[#0A70A7] shadow-lg flex items-center gap-1.5'>
                <DollarSign className='w-3.5 h-3.5' />
                {scholarship.amount}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className='p-6 flex flex-col flex-1'>
          <div className='flex items-start gap-4 mb-4'>
            {logo ? (
              <div className='relative w-12 h-12 flex-shrink-0 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden p-2'>
                <Image src={logo} alt='' fill className='object-contain p-1.5' />
              </div>
            ) : (
              <div className='w-12 h-12 flex-shrink-0 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0A70A7]'>
                <Award className='w-6 h-6' />
              </div>
            )}
            <div className='flex-1 min-w-0'>
              <h2 className='text-base md:text-lg font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#0A70A7] transition-colors duration-300'>
                {scholarship.name}
              </h2>
              <p className='text-xs font-semibold text-gray-400 mt-1 truncate uppercase tracking-wider'>
                {instituteName}
              </p>
            </div>
          </div>

          {/* Meta Information */}
          <div className='grid grid-cols-2 gap-4 mt-2 py-4 border-t border-gray-50'>
            <div className='flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400'>
                <Calendar className='w-4 h-4' />
              </div>
              <div className='flex flex-col'>
                <span className='text-[9px] uppercase text-gray-400 font-bold tracking-widest'>Deadline</span>
                <span className={`text-xs font-bold ${isExpired ? 'text-red-500' : 'text-gray-700'}`}>
                  {deadlineDisplay || 'N/A'}
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400'>
                <Clock className='w-4 h-4' />
              </div>
              <div className='flex flex-col'>
                <span className='text-[9px] uppercase text-gray-400 font-bold tracking-widest'>Level</span>
                <span className='text-xs font-bold text-gray-700'>
                  {scholarship.level || 'All Levels'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className='mt-auto pt-6 flex items-center justify-between gap-4'>
            <span className='text-xs font-bold text-[#0A70A7] flex items-center gap-1.5 group/link'>
              View Details
              <ArrowRight className='w-4 h-4 group-hover/link:translate-x-1 transition-transform' />
            </span>
            
            {!isExpired && (
              <button
                className='px-5 py-2 rounded-lg bg-[#0A70A7] text-white text-xs font-bold hover:bg-[#085a86] transition-all shadow-md shadow-blue-900/10 active:scale-95'
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = `/scholarship/apply/${scholarship.slug || scholarship.id}`
                }}
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

export default ScholarshipCard
