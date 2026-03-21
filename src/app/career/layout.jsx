import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
    title: 'Career Guidance in Nepal – Explore Career Paths | MeroUni',
    description: 'Explore career options in Nepal with expert guidance, tips, and insights. Discover the right career path based on your interests, skills, and future goals.'
}

export default function CareerLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
