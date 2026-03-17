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
          className='group flex flex-col bg-[#0A6FA7] rounded-md shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg relative min-h-[180px] justify-center text-center p-6'
        >
          <h2 className='text-white text-lg font-bold mb-2'>View All Degrees</h2>
          <p className='text-white/80 text-xs line-clamp-2'>
            Discover all available programs and career paths
          </p>
        </Link>
      </div>
    </div>
  )
}

export default FeaturedDegree
