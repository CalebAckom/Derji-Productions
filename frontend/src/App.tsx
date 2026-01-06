import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navigation } from './components/navigation'
import DesignSystemDemo from './components/demo/DesignSystemDemo'
import {
  HomePage,
  AboutPage,
  ServicesPage,
  PortfolioPage,
  BookPage,
  ContactPage,
  LocationPage
} from './pages'

const year = new Date().getFullYear();

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navigation />
        
        <main className="container mx-auto py-8 px-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/photography" element={<ServicesPage />} />
            <Route path="/services/videography" element={<ServicesPage />} />
            <Route path="/services/sound" element={<ServicesPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/location" element={<LocationPage />} />
            <Route path="/design-system" element={<DesignSystemDemo />} />
          </Routes>
        </main>
        
        <footer className="bg-secondary-100 text-secondary-700 p-4 mt-16">
          <div className="container mx-auto text-center">
            <p>&copy; {year} Derji Productions. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <a 
                href="/design-system" 
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                View Design System
              </a>
              <span className="text-secondary-400">|</span>
              <a 
                href="/contact" 
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App