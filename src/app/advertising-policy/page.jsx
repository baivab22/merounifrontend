
import React from 'react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import { THEME_BLUE } from '@/constants/constants'

export const metadata = {
    title: 'Advertising Policy – Guidelines for Promoting on MeroUni',
    description: 'Read MeroUni’s advertising policy and guidelines for colleges and schools. Learn the rules, terms, and standards for promoting your institution on our platform.',
    openGraph: {
        title: 'Advertising Policy – Guidelines for Promoting on MeroUni',
        description: 'Transparency and integrity in our platform\'s advertisements.',
        url: 'https://merouni.com/advertising-policy',
        type: 'website',
    }
}

const AdvertisingPolicy = () => {
    return (
        <>
            <Header />
            <Navbar />
            <div className='min-h-screen bg-white'>
                <div className='max-w-[850px] mx-auto px-6 py-16 lg:py-24'>
                    <div className="mb-12 border-b border-gray-100 pb-8">
                        <h1 className='text-3xl lg:text-4xl font-black text-gray-900 mb-4'>Advertising Policy</h1>
                        <p className='text-gray-500 text-lg'>Transparency and integrity in our platform's advertisements.</p>
                    </div>

                    <div className='space-y-8 text-gray-600 leading-relaxed text-lg prose prose-blue max-w-none'>
                        <p className="font-medium text-gray-900">Effective Date: March 2026</p>

                        <p>
                            MeroUni accepts advertising to support our mission of providing free and accessible educational resources. However, we maintain a strict separation between advertising and our editorial/academic content.
                        </p>

                        <div className="space-y-6">
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">1. Identification</h3>
                                <p>All advertisements and sponsored content will be clearly labeled as "Sponsored," "Advertisement," or "Partner Content" to distinguish them from editorial materials.</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">2. Editorial Independence</h3>
                                <p>Our academic content, notes, and institutional rankings are never influenced by advertising revenue. We do not provide favorable reviews in exchange for payment.</p>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">3. Prohibited Ads</h3>
                                <p>We do not accept ads for illegal products, misleading educational services, or any content that violates the dignity of the students and institutions we serve.</p>
                            </section>
                        </div>

                        <div className="mt-12 p-8 rounded-2xl bg-gray-50 border border-gray-100">
                            <p className="text-sm font-medium">
                                For any inquiries regarding our advertising transparency, please reach out to <span className="font-bold underline" style={{ color: THEME_BLUE }}>ads@merouni.com</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default AdvertisingPolicy
