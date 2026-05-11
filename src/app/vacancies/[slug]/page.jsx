import services from '@/app/apiService'
import { getVacancy } from '../actions'
import Footer from '../../../components/Frontpage/Footer'
import Header from '../../../components/Frontpage/Header'
import Navbar from '../../../components/Frontpage/Navbar'
import ShowVacancyContent from './components/ShowVacancyContent'
import { stripHtml } from '@/lib/string.utils'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
    const { slug } = await params
    try {
        const data = await getVacancy(slug)
        const vacancy = data.item

        if (!vacancy) return { title: 'Vacancy | MeroUni' }

        const title = vacancy.title
        
        const description = stripHtml(vacancy.description || '').substring(0, 160)
        const ogImage = vacancy.image

        return {
            title: `${title} | MeroUni`,
            description: description,
            openGraph: {
                title: title,
                description: description,
                url: `https://merouni.com/vacancies/${slug}`,
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
        return { title: 'Vacancy | MeroUni' }
    }
}

const ShowVacancy = async ({ params }) => {
    const { slug } = await params
    let vacancy = null
    try {
        const data = await getVacancy(slug)
        vacancy = data.item
    } catch (error) {
        console.error('Error fetching vacancy:', error)
    }

    if (!vacancy) {
        notFound()
    }

    return (
        <>
            <Header />
            <Navbar />
            <ShowVacancyContent initialData={vacancy} slug={slug} />
            <Footer />
        </>
    )
}
export default ShowVacancy
