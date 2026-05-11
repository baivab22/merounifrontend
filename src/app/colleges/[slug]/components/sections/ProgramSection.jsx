import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Search, GraduationCap } from 'lucide-react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogClose
} from '@/ui/shadcn/dialog'
import { Input } from '@/ui/shadcn/input'

const ProgramSection = ({ college }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const programs = Array.isArray(college?.collegePrograms)
    ? college.collegePrograms
    : []
  const displayedPrograms = programs.slice(0, 4)

  const filteredPrograms = useMemo(() => {
    if (!searchQuery.trim()) return programs
    return programs.filter((p) =>
      p?.program?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [programs, searchQuery])

  if (programs.length === 0) return null

  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-3'>
          <div className='w-1.5 h-6 bg-[#0A6FA7] rounded-full' />
          <h2 className='text-xl font-bold text-gray-900'>Offered Programs</h2>
        </div>
        <span className='text-xs font-bold bg-[#0A6FA7]/10 text-[#0A6FA7] px-4 py-1.5 rounded-full border border-[#0A6FA7]/20 uppercase tracking-wider'>
          {programs.length} Program{programs.length > 1 && 's'}
        </span>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {displayedPrograms.map((item, idx) => (
          <div
            key={item.id || idx}
            className='group flex flex-col justify-between rounded-xl bg-gray-50/50 p-5 border border-transparent hover:border-[#0A6FA7]/30 hover:bg-white hover:shadow-lg transition-all duration-300'
          >
            <div className='flex items-start justify-between gap-3 mb-4'>
              <div className='flex items-center gap-3 min-w-0'>
                <span className='h-1.5 w-1.5 rounded-full bg-[#0A6FA7]/60 group-hover:bg-[#0A6FA7] transition-colors shadow-sm flex-shrink-0' />
                <Link
                  href={`/programs/${item?.program?.slug}`}
                  className='text-sm font-bold text-gray-700 group-hover:text-[#0A6FA7] transition-colors line-clamp-2'
                >
                  {item?.program?.title || 'N/A'}
                </Link>
              </div>
              <ArrowRight className='w-3.5 h-3.5 text-[#0A6FA7] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex-shrink-0' />
            </div>

            <Link
              href={`/colleges/apply/${college.slug}/${item.id}`}
              className='w-full py-2 px-4 bg-[#0A6FA7] text-white rounded-lg hover:bg-[#085e8a] transition-all text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-sm uppercase tracking-wider opacity-90 hover:opacity-100'
            >
              <GraduationCap className='w-3.5 h-3.5' />
              Apply Now
            </Link>
          </div>
        ))}
      </div>

      {programs.length > 4 && (
        <div className='mt-8 flex justify-center'>
          <button
            onClick={() => setIsDialogOpen(true)}
            className='text-sm font-bold text-[#0A6FA7] hover:text-[#085e8a] flex items-center gap-2 transition-colors uppercase tracking-wider'
          >
            View all Programs
            <ArrowRight className='w-4 h-4' />
          </button>
        </div>
      )}

      {/* View All Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        className='max-w-2xl'
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3 text-[#0A6FA7]'>
            <div className='w-1.5 h-5 bg-[#0A6FA7] rounded-full' />
            All Offered Programs
          </DialogTitle>
          <DialogClose onClick={() => setIsDialogOpen(false)} />
        </DialogHeader>

        <DialogContent className='p-6'>
          <div className='relative mb-6'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <Input
              placeholder='Search programs...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 h-11 border-gray-200 focus-visible:ring-[#0A6FA7] rounded-xl'
            />
          </div>

          <div className='flex flex-col gap-3 h-[400px] md:h-[500px] overflow-y-auto px-1 pb-4 no-scrollbar'>
            {filteredPrograms?.length > 0 ? (
              filteredPrograms?.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className='group flex items-center justify-between rounded-xl bg-gray-50/50 px-4 py-3 border border-transparent hover:border-[#0A6FA7]/30 hover:bg-white hover:shadow-md transition-all duration-200'
                >
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#0A6FA7]/60 group-hover:bg-[#0A6FA7] transition-colors shadow-sm flex-shrink-0' />
                    <Link
                      href={`/programs/${item?.program?.slug}`}
                      className='text-sm font-bold text-gray-700 group-hover:text-[#0A6FA7] transition-colors truncate'
                    >
                      {item?.program?.title || 'N/A'}
                    </Link>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Link
                      href={`/colleges/apply/${college.slug}/${item.id}`}
                      className='px-3 py-1 bg-[#0A6FA7] text-white text-[10px] font-bold rounded-md hover:bg-[#085e8a] transition-colors uppercase tracking-wider'
                    >
                      Apply
                    </Link>
                    <ArrowRight className='w-3 h-3 text-[#0A6FA7] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all' />
                  </div>
                </div>
              ))
            ) : (
              <div className='col-span-full py-12 text-center'>
                <p className='text-gray-400 text-sm font-medium'>
                  No programs found matching your search.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProgramSection
