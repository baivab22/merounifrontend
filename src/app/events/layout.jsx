import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
    title: 'Education Events in Nepal – Workshops, Fairs & Updates | MeroUni',
    description: 'Discover upcoming education events in Nepal including college fairs, workshops, seminars, and student activities. Stay updated with the latest academic event listings.'
}

export default function EventsLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
