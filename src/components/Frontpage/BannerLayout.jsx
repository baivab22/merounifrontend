import Link from 'next/link'
import Image from 'next/image'

const isExpired = (banner) => {
  if (!banner?.date_of_expiry) return false
  return new Date(banner.date_of_expiry) < new Date()
}

const BannerLayout = ({ banners = [] }) => {
  const displayBanners = [1, 2, 3].map((position) => {
    const banner = banners.find((b) => b.display_position === position)
    return (!banner || isExpired(banner)) ? null : banner
  })

  return (
    <div className='flex flex-col sm:flex-row gap-4 md:gap-3 lg:gap-3 justify-center sm:flex-nowrap xl:flex-nowrap'>
      {displayBanners.map((banner, index) => (
        <div
          key={index}
          className={`w-full sm:w-[350px] lg:w-[340px] xl:w-full rounded-md overflow-hidden relative ${!banner ? 'bg-gray-100' : ''}`}
          style={{ height: '70px' }} // Fallback height to prevent layout shift
        >
          {banner ? (
            <a
              href={banner.website_url}
              target='_blank'
              rel='noopener noreferrer'
              className='block relative w-full h-full'
            >
              <Image
                src={banner.banner_image || '/images/meroUniLarge.gif'}
                alt={`Banner ${banner.title}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 350px, 400px"
                className='object-cover'
                priority={index === 0} // Prioritize first banner for LCP
              />
            </a>
          ) : (
            <div className='group relative w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium bg-gray-50 rounded-md overflow-hidden cursor-pointer'>
              <span className='group-hover:opacity-0 transition-opacity duration-200'>Ads place available</span>
              <Link
                href='/contact'
                className='absolute inset-0 flex items-center justify-center bg-[#387cae]/90 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200'
              >
                Contact Us
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default BannerLayout
