import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Academics from './pages/Academics.jsx'
import Admissions from './pages/Admissions.jsx'
import Gallery from './pages/Gallery.jsx'
import News from './pages/News.jsx'
import Events from './pages/Events.jsx'
import StaffDirectory from './pages/StaffDirectory.jsx'
import Employment from './pages/Employment.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'
import Portal from './pages/Portal.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="portal" element={<Portal />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="academics" element={<Academics />} />
        <Route path="admissions" element={<Admissions />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="news" element={<News />} />
        <Route path="events" element={<Events />} />
        <Route path="staff" element={<StaffDirectory />} />
        <Route path="employment" element={<Employment />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
