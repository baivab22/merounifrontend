import Link from 'next/link'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { THEME_BLUE } from '@/constants/constants'

const DisciplineList = async () => {
  let disciplines = []

  try {
    const response = await fetch(`${process.env.baseUrl}/discipline?limit=8`, {
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

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
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
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className='object-cover transition-transform duration-500 group-hover:scale-110'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center text-gray-300'>
                    <BookOpen className='w-12 h-12' />
                  </div>
                )}
                <div className='absolute inset-0 bg-black/40 group-hover:opacity-20 transition-opacity duration-300'></div>

                <div className='absolute bottom-4 left-4 right-4'>
                  <h3 className='text-base font-bold text-white leading-tight'>
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className='p-4'>
                <p className='text-sm text-gray-500 line-clamp-2'>
                  {item.description || `${item.title} discipline`}
                </p>
                <div className='mt-4 pt-3 border-t border-gray-50 flex items-center justify-between'>
                  <span className='text-xs font-semibold' style={{ color: THEME_BLUE }}>
                    View Degrees
                  </span>
                  <div className='w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#387cae] transition-colors'>
                    <svg className="w-3 h-3 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className='text-gray-500 font-medium'>No disciplines found available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DisciplineList