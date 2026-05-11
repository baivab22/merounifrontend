import { useEffect, useState } from 'react'

const Banner = () => {
    const [banners, setBanners] = useState([])

    useEffect(() => {
        if (typeof window === 'undefined') return

        async function fetchData() {
            try {
                const response = await fetch(
                    `${process.env.baseUrl}/banner?page=1&limit=100`,
                    {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                        cache: 'no-store'
                    }
                )

                if (response.ok) {
                    const data = await response.json()
                    setBanners(data.items || [])
                }
            } catch (err) {
                console.error('Banners fetch error', err)
            }
        }

        fetchData()
    }, [])

    const displayBanners = [1, 2, 3].map((position) =>
        banners.find((banner) => banner.display_position === position)
    )

    return (
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            {displayBanners.map((banner, index) => (
                <div
                    key={index}
                    className={`w-full sm:w-[350px] lg:w-[340px] xl:w-full rounded-md overflow-hidden shadow-md ${!banner ? 'bg-gray-100' : ''}`}
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
                                className='block h-full'
                            >
                                <img
                                    src={banner.banner_image}
                                    onError={(e) => { e.target.src = '/images/meroUniLarge.gif' }}
                                    alt={`Banner ${banner.title}`}
                                    className='w-full h-[45px] md:h-[60px] lg:h-[75px] object-cover transition-opacity hover:opacity-90'
                                />
                            </a>
                        ) : (
                            <div className='block h-full'>
                                <img
                                    src={banner.banner_image}
                                    onError={(e) => { e.target.src = '/images/meroUniLarge.gif' }}
                                    alt={`Banner ${banner.title}`}
                                    className='w-full h-[45px] md:h-[60px] lg:h-[75px] object-cover transition-opacity hover:opacity-90'
                                />
                            </div>
                        )
                    ) : (
                        <div className='w-full h-[45px] md:h-[60px] lg:h-[75px] flex items-center justify-center text-gray-400 text-[10px] font-bold uppercase tracking-widest'>
                            Contact for Ads
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
export default Banner;
