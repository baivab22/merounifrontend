'use client'
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages } = pagination

  const getPageNumbers = () => {
    const pages = []
    const showMax = 5

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      let start = Math.max(1, currentPage - 2)
      let end = Math.min(totalPages, start + showMax - 1)

      if (end === totalPages) {
        start = Math.max(1, end - showMax + 1)
      }

      for (let i = start; i <= end; i++) pages.push(i)
    }
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className='flex items-center gap-2'>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-[#0A70A7] disabled:opacity-50 disabled:hover:bg-transparent transition-all'
        aria-label='Previous page'
      >
        <ChevronLeft className='w-5 h-5' />
      </button>

      <div className='flex items-center gap-1.5 mx-2'>
        {pages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className='w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-[#0A70A7] transition-all'
            >
              1
            </button>
            {pages[0] > 2 && <span className='text-gray-400 px-1'>...</span>}
          </>
        )}

        {pages.map((pg) => (
          <button
            key={pg}
            onClick={() => onPageChange(pg)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
              currentPage === pg
                ? 'bg-[#0A70A7] text-white shadow-lg shadow-blue-100'
                : 'text-gray-500 hover:bg-gray-50 hover:text-[#0A70A7]'
            }`}
          >
            {pg}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className='text-gray-400 px-1'>...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className='w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-[#0A70A7] transition-all'
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-[#0A70A7] disabled:opacity-50 disabled:hover:bg-transparent transition-all'
        aria-label='Next page'
      >
        <ChevronRight className='w-5 h-5' />
      </button>
    </div>
  )
}

export default Pagination
