'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Search } from 'lucide-react'
import Header from '../../../../components/Frontpage/Header'
import Navbar from '../../../../components/Frontpage/Navbar'
import Footer from '../../../../components/Frontpage/Footer'
import { getMaterialsByCategory } from '../../action'
import MaterialsGrid from '../../components/MaterialsGrid'
import Pagination from '../../../blogs/components/Pagination'

const MaterialsCategoryContent = ({ categoryIdFromUrl, initialCategoryName, categories }) => {
  const router = useRouter()
  const isLoadingRef = useRef(false)

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  })
  const [materials, setMaterials] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(categoryIdFromUrl)
  const [selectedCategoryName, setSelectedCategoryName] = useState(initialCategoryName)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const prevCategoryRef = useRef(null)
  const prevSearchRef = useRef(null)

  useEffect(() => {
    if (!selectedCategory) {
      setMaterials([])
      setLoading(false)
      return
    }

    const categoryChanged = prevCategoryRef.current !== selectedCategory
    const searchChanged = prevSearchRef.current !== debouncedSearch

    if (categoryChanged || searchChanged) {
      setMaterials([])
      setPagination((prev) => ({ ...prev, currentPage: 1 }))
      prevCategoryRef.current = selectedCategory
      prevSearchRef.current = debouncedSearch
      loadPageNumber(1)
    } else {
      loadPageNumber(pagination.currentPage)
    }
  }, [pagination.currentPage, debouncedSearch, selectedCategory])

  const loadPageNumber = async (page) => {
    if (!selectedCategory) return
    if (isLoadingRef.current) return

    isLoadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const response = await getMaterialsByCategory(page, debouncedSearch, selectedCategory)
      if (response && response.pagination) {
        setMaterials(response.materials)
        setPagination((prev) => ({ ...prev, ...response.pagination }))
      }
    } catch (error) {
      setError('Failed to load materials')
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }

  const handleBackToCategories = () => router.push('/materials')

  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: page }))
    }
  }

  return (
    <>
      <Header />
      <Navbar />
      <div className='flex flex-col max-w-[1600px] mx-auto px-8 mt-10'>
        <div className='flex items-center justify-between mb-6 px-4'>
          <button onClick={handleBackToCategories} className='flex items-center gap-2 text-[#0A70A7] hover:text-[#085a85] font-medium' >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            Back to Categories
          </button>
          <h2 className='text-2xl font-bold text-gray-800'> {selectedCategoryName || 'Loading...'} </h2>
          <div className='w-24'></div>
        </div>

        <div className='flex justify-center mb-10 md:mb-20 w-full'>
          <div className='relative w-full max-w-md mb-6'>
            <input type='text' placeholder='Search material...' className='w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} />
            <Search className='absolute left-3 top-2.5 h-5 w-5 text-gray-400' />
          </div>
        </div>

        <MaterialsGrid materials={materials} loading={loading} />
        {error && <div className='text-center py-12'> <p className='text-red-500 text-lg'>{error}</p> </div>}
        {selectedCategory && ( <Pagination pagination={pagination} onPageChange={handlePageChange} /> )}
      </div>
      <Footer />
    </>
  )
}

export default MaterialsCategoryContent
