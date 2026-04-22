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
  }).filter(Boolean)

  if (displayBanners.length === 0) return null

  return (
    <div className='grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4'>
      {displayBanners.map((banner) => (
        <a
          href={banner.website_url}
          target='_blank'
          rel='noopener noreferrer'
          key={banner.id}
          className='group relative block overflow-hidden rounded-lg shadow-sm border border-gray-100 bg-gray-50 w-full h-[148px] mx-auto'
        >
          <Image
            src={banner.banner_image || '/images/meroUniLarge.gif'}
            alt={`Banner position ${banner.display_position}`}
            fill
            unoptimized
            sizes='(max-width: 768px) 50vw, 25vw'
            className='object-contain object-center'
          />
          <div className='absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300' />
        </a>
      ))}
    </div>
  )
}

export default SideBanner
