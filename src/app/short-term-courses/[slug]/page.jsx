import { fetchSkillCourseBySlug } from '../actions'
import ShortTermCourseContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { slug } = await params
    try {
        const course = await fetchSkillCourseBySlug(slug)

        if (!course) return { title: 'Skill Course | MeroUni' }

        const title = course.title
        const description = stripHtml(course.description || course.content || '').substring(0, 160)
        const ogImage = course.thumbnail_image

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/short-term-courses/${slug}`,
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
        return { title: 'Skill Course | MeroUni' }
    }
}

export default async function ShortTermCoursePage({ params }) {
    const { slug } = await params
    let course = null
    let error = null
    try {
        course = await fetchSkillCourseBySlug(slug)
    } catch (err) {
        console.error('Error fetching skill course:', err)
        error = err.message
    }

    if (!course && !error) {
        notFound()
    }

    return <ShortTermCourseContent course={course} error={error} />
}
