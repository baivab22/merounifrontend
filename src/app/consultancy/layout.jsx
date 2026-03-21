import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
    title: 'Educational Consultancy in Nepal – Expert Study & Career Guidance | MeroUni',
    description: 'Get trusted educational consultancy services in Nepal for admissions, career planning, study abroad support, and university applications. Expert guidance for students at every step.'
}

export default function ConsultancyLayout({ children }) {
  return (
    <>
      <Header />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
