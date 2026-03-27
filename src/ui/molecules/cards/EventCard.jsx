'use client'

import React from 'react'
import Image from 'next/image'
import { Share, Calendar, MapPin, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const EventCard = ({ event }) => {
  const { toast } = useToast()
  
  let month = ''
  let day = ''
  let year = ''
  let location = ''
  
  let hostData = {}
  try {
    if (event.event_host) {
      if (typeof event.event_host === 'string') {
        // Handle double-stringified JSON from production API
        const firstPass = JSON.parse(event.event_host)
        hostData = typeof firstPass === 'string' ? JSON.parse(firstPass) : firstPass
      } else {
        hostData = event.event_host
      }
    }
    
    const { start_date, venue, location: loc } = hostData
    location = loc || venue || ''
    
    if (start_date) {
      const dateObj = new Date(start_date)
      if (!isNaN(dateObj.getTime())) {
        month = dateObj.toLocaleString('en-US', { month: 'short' })
        day = dateObj.getDate()
        year = dateObj.getFullYear()
      }
    }
  } catch (error) {
    console.error('Error parsing event data:', error)
  }

  const collegeName = event.college?.name || event.institution_name || ''
  const image = event?.image || '/images/events.webp'
  const title = event.title || 'Upcoming Event'
  const slug = event.slugs || ''

  const handleShareClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (typeof window === 'undefined' || !slug) return
    
    const eventUrl = `${window.location.origin}/events/${slug}`
    navigator.clipboard.writeText(eventUrl).then(() => {
      toast({
        title: 'Link Copied',
        description: 'Event URL copied to clipboard!'
      })
    })
  }

  return (
    <div className='group h-full flex flex-col rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:border-[#0A70A7]/30 overflow-hidden relative'>
      {/* Top Section: Image */}
      <div className='relative h-[200px] overflow-hidden'>
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className='object-cover transition-transform duration-700 group-hover:scale-110'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300' />
        
        {/* College/Institution Tag */}
        {collegeName && (
          <div className='absolute top-3 left-3 z-10'>
            <span className='bg-white/95 backdrop-blur-sm text-[#0A70A7] text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider border border-[#0A70A7]/10'>
              {collegeName}
            </span>
          </div>
        )}

        {/* Floating Date Badge */}
        {day && (
          <div className='absolute bottom-3 right-3 z-10 flex flex-col items-center justify-center w-12 h-14 bg-white rounded-lg shadow-lg border border-gray-100 transform group-hover:-translate-y-1 transition-transform duration-300'>
            <span className='text-[10px] font-bold text-[#0A70A7] uppercase leading-none mb-1'>{month}</span>
            <span className='text-lg font-black text-gray-900 leading-none'>{day}</span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className='p-5 flex flex-col flex-1 gap-3'>
        <div className='flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
          <Calendar className='w-3 h-3 text-[#0A70A7]' />
          <span>{month} {day}, {year}</span>
        </div>

        <h3 className='text-lg font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#0A70A7] transition-colors'>
          {title}
        </h3>

        {location && (
          <div className='flex items-center gap-1.5 text-gray-500 text-xs mt-1'>
            <MapPin className='w-3.5 h-3.5 text-gray-400 shrink-0' />
            <span className='truncate'>{location}</span>
          </div>
        )}

        <div
          className='text-gray-600 text-sm line-clamp-2 leading-relaxed mt-2'
          dangerouslySetInnerHTML={{
            __html: event.description || ''
          }}
        />

        {/* Footer Actions */}
        <div className='mt-auto pt-5 border-t border-gray-50 flex items-center justify-between'>
          <button
            type='button'
            onClick={handleShareClick}
            className='flex items-center gap-2 text-[11px] font-bold text-gray-400 hover:text-[#0A70A7] transition-colors uppercase tracking-wider'
          >
            <Share className='w-4 h-4' />
            <span>Share</span>
          </button>
          
          <div className='flex items-center gap-1 text-[11px] font-bold text-[#0A70A7] uppercase tracking-wider group/link'>
            <span>Details</span>
            <ChevronRight className='w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
