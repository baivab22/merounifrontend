import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'

export const metadata = {
    title: 'About MeroUni – Nepal’s Leading Education & Academic Platform',
    description: 'Learn about MeroUni’s mission to empower students in Nepal with verified information, resources, and guidance. Discover our story and how we help shape futures.'
}

export default function AboutUsLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
