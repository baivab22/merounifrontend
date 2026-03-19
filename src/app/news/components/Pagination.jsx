'use client'
import React from 'react'

const Pagination = ({ pagination, onPageChange }) => {
    const { currentPage, totalPages } = pagination
    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1)
        }
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1)
        }
    }

    return (
        <div className='flex items-center justify-center gap-2 mt-12 mb-16'>
            <button
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-[#387cae] hover:text-[#387cae] shadow-sm'}`}
                onClick={handlePrevious}
                disabled={currentPage === 1}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div className='flex items-center gap-1 mx-4'>
                <span className='w-10 h-10 flex items-center justify-center bg-[#387cae] text-white rounded-xl font-bold shadow-lg shadow-[#387cae]/20'>
                    {currentPage}
                </span>
                <span className='text-gray-400 font-medium px-2'>of</span>
                <span className='w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-600 rounded-xl font-bold border border-gray-100'>
                    {totalPages}
                </span>
            </div>
            <button
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-[#387cae] hover:text-[#387cae] shadow-sm'}`}
                onClick={handleNext}
                disabled={currentPage === totalPages}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    )
}

export default Pagination
