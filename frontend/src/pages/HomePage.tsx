import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody } from '../components/ui';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section id="home" className="text-center py-16 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
        <div className="relative z-10">
          <h1 className="heading-hero text-secondary-900 mb-6">
            Welcome to Derji Productions
          </h1>
          <p className="body-large text-secondary-600 mb-8 max-w-2xl mx-auto">
            Professional photography, videography, and sound production services that capture your vision with artistic excellence and technical precision.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/portfolio">
              <Button variant="golden" size="lg">View Portfolio</Button>
            </Link>
            <Link to="/book">
              <Button variant="outline" size="lg">Book Consultation</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section id="services" className="py-16">
        <div className="text-center mb-12">
          <h2 className="heading-section text-secondary-900 mb-4">Our Services</h2>
          <p className="body-large text-secondary-600 max-w-2xl mx-auto">
            Comprehensive media production services tailored to your unique needs and vision.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="hover" className="group">
            <CardBody className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="heading-card text-primary-600 mb-4">Photography</h3>
              <p className="body-normal text-secondary-600 mb-6">
                Capturing your precious moments with artistic excellence across weddings, corporate events, portraits, and more.
              </p>
              <Link to="/services/photography">
                <Button variant="outline" size="sm">Learn More</Button>
              </Link>
            </CardBody>
          </Card>

          <Card variant="hover" className="group">
            <CardBody className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="heading-card text-primary-600 mb-4">Videography</h3>
              <p className="body-normal text-secondary-600 mb-6">
                Professional video production and post-production services including livestreaming, documentaries, and promotional content.
              </p>
              <Link to="/services/videography">
                <Button variant="outline" size="sm">Learn More</Button>
              </Link>
            </CardBody>
          </Card>

          <Card variant="hover" className="group">
            <CardBody className="text-center p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="heading-card text-primary-600 mb-4">Sound Production</h3>
              <p className="body-normal text-secondary-600 mb-6">
                High-quality audio recording, sound engineering, and post-production for podcasts, events, and multimedia projects.
              </p>
              <Link to="/services/sound">
                <Button variant="outline" size="sm">Learn More</Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Featured Portfolio */}
      <section id="portfolio" className="py-16 bg-secondary-50 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="heading-section text-secondary-900 mb-4">Featured Work</h2>
          <p className="body-large text-secondary-600 max-w-2xl mx-auto">
            Explore our latest projects and see the quality and creativity we bring to every production.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Placeholder portfolio items */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="aspect-square bg-gradient-to-br from-secondary-200 to-primary-100 rounded-lg overflow-hidden group cursor-pointer">
              <div className="w-full h-full flex items-center justify-center bg-secondary-300/50 group-hover:bg-secondary-300/30 transition-colors">
                <span className="text-secondary-600 font-medium">Portfolio Item {item}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Link to="/portfolio">
            <Button variant="golden">View Full Portfolio</Button>
          </Link>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="py-16 text-center bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-circuit-pattern opacity-20"></div>
        <div className="relative z-10">
          <h2 className="heading-section mb-4">Ready to Start Your Project?</h2>
          <p className="body-large mb-8 max-w-2xl mx-auto opacity-90">
            Let's discuss your vision and create something extraordinary together. Book a consultation today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/book">
              <Button variant="secondary" size="lg">Book Consultation</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">Get in Touch</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;