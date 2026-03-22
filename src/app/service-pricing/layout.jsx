import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'

export const metadata = {
    title: 'Service Pricing & Advertising – Professional Solutions | MeroUni',
    description: 'Explore MeroUni’s service pricing and advertising options for institutions. Discover professional solutions to reach more students and promote your brand in Nepal.'
}

export default function ServicePricingLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
