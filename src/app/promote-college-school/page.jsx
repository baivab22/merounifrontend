
import React from 'react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import { THEME_BLUE } from '@/constants/constants'
import { CheckCircle } from 'lucide-react'

export const metadata = {
    title: 'Promote Your College or School in Nepal – MeroUni Services',
    description: 'Showcase your college or school on MeroUni. Explore promotional services designed to increase visibility, attract students, and grow your institution’s reach across Nepal.'
}

const PromoteCollegeSchool = () => {
    return (
        <>
            <Header />
            <Navbar />
            <div className='min-h-screen bg-white'>
                <div className='max-w-[850px] mx-auto px-6 py-16 lg:py-24'>
                    <div className="mb-12 border-b border-gray-100 pb-8">
                        <h1 className='text-3xl lg:text-4xl font-black text-gray-900 mb-4'>Promote Your College & School</h1>
                        <p className='text-gray-500 text-lg'>Showcase your institution to the largest student community in Nepal.</p>
                    </div>

                    <div className='space-y-10 text-gray-600 leading-relaxed text-lg'>
                        <p>
                            MeroUni is more than just a directory; it's an educational ecosystem. By listing your institution, you place yourself directly in front of thousands of active students who are searching for their next academic destination.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-8 py-4">
                            {[
                                { title: "Visible Presence", desc: "Build a digital profile that ranks high on internal search and Google." },
                                { title: "Direct Inquiries", desc: "Allow students to contact your admission department with a single click." },
                                { title: "Verified Trust", desc: "Gain a verification badge that builds confidence among potential applicants." },
                                { title: "Data Insights", desc: "Understand student interest through detailed dashboard analytics." }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 font-bold text-gray-900">
                                        <CheckCircle size={20} style={{ color: THEME_BLUE }} />
                                        {item.title}
                                    </div>
                                    <p className="text-base text-gray-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 py-10 border-t border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Promotion</h2>
                            <p className="text-lg mb-6">We handle institutional registrations manually to ensure the highest quality and authenticity.</p>
                            <div className="p-8 rounded-2xl bg-gray-50 flex flex-col items-center text-center">
                                <p className="text-gray-600 mb-2">Interested in listing your institution?</p>
                                <p className="text-2xl font-black" style={{ color: THEME_BLUE }}>info@merouni.com</p>
                                <p className="text-xs text-gray-400 mt-4 uppercase font-bold tracking-widest">Typical response time: Within 24 hours</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default PromoteCollegeSchool
