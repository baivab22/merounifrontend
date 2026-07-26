'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

const EmptySlots = ({ count, onAdd }) => {
  return Array.from({ length: count }).map((_, i) => (
    <motion.button
      key={`empty-${i}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: i * 0.1 }}
      onClick={onAdd}
      className='w-full sm:min-w-[280px] sm:max-w-[340px] flex-shrink-0 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#0A6FA7]/40 hover:bg-[#0A6FA7]/[0.02] transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer group snap-center'
      style={{ minHeight: '420px' }}
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 90 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className='w-16 h-16 rounded-2xl bg-gray-100 group-hover:bg-[#0A6FA7]/10 flex items-center justify-center transition-colors duration-300'
      >
        <Plus className='w-7 h-7 text-gray-300 group-hover:text-[#0A6FA7] transition-colors duration-300' />
      </motion.div>
      <div className='text-center'>
        <p className='text-sm font-semibold text-gray-400 group-hover:text-[#0A6FA7] transition-colors duration-300'>
          Add College
        </p>
        <p className='text-[11px] text-gray-300 mt-1 font-medium'>
          Click to search & add
        </p>
      </div>
    </motion.button>
  ))
}

export default EmptySlots
