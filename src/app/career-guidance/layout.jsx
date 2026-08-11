import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
  title: 'Career Guidance – Get Free Expert Counseling | MeroUni',
  description: 'Not sure which course to pick? Our expert counselors guide you for free. Request a call back and get the right career guidance today.'
}

export default function CareerGuidanceLayout({ children }) {
  return (
    <>
      <Header />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
