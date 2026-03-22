import { getAdmissionDetail } from '../actions'
import AdmissionContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { id } = await params
    try {
        const admission = await getAdmissionDetail(id)

        if (!admission) return { title: 'Admission | MeroUni' }

        const title = admission.program?.title || 'Admission Detail'
        const description = stripHtml(admission.description || admission.eligibility_criteria || '').substring(0, 160)
        const ogImage = admission.collegeAdmissionCollege?.featured_img

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/admission/${id}`,
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
        return { title: 'Admission | MeroUni' }
    }
}

export default async function AdmissionPage({ params }) {
    const { id } = await params
    let admission = null
    try {
        admission = await getAdmissionDetail(id)
    } catch (error) {
        console.error('Error fetching admission:', error)
    }

    if (!admission) {
        notFound()
    }

    return <AdmissionContent admission={admission} />
}
