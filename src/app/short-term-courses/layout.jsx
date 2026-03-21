import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'

export const metadata = {
    title: 'Short-term Courses in Nepal – Skills & Professional Training | MeroUni',
    description: 'Find short-term vocational and professional courses in Nepal to enhance your skills. Explore training programs, certifications, and skill-based learning opportunities.'
}

export default function ShortTermCoursesLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
