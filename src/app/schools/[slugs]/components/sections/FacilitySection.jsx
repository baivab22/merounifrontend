import React from 'react'
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

      <div className='flex overflow-x-auto sm:grid sm:grid-cols-2 gap-4 sm:gap-6 no-scrollbar pb-4 -mx-2 px-2 sm:mx-0 sm:px-0'>
        {college.facilities.map((item, index) => {
          return (
            <div
              key={index}
              className='flex-shrink-0 w-[85vw] sm:w-auto group flex flex-col p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all duration-500 hover:border-[#30AD8F]/30 h-auto'
            >
              <div className='flex items-center gap-4 mb-4'>
                {item?.icon && (
                  <div className='w-14 h-14 rounded-2xl overflow-hidden bg-white flex-shrink-0 p-3 border border-gray-100 group-hover:bg-[#30AD8F]/5 transition-colors shadow-sm'>
                    <img
                      src={item.icon}
                      alt={item?.title}
                      className='w-full h-full object-contain'
                    />
                  </div>
                )}

                <h3 className='text-lg font-bold text-gray-800 group-hover:text-[#30AD8F] transition-colors leading-tight'>
                  {item?.title}
                </h3>
              </div>
              <p className='text-gray-500 leading-relaxed text-sm line-clamp-4'>
                {item?.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FacilitySection
