'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trash2, Share2, ChevronDown, X
} from 'lucide-react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import SearchCollegeModal from './components/SearchCollegeModal'
import { getCollegeBySlug } from '../actions'
import { ThemeSelect } from '@/ui/shadcn/ThemeSelect'
import { stripHtml } from '@/lib/string.utils'

const MAX_COMPARE = 4

const getProgramShortcut = (program, degrees = []) => {
  if (!program) return 'N/A'
  const title = program.title || ''
  const normalised = title.replace(/\./g, '').toLowerCase()
  const matched = degrees.find((d) => d.title?.toLowerCase() === normalised)
  return matched?.short_name || title
}

const CHECKPOINTS = [
  {
    tag: 'Checkpoint 1',
    title: 'Overview',
    rows: [
      { key: 'university', label: 'University' },
      { key: 'location', label: 'Location' },
      { key: 'website', label: 'Website' },
      { key: 'email', label: 'Email' },
    ]
  },
  {
    tag: 'Checkpoint 2',
    title: 'Fees & Duration',
    rows: [
      { key: 'fee', label: 'Fee Structure' },
      { key: 'scholarship', label: 'Scholarship' },
    ]
  },
  {
    tag: 'Checkpoint 3',
    title: 'Programs & Facilities',
    rows: [
      { key: 'program', label: 'Program' },
      { key: 'facilities', label: 'Facilities' },
    ]
  },
  {
    tag: 'Checkpoint 4',
    title: 'Outcomes & Contact',
    rows: [
      { key: 'placement', label: 'Placement' },
      { key: 'contact', label: 'Contact' },
    ]
  },
]

const buildEmptyCollege = (college) => ({
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
})

