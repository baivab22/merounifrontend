import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
    title: 'Scholarships in Nepal – Find & Apply for Funding Opportunities | MeroUni',
    description: 'Explore scholarships available for Nepali students with deadlines, eligibility details, award amounts, and application info. Discover funding to support your education journey.'
}

export default function ScholarshipLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
