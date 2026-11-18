'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  ChevronDown,
  Folder,
  ExternalLink,
  Loader2,
  File,
  Lock,
  Crown,
  Heart
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { getMaterialHierarchy, toggleMaterialHeart } from './action'
import { getMaterialFileUrl, getMaterialOpenUrl, isMaterialLocked } from './materialAccess'
import { useToast } from '@/hooks/use-toast'

// --- Components ---

const MaterialRow = ({ material }) => {
  const { toast } = useToast()
  const user = useSelector((state) => state.user?.data)

  const role = useMemo(() => {
    const r = user?.role || user?.roles
    if (!r) return {}
    if (typeof r === 'object') return r
    try {
      return JSON.parse(r)
    } catch {
      return {}
    }
  }, [user])

  const isStudent = role?.student === true

  const fileUrl = getMaterialFileUrl(material)
  const locked = isMaterialLocked(material)

  const [isHearted, setIsHearted] = useState(material.is_hearted)
  const [heartsCount, setHeartsCount] = useState(material.hearts_count || 0)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleHeart = async (e) => {
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to heart materials."
      })
      return
    }

    if (!isStudent) {
      toast({
        title: "Permission Denied",
        description: "Only students can heart materials."
      })
      return
    }

    setIsToggling(true)
    // Optimistic update
    const prevIsHearted = isHearted
    const prevCount = heartsCount
    setIsHearted(!prevIsHearted)
    setHeartsCount(prevIsHearted ? prevCount - 1 : prevCount + 1)

    try {
      const result = await toggleMaterialHeart(material.id)
      if (result && result.success === false) {
        throw new Error(result.message)
      }
      if (result && result.data) {
        setIsHearted(result.data.is_hearted)
        setHeartsCount(result.data.hearts_count)
      }
    } catch (error) {
      // Rollback on error
      setIsHearted(prevIsHearted)
      setHeartsCount(prevCount)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to toggle heart'
      })
    } finally {
      setIsToggling(false)
    }
  }

  const handleOpen = () => {
    if (locked || !fileUrl) {
      toast({
        variant: 'destructive',
        title: 'Members only',
        description: 'Become a verified member to open this material.'
      })
      return
    }
    const openUrl = getMaterialOpenUrl(material)
    if (!openUrl) return
    window.open(openUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/80 transition-all border border-transparent hover:border-gray-100 group relative"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          <File className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-800 group-hover:text-[#0A70A7] transition-colors">
              {material.title}
            </h4>
            {material.is_premium && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide border shrink-0 ${
                  locked
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-violet-50 text-violet-700 border-violet-200'
                }`}
              >
                <Crown size={10} />
                Premium
              </span>
            )}
          </div>
          {material.description && (
            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{material.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-50">
        <div className="flex flex-col items-center gap-0.5">
          <div
            role="button"
            aria-label="Heart material"
            onClick={handleToggleHeart}
            className={`p-1.5 rounded-full transition-all duration-300 ${
              isHearted
                ? 'bg-rose-50 text-rose-500 scale-110'
                : 'text-gray-300 hover:text-rose-400 hover:bg-rose-50/30'
            } ${isToggling ? 'opacity-50 animate-pulse' : ''} ${!isStudent ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Heart
              size={18}
              fill={isHearted ? 'currentColor' : 'none'}
              className={isHearted ? 'animate-heart-beat' : ''}
            />
          </div>
          <span className={`text-[10px] font-bold ${isHearted ? 'text-rose-500' : 'text-gray-500'}`}>
            {heartsCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {locked ? (
            <a
              href="/membership"
              title="Become a member to unlock this material"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg shadow-sm active:scale-95 transition-all"
            >
              <Lock size={12} />
              <span>Members only</span>
            </a>
          ) : fileUrl ? (
            <button
              onClick={handleOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A70A7] hover:bg-[#085a85] text-white text-[10px] font-bold rounded-lg shadow-sm active:scale-95 transition-all"
            >
              <ExternalLink size={12} />
              <span>Open</span>
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

const SubjectAccordion = ({ subject, isExpanded, onToggle }) => {
  // Materials arrive already filtered by the backend for the selected
  // Free/Premium tab as part of the hierarchy response.
  const materials = subject.materials || []

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center gap-3 text-left">
          <motion.div animate={{ rotate: isExpanded ? 0 : -90 }}>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600" />
          </motion.div>
          <div className="w-8 h-8 rounded-lg bg-[#0A70A7]/5 flex items-center justify-center text-[#0A70A7]">
            <Folder size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-700 tracking-tight group-hover:text-[#0A70A7] transition-colors">{subject.title}</h4>
            <p className="text-[10px] font-medium text-gray-400">
              {subject.materials_count || 0} notes available
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0A70A7] text-[10px] font-bold border border-blue-100/50">
            {subject.materials_count || 0}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-12 pr-2 pt-1 pb-3 border-l-2 border-dashed border-gray-100 ml-7">
              {materials.length > 0 ? (
                materials.map((m) => <MaterialRow key={m.id} material={m} />)
              ) : (
                <p className="text-gray-400 text-[11px] italic py-2">No materials found.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ClassAccordion = ({ classItem, isExpanded, onToggle }) => {
  const [expandedSubject, setExpandedSubject] = useState(null)

  const toggleSubject = (id) => {
    setExpandedSubject(expandedSubject === id ? null : id)
  }

  const totalNotes = useMemo(() => {
    return classItem.subcategories?.reduce((acc, sub) => acc + (sub.materials_count || 0), 0) || 0
  }, [classItem.subcategories])

  return (
    <div className="mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-gray-50/50 transition-colors group"
      >
        <div className="flex items-center gap-5 text-left">
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
          >
            <ChevronDown size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          </motion.div>
          <div className="w-11 h-11 rounded-xl bg-[#0A70A7]/5 flex items-center justify-center text-[#0A70A7] group-hover:bg-[#0A70A7] group-hover:text-white transition-all duration-300">
            <Folder size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800 tracking-tight group-hover:text-[#0A70A7] transition-colors">{classItem.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{classItem.subcategories?.length || 0} subjects</span>
              <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{totalNotes} resources</span>
            </div>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-xl bg-blue-50 text-[#0A70A7] text-[11px] font-bold border border-blue-100/50">
          {totalNotes}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-8 pb-6">
              <div className="h-px bg-gray-100 mb-6" />
              {classItem.subcategories?.length > 0 ? (
                <div className="space-y-1">
                  {classItem.subcategories.map((subject) => (
                    <SubjectAccordion
                      key={subject.id}
                      subject={subject}
                      isExpanded={expandedSubject === subject.id}
                      onToggle={() => toggleSubject(subject.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 font-medium text-[11px]">
                  No resources added yet.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const Materials = () => {
  const [hierarchy, setHierarchy] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedClass, setExpandedClass] = useState(null)
  const [activeTab, setActiveTab] = useState('free') // 'free' | 'premium'

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setLoading(true)
      setExpandedClass(null)
      // The backend filters every material by its own is_premium flag.
      const isPremium = activeTab === 'premium'
      const data = await getMaterialHierarchy(isPremium)
      if (!cancelled) {
        setHierarchy(data)
        setLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [activeTab])

  const toggleClass = (id) => {
    setExpandedClass(expandedClass === id ? null : id)
  }

  // Both tabs fetch a filtered list, so hide classes that ended up with no
  // materials for the selected tab (e.g. 0 premium materials in the Premium tab).
  const visibleHierarchy = useMemo(() => {
    const classHasMaterials = (classItem) =>
      (classItem.materials?.length || 0) > 0 ||
      (classItem.subcategories || []).some(
        (sub) => (sub.materials_count || 0) > 0 || (sub.materials?.length || 0) > 0
      )
    return hierarchy.filter(classHasMaterials)
  }, [hierarchy, activeTab])

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      <main className="max-w-4xl mx-auto px-6 pt-12 pb-24">
        {/* Page Header */}
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12'>
          <div>
            <div className='relative inline-block mb-3'>
              <h1 className='text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight'>
                Materials <span className='text-[#0A6FA7]'>Library</span>
              </h1>
              <div className='absolute -bottom-2 left-0 w-16 h-1 bg-[#0A6FA7] rounded-full'></div>
            </div>
          </div>
        </div>

        <div className='flex justify-center mb-8'>
          <div className='inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1'>
            {[
              { id: 'free', label: 'Free' },
              { id: 'premium', label: 'Premium' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#0A70A7] shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : visibleHierarchy.length > 0 ? (
          <div className="space-y-3">
            {visibleHierarchy.map((classItem) => (
              <ClassAccordion
                // Remount on tab change so expanded subjects never carry over stale data.
                key={`${classItem.id}-${activeTab}`}
                classItem={classItem}
                isExpanded={expandedClass === classItem.id}
                onToggle={() => toggleClass(classItem.id)}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-gray-300">
              <File size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No materials found</h3>
            <p className="text-gray-400 text-xs font-medium">
              There are no {activeTab} materials available yet.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default Materials
