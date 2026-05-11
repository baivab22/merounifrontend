import { getCollegeBySlug } from '../actions'
import CollegeContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { slug } = await params
    try {
        const college = await getCollegeBySlug(slug)

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
                url: `https://merouni.com/colleges/${slug}`,
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

/** Safe slug for /college-rankings/[slug] return link (query param). */
function parseRankingDegreeSlug(qs) {
    const raw = qs?.degreeSlug
    const s =
        typeof raw === 'string'
            ? raw.trim()
            : Array.isArray(raw) && raw[0]
              ? String(raw[0]).trim()
              : ''
    if (!s || /[/\\?#]/.test(s)) return null
    try {
        return decodeURIComponent(s)
    } catch {
        return s
    }
}

export default async function CollegePage({ params, searchParams }) {
    const { slug } = await params
    const qs = await Promise.resolve(searchParams ?? {})
    const fromCollegeRankings = qs.from === 'college-rankings'
    const collegeRankingDegreeSlug =
        qs.from === 'college-ranking-detail'
            ? parseRankingDegreeSlug(qs)
            : null

    let college = null
    try {
        college = await getCollegeBySlug(slug)
    } catch (error) {
        console.error('Error fetching college:', error)
    }

    if (!college) {
        notFound()
    }

    return (
        <CollegeContent
            college={college}
            fromCollegeRankings={fromCollegeRankings}
            collegeRankingDegreeSlug={collegeRankingDegreeSlug}
        />
    )
}
