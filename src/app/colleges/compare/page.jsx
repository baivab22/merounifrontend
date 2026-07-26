import { getCollegesBySlugs } from '../actions'
import CompareContent from './Content'
import { stripHtml } from '@/lib/string.utils'

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams
  const slugs = (sp?.slugs || '').split(',').filter(Boolean)

  if (slugs.length < 2) {
    return {
      title: 'Compare Colleges | MeroUni',
      description: 'Compare multiple colleges side by side on MeroUni. Find the best college for your education.'
    }
  }

  let colleges = []
  try {
    colleges = await getCollegesBySlugs(slugs)
  } catch {}

  const names = colleges.map((c) => c.name).join(' vs ')
  const description = `Compare ${names} side by side on MeroUni. Programs, facilities, fees, and more.`

  return {
    title: `Compare ${slugs.length} Colleges | MeroUni`,
    description: description.substring(0, 160),
    openGraph: {
      title: `Compare ${names}`,
      description: description.substring(0, 160),
      url: `https://merouni.com/colleges/compare?slugs=${slugs.join(',')}`,
      type: 'website',
      siteName: 'MeroUni'
    }
  }
}

export default async function ComparePage({ searchParams }) {
  const sp = await searchParams
  const slugString = sp?.slugs || ''
  const slugs = slugString.split(',').filter(Boolean)

  let colleges = []
  if (slugs.length > 0) {
    try {
      colleges = await getCollegesBySlugs(slugs)
    } catch (error) {
      console.error('Error fetching colleges for comparison:', error)
    }
  }

  const programSlug = sp?.program || ''

  return <CompareContent initialColleges={colleges} initialSlugs={slugs} programSlug={programSlug} />
}
