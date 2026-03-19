'use client'
import Footer from '@/components/Frontpage/Footer'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import { ArrowLeft, Home, Search } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
    const THEME_BLUE = '#387cae';

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header />
            <Navbar />

            <main className="flex-grow flex flex-col items-center justify-center py-24 px-6 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#387cae]/5 rounded-full blur-3xl -z-10" />
                <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-2xl -z-10" />

                <div className="max-w-2xl w-full text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="relative inline-block">
                        <div className="text-[180px] md:text-[240px] font-black text-[#387cae]/5 select-none leading-none">
                            404
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                            <div className="p-5 bg-white rounded-3xl shadow-2xl shadow-[#387cae]/10 border border-slate-50 relative group">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-[#387cae] to-blue-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                                <Search className="w-12 h-12 text-[#387cae] relative" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Oops! Page Lost</h2>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-md mx-auto">
                        <p className="text-xl md:text-2xl font-bold text-gray-700">We couldn't find what you're looking for.</p>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            The page might have been removed, or the link you followed is broken.
                            Let's get you back on track.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-100 text-gray-700 font-bold rounded-2xl hover:border-[#387cae] hover:text-[#387cae] transition-all active:scale-95 shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                        <Link
                            href="/"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#387cae] text-white font-bold rounded-2xl shadow-xl shadow-[#387cae]/20 hover:bg-[#2d648c] transition-all hover:scale-105 active:scale-95"
                        >
                            <Home className="w-5 h-5" />
                            Return Home
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

