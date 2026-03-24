import { formatDate } from '@/utils/date.util'
import React from 'react'

const Hero = ({ news }) => {
    return (
        <div className='relative px-6 md:px-16 pt-10 md:pt-24 max-w-[1600px] mx-auto'>
            <div className='max-w-[900px] mx-auto'>
               

                {/* Title */}
                <h1 className='font-black text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-[1.15] mb-8'>
                    {news?.title}
                </h1>

                {/* Author Section */}
                {(news?.newsAuthor || news?.author) && (
                    <div className='flex items-center gap-4 mb-10'>
                        <div className='w-12 h-12 bg-[#387cae] rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-[#387cae]/20'>
                            {(news?.newsAuthor?.firstName?.[0] || news?.author?.firstName?.[0] || 'A')}
                        </div>
                        <div className='flex flex-col'>
                            <span className='text-sm md:text-base font-bold text-gray-900'>
                                {news?.newsAuthor?.firstName || news?.author?.firstName} {news?.newsAuthor?.lastName || news?.author?.lastName}
                            </span>
                            <span className='text-[11px] md:text-xs text-gray-500 uppercase tracking-wider font-semibold'>
                                Published by MeroUni Team
                            </span>
                        </div>
                    </div>
                )}

                {/* Featured Image */}
                {(news?.featured_image || news?.image || news?.featuredImage) && (
                    <div className='w-full mb-12 group'>
                        <div className='overflow-hidden rounded-2xl md:rounded-[2.5rem] shadow-2xl shadow-[#387cae]/10 transition-transform duration-700 hover:scale-[1.01]'>
                            <img
                                src={news.featured_image || news.image || news.featuredImage}
                                alt={news?.title || 'News featured image'}
                                className='w-full h-auto max-h-[600px] object-cover'
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Hero
