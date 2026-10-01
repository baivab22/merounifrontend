'use client'
import React from 'react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import { getConfigByType } from '../actions/siteConfigActions'

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
        <div className='max-w-[800px] mx-auto px-6 py-16 lg:py-24 text-center'>
          {/* <p className='text-[11px] font-mono uppercase tracking-[0.15em] text-[#1F6F5C] mb-4 flex items-center justify-center gap-2'>
            <span className='w-6 h-px bg-[#1F6F5C]' />
            MeroUni Membership
            <span className='w-6 h-px bg-[#1F6F5C]' />
          </p>
          <h1 className='text-3xl lg:text-4xl font-black text-gray-900 mb-10 font-poppins tracking-tight'>
            Membership Pricing
          </h1> */}

          {/* Legal / editable content */}
          {loading ? (
            <div className='flex justify-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
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
