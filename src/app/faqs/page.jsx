'use client'

import React, { useState, useEffect } from 'react'
import { THEME_BLUE } from '@/constants/constants'
import { ChevronDown, Loader2 } from 'lucide-react'
import { getConfigByType } from '../actions/siteConfigActions'

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const data = await getConfigByType('site_faq')
        if (data?.config?.value) {
          const parsed = JSON.parse(data.config.value)
          if (Array.isArray(parsed)) {
            setFaqs(parsed)
          }
        }
      } catch (error) {
        console.error('Error loading dynamic FAQs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFaqs()
  }, [])

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      <div className='min-h-screen bg-white'>
        <div className='max-w-[850px] mx-auto px-6 py-16 lg:py-24'>
          <div className='mb-12 border-b border-gray-100 pb-8'>
            <h1 className='text-3xl lg:text-4xl font-black text-gray-900 mb-4'>
              Frequently Asked Questions
            </h1>
            <p className='text-gray-500 text-lg'>
              Quick answers to common questions about MeroUni.
            </p>
          </div>

          <div className='space-y-4'>
            {loading ? (
              <div className='flex flex-col items-center justify-center py-20 gap-4'>
                <Loader2 className='animate-spin text-gray-300' size={40} />
                <p className='text-gray-400 font-medium'>
                  Loading questions...
                </p>
              </div>
            ) : faqs.length > 0 ? (
              faqs.map((faq, index) => (
                <div
                  key={index}
                  className='border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-gray-200 transition-all'
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className='w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors'
                  >
                    <span className='text-lg font-bold text-gray-900'>
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                      style={{ color: THEME_BLUE }}
                      size={20}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === index
                        ? 'max-h-[1000px] opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className='p-6 pt-0 text-gray-600 leading-relaxed text-lg border-t border-gray-50 mt-4'>
                      <div
                        className='pt-4 prose prose-slate max-w-none'
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-20 bg-gray-50 rounded-xl border border-dashed'>
                <p className='text-gray-500'>No FAQs found at the moment.</p>
              </div>
            )}
          </div>

          <div className='mt-20 p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6'>
            <div>
              <h3 className='font-bold text-gray-900 mb-1'>
                Still have questions?
              </h3>
              <p className='text-gray-600'>
                Our support team is ready to help you.
              </p>
            </div>
            <a
              href='/contact'
              className='px-6 py-2.5 rounded-lg font-bold transition-all text-white shadow-sm'
              style={{ backgroundColor: THEME_BLUE }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default FAQs
