import services from '@/app/apiService'
import EventContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { slug } = await params
    try {
        const data = await services.event.getBySlug(slug)
        const event = data.item

        if (!event) return { title: 'Event | MeroUni' }

        const title = event.title
        const description = stripHtml(event.description || '').substring(0, 160)
        const ogImage = event.image

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/events/${slug}`,
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
        return { title: 'Event | MeroUni' }
    }
}

export default async function EventPage({ params }) {
    const { slug } = await params
    let event = null
    let relatedEvents = []
    try {
        const [eventData, allEventsData] = await Promise.all([
            services.event.getBySlug(slug),
            services.event.getAll()
        ])
        event = eventData.item
        relatedEvents = allEventsData.items || []
    } catch (error) {
        console.error('Error fetching event:', error)
    }

    if (!event) {
        notFound()
    }

    return <EventContent event={event} relatedEvents={relatedEvents} />
}
