'use client'

import { slugify } from '@/lib/slugify'
import EmptyState from '@/ui/shadcn/EmptyState'
import DOMPurify from 'dompurify'
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import Footer from '../../../components/Frontpage/Footer'
import Header from '../../../components/Frontpage/Header'
import Navbar from '../../../components/Frontpage/Navbar'
import Loading from '../../../ui/molecules/Loading'
import { getDegreeBySlug } from '../actions'
import OfferedColleges from './components/OfferedColleges'
import RelatedCourses from './components/RelatedCourses'
import Syllabus from './components/syllabus'
import ImageSection from './components/upperSection'

// Shared Share Section
const ShareSection = ({ degree }) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = `Check out ${degree?.title} on our platform`

  const shareLinks = [
    { name: 'Facebook', icon: '/images/fb.png', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareTitle)}`, popup: { w: 626, h: 436 } },
    { name: 'Twitter', icon: '/images/twitter.png', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`, popup: { w: 550, h: 420 } },
    { name: 'LinkedIn', icon: '/images/linkedin.png', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, popup: { w: 550, h: 420 } },
  ]

  const handleShare = (link) => {
    window.open(link.url, `${link.name}-share-dialog`, `width=${link.popup.w},height=${link.popup.h}`)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareTitle}\n${currentUrl}`)
    alert('Link copied to clipboard!')
  }

  return (
    <div className='fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-100 shadow-xl z-50 py-3 px-6 rounded-2xl flex items-center gap-4 transition-all hover:shadow-2xl'>
      <span className='text-[10px] uppercase tracking-widest font-bold text-gray-400 mr-2'>Share</span>
      {shareLinks.map((link) => (
        <button key={link.name} onClick={() => handleShare(link)} className='hover:-translate-y-1 transition-transform'>
          <img src={link.icon} alt={link.name} className='w-5 h-5 object-contain' />
        </button>
      ))}
      <button onClick={handleCopy} className='hover:-translate-y-1 transition-transform'>
        <img src='/images/insta.png' alt='Copy Link' className='w-5 h-5 object-contain' />
      </button>
    </div>
  )
}

const ProgramCard = ({ program }) => {
  if (!program.slugs) {
    return (
      <div className='h-full p-6 rounded-2xl border border-gray-100 bg-gray-50/50 grayscale opacity-60'>
        <div className='mb-4'>
          <div className='w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400'>
            <GraduationCap className='w-5 h-5' />
          </div>
        </div>
        <h3 className='font-bold text-gray-500 line-clamp-2'>{program.title}</h3>
        <p className='text-xs text-gray-400 mt-2 italic'>Coming soon</p>
      </div>
    )
  }

  return (
    <div
      className='group relative h-full p-6 rounded-2xl border border-gray-100 bg-white hover:border-[#30AD8F] hover:shadow-lg transition-all duration-300'
    >
      <div className='flex flex-col h-full'>
        <div className='flex items-start justify-between mb-4'>
          <div className='p-2 rounded-xl bg-[#30AD8F]/5 text-[#30AD8F] group-hover:bg-[#30AD8F] group-hover:text-white transition-colors duration-300'>
            <GraduationCap className='w-5 h-5' />
          </div>
        </div>
        <h3 className='font-bold text-gray-900 leading-snug line-clamp-2 mb-2'>
          {program.title}
        </h3>
        <div className='mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-400 font-bold'>
          <span>{program.duration || 'Full Time'}</span>
          {program.code && <span>{program.code}</span>}
        </div>
      </div>
    </div>
  )
}

const CourseDescription = ({ params }) => {
  const [degree, setDegree] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDegree = async () => {
      try {
        setLoading(true)
        setError(null)

        const resolvedParams = await params
        const slugs = decodeURIComponent(resolvedParams.slugs)
        const finalSlug = slugify(slugs)

        await fetchDegreeDetails(finalSlug)
      } catch (error) {
        console.error('Error resolving params:', error)
        setError('Failed to load degree information')
        setLoading(false)
      }
    }
    fetchDegree()
  }, [params])

  const fetchDegreeDetails = async (slugs) => {
    try {
      const degreeData = await getDegreeBySlug(slugs)

      if (degreeData && degreeData.id) {
        setDegree(degreeData)
        setError(null)
      } else {
        setError('Degree not found')
        setDegree(null)
      }
    } catch (error) {
      console.error('Error fetching degree details:', error)
      setError(error.message || 'Failed to fetch degree details')
      setDegree(null)
    } finally {
      setLoading(false)
    }
  }

  const uniqueColleges = useMemo(() => {
    if (degree?.colleges && degree.colleges.length > 0) return degree.colleges
    if (!degree?.programs) return []
    const collegesMap = new Map()
    degree.programs.forEach((program) => {
      program.colleges?.forEach((college) => {
        if (!collegesMap.has(college.id)) {
          collegesMap.set(college.id, college)
        }
      })
    })
    return Array.from(collegesMap.values())
  }, [degree])

  if (loading) {
    return <Loading />
  }

  if (error || !degree) {
    return (
      <>
        <Header />
        <Navbar />
        <div className='container mx-auto px-4 py-10'>
          <EmptyState
            icon={BookOpen}
            title={
              error === 'Degree not found' || !degree
                ? 'Degree Not Found'
                : 'Something went wrong'
            }
            description={
              error ||
              "We couldn't find the degree you're looking for. It might have been moved or deleted."
            }
            action={{
              label: 'Browse All Degrees',
              onClick: () => (window.location.href = '/degree')
            }}
          />
        </div>
      </>
    )
  }

  const isSimpleDegree = degree && degree.short_name != null && !degree.syllabus

  return (
    <>
      <div>
        <Header />
        <Navbar />
        {degree && (
          <>
            {isSimpleDegree ? (
              <div className='bg-white min-h-screen'>
                <div className='w-full bg-gray-50 border-b border-gray-100 py-16 md:py-20 relative'>
                  <div className='absolute top-6 left-6 md:left-24 z-10'>
                    <Link
                      href='/degree'
                      className='inline-flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white backdrop-blur-md text-gray-700 rounded-full text-sm font-medium transition-all shadow-sm border border-gray-100'
                    >
                      <ArrowLeft className='w-4 h-4' />
                      <span>Back to Degrees</span>
                    </Link>
                  </div>
                  <div className='container mx-auto px-4'>
                    <div className='max-w-4xl mx-auto'>
                      {degree.short_name && (
                        <p className='text-xs font-bold text-[#30AD8F] uppercase tracking-[0.2em] mb-3'>
                          {degree.short_name}
                        </p>
                      )}
                      <h1 className='text-3xl md:text-5xl font-bold text-gray-900 mb-6'>
                        {degree.title}
                      </h1>
                      {degree.description && (
                        <p className='text-gray-600 text-lg max-w-2xl leading-relaxed italic'>
                          {degree.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className='container mx-auto px-4 pt-16'>
                  <div className='max-w-4xl mx-auto'>
                    <div className='w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50 flex items-center justify-center mb-16'>
                      <img
                        src={degree.cover_image || degree.featured_image || '/images/logo.png'}
                        alt={degree.title}
                        className={
                          degree.cover_image || degree.featured_image
                            ? 'w-full h-full object-cover'
                            : 'w-1/3 h-auto object-contain opacity-50'
                        }
                      />
                    </div>

                    {degree.content && (
                      <div className='mb-20'>
                        <div
                          className='prose prose-lg prose-gray max-w-none'
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(degree.content) }}
                        />
                      </div>
                    )}

                    {degree.programs && degree.programs.length > 0 && (
                      <div className='mb-20'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-8 border-l-4 border-[#30AD8F] pl-4'>
                          Available Programs
                        </h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                          {degree.programs.map((program) => (
                            <ProgramCard key={program.id} program={program} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <ImageSection degree={degree} />

                {degree.content && (
                  <div className='container mx-auto px-4 py-20'>
                    <div className='max-w-4xl mx-auto'>
                      <div
                        className='prose prose-lg prose-gray max-w-none'
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(degree.content) }}
                      />
                    </div>
                  </div>
                )}

                <Syllabus degree={degree} />
                <RelatedCourses degree={degree} />

                {degree.programs && degree.programs.length > 0 && (
                  <div className='container mx-auto px-4 py-20'>
                    <div className='max-w-4xl mx-auto'>
                      <h2 className='text-2xl font-bold text-gray-900 mb-8 border-l-4 border-[#30AD8F] pl-4'>
                        Available Programs
                      </h2>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {degree.programs.map((program) => (
                          <ProgramCard key={program.id} program={program} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <OfferedColleges colleges={uniqueColleges} />

            <div className='container mx-auto px-4 pb-20'>
              <ShareSection degree={degree} />
            </div>
          </>
        )}
        <Footer />
      </div>
    </>
  )
}

export default CourseDescription
