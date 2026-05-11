import { getExamBySlug } from '../actions'
import { notFound } from 'next/navigation'
import ExamDetailContent from './Content'

export async function generateMetadata({ params }) {
  const { slug } = await params
  try {
    const exam = await getExamBySlug(slug)
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
        url: `https://merouni.com/exams/${slug}`,
        type: 'article',
        siteName: 'MeroUni',
      },
    }
  } catch {
    return { title: 'Exam | MeroUni' }
  }
}

export default async function ExamDetailPage({ params }) {
  const { slug } = await params
  const exam = await getExamBySlug(slug)

  if (!exam) {
    notFound()
  }

  return <ExamDetailContent exam={exam} />
}
