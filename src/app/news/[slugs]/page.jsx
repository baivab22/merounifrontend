'use client'
import services from '@/app/apiService'
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import Footer from '../../../components/Frontpage/Footer'
import Header from '../../../components/Frontpage/Header'
import Navbar from '../../../components/Frontpage/Navbar'
import Loading from '../../../ui/molecules/Loading'
import Banner from './components/Banner'
import Description from './components/Description'
import Hero from './components/Hero'
import SmallCardList from './components/SmallCardList'
import SideBanner from '../../../components/Frontpage/SideBanner'
import ShareSection from '@/ui/organisms/common/ShareSection'

const NewsDetailsPage = ({ params }) => {
    const [news, setNews] = useState(null)
    const [similarNews, setSimilarNews] = useState([])
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchNewsDetails = async () => {
            try {
                const resolvedParams = await params
                const [newsData, bannerData] = await Promise.all([
                    services.news.getBySlug(resolvedParams.slugs),
                    services.banner.getAll().catch(() => ({ items: [] }))
                ])

                const newsItem = newsData.news || newsData.item || null
                if (!newsItem && !loading) {
                    setNews(null)
                } else {
                    setNews(newsItem)
                    setSimilarNews(newsData.similarNews || newsData.related || [])
                    setBanners(bannerData.items || [])
                }
            } catch (err) {
                // If it's a 404 error from the API, we can just treat it as not found
                if (err.message.includes('404')) {
                    setError(null) // Not a "system error", just not found
                } else {
                    console.error('Fetch error:', err)
                    setError(true)
                }
            } finally {
                setLoading(false)
            }
        }

        fetchNewsDetails()
    }, [params])

    if (!loading && (error || !news)) {
        notFound()
    }

    return (
        <div>
            <Header />
            <Navbar />
            {loading ? (
                <Loading />
            ) : (
                <>
                    <Hero news={news} />
                    <div className='px-6 md:px-16 max-w-[1600px] mx-auto'>
                        <Banner />
                    </div>

                    <div className='px-6 md:px-16 max-w-[900px] mx-auto mt-12'>
                        {/* Main Content Area */}
                        <div className='w-full'>
                            <Description news={news} />

                            {news?.pdf_file && (
                                <div className='mt-10'>
                                    <div className='p-6 bg-[#387cae]/5 rounded-2xl border border-[#387cae]/10 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-[#387cae]/10 transition-all duration-300 group'>
                                        <div className='flex items-center gap-4'>
                                            <div className='p-4 bg-[#387cae] rounded-2xl text-white shadow-lg shadow-[#387cae]/20 transition-transform group-hover:scale-110'>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className='font-bold text-gray-900 text-lg'>Attached Document</h4>
                                                <p className='text-sm text-gray-500 font-medium'>Official PDF Document Available</p>
                                            </div>
                                        </div>
                                        <a
                                            href={news.pdf_file}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='w-full sm:w-auto text-center px-8 py-3 bg-white border border-[#387cae]/20 text-[#387cae] rounded-xl font-bold text-sm hover:bg-[#387cae] hover:text-white hover:border-[#387cae] transition-all shadow-sm'
                                        >
                                            View Document
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar content now at the bottom or as a centered section */}
                        {banners.length > 0 && (
                            <div className='mt-16 pt-16 border-t border-gray-100'>
                                <h3 className='text-sm font-semibold mb-6 text-gray-400 uppercase tracking-widest text-[10px] text-center'>
                                    Sponsored Content
                                </h3>
                                <SideBanner banners={banners} />
                            </div>
                        )}
                    </div>

                    <div className='max-w-[1600px] mx-auto px-6 md:px-16'>
                        <div className='h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent my-16'></div>
                    </div>
                    <div className='px-6 md:px-16 my-14 max-w-[1600px] mx-auto pb-20'>
                        <SmallCardList news={similarNews} />
                    </div>

                    <ShareSection title={news?.title} type='news' />
                </>
            )}

            <Footer />
        </div>
    )
}

export default NewsDetailsPage
