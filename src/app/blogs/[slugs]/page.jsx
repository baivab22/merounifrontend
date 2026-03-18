'use client'
import services from '@/app/apiService'
import { useEffect, useState } from 'react'
import Footer from '../../../components/Frontpage/Footer'
import Header from '../../../components/Frontpage/Header'
import Navbar from '../../../components/Frontpage/Navbar'
import Loading from '../../../ui/molecules/Loading'
import Banner from './components/Banner'
import Description from './components/Description'
import Hero from './components/Hero'
import SmallCardList from './components/SmallCardList'

// Share Section - matches college description page style
const ShareSection = ({ blog }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = `Check out ${blog?.title || 'this blog'} on our platform`

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareTitle)}`,
      'facebook-share-dialog',
      'width=626,height=436'
    )
  }

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`,
      'twitter-share-dialog',
      'width=550,height=420'
    )
  }

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      'linkedin-share-dialog',
      'width=550,height=420'
    )
  }

  const handleInstagramShare = () => {
    navigator.clipboard.writeText(`${shareTitle}\n${currentUrl}`)
    alert('Link copied to clipboard! You can now paste it in Instagram')
  }

  return (
    <div className='fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-gray-100 shadow-2xl z-50 py-3 px-6 rounded-2xl transition-all hover:scale-105'>
      <div className='flex flex-row gap-5 items-center justify-center'>
        <span className='text-gray-700 text-xs uppercase tracking-wider font-medium mr-2'>
          Share
        </span>

        <button
          onClick={handleFacebookShare}
          className='hover:opacity-80 transition-all hover:-translate-y-1'
          aria-label='Share on Facebook'
        >
          <img src='/images/fb.png' alt='Facebook' className='w-5' />
        </button>

        <button
          onClick={handleTwitterShare}
          className='hover:opacity-80 transition-all hover:-translate-y-1'
          aria-label='Share on Twitter'
        >
          <img src='/images/twitter.png' alt='Twitter' className='w-5' />
        </button>

        <button
          onClick={handleLinkedInShare}
          className='hover:opacity-80 transition-all hover:-translate-y-1'
          aria-label='Share on LinkedIn'
        >
          <img src='/images/linkedin.png' alt='LinkedIn' className='w-5' />
        </button>

        <button
          onClick={handleInstagramShare}
          className='hover:opacity-80 transition-all hover:-translate-y-1'
          aria-label='Share on Instagram'
        >
          <img src='/images/insta.png' alt='Instagram' className='w-5' />
        </button>
      </div>
    </div>
  )
}

import SideBanner from '../../../components/Frontpage/SideBanner'

const NewsDetailsPage = ({ params }) => {
  const [blog, setBlog] = useState(null)
  const [relatedBlogs, setRelatedBlogs] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const [newsData, bannerData] = await Promise.all([
          services.blogs.getBySlug((await params).slugs),
          services.banner.getAll().catch(() => ({ items: [] }))
        ])

        setBlog(newsData.blog || null)
        setRelatedBlogs(newsData.similarBlogs || [])
        setBanners(bannerData.items || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogDetails()
  }, [params])

  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <Header />
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <>
          <Hero blog={blog} />
          <div className='px-6 md:px-16 max-w-[1600px] mx-auto'>
            <Banner />
          </div>

          <div className='px-6 md:px-16 max-w-[1600px] mx-auto mt-12 flex flex-col lg:flex-row gap-12'>
            {/* Left side: Content */}
            <div className='flex-1 min-w-0'>
              <Description blog={blog} />

              {blog?.pdf_file && (
                <div className='mt-10'>
                  <div className='p-6 bg-[#0A6FA7]/5 rounded-2xl border border-[#0A6FA7]/10 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-[#0A6FA7]/10 transition-all duration-300 group'>
                    <div className='flex items-center gap-4'>
                      <div className='p-4 bg-[#0A6FA7] rounded-2xl text-white shadow-lg shadow-[#0A6FA7]/20 transition-transform group-hover:scale-110'>
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
                      href={blog.pdf_file}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='w-full sm:w-auto text-center px-8 py-3 bg-white border border-[#0A6FA7]/20 text-[#0A6FA7] rounded-xl font-bold text-sm hover:bg-[#0A6FA7] hover:text-white hover:border-[#0A6FA7] transition-all shadow-sm'
                    >
                      View Document
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Sidebar with Banners/Ads */}
            <div className='lg:w-[320px] shrink-0'>
              <div className='sticky top-28'>
                <h3 className='text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mb-6'>
                  Sponsored Content
                </h3>
                <SideBanner banners={banners} />
              </div>
            </div>
          </div>

          {/* BIG BREAK LINE  */}
          <div className='max-w-[1600px] mx-auto px-6 md:px-16'>
            <div className='h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent my-16'></div>
          </div>
          <div className='px-6 md:px-16 my-14 max-w-[1600px] mx-auto'>
            <SmallCardList blogs={relatedBlogs} />
          </div>

          <ShareSection blog={blog} />
        </>
      )}

      <Footer />
    </div>
  )
}

export default NewsDetailsPage
