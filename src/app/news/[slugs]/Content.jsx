'use client'
import services from '@/app/apiService'
import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import Loading from '../../../ui/molecules/Loading'
import Banner from './components/Banner'
import Description from './components/Description'
import Hero from './components/Hero'
import SmallCardList from './components/SmallCardList'
import SideBanner from '../../../components/Frontpage/SideBanner'
import ShareSection from '@/ui/organisms/common/ShareSection'

const NewsContent = ({ initialNews, initialSimilarNews, slugs }) => {
    const [news, setNews] = useState(initialNews)
    const [similarNews, setSimilarNews] = useState(initialSimilarNews || [])
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(!initialNews)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchAdditionalData = async () => {
            try {
                const [newsData, bannerData] = await Promise.all([
                    !initialNews ? services.news.getBySlug(slugs) : Promise.resolve(null),
                    services.banner.getAll().catch(() => ({ items: [] }))
                ])

                if (newsData) {
                    const newsItem = newsData.news || newsData.item || null
                    setNews(newsItem)
                    setSimilarNews(newsData.similarNews || newsData.related || [])
                } else if (!initialSimilarNews && initialNews) {
                     const fullData = await services.news.getBySlug(slugs)
                     setSimilarNews(fullData.similarNews || fullData.related || [])
                }

                setBanners(bannerData.items || [])
            } catch (err) {
                if (err.message.includes('404')) {
                    setError('notfound')
                } else {
                    console.error('Fetch error:', err)
                    setError(true)
                }
            } finally {
                setLoading(false)
            }
        }

        fetchAdditionalData()
    }, [slugs, initialNews, initialSimilarNews])

    if (!loading && (error === 'notfound' || !news)) {
        notFound()
    }

    if (error && error !== 'notfound') return <div>Error loading news details.</div>

    return (
        <div>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <Hero news={news} />
                    <div className='px-6 md:px-16 max-w-[1600px] mx-auto'>
                        <Banner />
                    </div>

                    <div className='px-6 md:px-16 max-w-[1600px] mx-auto mt-12 flex flex-col lg:flex-row gap-12'>
                        <div className='flex-1 min-w-0'>
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

                        {banners.length > 0 && (
                            <div className='lg:w-[320px] shrink-0'>
                                <div className='sticky top-28'>
                                    <h3 className='text-sm font-semibold mb-6'> Sponsored Content </h3>
                                    <SideBanner banners={banners} />
                                </div>
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

        </div>
    )
}

export default NewsContent
