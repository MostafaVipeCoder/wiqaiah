import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PainPoints from './components/PainPoints'
import HowItWorks from './components/HowItWorks'
import FAQ from './components/FAQ'
import Webinars from './components/Webinars'
import Offer from './components/Offer'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <PainPoints />
        <HowItWorks />
        <FAQ />
        <Webinars />
        <Offer />
      </main>
      <Footer />
    </div>
  )
}

export default App
