import { getCollegeBySlug } from '../actions'
import CollegeContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { slugs } = await params
    try {
        const college = await getCollegeBySlug(slugs)

        if (!college) return { title: 'College | MeroUni' }

        const title = college.name
        const description = stripHtml(college.description || '').substring(0, 160)
        const ogImage = college.featured_img

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/colleges/${slugs}`,
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
        return { title: 'College | MeroUni' }
    }
}

export default async function CollegePage({ params }) {
    const { slugs } = await params
    let college = null
    try {
        college = await getCollegeBySlug(slugs)
    } catch (error) {
        console.error('Error fetching college:', error)
    }

    if (!college) {
        notFound()
    }

    return <CollegeContent college={college} />
}
