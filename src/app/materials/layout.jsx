import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
    title: 'Study Materials & Resources in Nepal – Syllabus, Notes & Guides | MeroUni',
    description: 'Explore free study materials, syllabus outlines, notes, and educational resources for students in Nepal. Prepare better with organized guides and academic content.'
}

export default function MaterialsLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
