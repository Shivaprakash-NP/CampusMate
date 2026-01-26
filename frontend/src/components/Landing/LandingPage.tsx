import React from 'react'
import { WavyBackground } from '../ui/wavy-background'
import HowItWorks from './HowItWorks'
import GetStarted from './GetStarted'
const LandingPage = () => {
  return (
    <>
        <WavyBackground className="max-w-4xl mx-auto pb-40 min-h-screen">
            <div className='pt-80'>
              <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var text-center">
                Campus Mate
              </p>
              <p className="text-base md:text-lg mt-4 text-white font-normal inter-var text-center">
                A dedicated space for your academic journey.
              </p>
              </div>
        </WavyBackground>
        <HowItWorks/>
        <GetStarted/>
    </>
  )
}

export default LandingPage