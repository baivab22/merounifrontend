import Footer from '../../components/Frontpage/Footer'
import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Body from './components/Body'

export const metadata = {
  title: 'Find Colleges in Nepal – Explore & Compare Top Institutions',
  description: 'Discover and compare colleges across Nepal with verified information on courses, admissions, fees, and programs. Find the right college for your career path and make confident academic decisions.'
}

const Page = () => {
  return (
    <>
      <Header />
      <Navbar />
      {/* <Featured /> */}
      <Body />
      <Footer />
    </>
  )
}

export default Page
