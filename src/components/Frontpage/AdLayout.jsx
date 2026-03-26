import { Skeleton } from '../../ui/shadcn/Skeleton'
import Link from 'next/link'
import Image from 'next/image'

const isExpired = (banner) => {
  if (!banner?.date_of_expiry) return false
  return new Date(banner.date_of_expiry) < new Date()
}

const AdLayout = ({ banners = [], size = '', number = 1, loading = false }) => {
  const displayBanners = [8, 9, 10].map((position) => {
    const banner = banners.find((b) => b.display_position === position)
    return (!banner || isExpired(banner)) ? null : banner
  })

  if (loading) {
    return (
      <div className='mt-2 p-4'>
        <div className='flex gap-4 justify-center'>
          {[...Array(3)].map((_, index) => (
            <Skeleton
              key={index}
              className='w-full sm:w-[350px] lg:w-[340px] xl:w-full h-[44px] md:h-[58px] lg:h-[70px]'
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='mt-2 p-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-3 lg:gap-3'>
        {displayBanners.map((banner, index) => (
          <div
            key={index}
            className={`w-full h-[44px] md:h-[58px] lg:h-[70px] rounded-lg overflow-hidden relative ${!banner ? 'bg-gray-100 border-2 border-dashed border-gray-100' : 'bg-white shadow-sm ring-1 ring-black/5'
              }`}
          >
            {banner ? (
              <a
                href={banner.website_url}
                target='_blank'
                rel='noopener noreferrer'
                className='block w-full h-full relative p-0.5'
              >
                <Image
                  src={banner.banner_image || '/images/meroUniLarge.gif'}
                  alt={`Banner ${banner.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className='object-cover animate-banner-fade-in'
                />
              </a>
            ) : (
              <div className='group relative w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 cursor-pointer'>
                <div className='text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-0 transition-opacity duration-200'>
                  Ad Spot
                </div>
                <Link
                  href='/contact'
                  className='absolute inset-0 flex items-center justify-center bg-[#387cae]/90 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg'
                >
                  Contact us
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdLayout
