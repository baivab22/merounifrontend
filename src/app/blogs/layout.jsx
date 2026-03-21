import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
    title: 'Education Blog Nepal – College, Career & Study Tips | MeroUni',
    description: 'Read expert articles and guides on education, career planning, admissions, exam tips, scholarships, and student life in Nepal. Stay informed with MeroUni blogs.'
}

export default function BlogsLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
