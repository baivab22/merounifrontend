import { getDegreeBySlug } from '../actions'
import DegreeContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { slugify } from '@/lib/slugify'
import { notFound } from 'next/navigation'
import Footer from '../../../components/Frontpage/Footer'
import Header from '../../../components/Frontpage/Header'
import Navbar from '../../../components/Frontpage/Navbar'

export async function generateMetadata({ params }) {
    const { slugs } = await params
    try {
        const decodedSlug = decodeURIComponent(slugs)
        const finalSlug = slugify(decodedSlug)
        const degree = await getDegreeBySlug(finalSlug)

        if (!degree) return { title: 'Degree | MeroUni' }

        const title = degree.title
        const description = stripHtml(degree.description || degree.content || '').substring(0, 160)
        const ogImage = degree.cover_image || degree.featured_image

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/degree/${slugs}`,
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
        return { title: 'Degree | MeroUni' }
    }
}

export default async function DegreePage({ params }) {
    const { slugs } = await params
    let degree = null
    let error = null
    try {
        const decodedSlug = decodeURIComponent(slugs)
        const finalSlug = slugify(decodedSlug)
        degree = await getDegreeBySlug(finalSlug)
    } catch (err) {
        console.error('Error fetching degree:', err)
        error = err.message
    }

    if (!degree && !error) {
        notFound()
    }

    return (
        <div>
            <DegreeContent degree={degree} error={error} slugs={slugs} />
        </div>
    )
}
