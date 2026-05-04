import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogClose
} from '@/ui/shadcn/dialog'
import { Input } from '@/ui/shadcn/input'

const ProgramSection = ({ university }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const programs = Array.isArray(university?.programs)
    ? university.programs
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
          <div className='w-1.5 h-6 bg-[#30AD8F] rounded-full' />
          <h2 className='text-xl font-bold text-gray-900'>Programs Offered</h2>
        </div>
        <span className='text-sm font-medium bg-[#30AD8F]/10 text-[#30AD8F] px-4 py-1.5 rounded-full border border-[#30AD8F]/20'>
          {programs.length} Program{programs.length > 1 && 's'}
        </span>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {displayedPrograms.map((item, idx) => (
          <Link
            key={item.id || idx}
            href={`/${university.slugs}/programs/${item?.program?.slugs}`}
            className='group flex items-center justify-between rounded-xl bg-gray-50/50 px-4 py-3.5 border border-transparent hover:border-[#30AD8F]/30 hover:bg-white hover:shadow-lg transition-all duration-300'
          >
            <div className='flex items-center gap-3'>
              <span className='h-1.5 w-1.5 rounded-full bg-[#30AD8F]/60 group-hover:bg-[#30AD8F] transition-colors shadow-sm' />
              <span className='text-sm font-bold text-gray-700 group-hover:text-[#387cae] transition-colors'>
                {item?.program?.title || 'N/A'}
              </span>
            </div>
            <ArrowRight className='w-3.5 h-3.5 text-[#30AD8F] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all' />
          </Link>
        ))}
      </div>

      {programs.length > 4 && (
        <div className='mt-8 flex justify-center'>
          <button
            onClick={() => setIsDialogOpen(true)}
            className='text-sm font-bold text-[#30AD8F] hover:text-[#258a72] flex items-center gap-2 transition-colors uppercase tracking-wider'
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
          <DialogTitle className='flex items-center gap-3 text-[#30AD8F]'>
            <div className='w-1.5 h-5 bg-[#30AD8F] rounded-full' />
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
              className='pl-10 h-11 border-gray-200 focus-visible:ring-[#30AD8F] rounded-xl'
            />
          </div>

          <div className='flex flex-col gap-3 h-[400px] md:h-[500px] overflow-y-auto px-1 pb-4 no-scrollbar'>
            {filteredPrograms?.length > 0 ? (
              filteredPrograms?.map((item, idx) => (
                <Link
                  key={item.id || idx}
                  href={`/${university.slugs}/programs/${item?.program?.slugs}`}
                  className='group flex items-center justify-between rounded-xl bg-gray-50/50 px-4 py-3 border border-transparent hover:border-[#30AD8F]/30 hover:bg-white hover:shadow-md transition-all duration-200'
                >
                  <div className='flex items-center gap-3'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[#30AD8F]/60 group-hover:bg-[#30AD8F] transition-colors shadow-sm' />
                    <span className='text-sm font-bold text-gray-700 group-hover:text-[#387cae] transition-colors'>
                      {item?.program?.title || 'N/A'}
                    </span>
                  </div>
                  <ArrowRight className='w-3 h-3 text-[#30AD8F] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all' />
                </Link>
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
