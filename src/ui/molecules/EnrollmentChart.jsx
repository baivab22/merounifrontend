'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, X } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

const ROLE_COLORS = {
  student: '#6366f1',      // indigo-500
  institution: '#14b8a6',  // teal-500
  agent: '#f59e0b',        // amber-500
  consultancy: '#ec4899',  // pink-500
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  // Group payload by year
  const years = [...new Set(payload.map(p => p.dataKey.split('_')[1]))]

  return (
    <div className='bg-white/95 backdrop-blur rounded-xl shadow-xl border border-gray-100 p-4 min-w-[220px] z-[9999]'>
      <p className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3 border-b border-gray-50 pb-2'>
        {label}
      </p>
      <div className='space-y-4'>
        {years.map(year => (
          <div key={year} className='space-y-1.5'>
            <p className='text-[10px] font-black text-gray-900 mb-1 flex items-center gap-2'>
              <span className='w-1 h-3 bg-indigo-500 rounded-full' />
              YEAR {year}
            </p>
            {payload
              .filter(p => p.dataKey.endsWith(`_${year}`))
              .map((entry, index) => (
                <div key={index} className='flex items-center justify-between gap-4 pl-3'>
                  <div className='flex items-center gap-2.5'>
                    <div 
                      className='w-1.5 h-1.5 rounded-full shadow-sm'
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className='text-[11px] font-medium text-gray-500 capitalize'>{entry.name}</span>
                  </div>
                  <span className='text-xs font-bold text-gray-900 tabular-nums'>
                    {entry.value}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const CustomLegend = () => {
  return (
    <div className='flex flex-wrap items-center justify-center gap-6 mt-6 border-t border-gray-50 pt-6'>
      {Object.entries(ROLE_COLORS).map(([role, color]) => (
        <div
          key={role}
          className='flex items-center gap-2.5 group cursor-default'
        >
          <div
            className='w-3 h-3 rounded-md shadow-sm transition-transform group-hover:scale-110'
            style={{ backgroundColor: color }}
          />
          <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>{role}</span>
        </div>
      ))}
    </div>
  )
}

const StudentEnrollmentGrowthChart = ({
  data,
  availableYears = [],
  selectedYears = [],
  onYearsChange
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const enrollmentData = Array.isArray(data) && data.length > 0 ? data : []

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleYearToggle = (year) => {
    if (!onYearsChange) return

    const newSelectedYears = selectedYears.includes(year)
      ? selectedYears.filter((y) => y !== year)
      : [...selectedYears, year].sort((a, b) => b - a)

    // Ensure at least one year is selected
    if (newSelectedYears.length > 0) {
      onYearsChange(newSelectedYears)
    }
  }

  // Generate Bar components for each selected year and each role
  const renderBars = () => {
    if (!selectedYears || selectedYears.length === 0) return null

    const bars = []
    selectedYears.forEach((year) => {
      Object.entries(ROLE_COLORS).forEach(([role, color]) => {
        bars.push(
          <Bar
            key={`${role}_${year}`}
            dataKey={`${role}_${year}`}
            name={role}
            stackId={year.toString()}
            fill={color}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing='ease-out'
          />
        )
      })
    })
    return bars
  }

  return (
    <div className='bg-white rounded-3xl w-full h-full p-8 shadow-sm border border-gray-100/80 transition-all hover:shadow-md'>
      <div className='flex justify-between items-center mb-10'>
        <div className='space-y-1'>
          <h2 className='text-lg font-black text-gray-900 tracking-tight'>
            Enrollment Growth
          </h2>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-widest'>
            Monthly User Registration
          </p>
        </div>
        <div className='relative' ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className='flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-600 bg-gray-50/50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all uppercase tracking-widest'
          >
            <span>Filters</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''
                }`}
            />
          </button>
          {isDropdownOpen && availableYears.length > 0 && (
            <div className='absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-indigo-100'>
              <div className='p-2 bg-gray-50/50 border-b border-gray-100 px-4 py-3'>
                <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Select Years</span>
              </div>
              <div className='p-2 max-h-64 overflow-y-auto'>
                {availableYears.map((year) => {
                  const isSelected = selectedYears.includes(year)
                  return (
                    <label
                      key={year}
                      className={`flex items-center justify-between p-3 cursor-pointer rounded-xl transition-all ${
                        isSelected ? 'bg-indigo-50/50 text-indigo-700' : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <span className='text-sm font-bold'>{year}</span>
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => handleYearToggle(year)}
                        className='w-4.5 h-4.5 text-indigo-600 rounded-lg border-gray-300 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer'
                      />
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={enrollmentData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray='4 4'
              vertical={false}
              stroke='#f1f5f9'
            />
            <XAxis
              dataKey='name'
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
              width={80}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: '#f8fafc', radius: [8, 8, 0, 0] }} 
            />
            <Legend content={<CustomLegend />} />
            {renderBars()}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default StudentEnrollmentGrowthChart
