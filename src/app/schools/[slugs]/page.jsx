import services from '@/app/apiService'
import SchoolContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { slugs } = await params
    try {
        const data = await services.school.getBySlug(slugs)
        const school = data.item

        if (!school) return { title: 'School | MeroUni' }

        const title = school.name
        const description = stripHtml(school.description || '').substring(0, 160)
        const ogImage = school.college_logo || school.college_image

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/schools/${slugs}`,
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
        return { title: 'School | MeroUni' }
    }
}

export default async function SchoolPage({ params }) {
    const { slugs } = await params
    let school = null
    try {
        const data = await services.school.getBySlug(slugs)
        school = data.item
    } catch (error) {
        console.error('Error fetching school:', error)
    }

    if (!school) {
        notFound()
    }

    return <SchoolContent college={school} />
}
