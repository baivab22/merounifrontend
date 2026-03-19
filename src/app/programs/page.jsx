import React from 'react'
import Header from '@/components/Frontpage/Header'
import Navbar from '@/components/Frontpage/Navbar'
import Footer from '@/components/Frontpage/Footer'
import Body from './components/Body'
import Featured from './components/Featured'

export const metadata = {
    title: 'All Programs - Merouni',
    description: 'Explore all available programs across various universities and educational levels in Nepal.'
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
