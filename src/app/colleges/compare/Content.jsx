'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft, Plus, GitCompareArrows,
  Trash2, Share2, ChevronLeft, ChevronRight
} from 'lucide-react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import ComparisonCard from './components/ComparisonCard'
import EmptySlots from './components/EmptySlots'
import SearchCollegeModal from './components/SearchCollegeModal'
import { getCollegeBySlug } from '../actions'
import { ThemeSelect } from '@/ui/shadcn/ThemeSelect'
import { stripHtml } from '@/lib/string.utils'

const DEFAULT_SLOTS = 2
const MAX_COMPARE = 4

const CompareContent = ({ initialColleges = [], initialSlugs = [], programSlug = '' }) => {
  const router = useRouter()
  const [colleges, setColleges] = useState(initialColleges)
  const [copied, setCopied] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const [selectedPrograms, setSelectedPrograms] = useState(() => {
    const init = {}
    initialColleges.forEach((c) => {
      const progs = c.collegePrograms || []
      if (programSlug && progs.some((p) => p?.program?.slug === programSlug)) {
        init[c.slug] = programSlug
      } else if (progs.length > 0) {
        init[c.slug] = progs[0]?.program?.slug || ''
      } else {
        init[c.slug] = ''
      }
    })
    return init
  })

  const currentSlugs = colleges.map((c) => c.slug)
  const slots = Math.max(DEFAULT_SLOTS, colleges.length + (colleges.length < DEFAULT_SLOTS ? DEFAULT_SLOTS - colleges.length : 0))
  const emptySlots = Math.min(MAX_COMPARE, slots) - colleges.length

  const syncUrl = useCallback(
    (newColleges) => {
      const slugs = newColleges.map((c) => c.slug).join(',')
      const url = slugs ? `/colleges/compare?slugs=${slugs}` : '/colleges/compare'
      router.replace(url, { scroll: false })
    },
    [router]
  )

  const handleAddCollege = useCallback(
    async (college) => {
      if (colleges.length >= MAX_COMPARE) return
      if (colleges.some((c) => c.slug === college.slug)) return

      try {
        const fullCollege = await getCollegeBySlug(college.slug)
        if (fullCollege) {
          const updated = [...colleges, fullCollege]
          setColleges(updated)
          syncUrl(updated)
          setSearchOpen(false)
          return
        }
      } catch (err) {
        // fallback to search result data
      }

      const newCollege = {
        id: college.collegeId || college.id,
        name: college.name,
        slug: college.slug,
        featured_img: college.collegeImage || null,
        college_logo: college.logo || null,
        collegeAddress: college.location
          ? { city: college.location.split(',')[0]?.trim(), country: 'Nepal' }
          : {},
        collegeContacts: [],
        collegePrograms: [],
        degrees: [],
        universities: [],
        collegeMembers: [],
        facilities: [],
        website_url: null,
        email: null,
        fee_structure: null,
        placement: null,
        scholarship: null
      }

      const updated = [...colleges, newCollege]
      setColleges(updated)
      syncUrl(updated)
      setSearchOpen(false)
    },
    [colleges, syncUrl]
  )

  const handleRemoveCollege = useCallback(
    (slug) => {
      const updated = colleges.filter((c) => c.slug !== slug)
      setColleges(updated)
      syncUrl(updated)
    },
    [colleges, syncUrl]
  )

  const handleClearAll = useCallback(() => {
    setColleges([])
    syncUrl([])
  }, [syncUrl])

  const handleShare = useCallback(async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

  const scrollContainer = (direction) => {
    const container = document.getElementById('compare-scroll-container')
    if (container) {
      container.scrollBy({
        left: direction === 'left' ? -320 : 320,
        behavior: 'smooth'
      })
    }
  }

  const getCollegeField = (c, field) => {
    const selectedSlug = selectedPrograms[c.slug] || ''
    const programs = c.collegePrograms || []
    const selectedProg = programs.find((p) => p?.program?.slug === selectedSlug)

    switch (field) {
      case 'university':
        return c.universities?.map((u) => u.fullname).join(', ') || null
      case 'location': {
        const addr = c.collegeAddress || {}
        return [addr.street, addr.city, addr.district].filter(Boolean).join(', ') || null
      }
      case 'fee': {
        const progFee = stripHtml(selectedProg?.fee) || null
        const collFee = stripHtml(c.fee_structure) || null
        return progFee || collFee
      }
      case 'placement': {
        const progPlacement = stripHtml(selectedProg?.placement) || null
        const collPlacement = stripHtml(c.placement) || null
        return progPlacement || collPlacement
      }
      case 'scholarship': {
        const progScholarship = stripHtml(selectedProg?.scholarship) || null
        const collScholarship = stripHtml(c.scholarship) || null
        return progScholarship || collScholarship
      }
      case 'facilities':
        return c.facilities?.map((f) => f.name || f.title).join(', ') || null
      default:
        return null
    }
  }

  const comparisonFields = [
    { key: 'university', label: 'University' },
    { key: 'location', label: 'Location' },
    { key: 'fee_structure', label: 'Fee Structure' },
    { key: 'facilities', label: 'Facilities' },
    { key: 'placement', label: 'Placement' },
    { key: 'scholarship', label: 'Scholarship' }
  ]

  return (
    <div className='min-h-screen bg-[#F8FAFC]'>
      <Header />
      <Navbar />

      {/* Hero */}
      <div className='bg-gradient-to-br from-[#0A6FA7] via-[#085e8a] to-[#064a6e] relative overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute top-10 left-10 w-32 h-32 rounded-full bg-white/5 blur-xl' />
          <div className='absolute bottom-10 right-20 w-48 h-48 rounded-full bg-[#30AD8F]/10 blur-2xl' />
        </div>

        <div className='max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-6 sm:py-8 md:py-12 relative z-10'>
          <Link
            href='/colleges'
            className='inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-bold mb-4 sm:mb-6 transition-colors group'
          >
            <ArrowLeft className='w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform' />
            Back to Colleges
          </Link>

          <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4'>
            <div>
              <div className='flex items-center gap-3 mb-2 sm:mb-3'>
                <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10'>
                  <GitCompareArrows className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                </div>
                <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-white'>Compare Colleges</h1>
              </div>
              <p className='text-xs sm:text-sm text-white/60 font-medium max-w-md'>
                Compare colleges side by side — programs, fees, placements, and more.
              </p>
            </div>

            <div className='flex items-center gap-2 flex-wrap'>
              {colleges.length > 0 && (
                <>
                  <button
                    onClick={handleShare}
                    className='flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10'
                  >
                    <Share2 className='w-3.5 h-3.5' />
                    {copied ? 'Copied!' : 'Share'}
                  </button>
                  <button
                    onClick={handleClearAll}
                    className='flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold transition-all border border-red-400/10'
                  >
                    <Trash2 className='w-3.5 h-3.5' />
                    Clear
                  </button>
                </>
              )}
              {colleges.length < MAX_COMPARE && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className='flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white text-[#0A6FA7] text-xs font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all active:scale-95'
                >
                  <Plus className='w-4 h-4' />
                  Add College
                </button>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2 mt-4 sm:mt-5'>
            {Array.from({ length: MAX_COMPARE }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i < colleges.length ? 'bg-[#30AD8F] w-8' : 'bg-white/20 w-4'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-24 py-6 sm:py-8 md:py-12'>
        <div className='relative'>
          {colleges.length + emptySlots > 2 && (
            <>
              <button
                onClick={() => scrollContainer('left')}
                className='absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex -ml-5'
              >
                <ChevronLeft className='w-5 h-5 text-gray-600' />
              </button>
              <button
                onClick={() => scrollContainer('right')}
                className='absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors hidden md:flex -mr-5'
              >
                <ChevronRight className='w-5 h-5 text-gray-600' />
              </button>
            </>
          )}

          <div
            id='compare-scroll-container'
            className='flex gap-3 sm:gap-4 md:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory sidebar-scrollbar -mx-4 px-4 sm:-mx-0 sm:px-0'
          >
            <AnimatePresence mode='popLayout'>
              {colleges.map((college, index) => (
                <ComparisonCard
                  key={college.slug}
                  college={college}
                  index={index}
                  onRemove={handleRemoveCollege}
                  selectedProgramSlug={selectedPrograms[college.slug] || ''}
                />
              ))}
            </AnimatePresence>

            {emptySlots > 0 && (
              <EmptySlots count={emptySlots} onAdd={() => setSearchOpen(true)} />
            )}
          </div>
        </div>

        {/* Comparison Table - Desktop */}
        {colleges.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='mt-10 sm:mt-12 md:mt-16'
          >
            <div className='flex items-center gap-3 mb-4 sm:mb-6'>
              <div className='w-1.5 h-6 bg-gradient-to-b from-[#0A6FA7] to-[#30AD8F] rounded-full' />
              <h2 className='text-base sm:text-lg font-bold text-gray-900'>Quick Comparison</h2>
            </div>

            {/* Desktop Table */}
            <div className='hidden md:block bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-gray-100'>
                      <th className='text-left px-5 py-4 text-[11px] uppercase tracking-wider text-gray-400 font-bold w-44'>
                        Feature
                      </th>
                      {colleges.map((c) => (
                        <th key={c.slug} className='text-center px-4 py-4 text-[11px] uppercase tracking-wider text-gray-400 font-bold'>
                          <div className='flex flex-col items-center gap-2'>
                            <div className='w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0'>
                              {c.college_logo ? (
                                <img src={c.college_logo} alt={c.name} className='w-full h-full object-cover' />
                              ) : (
                                <div className='w-full h-full flex items-center justify-center text-xs font-bold bg-[#0A6FA7]/10 text-[#0A6FA7]'>
                                  {c.name?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className='text-xs font-bold text-gray-700 line-clamp-1 max-w-[140px]'>{c.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <CompareRow
                      label='University'
                      values={colleges.map((c) => getCollegeField(c, 'university') || '—')}
                    />
                    <CompareRow
                      label='Location'
                      values={colleges.map((c) => getCollegeField(c, 'location') || '—')}
                    />
                    <CompareRow
                      label='Fee Structure'
                      values={colleges.map((c) => {
                        const val = getCollegeField(c, 'fee')
                        return val ? <span title={val}>{val.length > 60 ? val.substring(0, 60) + '...' : val}</span> : <span className='text-gray-300'>Not Available</span>
                      })}
                      isRich
                    />
                    <tr className='border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors'>
                      <td className='px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider'>Programs</td>
                      {colleges.map((c) => {
                        const progs = c.collegePrograms || []
                        const currentSlug = selectedPrograms[c.slug] || ''
                        return (
                          <td key={c.slug} className='px-4 py-3.5 text-center'>
                            {progs.length > 0 ? (
                              <ThemeSelect
                                compact
                                value={currentSlug}
                                options={progs.map((p) => ({
                                  value: p?.program?.slug || '',
                                  label: p?.program?.title || 'N/A'
                                }))}
                                onChange={(slug) => setSelectedPrograms((prev) => ({ ...prev, [c.slug]: slug }))}
                              />
                            ) : (
                              <span className='text-xs font-semibold text-gray-400'>—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                    <CompareRow
                      label='Facilities'
                      values={colleges.map((c) => getCollegeField(c, 'facilities') || '—')}
                    />
                    <CompareRow
                      label='Placement'
                      values={colleges.map((c) => {
                        const val = getCollegeField(c, 'placement')
                        return val ? <span title={val}>{val.length > 60 ? val.substring(0, 60) + '...' : val}</span> : <span className='text-gray-300'>Not Available</span>
                      })}
                      isRich
                    />
                    <CompareRow
                      label='Scholarship'
                      values={colleges.map((c) => {
                        const val = getCollegeField(c, 'scholarship')
                        return val ? <span title={val}>{val.length > 60 ? val.substring(0, 60) + '...' : val}</span> : <span className='text-gray-300'>Not Available</span>
                      })}
                      isRich
                    />
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className='md:hidden space-y-4'>
              {colleges.map((c) => (
                <div key={c.slug} className='bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden'>
                  <div className='flex items-center gap-3 px-4 py-3 border-b border-gray-50 bg-gray-50/50'>
                    <div className='w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0'>
                      {c.college_logo ? (
                        <img src={c.college_logo} alt={c.name} className='w-full h-full object-cover' />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center text-xs font-bold bg-[#0A6FA7]/10 text-[#0A6FA7]'>
                          {c.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className='text-xs font-bold text-gray-700 line-clamp-1'>{c.name}</span>
                  </div>

                  <div className='divide-y divide-gray-50'>
                    <MobileCompareRow label='University' value={getCollegeField(c, 'university') || '—'} />
                    <MobileCompareRow label='Location' value={getCollegeField(c, 'location') || '—'} />
                    <MobileCompareRow label='Fee Structure' value={getCollegeField(c, 'fee')} />
                    <div className='px-4 py-3'>
                      <p className='text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5'>Programs</p>
                      {(c.collegePrograms || []).length > 0 ? (
                        <ThemeSelect
                          compact
                          value={selectedPrograms[c.slug] || ''}
                          options={(c.collegePrograms || []).map((p) => ({
                            value: p?.program?.slug || '',
                            label: p?.program?.title || 'N/A'
                          }))}
                          onChange={(slug) => setSelectedPrograms((prev) => ({ ...prev, [c.slug]: slug }))}
                        />
                      ) : (
                        <p className='text-xs font-semibold text-gray-300'>Not Available</p>
                      )}
                    </div>
                    <MobileCompareRow label='Facilities' value={getCollegeField(c, 'facilities') || '—'} />
                    <MobileCompareRow label='Placement' value={getCollegeField(c, 'placement')} />
                    <MobileCompareRow label='Scholarship' value={getCollegeField(c, 'scholarship')} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />

      <SearchCollegeModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={handleAddCollege}
        selectedSlugs={currentSlugs}
      />
    </div>
  )
}

const CompareRow = ({ label, values, isRich }) => (
  <tr className='border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors'>
    <td className='px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider'>{label}</td>
    {values.map((val, i) => (
      <td key={i} className='px-4 py-3.5 text-center text-xs font-semibold text-gray-700'>
        {isRich ? val : val}
      </td>
    ))}
  </tr>
)

const MobileCompareRow = ({ label, value }) => (
  <div className='px-4 py-3'>
    <p className='text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5'>{label}</p>
    {value ? (
      <p className='text-xs font-semibold text-gray-700 line-clamp-3 break-words'>{value}</p>
    ) : (
      <p className='text-xs font-semibold text-gray-300'>Not Available</p>
    )}
  </div>
)

export default CompareContent
