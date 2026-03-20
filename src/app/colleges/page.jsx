import Footer from '../../components/Frontpage/Footer'
import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
import Body from './components/Body'

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
