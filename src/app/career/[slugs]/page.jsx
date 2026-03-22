import { getCareer } from '../actions'
import CareerContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { slugs } = await params
    try {
        const careerData = await getCareer(slugs)
        const career = careerData.item

        if (!career) return { title: 'Career | MeroUni' }

        const title = career.title
        const description = stripHtml(career.description || '').substring(0, 160)
        const ogImage = career.featuredImage

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/career/${slugs}`,
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
        return { title: 'Career | MeroUni' }
    }
}

export default async function CareerPage({ params }) {
    const { slugs } = await params
    let career = null
    try {
        const data = await getCareer(slugs)
        career = data.item
    } catch (error) {
        console.error('Error fetching career:', error)
    }

    if (!career) {
        notFound()
    }

    return <CareerContent data={career} />
}
