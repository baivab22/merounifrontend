'use client'

import React, { useState } from 'react'
import { THEME_BLUE } from '@/constants/constants'
import { ChevronDown } from 'lucide-react'

const FAQs = () => {
    const [openIndex, setOpenIndex] = useState(null)

    const faqs = [
        {
            question: "What is MeroUni?",
            answer: "MeroUni is a comprehensive educational platform dedicated to helping students find the right colleges, schools, and courses in Nepal. We provide detailed information, notes, and entrance preparation materials."
        },
        {
            question: "How can I find a college or school?",
            answer: "You can use our search feature on the homepage or browse through various categories like 'Colleges' or 'Schools' to find institutions that match your preferences."
        },
        {
            question: "Are the study materials free?",
            answer: "We offer a wide range of free notes and resources for Class 11, 12, and entrance exams. Some specialized premium materials may require a membership for full access."
        },
        {
            question: "How can institutions list themselves?",
            answer: "Educational institutions can reach out to us via info@merouni.com to get their profiles verified and listed on our platform."
        }
    ]

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <>
            <div className='min-h-screen bg-white'>
                <div className='max-w-[850px] mx-auto px-6 py-16 lg:py-24'>
                    <div className="mb-12 border-b border-gray-100 pb-8">
                        <h1 className='text-3xl lg:text-4xl font-black text-gray-900 mb-4'>Frequently Asked Questions</h1>
                        <p className='text-gray-500 text-lg'>Quick answers to common questions about MeroUni.</p>
                    </div>

                    <div className='space-y-4'>
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-gray-200 transition-all">
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors"
                                >
                                    <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                                    <ChevronDown
                                        className={`shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                                        style={{ color: THEME_BLUE }}
                                        size={20}
                                    />
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="p-6 pt-0 text-gray-600 leading-relaxed text-lg border-t border-gray-50 mt-4">
                                        <div className="pt-4">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Still have questions?</h3>
                            <p className="text-gray-600">Our support team is ready to help you.</p>
                        </div>
                        <a
                            href="/contact"
                            className="px-6 py-2.5 rounded-lg font-bold transition-all text-white shadow-sm"
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