const CompareContent = ({ initialColleges = [], initialSlugs = [], programSlug = '' }) => {
  const router = useRouter()
  const isInitialMount = useRef(true)

  const [colleges, setColleges] = useState(initialColleges)
  const [copied, setCopied] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openLayers, setOpenLayers] = useState(() => {
    const init = {}
    CHECKPOINTS.forEach((_, i) => { init[i] = true })
    return init
  })

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

  const [removePending, setRemovePending] = useState(null)

  const currentSlugs = colleges.map((c) => c.slug)

  // URL sync via useEffect — avoids router.replace inside callbacks
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const slugs = colleges.map((c) => c.slug).join(',')
    const url = slugs ? `/colleges/compare?slugs=${slugs}` : '/colleges/compare'
    router.replace(url, { scroll: false })
  }, [colleges, router])

  // Handle removal with a micro-delay to avoid concurrent update issues
  useEffect(() => {
    if (removePending === null) return
    setColleges((prev) => {
      const updated = prev.filter((c) => c.slug !== removePending)
      return updated
    })
    setRemovePending(null)
  }, [removePending])

  const handleAddCollege = useCallback(
    async (college) => {
      if (!college?.slug) return

      let currentCount = 0
      setColleges((prev) => {
        currentCount = prev.length
        return prev
      })

      if (currentCount >= MAX_COMPARE) return

      let fullCollege = null
      try {
        fullCollege = await getCollegeBySlug(college.slug)
      } catch {
        // fallback to search result data
      }

      const collegeData = fullCollege || buildEmptyCollege(college)

      setSelectedPrograms((prev) => {
        const progs = collegeData.collegePrograms || []
        return {
          ...prev,
          [collegeData.slug]: progs.length > 0 ? progs[0]?.program?.slug || '' : ''
        }
      })

      setColleges((prev) => {
        if (prev.some((c) => c.slug === collegeData.slug)) return prev
        if (prev.length >= MAX_COMPARE) return prev
        return [...prev, collegeData]
      })

      setSearchOpen(false)
    },
    []
  )

  const handleRemoveCollege = useCallback((slug) => {
    setRemovePending(slug)
  }, [])

  const handleClearAll = useCallback(() => {
    setColleges([])
    setSelectedPrograms({})
  }, [])

  const handleShare = useCallback(async () => {
    const url = window.location.href
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

  const toggleLayer = useCallback((idx) => {
    setOpenLayers((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }, [])

  const getCollegeField = useCallback((c, field) => {
    const selectedSlug = selectedPrograms[c?.slug] || ''
    const programs = c?.collegePrograms || []
    const selectedProg = programs.find((p) => p?.program?.slug === selectedSlug)

    switch (field) {
      case 'university':
        return c?.universities?.map((u) => u?.fullname).filter(Boolean).join(', ') || null
      case 'location': {
        const addr = c?.collegeAddress || {}
        return [addr.street, addr.city, addr.district].filter(Boolean).join(', ') || null
      }
      case 'fee': {
        const progFee = stripHtml(selectedProg?.fee) || null
        const collFee = stripHtml(c?.fee_structure) || null
        return progFee || collFee
      }
      case 'placement': {
        const progPlacement = stripHtml(selectedProg?.placement) || null
        const collPlacement = stripHtml(c?.placement) || null
        return progPlacement || collPlacement
      }
      case 'scholarship': {
        const progScholarship = stripHtml(selectedProg?.scholarship) || null
        const collScholarship = stripHtml(c?.scholarship) || null
        return progScholarship || collScholarship
      }
      case 'facilities':
        return c?.facilities?.map((f) => f?.title).filter(Boolean).join(', ') || null
      case 'contact':
        return c?.collegeContacts?.map((ct) => ct?.contact_number).filter(Boolean).join(', ') || null
      case 'website':
        return c?.website_url || null
      case 'email':
        return c?.email || null
      case 'program':
        return selectedProg?.program?.title || null
      default:
        return null
    }
  }, [selectedPrograms])

  const renderCellValue = useCallback((c, field) => {
    const val = getCollegeField(c, field)
    if (field === 'website') {
      return val
        ? <a href={val} target='_blank' rel='noopener noreferrer' className='text-[#0A6FA7] hover:underline break-all line-clamp-2' title={val}>{val.replace(/^https?:\/\/(www\.)?/, '')}</a>
        : <span className='text-gray-300'>—</span>
    }
    if (field === 'email') {
      return val
        ? <a href={`mailto:${val}`} className='text-[#0A6FA7] hover:underline break-all line-clamp-2' title={val}>{val}</a>
        : <span className='text-gray-300'>—</span>
    }
    if (field === 'contact') {
      return val
        ? <a href={`tel:${val}`} className='text-[#0A6FA7] hover:underline'>{val}</a>
        : <span className='text-gray-300'>—</span>
    }
    if (val) {
      return <span title={val}>{val.length > 80 ? val.substring(0, 80) + '...' : val}</span>
    }
    return <span className='text-gray-300'>Not Available</span>
  }, [getCollegeField])

  return (
    <div className='min-h-screen bg-[#F8FAFC]'>
      <Header />
      <Navbar />

      <div className='max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 py-6 sm:py-8 md:py-12'>

        {/* ── Masthead ── */}
        <div className='mb-2'>
          <h1 className='text-xl sm:text-2xl md:text-[2rem] font-bold text-gray-900 leading-tight mb-2'>
            Compare your education path
          </h1>
          <p className='text-xs sm:text-sm text-gray-500 max-w-xl leading-relaxed'>
            Pick 2–4 programs — across any colleges, any affiliation — and walk through each checkpoint from overview to outcomes.
          </p>
        </div>

        {/* ── Picker Bar ── */}
        <div className='mt-5 mb-6 sm:mb-8 bg-white rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3 items-start sm:items-center shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]'>
          <p className='hidden sm:block w-full text-[11px] font-bold uppercase tracking-widest text-[#0A6FA7] font-mono mb-0.5'>
            Programs being compared
          </p>

          <div className='flex flex-wrap gap-2 sm:gap-2.5 w-full sm:w-auto'>
            <AnimatePresence mode='popLayout'>
              {colleges.map((c) => (
                <motion.div
                  key={c.slug}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className='flex items-center gap-2 bg-[#F8FAFC] rounded-lg py-1.5 pl-1.5 pr-1.5 border border-gray-100'
                >
                  <div className='w-6 h-6 rounded-md bg-gray-100 overflow-hidden flex-shrink-0'>
                    {c.college_logo ? (
                      <img src={c.college_logo} alt={c.name} className='w-full h-full object-contain p-0.5' />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-[9px] font-bold bg-[#0A6FA7]/10 text-[#0A6FA7]'>
                        {c.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <span className='text-[11px] sm:text-xs font-semibold text-gray-700 truncate max-w-[100px] sm:max-w-[180px]'>
                    {c.name}
                  </span>
                  {(c.collegePrograms || []).length > 0 && (
                    <ThemeSelect
                      compact
                      value={selectedPrograms[c.slug] || ''}
                      options={(c.collegePrograms || []).map((p) => ({
                        value: p?.program?.slug || '',
                        label: getProgramShortcut(p?.program, c.degrees)
                      }))}
                      onChange={(slug) => setSelectedPrograms((prev) => ({ ...prev, [c.slug]: slug }))}
                      triggerClassName='!border-gray-200 !text-gray-600 !h-6 sm:!h-7 !text-[10px] sm:!text-[11px] !px-1.5 sm:!px-2 !rounded-md !bg-white'
                    />
                  )}
                  <button
                    onClick={() => handleRemoveCollege(c.slug)}
                    className='w-5 h-5 sm:w-6 sm:h-6 rounded-md hover:bg-red-50 flex items-center justify-center shrink-0 transition-colors group'
                    aria-label={`Remove ${c.name}`}
                  >
                    <X className='w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 group-hover:text-red-500 transition-colors' />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className='flex items-center gap-2 w-full sm:w-auto sm:ml-auto'>
            <button
              onClick={() => setSearchOpen(true)}
              disabled={colleges.length >= MAX_COMPARE}
              className='border border-dashed border-[#0A6FA7]/40 bg-transparent text-[#0A6FA7] rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer hover:bg-[#0A6FA7]/5 disabled:opacity-35 disabled:cursor-not-allowed transition-colors'
            >
              + Add
            </button>

            {colleges.length > 0 && (
              <>
                <button
                  onClick={handleShare}
                  className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors'
                >
                  <Share2 className='w-3.5 h-3.5' />
                  <span className='hidden sm:inline'>{copied ? 'Copied!' : 'Share'}</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-50 transition-colors'
                >
                  <Trash2 className='w-3.5 h-3.5' />
                  <span className='hidden sm:inline'>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Checkpoints ── */}
        {colleges.length >= 2 ? (
          <div className='space-y-2.5 sm:space-y-3'>
            {CHECKPOINTS.map((layer, li) => {
              const isOpen = openLayers[li]
              return (
                <div key={li}>
                  <button
                    onClick={() => toggleLayer(li)}
                    className='w-full flex items-center justify-between gap-3 bg-white rounded-xl py-3 px-3.5 sm:px-5 cursor-pointer select-none hover:bg-gray-50 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0A6FA7]/10 flex items-center justify-center flex-shrink-0'>
                        <span className='text-xs font-bold text-[#0A6FA7]'>{li + 1}</span>
                      </div>
                      <div className='flex flex-col items-start gap-0'>
                        <span className='text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#0A6FA7]/60 font-mono'>
                          {layer.tag}
                        </span>
                        <span className='text-sm sm:text-base font-bold text-gray-900 text-left'>
                          {layer.title}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#0A6FA7] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className='overflow-hidden'
                      >
                        {/* Comparison Table (all screen sizes) */}
                        <div className='mt-2 rounded-xl bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]'>
                          <div className='overflow-x-auto scrollbar-hide'>
                            <table className='w-full' style={{ minWidth: `${120 + colleges.length * 200}px` }}>
                              <colgroup>
                                <col style={{ width: '120px' }} />
                                {colleges.map((_, ci) => <col key={ci} />)}
                              </colgroup>
                              <thead>
                                <tr>
                                  <th className='text-left px-4 py-3.5 text-[10px] uppercase tracking-wider text-gray-400 font-bold bg-[#0A6FA7]/[0.03]'>
                                  </th>
                                  {colleges.map((c) => (
                                    <th key={c.slug} className='text-center px-4 py-3.5 bg-[#0A6FA7]/[0.03]'>
                                      <div className='flex flex-col items-center gap-1.5'>
                                        <div className='w-9 h-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 shadow-sm'>
                                          {c.college_logo ? (
                                            <img src={c.college_logo} alt={c.name} className='w-full h-full object-contain p-0.5' />
                                          ) : (
                                            <div className='w-full h-full flex items-center justify-center text-xs font-bold bg-[#0A6FA7]/10 text-[#0A6FA7]'>
                                              {c.name?.charAt(0) || '?'}
                                            </div>
                                          )}
                                        </div>
                                        <div className='text-[11px] font-bold text-gray-900 leading-tight'>{c.name}</div>
                                        {(c.universities || []).length > 0 && (
                                          <div className='text-[9px] text-gray-400 font-medium'>
                                            {c.universities.map((u) => u?.fullname).filter(Boolean).join(', ')}
                                          </div>
                                        )}
                                      </div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {layer.rows.map((row) => (
                                  <tr key={row.key} className='last:border-0 hover:bg-[#0A6FA7]/[0.01] transition-colors'>
                                    <td className='px-4 py-3 text-[11px] font-extrabold text-gray-700 uppercase tracking-wider bg-gray-50/40'>
                                      {row.label}
                                    </td>
                                    {colleges.map((c) => (
                                      <td key={c.slug} className='px-4 py-3 text-center text-xs font-semibold text-gray-700'>
                                        {row.key === 'program' ? (
                                          (c.collegePrograms || []).length > 0 ? (
                                            <ThemeSelect
                                              compact
                                              value={selectedPrograms[c.slug] || ''}
                                              options={(c.collegePrograms || []).map((p) => ({
                                                value: p?.program?.slug || '',
                                                label: getProgramShortcut(p?.program, c.degrees)
                                              }))}
                                              onChange={(slug) => setSelectedPrograms((prev) => ({ ...prev, [c.slug]: slug }))}
                                            />
                                          ) : (
                                            <span className='text-gray-300'>—</span>
                                          )
                                        ) : (
                                          renderCellValue(c, row.key)
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        ) : colleges.length === 1 ? (
          <div className='text-center py-12 text-gray-400 text-sm font-medium'>
            Add at least one more college to start comparing.
          </div>
        ) : (
          <div className='text-center py-12 text-gray-400 text-sm font-medium'>
            Add 2 or more colleges to begin comparing.
          </div>
        )}

        {/* ── Note ── */}
        <div className='mt-6 sm:mt-8 p-3 sm:p-4 rounded-xl bg-[#0A6FA7]/[0.03] text-[11px] sm:text-xs text-gray-500 leading-relaxed shadow-[0_1px_3px_rgba(0,0,0,0.04)]'>
          <strong className='text-gray-700'>Data sourced from college submissions</strong> — fees, placements, and scholarship details may vary. Verify directly with the college before making decisions.
        </div>
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

export default CompareContent
