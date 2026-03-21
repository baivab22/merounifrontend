'use client'

import React from 'react'
import { THEME_BLUE } from '@/constants/constants'

const AboutUs = () => {
    return (
        <>
            <div className='min-h-screen bg-white'>
                <div className='max-w-[850px] mx-auto px-6 py-16 lg:py-24'>
                    <div className="mb-12 border-b border-gray-100 pb-8">
                        <h1 className='text-3xl lg:text-4xl font-black text-gray-900 mb-4'>About Us</h1>
                        <p className='text-gray-500 text-lg'>Your trusted companion in the journey of education.</p>
                    </div>

                    <div className='space-y-8 text-gray-600 leading-relaxed text-lg'>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                            <p>
                                MeroUni is Nepal's leading educational platform, designed to bridge the gap between students and educational institutions. Our mission is to provide accurate, transparent, and comprehensive information about educational opportunities in Nepal.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Do</h2>
                            <p>
                                We empower students with the tools and knowledge they need to make informed decisions. From specialized notes for Class 11 and 12 to comprehensive entrance preparation materials for IOE and CEE, we provide resources that help students excel.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                            <p>
                                To become the definitive guide for education in Nepal, fostering a society where every student has access to the best possible educational resources and institutional guidance.
                            </p>
                        </section>
                    </div>

                    <div className="mt-16 p-8 rounded-2xl border-2 border-dashed border-gray-100 text-center">
                        <p className="text-gray-500 font-medium italic">Empowering the next generation of Nepalese scholars.</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AboutUs
