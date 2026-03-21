

import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'
import Header from '../../components/Frontpage/Header'
import Body from './components/Body'

export const metadata = {
  title: 'Find Schools in Nepal – Search & Compare Schools | MeroUni',
  description: 'Explore verified schools across Nepal with details on programs, locations, admissions, and more. Search and compare top schools to make informed choices for your child’s education.'
}

const page = () => {
  return (
    <>
      <Header />
      <Navbar />
      <Body />
      <Footer />
    </>
  )
}

export default page
