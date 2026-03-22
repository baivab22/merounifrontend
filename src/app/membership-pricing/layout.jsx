import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'

export const metadata = {
    title: 'Membership Pricing & Plans – Unlock Premium Resources | MeroUni',
    description: 'Choose a MeroUni membership plan to access premium study materials, notes, and exclusive educational features. Find the right plan for your academic success in Nepal.'
}

export default function MembershipPricingLayout({ children }) {
    return (
        <>
            <Header />
            <Navbar />
            {children}
            <Footer />
        </>
    )
}
