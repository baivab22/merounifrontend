import React from 'react'

const RelatedCard = ({ image, date, description, title }) => {
    return (
        <div className='bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#387cae]/10 transition-all duration-500 flex flex-col h-full group'>
            <div className='relative aspect-[4/3] overflow-hidden'>
                <img
                    src={image}
                    alt={title}
                    className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
            </div>
            <div className='p-6 flex flex-col flex-1 bg-white group-hover:bg-[#387cae]/5 transition-colors duration-500'>
                <div className='flex items-center gap-2 mb-4'>
                    <div className='w-1 h-4 bg-[#387cae] rounded-full'></div>
                    <span className='text-[11px] font-black uppercase tracking-widest text-[#387cae]'>{date}</span>
                </div>
                <h3 className='font-black text-gray-900 line-clamp-2 leading-tight mb-3 group-hover:text-[#387cae] transition-colors'>
                    {title}
                </h3>
                <p className='text-sm text-gray-500 line-clamp-3 leading-relaxed'>
                    {description}
                </p>
            </div>
        </div>
    )
}

export default RelatedCard
