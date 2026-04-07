'use client'
import React from 'react'
import Link from 'next/link'
import { BookOpen, GraduationCap, ArrowLeft, Search } from 'lucide-react'
import EmptyState from '@/ui/shadcn/EmptyState'
import DegreeCard from '@/ui/molecules/cards/DegreeCard'

const DisciplineContent = ({ discipline, degrees, error }) => {
  if (error || !discipline) {
    return (
      <main className='container mx-auto px-4 py-20'>
        <EmptyState
          icon={BookOpen}
          title={error === 'Failed to fetch discipline' ? 'Discipline Not Found' : 'Error'}
          description={error || "We couldn't find the discipline you're looking for."}
          action={{
            label: 'Return Home',
            onClick: () => (window.location.href = '/')
          }}
        />
      </main>
    )
  }

  return (
    <main className='bg-gray-50/30 min-h-screen'>
      <div className='bg-white border-b border-gray-100'>
        <div className='container mx-auto px-4 py-12 md:py-16'>
          <Link href="/" className='inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#0A6FA7] mb-8 transition-colors' >
            <ArrowLeft className='w-4 h-4 mr-2' /> Back to Explore
          </Link>

          <div className='flex flex-col md:flex-row gap-10 items-start'>
            <div className='flex-1 max-w-3xl'>
              <div className='flex items-center gap-3 mb-4'>
                <span className='px-3 py-1 bg-[#0A6FA7]/10 text-[#0A6FA7] text-xs font-bold rounded-full border border-[#0A6FA7]/20 uppercase tracking-wider'> Field of Study </span>
              </div>
              <h1 className='text-3xl md:text-5xl font-bold text-gray-900 mb-6'> {discipline.title} </h1>
              <p className='text-gray-600 text-lg leading-relaxed'> {discipline.description || 'Explore various degree programs and career paths within this field of study.'} </p>
            </div>

            {discipline.featured_image && (
              <div className='w-full md:w-80 aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-gray-100'>
                <img src={discipline.featured_image} alt={discipline.title} className='w-full h-full object-cover' />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-16'>
        <div className='flex items-center justify-between mb-10'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2'>
              <GraduationCap className='w-7 h-7 text-[#0A6FA7]' /> Available Degrees
            </h2>
            <p className='text-gray-500'>Browse academic programs in {discipline.title}</p>
          </div>
          <div className='hidden md:block'>
            <span className='text-sm text-gray-400 font-medium'> Showing {degrees.length} Programs </span>
          </div>
        </div>

        {degrees.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {degrees.map((degree) => ( <DegreeCard key={degree.id} degree={degree} /> ))}
          </div>
        ) : (
          <div className='bg-white rounded-3xl border border-dashed border-gray-200 py-20 px-4 text-center'>
            <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6'> <Search className='w-10 h-10 text-gray-300' /> </div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>No Degrees Found</h3>
            <p className='text-gray-500 max-w-md mx-auto'> We currently don't have any degree programs listed under {discipline.title}. Please check back later or explore other fields. </p>
            <Link href="/" className='mt-8 inline-flex px-6 py-3 bg-[#0A6FA7] text-white font-bold rounded-md hover:bg-[#085a88] transition-colors shadow-lg shadow-blue-900/10' > Explore Other Fields </Link>
          </div>
        )}
      </div>
    </main>
  )
}

export default DisciplineContent
