import Link from 'next/link'
import Image from 'next/image'

const isExpired = (banner) => {
  if (!banner?.date_of_expiry) return false
  return new Date(banner.date_of_expiry) < new Date()
}

const SideBanner = ({ banners = [] }) => {
  // Get banners for positions 4,5,6,7
  const displayBanners = [4, 5, 6, 7].map((position) => {
    const banner = banners.find((b) => b.display_position === position)
    return (!banner || isExpired(banner)) ? null : banner
  })

  return (
    <div className='grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4'>
      {displayBanners.map((banner, index) =>
        banner ? (
          <a
            href={banner.website_url}
            target='_blank'
            rel='noopener noreferrer'
            key={banner.id}
            className='group relative block overflow-hidden rounded-lg shadow-sm border border-gray-100 bg-gray-50 h-28 md:h-32'
          >
            <Image
              src={banner.banner_image || '/images/meroUniLarge.gif'}
              alt={`Banner position ${banner.display_position}`}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 20vw, 300px"
              className='object-contain transition-transform duration-300 hover:scale-[1.05]'
            />
            <div className='absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300' />
          </a>
        ) : (
          <div
            key={`empty-${index}`}
            className='group relative w-full h-28 md:h-32 rounded-lg shadow-sm bg-gray-50 border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer p-2'
          >
            <div className='flex flex-col items-center gap-1 text-center group-hover:opacity-0 transition-opacity duration-200'>
              <span className='text-gray-400 text-[10px] font-bold uppercase tracking-wider'>
                Ads placement
              </span>
            </div>
            <Link
              href='/contact'
              className='absolute inset-0 flex items-center justify-center bg-[#387cae]/90 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg'
            >
              Contact Us
            </Link>
          </div>
        )
      )}
    </div>
  )
}

export default SideBanner
