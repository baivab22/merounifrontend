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

      <div className='flex overflow-x-auto lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 no-scrollbar pb-4 -mx-2 px-2 lg:mx-0 lg:px-0'>
        {college.facilities.map((item, index) => (
          <FacilityCard key={index} item={item} />
        ))}
      </div>
    </div>
  )
}

const FacilityCard = ({ item }) => {
  return (
    <div className='flex-shrink-0 w-[85vw] sm:w-[350px] lg:w-auto min-h-full'>
      <motion.div
        initial="initial"
        whileHover="hover"
        className='group relative bg-gray-50 border border-gray-100 rounded-2xl p-6 h-full overflow-hidden transition-all duration-500 hover:border-[#30AD8F]/30 hover:shadow-xl'
      >
        {/* Mobile Layout (Static) */}
        <div className='lg:hidden flex flex-col gap-4'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-3 shadow-sm'>
              {item?.icon}
            </div>
            <h3 className='text-lg font-bold text-gray-900 leading-tight'>
              {item?.title}
            </h3>
          </div>
          <p className='text-sm text-gray-500 leading-relaxed'>
            {item?.description}
          </p>
        </div>

        {/* Desktop Layout (Animated Overlay) */}
        <div className='hidden lg:block h-full'>
          <motion.div
            className='flex flex-col items-center justify-center h-full gap-5 text-center'
            variants={{
              initial: { y: 0, opacity: 1 },
              hover: { y: -20, opacity: 0 }
            }}
            transition={{ duration: 0.4, ease: "backOut" }}
          >
            <div className='w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center p-4 shadow-sm group-hover:scale-110 transition-transform'>
              {item?.icon}
            </div>
            <h3 className='text-lg font-bold text-gray-800 group-hover:text-[#30AD8F] transition-colors px-4 px-2'>
              {item?.title}
            </h3>
          </motion.div>

          <motion.div
            className='absolute inset-0 p-8 flex flex-col bg-white/95 backdrop-blur-[4px]'
            variants={{
              initial: { y: '100%', opacity: 0 },
              hover: { y: 0, opacity: 1 }
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className='flex items-center gap-3 mb-4 flex-shrink-0'>
              <div className='w-1.5 h-4 bg-[#30AD8F] rounded-full' />
              <span className='text-xs uppercase tracking-[0.2em] font-black text-[#30AD8F]'>
                {item?.title}
              </span>
            </div>
            <p className='text-sm text-gray-600 leading-relaxed text-left overflow-y-auto pr-2 no-scrollbar'>
              {item?.description}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default FacilitySection
