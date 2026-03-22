import React, { useState } from 'react'
import HTMLRenderer from '@/ui/HTMLRenderer'
import he from 'he'

const OverviewSection = ({ university }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const truncateDescription = (text, wordLimit = 30) => {
    if (!text) return ''
    const words = text.split(/\s+/)
    if (words.length <= wordLimit) return text
    return words.slice(0, wordLimit).join(' ') + '...'
  }

  const fullDescription = university?.description || ''
  const truncatedDescription = truncateDescription(fullDescription, 30)
  const shouldTruncate = fullDescription.split(/\s+/).length > 30

  if (!university?.description) return null

  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='w-1.5 h-6 bg-[#0A6FA7] rounded-full' />
        <h2 className='text-xl font-bold text-gray-900'>About {university?.fullname}</h2>
      </div>

      <div className='mb-0'>
        {/* Mobile view - with truncation */}
        <div className='md:hidden'>
          <div className='text-gray-600 leading-relaxed text-sm text-justify'>
            <HTMLRenderer html={he.decode(isExpanded ? fullDescription : truncatedDescription)} />
          </div>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='mt-3 text-[#0A6FA7] hover:text-[#085e8a] font-bold text-sm flex items-center gap-1 transition-colors'
            >
              {isExpanded ? 'Read less ↑' : 'Read more ↓'}
            </button>
          )}
        </div>

        {/* Desktop view - full description */}
        <div className='hidden md:block text-gray-600 leading-relaxed text-base'>
          <HTMLRenderer html={he.decode(fullDescription)} />
        </div>
      </div>
    </div>
  )
}

export default OverviewSection
