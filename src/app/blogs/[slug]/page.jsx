import services from '@/app/apiService'
import BlogContent from './Content'
import { stripHtml } from '@/lib/string.utils'

export async function generateMetadata({ params }) {
    const { slug } = await params
    try {
        const data = await services.blogs.getBySlug(slug)
        const blog = data.blog

        if (!blog) return { title: 'Blog | MeroUni' }

        const title = blog.title
        const description = blog.description || stripHtml(blog.content || '').substring(0, 160)
        const ogImage = blog.featured_image

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/blogs/${slug}`,
                images: ogImage ? [{ url: ogImage }] : [],
                type: 'article',
                siteName: 'MeroUni'
            },
            twitter: {
                card: 'summary_large_image',
                title: title,
                description: description,
                images: ogImage ? [ogImage] : [],
            }
        }
    } catch (error) {
        return { title: 'Blog | MeroUni' }
    }
}

export default async function BlogPage({ params }) {
    const { slug } = await params
    let blog = null
    try {
        const data = await services.blogs.getBySlug(slug)
        blog = data.blog
    } catch (error) {
        console.error('Error fetching blog:', error)
    }

    return <BlogContent initialBlog={blog} slug={slug} />
}
