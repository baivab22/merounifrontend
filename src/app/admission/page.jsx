import React from 'react'
import Navbar from '../../components/Frontpage/Navbar'
import Footer from '../../components/Frontpage/Footer'
import Header from '../../components/Frontpage/Header'
import Body from './components/Body'

export const metadata = {
  title: 'College & University Admission in Nepal – Guide & Updates | MeroUni',
  description: 'Get complete admission info for colleges and universities in Nepal, including deadlines, requirements, and application tips. Find your pathway to higher education.'
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
