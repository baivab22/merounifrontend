import React from 'react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import Body from './components/Body'
import Featured from './components/Featured'

export const metadata = {
    title: 'Explore Courses in Nepal – Search & Compare Programs | MeroUni',
    description: 'Discover a wide range of course programs in Nepal with details on subjects, eligibility, fees, and college options. Find the right academic pathway for your future at MeroUni.'
}

const ProgramsPage = () => {
    return (
        <>
            <Header />
            <Navbar />
            <Featured />
            <Body />
            <Footer />
        </>
    )
}

export default ProgramsPage
