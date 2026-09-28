'use client'
import React from 'react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import { getConfigByType } from '../actions/siteConfigActions'
import { THEME_BLUE } from '@/constants/constants'
import Link from 'next/link'
import { Check, GraduationCap, Shield, Sparkles } from 'lucide-react'

const MEMBERSHIP_LEVELS = [
    {
        id: 'PLUS2',
        name: '+2 / Grade 12',
        tagline: 'Free exam prep + early career-field access',
        code: 'LVL-01',
        icon: Shield,
        price: 'Rs. 1,000',
        period: 'per membership',
        features: [
            'Free Grade 12 board exam prep',
            'Field-based professional trainings',
            'Member Library access',
            'Placement network priority'
        ],
        cta: 'Join +2 membership',
        highlighted: false,
        note: 'INCLUDES FREE EXAM PREP'
    },
    {
        id: 'BACHELORS',
        name: "Bachelor's — Running",
        tagline: 'Course-aligned professional trainings',
        code: 'LVL-02',
        icon: GraduationCap,
        price: 'Rs. 3,000',
        period: 'per membership',
        features: [
            'Trainings matched to your degree',
            'Member Library access',
            'Completion certificates',
            'Placement & internship priority'
        ],
        cta: 'Join Bachelor membership',
        highlighted: true,
        note: 'MOST POPULAR'
    },
    {
        id: 'GRADUATE',
        name: 'Graduate',
        tagline: 'Placement-focused upskilling',
        code: 'LVL-03',
        icon: Sparkles,
        price: 'Custom',
        period: 'priced by field',
        features: [
            'Interview & portfolio readiness',
            'Depth-weighted trainings per field',
            'Member Library access',
            'Direct placement support'
        ],
        cta: 'Query your field fee',
        highlighted: false,
        note: 'JOB-READY'
    }
]

const MembershipPricing = () => {
    const [content, setContent] = React.useState(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchContent = async () => {
            try {
                const configRes = await getConfigByType('legal_membership_pricing')
                const config = configRes?.config
                if (config?.value) {
                    setContent(config.value)
                }
            } catch (error) {
                console.error('Failed to fetch Membership Pricing:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchContent()
    }, [])

    return (
        <>
            <Header />
            <Navbar />
            <div className='min-h-screen bg-white'>
                <div className='max-w-6xl mx-auto px-6 py-16 lg:py-24 text-center'>
                    <p className='text-[11px] font-mono uppercase tracking-[0.15em] text-[#1F6F5C] mb-4 flex items-center justify-center gap-2'>
                        <span className='w-6 h-px bg-[#1F6F5C]' />
                        MeroUni Membership
                        <span className='w-6 h-px bg-[#1F6F5C]' />
                    </p>
                    <h1 className='text-3xl lg:text-5xl font-black text-gray-900 mb-4 font-poppins tracking-tight'>
                        One membership. Every step from{' '}
                        <em className='not-italic text-[#c9862a]'>board exams</em>{' '}
                        to your <em className='not-italic text-[#c9862a]'>first job</em>.
                    </h1>
                    <p className='text-gray-500 text-lg max-w-2xl mx-auto mb-14'>
                        Free Grade 12 exam preparation for every member, then hands-on
                        professional training in your chosen field — delivered by MeroUni's
                        partner colleges, at zero training cost to you.
                    </p>

                    {/* Level cards */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
                        {MEMBERSHIP_LEVELS.map((level) => {
                            const Icon = level.icon
                            return (
                                <div
                                    key={level.id}
                                    className={`relative rounded-2xl border p-8 text-left transition-all duration-200 ${
                                        level.highlighted
                                            ? 'border-[#387cae] shadow-2xl scale-[1.03] bg-gradient-to-b from-[#387cae]/5 to-white'
                                            : 'border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5'
                                    }`}
                                >
                                    <span className='absolute top-6 right-6 font-mono text-[10px] text-gray-300'>
                                        {level.code}
                                    </span>
                                    {level.highlighted && (
                                        <span className='absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider bg-[#c9862a] text-white px-3 py-1 rounded-full shadow-md'>
                                            {level.note}
                                        </span>
                                    )}
                                    <div className='flex items-center gap-3 mb-4'>
                                        <div
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                                level.highlighted
                                                    ? 'bg-[#387cae] text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            <Icon size={22} />
                                        </div>
                                        <div>
                                            <h2 className='text-lg font-bold text-gray-900'>
                                                {level.name}
                                            </h2>
                                            <p className='text-xs text-gray-400'>{level.tagline}</p>
                                        </div>
                                    </div>
                                    <div className='mb-6'>
                                        <span className='text-3xl font-black text-gray-900'>
                                            {level.price}
                                        </span>
                                        <span className='text-sm text-gray-400 ml-1'>
                                            {level.period}
                                        </span>
                                    </div>
                                    <ul className='space-y-3 mb-8'>
                                        {level.features.map((feature, idx) => (
                                            <li
                                                key={idx}
                                                className='flex items-start gap-2.5 text-sm text-gray-600'
                                            >
                                                <Check
                                                    size={16}
                                                    className='shrink-0 mt-0.5 text-[#387cae]'
                                                />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link
                                        href={{
                                            pathname: '/membership',
                                            query: { plan: level.id }
                                        }}
                                        className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                                            level.highlighted
                                                ? 'bg-[#387cae] text-white shadow-lg hover:bg-[#2d658e]'
                                                : 'border-2 border-[#387cae] text-[#387cae] hover:bg-[#387cae]/5'
                                        }`}
                                        style={level.highlighted ? { backgroundColor: THEME_BLUE } : undefined}
                                    >
                                        {level.cta}
                                    </Link>
                                </div>
                            )
                        })}
                    </div>

                    {/* Legal / editable content */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <div className='max-w-[800px] mx-auto text-left'>
                            <div className='pt-12 border-t border-gray-100'>
                                <h2 className='text-2xl font-bold text-gray-900 mb-6 text-center'>
                                    Membership Details
                                </h2>
                                <div
                                    className='space-y-8 text-gray-600 leading-relaxed text-lg prose prose-lg max-w-none'
                                    dangerouslySetInnerHTML={{
                                        __html:
                                            content ||
                                            '<p>Membership terms and benefits will be listed here.</p>'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default MembershipPricing