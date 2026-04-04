import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import PainPoints from '../components/PainPoints';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import Webinars from '../components/Webinars';
import Offer from '../components/Offer';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
  const { i18n } = useTranslation();



  return (
    <>
      <Hero />
      <PainPoints />
      <HowItWorks />
      <FAQ />
      <Webinars />
      <Offer />
    </>
  );
};

export default LandingPage;
