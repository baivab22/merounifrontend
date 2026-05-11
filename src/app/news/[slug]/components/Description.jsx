import React from 'react'
import HTMLRenderer from '@/ui/HTMLRenderer'

const Description = ({ news }) => {
  const featuredImage = news?.featured_image || news?.image || news?.featuredImage
  
  return (
    <div className='mb-10'>
      {/* News Thumbnail Image */}
      {featuredImage && (
        <div className="w-full mb-10 group">
          <div className='overflow-hidden rounded-2xl md:rounded-[2rem] shadow-2xl shadow-[#0A6FA7]/10 transition-transform duration-700 hover:scale-[1.01] border border-gray-100'>
            <img
              src={featuredImage}
              alt={news?.title || 'News featured image'}
              className='w-full h-auto max-h-[600px] object-cover'
            />
          </div>
        </div>
      )}

      {/* Introduction/Description */}
      {news?.description && (
        <HTMLRenderer
          html={news.description}
          className="mb-10 text-gray-700"
        />
      )}

      {/* Main Content */}
      <HTMLRenderer html={news?.content} />
    </div>
  )
}

export default Description
