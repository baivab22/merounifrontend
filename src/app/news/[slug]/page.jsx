import services from '@/app/apiService'
import NewsContent from './Content'
import { stripHtml } from '@/lib/string.utils'

export async function generateMetadata({ params }) {
    const { slug } = await params
    try {
        const data = await services.news.getBySlug(slug)
        const news = data.news || data.item

        if (!news) return { title: 'News | MeroUni' }

        const title = news.title
        const description = stripHtml(news.description || news.content || '').substring(0, 160)
        const ogImage = news.featured_image

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/news/${slug}`,
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
        return { title: 'News | MeroUni' }
    }
}

export default async function NewsPage({ params }) {
    const { slug } = await params
    let news = null
    let similarNews = []
    try {
        const data = await services.news.getBySlug(slug)
        news = data.news || data.item
        similarNews = data.similarNews || data.related || []
    } catch (error) {
        console.error('Error fetching news:', error)
    }

    return <NewsContent initialNews={news} initialSimilarNews={similarNews} slug={slug} />
}
