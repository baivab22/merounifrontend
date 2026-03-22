import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const ProgramSection = ({ university }) => {
  const programs = Array.isArray(university?.programs) ? university.programs : []

  if (programs.length === 0) return null

  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-3'>
          <div className='w-1.5 h-6 bg-[#30AD8F] rounded-full' />
          <h2 className='text-xl font-bold text-gray-900'>Programs Offered</h2>
        </div>
        <span className='text-sm font-medium bg-[#30AD8F]/10 text-[#30AD8F] px-4 py-1.5 rounded-full border border-[#30AD8F]/20'>
          {programs.length} Program{programs.length > 1 && 's'}
        </span>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {programs.map((item, idx) => (
          <Link
            key={item.id || idx}
            href={`/programs/${item?.program?.slugs}`}
            className='group flex items-center justify-between rounded-xl bg-gray-50/50 px-5 py-4 border border-transparent hover:border-[#30AD8F]/30 hover:bg-white hover:shadow-xl hover:shadow-[#30AD8F]/5 transition-all duration-300'
          >
            <div className='flex items-center gap-3'>
              <span className='h-2 w-2 rounded-full bg-[#30AD8F] group-hover:scale-125 transition-transform' />
              <span className='text-sm md:text-base font-bold text-gray-700 group-hover:text-gray-900 transition-colors'>
                {item?.program?.title || 'N/A'}
              </span>
            </div>
            <ArrowRight className='w-4 h-4 text-[#30AD8F] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all' />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ProgramSection
