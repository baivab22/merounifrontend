import Link from 'next/link'
import Image from 'next/image'

const FeaturedDegree = async () => {
  let degrees = []

  try {
    const response = await fetch(`${process.env.baseUrl}/degree?page=1&limit=7`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      next: { revalidate: 3600 }
    })

    if (response.ok) {
      const data = await response.json()
      degrees = data?.items ?? []
    }
  } catch (error) {
    console.error('Error fetching degrees:', error)
  }

  return (
    <div className='py-8 md:py-10 bg-white'>
      <div className='mb-6'>
        <h2 className='text-lg md:text-xl font-bold text-gray-900'>
          Degrees
        </h2>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5'>
        {degrees?.map((item) => (
          <Link
            key={item.id}
            href={`/degree/${encodeURIComponent(item.slug || '')}`}
            className='group block bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md'
          >
            <div className='aspect-[16/10] w-full overflow-hidden bg-gray-100 relative'>
              {item.featured_image ? (
                <Image
                  src={item.featured_image}
                  alt={item.title || 'Degree'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                  className='object-cover transition-transform duration-500 group-hover:scale-110'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A6FA7]/10 to-[#31AD8F]/10 text-[#0A6FA7] text-4xl font-bold'>
                  {item.short_name?.charAt(0) ||
                    item.title?.charAt(0) ||
                    'D'}
                </div>
              )}
            </div>
            <div className='p-4 h-[100px] flex flex-col justify-between'>
              <div>
                <h2 className='text-sm font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#0A6FA7] transition-colors'>
                  {item.title}
                </h2>
                {item.short_name && (
                  <p className='text-xs text-gray-500 mt-1.5 font-medium'>
                    {item.short_name}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
        <Link
          href='/degree'
          className='group flex flex-col rounded-md overflow-hidden transition-all duration-300 hover:shadow-xl relative min-h-[180px] justify-center items-center text-center p-6 cursor-pointer'
          style={{ background: 'linear-gradient(135deg, #0A6FA7 0%, #0e4f7a 60%, #31AD8F 100%)' }}
        >
          {/* Decorative blobs */}
          <div className='absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none' />
          <div className='absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10 pointer-events-none' />
          {/* Grid pattern overlay */}
          <div className='absolute inset-0 opacity-5 pointer-events-none' style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />

          <div className='relative z-10 flex flex-col items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
              <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
              </svg>
            </div>
            <h2 className='text-white text-base font-bold leading-snug'>Explore All Degrees</h2>
            <p className='text-white/75 text-xs leading-relaxed'>Browse every program &amp; career path</p>
            <div className='mt-1 flex items-center gap-1 text-white/90 text-xs font-semibold group-hover:gap-2 transition-all duration-300'>
              <span>View all</span>
              <svg className='w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2.5' d='M9 5l7 7-7 7' />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default FeaturedDegree
