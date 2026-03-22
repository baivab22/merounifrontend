import SingleSubject from './SingleSubject'
import { getCourseBySlug } from '../../actions'
import { stripHtml } from '@/lib/string.utils'

export async function generateMetadata({ params }) {
    const { slugs } = await params
    try {
        const course = await getCourseBySlug(slugs)
        if (!course) return { title: 'Degree Subject | MeroUni' }

        const title = `${course.title} (${course.code || ''}) | MeroUni`
        const description = stripHtml(course.description || '').substring(0, 160)

        return {
            title: title,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/degree/single-subject/${slugs}`,
                type: 'website',
                siteName: 'MeroUni'
            },
            twitter: {
                card: 'summary',
                title: title,
                description: description,
            }
        }
    } catch (error) {
        return { title: 'Degree Subject | MeroUni' }
    }
}

export default async function Page({ params }) {
  const unwrappedParams = await params
  const slug = unwrappedParams.slugs

  return <SingleSubject slug={slug} />
}
