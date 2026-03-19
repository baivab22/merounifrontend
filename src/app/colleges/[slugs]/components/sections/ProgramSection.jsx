import { useRouter } from 'next/navigation'
import React from 'react'

const ProgramSection = ({ college }) => {
  const route = useRouter()

  const handleApply = (id) => {
    route.push(`/colleges/apply/${college.slugs}/${id}`)
  }
  const handleDegree = (degree) => {
    route.push(`/degree/${degree}`)
  }

  if (!college?.collegeCourses || college.collegeCourses.length === 0) {
    return null
  }

  return (
    <div className='bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm'>
      <div className='flex items-center gap-3 mb-8'>
        <div className='w-1.5 h-8 bg-[#0A6FA7] rounded-full' />
        <h2 className='text-2xl font-bold text-gray-900'>Offered Programs</h2>
      </div>

      <div className='flex overflow-x-auto md:grid md:grid-cols-2 gap-4 md:gap-6 no-scrollbar pb-4 -mx-2 px-2 md:mx-0 md:px-0'>
        {college.collegeCourses.map((course, index) => (
          <div
            key={index}
            className='flex-shrink-0 w-[85vw] md:w-auto group bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 hover:border-[#0A6FA7]/30 flex flex-col justify-between h-auto min-h-[160px]'
          >
            <div>
              <h3
                onClick={() => handleDegree(course?.program?.title)}
                className='text-lg font-bold text-gray-800 cursor-pointer group-hover:text-[#0A6FA7] transition-colors leading-tight mb-6'
              >
                {course.program.title}
              </h3>
            </div>
            <button
              onClick={() => handleApply(course.id)}
              type='button'
              className='w-full md:w-max bg-[#0A6FA7] hover:bg-[#085e8a] text-white text-sm font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-md hover:shadow-lg'
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProgramSection
