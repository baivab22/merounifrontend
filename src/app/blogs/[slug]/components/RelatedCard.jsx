import React from 'react'

const RelatedCard = ({ image, title, description, date }) => {
  return (
    <div className='relative bg-white rounded-3xl shadow-sm border border-gray-100 h-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2 group'>
      <div className='h-[200px] relative overflow-hidden'>
        <img
          src={image}
          alt={title}
          className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
        />
        <div className='absolute top-4 left-4'>
          <span className='bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wider'>
            {date || 'Recent'}
          </span>
        </div>
      </div>

      <div className='p-6 flex flex-col h-[calc(100%-200px)]'>
        <h3 className='text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors'>
          {title}
        </h3>

        {description && (
          <div className='text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed'>
            {description}
          </div>
        )}

        <div className='mt-auto flex items-center text-blue-600 font-bold text-sm gap-2'>
          Read Story
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default RelatedCard

