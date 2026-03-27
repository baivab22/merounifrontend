'use client'
import services from '@/app/apiService'
import { useEffect, useState } from 'react'
import Loading from '../../../ui/molecules/Loading'
import BannerLayout from '../../../components/Frontpage/BannerLayout'
import SideBanner from '../../../components/Frontpage/SideBanner'
import Description from './components/Description'
import Hero from './components/Hero'
import SmallCardList from './components/SmallCardList'
import ShareSection from '@/ui/organisms/common/ShareSection'

const BlogContent = ({ initialBlog, slugs }) => {
  const [blog, setBlog] = useState(initialBlog)
  const [relatedBlogs, setRelatedBlogs] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(!initialBlog)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const [newsData, bannerData] = await Promise.all([
          !initialBlog ? services.blogs.getBySlug(slugs) : Promise.resolve(null),
          services.banner.getAll({ type: 'FRONT_PAGE' }).catch(() => ({ items: [] }))
        ])

        if (newsData) {
          setBlog(newsData.blog || null)
          setRelatedBlogs(newsData.similarBlogs || [])
        } else if (initialBlog) {
            // If we have initialBlog, we still need similar blogs
            const fullData = await services.blogs.getBySlug(slugs)
            setRelatedBlogs(fullData.similarBlogs || [])
        }
        
        setBanners(bannerData.items || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAdditionalData()
  }, [slugs, initialBlog])

  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Hero blog={blog} />
          <div className='px-6 md:px-16 max-w-[1600px] mx-auto'>
            <BannerLayout banners={banners} />
          </div>

          <div className='px-6 md:px-16 max-w-[1600px] mx-auto mt-12 flex flex-col lg:flex-row gap-12'>
            <div className='flex-1 md:w-3/4 min-w-0'>
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

            {/* Sidebar with ads */}
            <div className='w-full md:w-1/4 hidden md:block'>
                <SideBanner banners={banners} />
            </div>
          </div>

          <div className='max-w-[1600px] mx-auto px-6 md:px-16'>
            <div className='h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent my-16'></div>
          </div>
          <div className='px-6 md:px-16 my-14 max-w-[1600px] mx-auto'>
            <SmallCardList blogs={relatedBlogs} />
          </div>

          <ShareSection title={blog?.title} />
        </>
      )}

    </div>
  )
}

export default BlogContent
