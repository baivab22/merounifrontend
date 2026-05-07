import { Skeleton } from '../../ui/shadcn/Skeleton'
import Link from 'next/link'
import Image from 'next/image'

const isExpired = (banner) => {
  if (!banner?.date_of_expiry) return false
  return new Date(banner.date_of_expiry) < new Date()
}

const AdLayout = ({ banners = [], size = '', number = 1, loading = false, positions = [8, 9, 10] }) => {
  const displayBanners = positions.map((position) => {
    const banner = banners.find((b) => b.display_position === position)
    return (!banner || isExpired(banner)) ? null : banner
  }).filter(Boolean)

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
        {displayBanners.map((banner, index) => {
          const url = banner.website_url?.trim()
          const href =
            url &&
            (/^https?:\/\//i.test(url) ? url : `https://${url}`)
          const wrapClass =
            'block w-full h-full relative p-0.5'
          const img = (
            <Image
              src={banner.banner_image || '/images/meroUniLarge.gif'}
              alt={`Banner ${banner.title}`}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className='object-cover'
            />
          )
          return (
            <div
              key={index}
              className="w-full h-[44px] md:h-[58px] lg:h-[70px] rounded-lg overflow-hidden relative bg-white shadow-sm ring-1 ring-black/5"
            >
              {href ? (
                <a
                  href={href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={wrapClass}
                >
                  {img}
                </a>
              ) : (
                <div className={wrapClass}>{img}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdLayout
