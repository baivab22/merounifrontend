import Header from '../../components/Frontpage/Header'
import Footer from '../../components/Frontpage/Footer'
import Navbar from '@/components/Frontpage/Navbar'

export const metadata = {
    title: 'Watch Education Videos in Nepal – Learn & Explore | MeroUni',
    description: 'Watch educational videos on colleges, courses, careers, and student guidance in Nepal. Learn visually and make informed academic decisions with MeroUni.'
}

const WatchLayout = ({ children }) => {
    return (
        <>
            <Header />
            <Navbar/>
            <div className='min-h-screen bg-gray-50'>{children}</div>
            <Footer />
        </>
    )
}

export default WatchLayout
