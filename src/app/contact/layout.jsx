import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
    title: 'Contact MeroUni – Get in Touch for Support & Inquiries',
    description: 'Have questions or need assistance? Contact the MeroUni team for support, academic inquiries, partnership opportunities, or feedback. We’re here to help you.'
}

export default function ContactLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
