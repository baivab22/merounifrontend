import { getScholarshipBySlug } from '../actions'
import ScholarshipContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { slug } = await params
    try {
        const scholarship = await getScholarshipBySlug(slug)

        if (!scholarship) return { title: 'Scholarship | MeroUni' }

        const title = scholarship.name
        const description = stripHtml(scholarship.description || '').substring(0, 160)
        // Scholarship might not have a direct image in the same field as others
        const ogImage = scholarship.image || null 

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/scholarship/${slug}`,
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
        return { title: 'Scholarship | MeroUni' }
    }
}

export default async function ScholarshipPage({ params }) {
    const { slug } = await params
    let scholarship = null
    let error = null
    try {
        scholarship = await getScholarshipBySlug(slug)
    } catch (err) {
        console.error('Error fetching scholarship:', err)
        error = err.message
    }

    if (!scholarship && !error) {
        notFound()
    }

    return <ScholarshipContent scholarship={scholarship} error={error} />
}
