import Link from 'next/link'
import RelatedCard from './RelatedCard'
import { formatDate } from '@/utils/date.util'

const SmallCardList = ({ blogs }) => {
  const truncateString = (str, maxLength) => {
    if (str.length > maxLength) {
      return str.slice(0, maxLength) + '...'
    }
    return str
  }


  return (
    <div className='pb-20'>
      {
        blogs.length > 0 && (
          <>
            <div className='flex flex-col items-center mb-12'>
              <h2 className='text-3xl md:text-4xl font-black text-gray-900 mb-4 text-center'>Related Blogs</h2>
              <div className='w-24 h-1.5 bg-blue-600 rounded-full'></div>
            </div>
          </>
        )
      }
      <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
        {blogs.map((blog) => (
          <Link href={`/blogs/${blog.slug}`} key={blog.id} className='group'>
            <RelatedCard
              image={blog.featured_image || 'https://placehold.co/600x400'}
              date={formatDate(blog.createdAt)}
              description={truncateString(blog.description, 100)}
              title={truncateString(blog.title, 60)}
              key={blog.id}
              slug={blog.slug}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
export default SmallCardList
