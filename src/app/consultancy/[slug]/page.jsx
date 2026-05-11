import { getConsultancyBySlug } from '../actions'
import ConsultancyContent from './Content'
import { stripHtml } from '@/lib/string.utils'

export async function generateMetadata({ params }) {
    const { slug } = await params
    try {
        const consultancy = await getConsultancyBySlug(slug)

        if (!consultancy) return { title: 'Consultancy | MeroUni' }

        const title = consultancy.title || consultancy.name
        const description = stripHtml(consultancy.description || '').substring(0, 160)
        const ogImage = consultancy.logo || consultancy.image

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/consultancy/${slug}`,
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
        return { title: 'Consultancy | MeroUni' }
    }
}

export default async function ConsultancyPage({ params }) {
    const { slug } = await params
    let consultancy = null
    try {
        consultancy = await getConsultancyBySlug(slug)
    } catch (error) {
        console.error('Error fetching consultancy:', error)
    }

    return <ConsultancyContent consultancy={consultancy} />
}
