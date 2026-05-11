import React, { useState } from 'react'
import HTMLRenderer from '@/ui/HTMLRenderer'

const OverviewSection = ({ college }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Truncate description to first 30 words for mobile
  const truncateDescription = (text, wordLimit = 30) => {
    if (!text) return ''
    const words = text.split(/\s+/)
    if (words.length <= wordLimit) return text
    return words.slice(0, wordLimit).join(' ') + '...'
  }

  const fullDescription = college?.description || ''
  const truncatedDescription = truncateDescription(fullDescription, 30)
  const shouldTruncate = fullDescription.split(/\s+/).length > 30

  // If no description and no content, return null to avoid empty card
  if (!college?.description && !college?.content) {
    return null
  }

  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='w-1.5 h-6 bg-[#0A6FA7] rounded-full' />
        <h2 className='text-xl font-bold text-gray-900'>Description & Overview</h2>
      </div>

      {/* Plain description text */}
      {college?.description && (
        <div className='mb-8'>
          {/* Mobile view - with truncation */}
          <div className='md:hidden'>
            <p className='text-gray-600 leading-relaxed text-sm text-justify'>
              {isExpanded ? fullDescription : truncatedDescription}
            </p>
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
          <p className='hidden md:block text-gray-600 leading-relaxed text-base'>
            {fullDescription}
          </p>
        </div>
      )}

      {/* Rich HTML content */}
      <HTMLRenderer html={college?.content} className='mt-0' />
    </div>
  )
}

export default OverviewSection
