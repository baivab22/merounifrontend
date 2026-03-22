import { getExamBySlug } from '../actions'
import { notFound } from 'next/navigation'
import ExamDetailContent from './Content'

export async function generateMetadata({ params }) {
  const { slugs } = await params
  try {
    const exam = await getExamBySlug(slugs)
    if (!exam) return { title: 'Exam | MeroUni' }
    return {
      title: `${exam.title} | MeroUni`,
      description: exam.description
        ? exam.description.replace(/<[^>]+>/g, '').substring(0, 160)
        : `Details for ${exam.title}`,
      openGraph: {
        title: exam.title,
        description: exam.description
          ? exam.description.replace(/<[^>]+>/g, '').substring(0, 160)
          : '',
        url: `https://merouni.com/exams/${slugs}`,
        type: 'article',
        siteName: 'MeroUni',
      },
    }
  } catch {
    return { title: 'Exam | MeroUni' }
  }
}

export default async function ExamDetailPage({ params }) {
  const { slugs } = await params
  const exam = await getExamBySlug(slugs)

  if (!exam) {
    notFound()
  }

  return <ExamDetailContent exam={exam} />
}
