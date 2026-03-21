import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'
import Header from '../../components/Frontpage/Header'
import VacanciesContent from './components/VacanciesContent'

export const metadata = {
  title: 'Job Vacancies & Career Opportunities in Nepal – MeroUni Careers',
  description: 'Discover current job openings and career opportunities at MeroUni and in the education sector in Nepal. Browse vacancies, apply now, and grow your professional journey.'
}

export default function VacanciesPage() {
  return (
    <>
      <Header />
      <Navbar />
      <VacanciesContent />
      <Footer />
    </>
  )
}
