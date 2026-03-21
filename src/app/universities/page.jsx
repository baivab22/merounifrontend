import React from 'react'
// import AdLayout from '../../components/Frontpage/AdLayout'
import Footer from '../../components/Frontpage/Footer'
import Header from '../../components/Frontpage/Header'
import Navbar from '../../components/Frontpage/Navbar'
// import Featured from './components/Featured'
import Body from './components/Body'

export const metadata = {
  title: 'Search & Compare Universities in Nepal – MeroUni',
  description: 'Explore a wide range of programs and courses offered by universities in Nepal. Compare fees, admission criteria, and campus facilities to find your perfect fit.'
}

const UniversityPage = () => {
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

export default UniversityPage
