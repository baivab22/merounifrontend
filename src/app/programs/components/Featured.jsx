'use client'

import React from 'react'

const Featured = () => {
    return (
        <div className='w-full bg-gradient-to-br from-[#0A70A7] to-[#085a8a] py-20 px-4 md:px-8'>
            <div className='max-w-[1600px] mx-auto flex flex-col items-center text-center'>
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight'>
                    Find Your Perfect <span className='text-blue-200'>Academic Path</span>
                </h1>
                <p className='text-blue-100 text-lg md:text-xl max-w-2xl font-medium leading-relaxed'>
                    Explore thousands of programs across various universities and levels.
                    Your journey to a brighter future begins with the right choice today.
                </p>

                <div className='mt-10 flex flex-wrap justify-center gap-4'>
                    <div className='bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white text-sm font-bold'>
                        1000+ Programs
                    </div>
                    <div className='bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white text-sm font-bold'>
                        Top Universities
                    </div>
                    <div className='bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white text-sm font-bold'>
                        Expert Guidance
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Featured
