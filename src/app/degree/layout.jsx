import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
    title: 'Explore Academic Degrees in Nepal – BBA, BIM, BCA & More | MeroUni',
    description: 'Discover popular bachelor degrees in Nepal with program info, eligibility, and curriculum details. Compare degrees like BBA, BIM, BCA and choose the right academic path.'
}

export default function DegreeLayout({ children }) {
  return (
    <>
      <Header />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
