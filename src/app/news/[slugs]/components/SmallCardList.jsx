import Link from 'next/link'
import RelatedCard from './RelatedCard'
import { formatDate } from '@/utils/date.util'
import { stripHtml } from '@/lib/string.utils'

const SmallCardList = ({ news = [] }) => {
    const truncateString = (str, maxLength) => {
        if (!str) return ''
        const cleanedStr = stripHtml(str)
        if (cleanedStr.length > maxLength) {
            return cleanedStr.slice(0, maxLength) + '...'
        }
        return cleanedStr
    }

    return (
        <div className='pb-20'>
            {
                news.length > 0 && (
                    <div className='flex flex-col items-center mb-12'>
                        <h2 className='text-3xl md:text-4xl font-black text-gray-900 mb-4 text-center'>Related News</h2>
                        <div className='w-24 h-1.5 bg-[#387cae] rounded-full'></div>
                    </div>
                )
            }
            <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
                {news.map((item) => (
                    <Link href={`/news/${item.slug || item.slugs}`} key={item.id} className='group'>
                        <RelatedCard
                            image={item.image || item.featured_image || item.featuredImage || 'https://placehold.co/600x400'}
                            date={formatDate(item.createdAt || item.published_at)}
                            description={truncateString(item.description, 100)}
                            title={truncateString(item.title, 60)}
                            slug={item.slug || item.slugs}
                        />
                    </Link>
                ))}
            </div>
        </div>
    )
}
export default SmallCardList
