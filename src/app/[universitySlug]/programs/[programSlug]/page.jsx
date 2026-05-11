import { getProgramBySlug } from '../../../programs/actions'
import { getUniversityBySlug } from '../../../universities/actions'
import ProgramContent from '../../../programs/[slug]/Content'
import { stripHtml } from '@/lib/string.utils'
import { slugify } from '@/lib/slugify'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { universitySlug, programSlug } = await params
    try {
        const decodedProgramSlug = decodeURIComponent(programSlug)
        const finalProgramSlug = slugify(decodedProgramSlug)
        
        // Fetch both to ensure the URL context is valid
        const [university, program] = await Promise.all([
            getUniversityBySlug(universitySlug),
            getProgramBySlug(finalProgramSlug)
        ])

        if (!university || !program) return { title: 'Program | MeroUni' }

        const title = program.title
        const description = stripHtml(program.curriculum || program.learning_outcomes || '').substring(0, 160)
        const ogImage = null 

        return {
            title: `${title} | ${university.fullname || university.name} | MeroUni`,
            description: description,
            openGraph: {
                title: `${title} - ${university.fullname || university.name}`,
                description: description,
                url: `https://merouni.com/${universitySlug}/programs/${programSlug}`,
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
        return { title: 'Program | MeroUni' }
    }
}

export default async function ProgramByUniversityPage({ params }) {
    const { universitySlug, programSlug } = await params
    let program = null
    let university = null
    let error = null
    
    try {
        const decodedProgramSlug = decodeURIComponent(programSlug)
        const finalProgramSlug = slugify(decodedProgramSlug)
        
        const [uniData, progData] = await Promise.all([
            getUniversityBySlug(universitySlug),
            getProgramBySlug(finalProgramSlug)
        ])
        
        university = uniData
        program = progData
    } catch (err) {
        console.error('Error fetching university/program:', err)
        error = err.message
    }

    if ((!program || !university) && !error) {
        notFound()
    }

    // We can pass university context to ProgramContent if we want to filter associated colleges
    // For now, we'll just render it as is.
    return <ProgramContent program={program} error={error} university={university} />
}
