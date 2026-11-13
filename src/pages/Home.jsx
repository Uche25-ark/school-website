import HeroCarousel from '../components/Home/HeroCarousel.jsx'
import IntroSection from '../components/Home/IntroSection.jsx'
import Featuretiles from '../components/Home/Featuretiles.jsx'
import StatsBand from '../components/Home/StatsBand.jsx'
import SchoolLife from '../components/Home/SchoolLife.jsx'
import MediaGallery from '../components/Home/MediaGallery.jsx'
import ParentTestimonials from '../components/Home/ParentTestimonials.jsx'

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <IntroSection />
      <Featuretiles />
      <StatsBand />
      <SchoolLife />
      <MediaGallery />
      <ParentTestimonials />
    </>
  )
}