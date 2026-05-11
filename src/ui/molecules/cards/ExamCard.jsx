'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardCheck, Calendar, Tag, ArrowRight } from 'lucide-react'
import { formatDate } from '@/utils/date.util'

const ExamCard = ({ exam }) => {
  const router = useRouter()
  const isExpired = new Date(exam.closing_date) < new Date()

  return (
    <div
      onClick={() => router.push(`/exams/${exam.slug}`)}
      className='group bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col hover:border-gray-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 cursor-pointer'
    >
      {/* Header with stylized icon/background */}
      <div className='relative h-24 bg-gradient-to-br from-blue-50 to-indigo-50/30 overflow-hidden'>
        <div className='absolute top-4 right-4'>
          <div className='w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 flex items-center justify-center text-[#0A70A7] shadow-sm'>
            <ClipboardCheck className='w-5 h-5' />
          </div>
        </div>
        <div className='absolute bottom-3 left-4 flex gap-2'>
          {exam.exam_type && (
            <span className='px-2.5 py-1 rounded-md bg-emerald-500/90 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-wider shadow-sm'>
              {exam.exam_type}
            </span>
          )}
          {exam.level?.title && (
            <span className='px-2.5 py-1 rounded-md bg-[#0A70A7]/90 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-wider shadow-sm'>
              {exam.level.title}
            </span>
          )}
        </div>
      </div>

      <div className='p-6 flex flex-col flex-1'>
        <div className='mb-4 flex-1'>
          <h2 className='text-base md:text-lg font-bold text-gray-900 group-hover:text-[#0A70A7] transition-colors duration-300 line-clamp-2 leading-tight mb-2'>
            {exam.title}
          </h2>
          
          {Array.isArray(exam.affiliation) && exam.affiliation.length > 0 && (
            <div className='flex items-center gap-2 mt-3'>
              <div className='flex -space-x-1.5'>
                {exam.affiliation.slice(0, 3).map((uni, idx) => (
                  <div key={idx} className='w-6 h-6 rounded-full border-2 border-white bg-white overflow-hidden shrink-0 shadow-sm'>
                    <img 
                      src={uni.logo || '/images/default-uni.png'} 
                      alt='' 
                      className='w-full h-full object-contain p-0.5' 
                    />
                  </div>
                ))}
              </div>
              <span className='text-[10px] font-bold text-gray-400 uppercase tracking-tight'>
                {exam.affiliation[0]?.fullname || exam.affiliation[0]?.name}
                {exam.affiliation.length > 1 && ` +${exam.affiliation.length - 1} More`}
              </span>
            </div>
          )}
        </div>

        <div className='mt-auto pt-5 border-t border-gray-50 grid grid-cols-2 gap-4'>
          <div className='flex flex-col'>
            <span className='text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-1'>Closing Date</span>
            <div className='flex items-center gap-2'>
              <Calendar className='w-3.5 h-3.5 text-gray-400' />
              <span className={`text-xs font-bold ${isExpired ? 'text-red-500' : 'text-gray-700'}`}>
                {formatDate(exam.closing_date) || 'TBD'}
              </span>
            </div>
          </div>
          <div className='flex flex-col'>
            <span className='text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-1'>Exam Date</span>
            <div className='flex items-center gap-2'>
              <Tag className='w-3.5 h-3.5 text-[#0A70A7]' />
              <span className='text-xs font-extrabold text-[#0A70A7]'>
                {formatDate(exam.exam_date) || 'TBD'}
              </span>
            </div>
          </div>
        </div>

        <div className='mt-5'>
          <button className='w-full py-3 rounded-lg bg-gray-50 group-hover:bg-[#0A70A7] text-gray-500 group-hover:text-white text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-gray-100 group-hover:border-[#0A70A7] shadow-sm'>
            View Exam Details
            <ArrowRight className='w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExamCard
