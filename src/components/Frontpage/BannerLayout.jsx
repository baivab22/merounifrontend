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
  }).filter(Boolean)

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4'>
      {displayBanners.map((banner, index) => (
        <div
          key={index}
          className={`w-full h-[50px] sm:h-[60px] lg:h-[70px] rounded-lg overflow-hidden relative ${!banner ? 'bg-gray-50 border-2 border-dashed border-gray-100' : 'bg-white shadow-sm ring-1 ring-black/5'
            }`}
        >
          {banner ? (
            banner.website_url?.trim() ? (
              <a
                href={
                  /^https?:\/\//i.test(banner.website_url.trim())
                    ? banner.website_url.trim()
                    : `https://${banner.website_url.trim()}`
                }
                target='_blank'
                rel='noopener noreferrer'
                className='block relative w-full h-full p-1'
              >
                <Image
                  src={banner.banner_image || '/images/meroUniLarge.gif'}
                  alt={`Banner ${banner.title}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className='object-cover'
                  priority={index === 0}
                />
              </a>
            ) : (
              <div className='block relative w-full h-full p-1'>
                <Image
                  src={banner.banner_image || '/images/meroUniLarge.gif'}
                  alt={`Banner ${banner.title}`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className='object-cover'
                  priority={index === 0}
                />
              </div>
            )
          ) : (
            <div className='group relative w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 cursor-pointer'>
              <div className='text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-60 group-hover:opacity-0 transition-opacity duration-200'>
                Ads placement
              </div>
              <Link
                href='/contact'
                className='absolute inset-0 flex items-center justify-center bg-[#387cae]/90 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg'
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
