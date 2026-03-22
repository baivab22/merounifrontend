import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
    title: 'Education Exams in Nepal – Schedules, Routines & Dates | MeroUni',
    description: 'Find upcoming education exams in Nepal with complete schedules, routines, dates, and details. Search and stay updated on board and entrance exams with MeroUni.'
}

export default function ExamsLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
