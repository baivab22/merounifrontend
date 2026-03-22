'use client'

import React, { useState, useEffect, useRef } from 'react'
import NewsFilters from './components/NewsFilters'
import FeaturedNews from './components/FeaturedNews'
import { getNews, getCategories } from '@/app/action'
import SideBanner from '@/components/Frontpage/SideBanner'

const News = () => {
    // State
    const [news, setNews] = useState([])
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    // Pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0
    })

    const [categories, setCategories] = useState([
        { id: 'all', title: 'All' }
    ])

    const debounceRef = useRef(null)

    // Data Fetching
    const fetchNewsData = async (page = 1, search = '', category = '') => {
        setLoading(true)
        setError(null)
        try {
            const catParam = category === 'all' ? '' : category
            const response = await getNews(page, catParam, search)

            if (response && response.items) {
                setNews(response.items)
                if (response.pagination) {
                    setPagination({
                        currentPage: response.pagination.currentPage,
                        totalPages: response.pagination.totalPages,
                        totalCount: response.pagination.totalCount
                    })
                }
            } else {
                setNews([])
                setPagination(prev => ({ ...prev, totalCount: 0 }))
            }
        } catch (error) {
            console.error('Error fetching news:', error)
            setError('Failed to load news')
        } finally {
            setLoading(false)
        }
    }

    const fetchCategoriesAndBanners = async () => {
        try {
            const [categoriesResponse, bannerResponse] = await Promise.all([
                getCategories({ type: 'NEWS' }).catch(() => null),
                fetch(`${process.env.baseUrl}/banner?type=FRONT_PAGE&limit=10`).then(res => res.json()).catch(() => ({ items: [] }))
            ])

            if (categoriesResponse && categoriesResponse.items) {
                setCategories([{ id: 'all', title: 'All' }, ...categoriesResponse.items])
            }
            if (bannerResponse && bannerResponse.items) {
                setBanners(bannerResponse.items)
            }
        } catch (error) {
            console.error('Error fetching categories and banners:', error)
        }
    }

    useEffect(() => {
        fetchCategoriesAndBanners()
    }, [])

    // Effect: Debounced Search & Filter Change
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(() => {
            // Reset to page 1 on filter change
            if (pagination.currentPage !== 1) {
                setPagination(prev => ({ ...prev, currentPage: 1 }))
                fetchNewsData(1, searchQuery, selectedCategory)
            } else {
                fetchNewsData(1, searchQuery, selectedCategory)
            }
        }, 500)

        return () => clearTimeout(debounceRef.current)
    }, [searchQuery, selectedCategory])

    const handlePageChange = (page) => {
        if (page > 0 && page <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: page }))
            fetchNewsData(page, searchQuery, selectedCategory)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    return (
        <>
            <div className='min-h-screen bg-white pb-20'>
                {/* Filters Section */}
                <div className='max-w-[1600px] mx-auto px-4 sm:px-8 pt-8'>
                    <NewsFilters
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        categories={categories}
                    />
                </div>

                {/* News Grid Section */}
                <div className='max-w-[1600px] mx-auto px-4 sm:px-8 mb-8'>
                    <div className='flex flex-col gap-4 md:gap-6'>
                        <div className='flex flex-col w-full -mx-4 sm:-mx-8 md:mx-0'>
                            <FeaturedNews
                                news={news}
                                loading={loading}
                                pagination={pagination}
                                onPageChange={handlePageChange}
                            />
                        </div>

                        {/* Mobile Side Banner */}
                        <div className='w-full block md:hidden mt-4'>
                            <SideBanner banners={banners} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default News
