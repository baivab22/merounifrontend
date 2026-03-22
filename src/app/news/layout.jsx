import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
    title: 'Education News in Nepal – Updates, Notices & Alerts | MeroUni',
    description: 'Stay updated with the latest education news in Nepal, including admissions, exams, scholarships, and notices. Get timely updates for students and academic planning.'
}

export default function NewsLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
