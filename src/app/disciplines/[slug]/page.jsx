import { getDisciplineBySlug } from '../../degree/actions'
import DisciplineContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { slug } = await params
    try {
        const discipline = await getDisciplineBySlug(slug)
        if (!discipline) return { title: 'Discipline | MeroUni' }

        const title = discipline.title
        const description = stripHtml(discipline.description || '').substring(0, 160)
        const ogImage = discipline.featured_image

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/disciplines/${slug}`,
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
        return { title: 'Discipline | MeroUni' }
    }
}

export default async function DisciplinePage({ params }) {
    const { slug } = await params
    let discipline = null
    let degrees = []
    let error = null
    try {
        discipline = await getDisciplineBySlug(slug)
        degrees = discipline?.degrees || []
    } catch (err) {
        console.error('Error fetching discipline:', err)
        error = err.message
    }

    if (!discipline && !error) {
        notFound()
    }

    return <DisciplineContent discipline={discipline} degrees={degrees} error={error} />
}
