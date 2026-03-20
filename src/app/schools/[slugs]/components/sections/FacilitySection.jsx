import React from 'react'
import Image from 'next/image'

const FacilityIcon = ({ icon, title }) => {
  if (!icon) return null;

  // Check if icon is a URL string
  const isUrl = typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('/'));

  if (isUrl) {
    return (
      <div className="relative w-full h-full">
        <img
          src={icon}
          alt={title || 'Facility'}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // If it's a React component/element
  return <div className="text-[#30AD8F]">{icon}</div>;
};

const FacilitySection = ({ college }) => {
  if (!college?.facilities || college.facilities.length === 0) {
    return null
  }

  return (
    <div className='bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm overflow-hidden'>
      <div className='flex items-center gap-3 mb-8'>
        <div className='w-1.5 h-8 bg-[#30AD8F] rounded-full' />
        <h2 className='text-2xl font-bold text-gray-900'>School Facilities</h2>
      </div>

      <div className='flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 no-scrollbar pb-4 -mx-2 px-2 md:mx-0 md:px-0'>
        {college.facilities.map((item, index) => (
          <div
            key={index}
            className='flex-shrink-0 w-[85vw] md:w-auto group flex flex-col p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition-all duration-500 hover:border-[#30AD8F]/30 h-full'
          >
            <div className='flex items-center gap-4 mb-4 min-w-0'>
              <div className='w-14 h-14 rounded-2xl overflow-hidden bg-white flex-shrink-0 p-3 border border-gray-100 group-hover:bg-[#30AD8F]/5 transition-colors shadow-sm flex items-center justify-center'>
                <FacilityIcon icon={item?.icon} title={item?.title} />
              </div>

              <h3 className='text-lg font-bold text-gray-800 group-hover:text-[#30AD8F] transition-colors leading-tight break-words overflow-hidden'>
                {item?.title}
              </h3>
            </div>
            <div className='flex-1 overflow-hidden'>
              <p className='text-gray-500 leading-relaxed text-sm line-clamp-6 md:line-clamp-none break-words'>
                {item?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FacilitySection
