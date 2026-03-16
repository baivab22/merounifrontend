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

const NewsDetailsPage = ({ params }) => {
  const [blog, setBlog] = useState(null)
  const [relatedBlogs, setRelatedBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const resolvedParams = await params
        const slugs = resolvedParams.slugs
        const newsData = await services.blogs.getBySlug(slugs)

        setBlog(newsData.blog || null)
        setRelatedBlogs(newsData.similarBlogs || [])
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
          <div className='px-6 md:px-16 max-w-[1600px] mx-auto mt-12'>
            <Description blog={blog} />
          </div>
          <div className='px-6 md:px-16 max-w-[1600px] mx-auto mt-12'>
            {
              blog?.pdf_file && (
                <a
                  href={blog.pdf_file}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 px-10 rounded-2xl font-bold transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 shadow-lg shadow-blue-100'
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  Read Attached PDF Document
                </a>
              )
            }
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
