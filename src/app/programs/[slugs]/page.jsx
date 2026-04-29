import { getProgramBySlug } from '../actions'
import ProgramContent from './Content'
import { stripHtml } from '@/lib/string.utils'
import { slugify } from '@/lib/slugify'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const { slugs } = await params
  try {
    const decodedSlug = decodeURIComponent(slugs)
    const finalSlug = slugify(decodedSlug)
    const program = await getProgramBySlug(finalSlug)

    if (!program) return { title: 'Program | MeroUni' }

    const title = program.title
    const description = stripHtml(
      program.curriculum || program.learning_outcomes || ''
    ).substring(0, 160)
    // Program level/degree info as backup
    const ogImage = null

    return {
      title: `${title} | MeroUni`,
      description: description,
      openGraph: {
        title: title,
        description: description,
        url: `https://merouni.com/programs/${slugs}`,
        images: ogImage ? [{ url: ogImage }] : [],
        type: 'website',
        siteName: 'MeroUni'
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,

        images: ogImage ? [ogImage] : []
      }
    }
  } catch (error) {
    return { title: 'Program | MeroUni' }
  }
}

export default async function ProgramPage({ params }) {
  const { slugs } = await params
  let program = null
  let error = null
  try {
    const decodedSlug = decodeURIComponent(slugs)
    const finalSlug = slugify(decodedSlug)
    program = await getProgramBySlug(finalSlug)
  } catch (err) {
    console.error('Error fetching program:', err)
    error = err.message
  }

  if (!program && !error) {
    notFound()
  }

  if (program && program.universities && program.universities.length > 0) {
    const universitySlug =
      program.universities[0].slugs || program.universities[0].slug
    if (universitySlug) {
      const { redirect } = await import('next/navigation')
      redirect(`/${universitySlug}/programs/${slugs}`)
    }
  }

  return <ProgramContent program={program} error={error} />
}
