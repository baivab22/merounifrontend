import React, { Suspense } from 'react'
import Link from 'next/link'
import { ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import MembershipForm from './components/MembershipForm'

export const metadata = {
    title: 'Apply for Membership',
    description:
        'Join MeroUni Membership — pick your level, choose your career field, get professional trainings and free Grade 12 exam prep.',
    alternates: {
        canonical: '/membership'
    }
}

const HIGHLIGHTS = [
    {
        icon: ShieldCheck,
        title: 'Verified by MeroUni',
        text: 'Reviewed by our team before activation — no spam, no random trainers.'
    },
    {
        icon: Sparkles,
        title: 'Free Grade 12 prep',
        text: 'Board exam preparation is included free for every +2 member.'
    },
    {
        icon: Wallet,
        title: 'Pay your way',
        text: 'eSewa, Khalti or bank transfer. Proof upload is optional but speeds things up.'
    }
]

const MembershipFormSkeleton = () => (
    <div className='w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80'>
        <div
            className='h-48 w-full'
            style={{ background: `linear-gradient(120deg, #387cae 0%, #2c7a9a 55%, #2d658e 100%)` }}
        />
        <div className='space-y-4 px-7 py-10 sm:px-10'>
            <div className='h-3 w-40 animate-pulse rounded-full bg-slate-100' />
            <div className='h-7 w-2/3 animate-pulse rounded-full bg-slate-100' />
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className='h-36 animate-pulse rounded-2xl border border-slate-100 bg-slate-50'
                    />
                ))}
            </div>
        </div>
    </div>
)

const MembershipPage = () => {
    return (
        <>
            <Header />
            <Navbar />
            <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50'>
                <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16'>
                    <div className='mb-10 text-center'>
                        <p className='mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1F6F5C]'>
                            MeroUni Membership
                        </p>
                        <h1 className='mx-auto max-w-3xl font-poppins text-3xl font-bold tracking-tight text-slate-900 lg:text-[42px] lg:leading-tight'>
                            One application, every step of your{' '}
                            <span className='text-[#0a6fa7]'>education journey</span>
                        </h1>
                        <p className='mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500'>
                            Tell us where you are, what you want to train in, and
                            you&rsquo;re in. Most members finish the form in about
                            two minutes.
                        </p>
                        <div className='mt-5 text-sm text-slate-500'>
                            Want to compare levels first?{' '}
                            <Link
                                href='/student-membership-pricing'
                                className='font-semibold text-[#387cae] underline-offset-4 hover:underline'
                            >
                                See membership pricing
                            </Link>
                        </div>
                    </div>

                    <div className='flex flex-col items-center'>
                        <div className='w-full max-w-5xl'>
                            <Suspense fallback={<MembershipFormSkeleton />}>
                                <MembershipForm />
                            </Suspense>
                        </div>
                    </div>

                    <div className='mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3'>
                        {HIGHLIGHTS.map((item) => {
                            const Icon = item.icon
                            return (
                                <div
                                    key={item.title}
                                    className='rounded-2xl border border-slate-200 bg-white/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#387cae]/40 hover:shadow-md'
                                >
                                    <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#387cae]/10 text-[#387cae]'>
                                        <Icon size={20} />
                                    </div>
                                    <h2 className='text-[15px] font-bold text-slate-900'>
                                        {item.title}
                                    </h2>
                                    <p className='mt-1.5 text-[13px] leading-relaxed text-slate-500'>
                                        {item.text}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default MembershipPage
