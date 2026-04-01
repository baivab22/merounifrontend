import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'

export const metadata = {
  title: 'Explore Academic Disciplines in Nepal – Arts, Science, Management & More | MeroUni',
  description: 'Discover academic disciplines available in Nepal. Explore fields like Management, Science, Arts, Engineering and more. Find degrees and programs by discipline on MeroUni.'
}

export default function DisciplinesLayout({ children }) {
  return (
    <>
      <Header />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
