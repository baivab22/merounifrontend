import Link from 'next/link'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { THEME_BLUE } from '@/constants/constants'

const DisciplineList = async () => {
  let disciplines = []

  try {
    const response = await fetch(`${process.env.baseUrl}/discipline?limit=7`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    if (response.ok) {
      const data = await response.json()
      disciplines = data?.items || []
    }
  } catch (error) {
    console.error('Discipline Fetch Error:', error)
  }

  return (
    <div className='py-8 md:py-10 bg-white'>
      <div className='mb-6'>
        <h2 className='text-lg md:text-xl font-bold text-gray-900'>
          Disciplines
        </h2>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6'>
        {disciplines.length > 0 ? (
          disciplines.map((item) => (
            <Link
              key={item.id}
              href={`/disciplines/${item.slug}`}
              className='group cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-sm transition-all duration-300'
            >
              <div className='relative aspect-[16/10] overflow-hidden bg-gray-100'>
                {item.featured_image ? (
                  <Image
                    src={item.featured_image}
                    alt={item.title || 'Discipline'}
                    fill
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                    className='object-cover transition-transform duration-500 group-hover:scale-110'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-gray-300'>
                    <BookOpen className='w-10 h-10 md:w-12 md:h-12' />
                  </div>
                )}
                <div className='absolute inset-0 bg-black/40 group-hover:opacity-20 transition-opacity duration-300'></div>

                <div className='absolute bottom-4 left-4 right-4'>
                  <h3 className='text-sm md:text-base font-bold text-white leading-tight'>
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className='p-3 md:p-4'>
                <p className='text-sm text-gray-500 line-clamp-2'>
                  {item.description || `${item.title} discipline`}
                </p>
                <div className='mt-4 pt-3 border-t border-gray-50 flex items-center justify-between'>
                  <span
                    className='text-xs font-semibold'
                    style={{ color: THEME_BLUE }}
                  >
                    View Degrees
                  </span>
                  <div className='w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#387cae] transition-colors'>
                    <svg
                      className='w-3 h-3 text-gray-400 group-hover:text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className='col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200'>
            <BookOpen className='w-12 h-12 text-gray-300 mx-auto mb-3' />
            <p className='text-gray-500 font-medium'>
              No disciplines found available yet.
            </p>
          </div>
        )}
        {disciplines.length > 0 && (
          <Link
            href='/disciplines'
            className='group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl relative min-h-[180px] justify-center items-center text-center p-4 md:p-6 cursor-pointer'
            style={{
              background:
                'linear-gradient(135deg, #0A6FA7 0%, #0e4f7a 60%, #31AD8F 100%)'
            }}
          >
            {/* Decorative blobs */}
            <div className='absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none' />
            <div className='absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10 pointer-events-none' />
            {/* Dot grid overlay */}
            <div
              className='absolute inset-0 opacity-5 pointer-events-none'
              style={{
                backgroundImage:
                  'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '18px 18px'
              }}
            />

            <div className='relative z-10 flex flex-col items-center gap-3'>
              <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                <BookOpen className='w-4 h-4 md:w-5 md:h-5 text-white' />
              </div>
              <h2 className='text-white text-base font-bold leading-snug'>
                Explore All Disciplines
              </h2>
              <p className='text-white/75 text-xs leading-relaxed'>
                Browse every field &amp; academic program
              </p>
              <div className='mt-1 flex items-center gap-1 text-white/90 text-xs font-semibold group-hover:gap-2 transition-all duration-300'>
                <span>View all</span>
                <svg
                  className='w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2.5'
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

export default DisciplineList
