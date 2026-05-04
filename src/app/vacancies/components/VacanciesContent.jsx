'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, Briefcase, X } from 'lucide-react'
import { debounce } from 'lodash'
import { getVacancies } from '../actions'
import Link from 'next/link'
import Pagination from '@/ui/molecules/common/Pagination'
import { CardSkeleton } from '@/ui/shadcn/CardSkeleton'
import { formatDate } from '@/utils/date.util'
import EmptyState from '@/ui/shadcn/EmptyState'

const VacanciesContent = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page')) || 1

    const [vacancies, setVacancies] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState(q)
    const [isSearching, setIsSearching] = useState(false)

    const [pagination, setPagination] = useState({
        currentPage: page,
        totalPages: 1,
        totalCount: 0
    })

    const updateURL = useCallback((params) => {
        const newParams = new URLSearchParams(searchParams.toString())
        Object.entries(params).forEach(([key, value]) => {
            if (value) newParams.set(key, value)
            else newParams.delete(key)
        })
        router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
    }, [searchParams, pathname, router])

    const loadVacancies = useCallback(async (p, search) => {
        setLoading(true)
        try {
            const response = await getVacancies(p, search)
            setVacancies(response.items || [])
            if (response.pagination) {
                setPagination({
                    currentPage: response.pagination.currentPage,
                    totalPages: response.pagination.totalPages,
                    totalCount: response.pagination.totalCount
                })
            }
        } catch (error) {
            console.error('Error:', error)
            setVacancies([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadVacancies(page, q)
    }, [page, q, loadVacancies])

    // Debounce search input
    useEffect(() => {
        setIsSearching(true)
        const handler = setTimeout(() => {
            setIsSearching(false)
            if (searchTerm !== q) {
                updateURL({ q: searchTerm, page: 1 })
            }
        }, 500)
        return () => clearTimeout(handler)
    }, [searchTerm, q, updateURL])

    const handlePageChange = (p) => {
        if (p > 0 && p <= pagination.totalPages) {
            updateURL({ page: p })
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const clearFilters = () => {
        setSearchTerm('')
        updateURL({ q: '', page: 1 })
    }

    return (
        <div className='min-h-screen bg-gray-50/50 py-12 px-6 font-sans'>
            <div className='max-w-[1600px] mx-auto'>
                
                {/* Unified Header */}
                <div className='flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8 border-b border-gray-100 pb-12'>
                    <div className='flex-1 space-y-6 w-full'>
                        <div className='flex items-center gap-4 mb-2'>
                            <h1 className='text-3xl font-extrabold text-gray-900 tracking-tight'>
                                Vacancies
                            </h1>
                            <span className='bg-blue-50 text-[#0A70A7] px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider'>
                                {pagination.totalCount} Openings
                            </span>
                        </div>

                        <div className='flex bg-white items-center rounded-2xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-[#0A70A7] focus-within:border-[#0A70A7] transition-all px-5 py-2.5 relative w-full group'>
                            <Search className='w-5 h-5 text-gray-400 group-focus-within:text-[#0A70A7] transition-colors' />
                            <input
                                type='text'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder='Job title, keyword or organization...'
                                className='w-full px-4 py-2 bg-transparent text-base font-medium outline-none placeholder:text-gray-400'
                            />
                            <div className='absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3'>
                                {isSearching && (
                                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A70A7]'></div>
                                )}
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className='p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-all'
                                    >
                                        <X className='w-5 h-5' />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col lg:flex-row gap-12'>
                    {/* Placeholder Sidebar for visual consistency if needed, but currently Vacancies has no categories */}
                    {/* <aside className='lg:w-[320px] shrink-0 hidden lg:block'></aside> */}

                    <main className='flex-1'>
                        {loading ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'>
                                {Array(6).fill('').map((_, index) => (
                                    <CardSkeleton key={index} />
                                ))}
                            </div>
                        ) : vacancies.length === 0 ? (
                            <div className='bg-white rounded-[32px] border border-gray-100 border-dashed py-20'>
                                <EmptyState
                                    icon={Briefcase}
                                    title='No Vacancies Found'
                                    description={q ? 'No vacancies match your search. Try different keywords.' : 'No vacancies are currently available'}
                                    action={q ? { label: 'Clear Search', onClick: clearFilters } : null}
                                />
                            </div>
                        ) : (
                            <>
                                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'>
                                    {vacancies.map((vacancy) => (
                                        <Link href={`/vacancies/${vacancy.slugs}`} key={vacancy.id} className='group'>
                                            <div className='h-full bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#0A70A7]/5 hover:border-[#0A70A7]/20 transition-all duration-500 flex flex-col overflow-hidden'>
                                                <div className='relative h-48 w-full bg-gray-100'>
                                                    <img
                                                        src={vacancy?.featuredImage || '/images/job.webp'}
                                                        alt={vacancy.title}
                                                        className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-700'
                                                    />
                                                    <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60' />
                                                    {vacancy.associated_organization_name && (
                                                        <div className='absolute bottom-4 left-4 right-4'>
                                                            <span className='inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-[#0A70A7] shadow-sm'>
                                                                {vacancy.associated_organization_name}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className='p-8 flex flex-col flex-1'>
                                                    <h2 className='text-xl font-bold text-gray-900 mb-3 group-hover:text-[#0A70A7] transition-colors line-clamp-2 tracking-tight'>
                                                        {vacancy.title}
                                                    </h2>
                                                    <p className='text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed'>
                                                        {vacancy.description}
                                                    </p>
                                                    <div className='mt-auto pt-6 border-t border-gray-50 flex items-center justify-between'>
                                                        <div className='flex flex-col'>
                                                            <span className='text-[10px] uppercase tracking-widest font-bold text-gray-400'>Posted</span>
                                                            <span className='text-sm font-bold text-gray-700'>{formatDate(vacancy.createdAt)}</span>
                                                        </div>
                                                        <div className='w-8 h-8 rounded-full bg-[#0A70A7]/10 flex items-center justify-center group-hover:bg-[#0A70A7] transition-colors duration-500'>
                                                            <Briefcase className='w-4 h-4 text-[#0A70A7] group-hover:text-white transition-colors duration-500' />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {pagination.totalPages > 1 && (
                                    <div className='mt-20 flex justify-center'>
                                        <div className='bg-white px-8 py-4 rounded-[24px] shadow-sm border border-gray-100'>
                                            <Pagination
                                                currentPage={pagination.currentPage}
                                                totalPages={pagination.totalPages}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}

export default VacanciesContent
