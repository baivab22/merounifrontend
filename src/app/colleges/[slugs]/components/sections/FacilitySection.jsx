import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FacilitySection = ({ college }) => {
  if (!college?.facilities || college.facilities.length === 0) {
    return null
  }

  return (
    <div className='bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm'>
      <div className='flex items-center gap-3 mb-8'>
        <div className='w-1.5 h-8 bg-[#30AD8F] rounded-full' />
        <h2 className='text-2xl font-bold text-gray-900'>Campus Facilities</h2>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
        {college.facilities.map((item, index) => (
          <FacilityCard key={index} item={item} />
        ))}
      </div>
    </div>
  )
}

const FacilityCard = ({ item }) => {
  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      className='group relative bg-gray-50/50 rounded-2xl border border-gray-100 p-5 h-[160px] sm:h-[180px] overflow-hidden cursor-default transition-colors duration-300 hover:border-[#30AD8F]/30 hover:shadow-xl hover:shadow-[#30AD8F]/10'
    >
      {/* Icon & Heading Wrapper */}
      <motion.div
        initial="initial"
        className='flex flex-col items-center justify-center h-full gap-4'
        variants={{
          initial: { y: 0, opacity: 1 },
          hover: { y: -20, opacity: 0 }
        }}
        transition={{ duration: 0.4, ease: "backOut" }}
      >
        {item?.icon ? (
          <div className='w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-3 shadow-sm'>
            {item?.icon}
          </div>
        ) : (
          <div className='w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400'>
            <div className='w-8 h-8 opacity-20 bg-gray-400 rounded-full' />
          </div>
        )}
        <h3 className='text-sm sm:text-base font-bold text-gray-800 text-center px-2 group-hover:text-[#30AD8F] transition-colors'>
          {item?.title}
        </h3>
      </motion.div>

      {/* Description Overlay */}
      <motion.div
        className='absolute inset-0 p-5 flex flex-col bg-white/90 backdrop-blur-[4px]'
        variants={{
          initial: { y: '100%', opacity: 0 },
          hover: { y: 0, opacity: 1 }
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className='flex items-center gap-2 mb-3 flex-shrink-0'>
          <div className='w-1 h-3 bg-[#30AD8F] rounded-full' />
          <span className='text-[10px] uppercase tracking-widest font-black text-[#30AD8F]'>
            {item?.title}
          </span>
        </div>

        {/* Scrollable Description Area */}
        <div className='flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#30AD8F]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#30AD8F]/40 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#30AD8F]/20 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-[#30AD8F]/40'>
          <p className='text-xs sm:text-sm text-gray-600 leading-relaxed text-left'>
            {item?.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default FacilitySection
