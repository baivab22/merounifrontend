'use client'

import React from 'react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import { THEME_BLUE } from '@/constants/constants'
import { Check } from 'lucide-react'

const ServicePricing = () => {
    const services = [
        {
            title: "Featured Institution Listing",
            price: "Contact Us",
            desc: "Get your institution verified and highlighted at the top of search results and category pages.",
            items: ["Priority Search Results", "Verification Badge", "Leads Dashboard"]
        },
        {
            title: "Banner Advertising",
            price: "Variable",
            desc: "Place your brand in front of thousands of active students through targeted banner slots.",
            items: ["Homepage Hero Slots", "Category Banners", "Monthly Reports"]
        },
        {
            title: "Promotional Articles",
            price: "Custom",
            desc: "Tell your institution's story through professional, SEO-optimized blog posts and news coverage.",
            items: ["Expert Copywriting", "Social Media Sharing", "Permanent Link"]
        }
    ]

    return (
        <>
            <Header />
            <Navbar />
            <div className='min-h-screen bg-white'>
                <div className='max-w-[850px] mx-auto px-6 py-16 lg:py-24'>
                    <div className="mb-12 border-b border-gray-100 pb-8">
                        <h1 className='text-3xl lg:text-4xl font-black text-gray-900 mb-4'>Service Pricing</h1>
                        <p className='text-gray-500 text-lg'>Solutions designed to help institutions reach their target audience.</p>
                    </div>

                    <div className='space-y-12'>
                        {services.map((service, index) => (
                            <div key={index} className="relative">
                                <div className="flex justify-between items-baseline mb-4">
                                    <h3 className="text-2xl font-extrabold text-gray-900">{service.title}</h3>
                                    <span className="text-xl font-black px-4 py-1 rounded-full bg-gray-50" style={{ color: THEME_BLUE }}>{service.price}</span>
                                </div>
                                <p className="text-gray-600 text-lg leading-relaxed mb-6">{service.desc}</p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {service.items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Check size={16} style={{ color: THEME_BLUE }} />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-8 rounded-2xl bg-gray-900 text-white flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Ready to grow your presence?</h3>
                            <p className="text-gray-400 text-sm">Contact our advertising team for a personalized proposal.</p>
                        </div>
                        <a href="mailto:info@merouni.com" className="px-8 py-3 rounded-lg font-bold transition-all text-white border border-white/20 hover:bg-white hover:text-gray-900">
                            Email Us
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ServicePricing
