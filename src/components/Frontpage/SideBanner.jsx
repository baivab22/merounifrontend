import Image from 'next/image'

const isExpired = (banner) => {
  if (!banner?.date_of_expiry) return false
  return new Date(banner.date_of_expiry) < new Date()
}

const SideBanner = ({ banners = [] }) => {
  // Positions 4–8: right column on homepage and blog article layout (matches dashboard slots)
  const displayBanners = [4, 5, 6, 7, 8]
    .map((position) => {
      const banner = banners.find((b) => b.display_position === position)
      return !banner || isExpired(banner) ? null : banner
    })
    .filter(Boolean)

  if (displayBanners.length === 0) return null

  // Same tile height as desktop sidebar on all breakpoints (matches dashboard slot preview height).
  const tileHeightClass = 'h-[148px] min-h-[148px]'

  return (
    <div className='grid grid-cols-1 gap-3 md:gap-4'>
      {displayBanners.map((banner) => {
        const url = banner.website_url?.trim()
        const href =
          url &&
          (/^https?:\/\//i.test(url) ? url : `https://${url}`)
        const shellClass = `group relative block overflow-hidden rounded-lg shadow-sm border border-gray-100 bg-gray-50 w-full ${tileHeightClass} mx-auto`
        const inner = (
          <>
            <Image
              src={banner.banner_image || '/images/meroUniLarge.gif'}
              alt={`Banner position ${banner.display_position}`}
              fill
              unoptimized
              sizes='(max-width: 768px) 100vw, 25vw'
              className='object-cover object-center'
            />
            <div className='absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all duration-300' />
          </>
        )
        return href ? (
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            key={banner.id}
            className={shellClass}
          >
            {inner}
          </a>
        ) : (
          <div key={banner.id} className={shellClass}>
            {inner}
          </div>
        )
      })}
    </div>
  )
}

export default SideBanner
