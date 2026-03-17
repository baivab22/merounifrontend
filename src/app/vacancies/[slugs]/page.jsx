import Footer from '../../../components/Frontpage/Footer'
import Header from '../../../components/Frontpage/Header'
import Navbar from '../../../components/Frontpage/Navbar'
import ShowVacancyContent from './components/ShowVacancyContent'

const ShowVacancy = ({ params }) => {
  return (
    <>
      <Header />
      <Navbar />
      <ShowVacancyContent params={params} />
      <Footer />
    </>
  )
}
export default ShowVacancy
