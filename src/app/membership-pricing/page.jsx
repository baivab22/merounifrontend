import React from 'react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import { THEME_BLUE } from '@/constants/constants'
import { CheckCircle2 } from 'lucide-react'

export const metadata = {
    title: 'Membership Pricing – Student Learning Plans | MeroUni',
    description: 'Choose a MeroUni membership plan that fits your learning journey. Access premium notes, entrance prep materials, and video tutorials.',
    openGraph: {
        title: 'Membership Pricing – Student Learning Plans | MeroUni',
        description: 'Choose the plan that fits your learning journey.',
        url: 'https://merouni.com/membership-pricing',
        type: 'website',
    }
}

const MembershipPricing = () => {
    const plans = [
        {
            name: "Standard",
            price: "Free",
            desc: "Basic access to essential notes and institution listings for everyone.",
            features: ["Access to Free Notes", "Basic Search", "Article Reading"]
        },
        {
            name: "Plus",
            price: "Rs 499",
            desc: "Enhanced materials and focus on entrance exam preparation for serious pupils.",
            features: ["Premium Note Access", "Entrance Prep Basics", "Ad-Free Experience"]
        },
        {
            name: "Elite",
            price: "Rs 999",
            desc: "The complete education package with mock tests and expert tutorials.",
            features: ["Video Tutorials", "Full Mock Tests", "Priority Support"]
        }
    ]

    return (
        <>
            <Header />
            <Navbar />
            <div className='min-h-screen bg-white'>
                <div className='max-w-[850px] mx-auto px-6 py-16 lg:py-24'>
                    <div className="mb-12 border-b border-gray-100 pb-8">
                        <h1 className='text-3xl lg:text-4xl font-black text-gray-900 mb-4'>Membership Pricing</h1>
                        <p className='text-gray-500 text-lg'>Choose the plan that fits your learning journey.</p>
                    </div>

                    <div className='space-y-6'>
                        {plans.map((plan, index) => (
                            <div key={index} className="flex flex-col sm:flex-row justify-between p-8 border border-gray-100 rounded-2xl hover:border-blue-100 hover:shadow-sm transition-all bg-white gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-black text-gray-900">{plan.name}</h3>
                                        <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 text-gray-500">Tier {index + 1}</span>
                                    </div>
                                    <p className="text-gray-600 mb-6">{plan.desc}</p>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                                        {plan.features.map((feat, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                                                <CheckCircle2 size={16} style={{ color: THEME_BLUE }} />
                                                {feat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="sm:text-right flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-gray-50 pt-6 sm:pt-0 sm:pl-10 min-w-[120px]">
                                    <div className="text-3xl font-black mb-1" style={{ color: THEME_BLUE }}>{plan.price}</div>
                                    <div className="text-xs font-bold text-gray-400 uppercase">One Time</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="mt-12 text-center text-gray-400 text-sm ">
                        All prices are in Nepalese Rupees (NPR). Memberships are per academic semester.
                    </p>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default MembershipPricing
