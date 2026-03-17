'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Search,
  ChevronDown,
  Folder,
  BookOpen,
  ExternalLink,
  Loader2,
  X,
  FileSearch,
  Book,
  File
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'
import { getMaterialHierarchy, getMaterialsBySubject } from './action'

// --- Components ---

const SearchBar = ({ value, onChange, onClear }) => (
  <div className="relative w-full max-w-xl mx-auto mb-10">
    <div className="relative group">
      <div className="relative bg-white border border-gray-200 shadow-sm group-focus-within:ring-2 group-focus-within:ring-[#0A70A7]/20 group-focus-within:border-[#0A70A7] rounded-xl flex items-center px-5 py-3 transition-all">
        <Search className="w-4 h-4 text-gray-400 group-focus-within:text-[#0A70A7] transition-colors" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by chapter, subject, or class..."
          className="w-full bg-transparent border-none outline-none px-3 text-sm text-gray-700 placeholder:text-gray-400 font-medium"
        />
        {value && (
          <button
            onClick={onClear}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  </div>
)

const MaterialRow = ({ material }) => {  
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 mb-2 bg-white rounded-lg border border-gray-100 hover:border-[#0A70A7]/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-[#0A70A7] transition-colors group-hover:bg-[#0A70A7] group-hover:text-white">
          <Book size={14} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800 group-hover:text-[#0A70A7] transition-colors">{material.title}</h4>
          {material.description && (
            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{material.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {(material.file_url || material.file) && (
          <>
            <button
              onClick={() => window.open(material.file_url || material.file, '_blank')}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors flex items-center gap-1"
            >
              <BookOpen size={12} />
              <span>Detail</span>
            </button>
            <button
              onClick={() => window.open(material.file_url || material.file, '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A70A7] hover:bg-[#085a85] text-white text-[10px] font-bold rounded-lg shadow-sm active:scale-95 transition-all"
            >
              <ExternalLink size={12} />
              <span>Open</span>
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

const SubjectAccordion = ({ subject, isExpanded, onToggle, searchActive }) => {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if ((isExpanded || searchActive) && !hasLoaded) {
      const loadMaterials = async () => {
        setLoading(true)
        const data = await getMaterialsBySubject(subject.id)
        setMaterials(data)
        setLoading(false)
        setHasLoaded(true)
      }
      loadMaterials()
    }
  }, [isExpanded, searchActive, hasLoaded, subject.id])

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center gap-3 text-left">
          <motion.div animate={{ rotate: (isExpanded || searchActive) ? 0 : -90 }}>
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
        <div className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0A70A7] text-[10px] font-bold">
          {subject.materials_count || 0}
        </div>
      </button>

      <AnimatePresence>
        {(isExpanded || searchActive) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pl-12 pr-2 pt-1 pb-3 border-l-2 border-dashed border-gray-100 ml-7">
              {loading ? (
                <div className="flex items-center gap-2 text-gray-400 text-xs py-3">
                  <Loader2 className="animate-spin" size={12} />
                  <span>Loading...</span>
                </div>
              ) : materials.length > 0 ? (
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

const ClassAccordion = ({ classItem, isExpanded, onToggle, searchActive }) => {
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
                      isExpanded={searchActive || expandedSubject === subject.id}
                      onToggle={() => toggleSubject(subject.id)}
                      searchActive={searchActive}
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [hierarchy, setHierarchy] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [expandedClass, setExpandedClass] = useState(null)

  const updateURL = (params) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value) newParams.set(key, value)
      else newParams.delete(key)
    })
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const data = await getMaterialHierarchy()
      setHierarchy(data)
      setLoading(false)
      if (data.length > 0) setExpandedClass(data[0].id)
    }
    fetchData()
  }, [])

  const filteredHierarchy = useMemo(() => {
    if (!searchTerm) return hierarchy
    const query = searchTerm.toLowerCase()
    return hierarchy.filter(cls => {
      const matchInClass = cls.title.toLowerCase().includes(query)
      const matchInSubject = cls.subcategories?.some(sub => sub.title.toLowerCase().includes(query))
      return matchInClass || matchInSubject
    })
  }, [hierarchy, searchTerm])

  const toggleClass = (id) => {
    setExpandedClass(expandedClass === id ? null : id)
  }

  const handleSearchChange = (val) => {
    setSearchTerm(val)
    updateURL({ q: val })
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header />
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-12 pb-24">
        {/* Page Header */}
        <div className="text-center mb-10 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#0A70A7] rounded-full text-[10px] font-bold uppercase tracking-widest mb-1 shadow-sm border border-blue-100/50"
          >
            <FileSearch size={12} />
            Study Resources
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Materials <span className="text-[#0A70A7]">Library</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto font-medium">
            Structured academic resources organized by class and subject for easier learning.
          </p>
        </div>

        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          onClear={() => handleSearchChange('')}
        />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredHierarchy.length > 0 ? (
          <div className="space-y-3">
            {filteredHierarchy.map((classItem) => (
              <ClassAccordion
                key={classItem.id}
                classItem={classItem}
                isExpanded={!!searchTerm || expandedClass === classItem.id}
                onToggle={() => toggleClass(classItem.id)}
                searchActive={!!searchTerm}
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
            <h3 className="text-lg font-bold text-gray-900 mb-1">No results found</h3>
            <p className="text-gray-400 text-xs font-medium">Try searching for a different subject or class.</p>
            <button
              onClick={() => handleSearchChange('')}
              className="mt-6 px-5 py-2.5 bg-[#0A70A7] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#085a85] transition-all"
            >
              Reset Library
            </button>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Materials
