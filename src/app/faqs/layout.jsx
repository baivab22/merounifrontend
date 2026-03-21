import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'

export const metadata = {
    title: 'Frequently Asked Questions – MeroUni Help & Support',
    description: 'Find answers to common questions about MeroUni, including how to search for colleges, accessing study materials, and more. Get the help you need quickly.'
}

export default function FAQsLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
