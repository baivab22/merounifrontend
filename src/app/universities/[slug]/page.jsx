import { getUniversityBySlug } from '../actions'
import UniversityContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { slug } = await params
    try {
        const universityData = await getUniversityBySlug(slug)

        if (!universityData) return { title: 'University | MeroUni' }

        const title = universityData.fullname || universityData.name
        const description = stripHtml(universityData.description || '').substring(0, 160)
        const ogImage = universityData.logo || universityData.image

        return {
            title: `${title}`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/universities/${slug}`,
                images: ogImage ? [{ url: ogImage }] : [],
                type: 'website',
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
        return { title: 'University | MeroUni' }
    }
}

export default async function UniversityPage({ params }) {
    const { slug } = await params
    let university = null
    try {
        university = await getUniversityBySlug(slug)
    } catch (error) {
        console.error('Error fetching university:', error)
    }

    if (!university) {
        notFound()
    }

    return <UniversityContent university={university} />
}
