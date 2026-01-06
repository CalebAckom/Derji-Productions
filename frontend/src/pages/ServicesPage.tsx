import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody } from '../components/ui';
import Breadcrumb from '../components/navigation/Breadcrumb';

const ServicesPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-16 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
          <div className="relative z-10">
            <h1 className="heading-hero text-secondary-900 mb-6">Our Services</h1>
            <p className="body-large text-secondary-600 max-w-3xl mx-auto">
              Comprehensive media production services designed to bring your vision to life with professional quality and creative excellence.
            </p>
          </div>
        </section>

        {/* Photography Services */}
        <section>
          <div className="mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Photography</h2>
            <p className="body-large text-secondary-600 max-w-3xl">
              Capturing life's precious moments with artistic vision and technical precision across various photography specialties.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { name: 'Wedding Photography', description: 'Romantic and timeless wedding photography that captures every precious moment of your special day.' },
              { name: 'Corporate Events', description: 'Professional corporate photography for conferences, meetings, and business events.' },
              { name: 'Portrait Sessions', description: 'Individual and family portraits that showcase personality and create lasting memories.' },
              { name: 'Birthday Celebrations', description: 'Fun and vibrant birthday party photography for all ages and celebrations.' },
              { name: 'Graduation Ceremonies', description: 'Commemorative graduation photography to celebrate academic achievements.' },
              { name: 'Church Events', description: 'Respectful and meaningful photography for religious ceremonies and church events.' },
              { name: 'Travel & Outing', description: 'Adventure and travel photography that captures the spirit of exploration.' },
              { name: 'Studio Photography', description: 'Controlled studio environment for professional headshots and product photography.' },
              { name: 'Drone Aerial Shots', description: 'Stunning aerial photography using professional drone equipment.' },
            ].map((service, index) => (
              <Card key={index} variant="hover">
                <CardBody className="p-6">
                  <h3 className="heading-card text-primary-600 mb-3">{service.name}</h3>
                  <p className="body-normal text-secondary-600">{service.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/services/photography">
              <Button variant="golden">Explore Photography Services</Button>
            </Link>
          </div>
        </section>

        {/* Videography Services */}
        <section className="py-16 bg-secondary-50 rounded-2xl">
          <div className="mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Videography</h2>
            <p className="body-large text-secondary-600 max-w-3xl">
              Professional video production services from concept to final delivery, including live streaming and post-production.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              { name: 'Live Streaming', description: 'Professional live streaming services for events, conferences, and online broadcasts with multi-camera setups.' },
              { name: 'Post-Production', description: 'Complete video editing, color grading, and post-production services to polish your content.' },
              { name: 'Podcast Production', description: 'Full podcast video production including multi-camera setups and professional editing.' },
              { name: 'Drone Coverage', description: 'Cinematic aerial videography using professional drone equipment for stunning perspectives.' },
              { name: 'Consultation & Training', description: 'Expert consultation and training services for video production techniques and equipment.' },
            ].map((service, index) => (
              <Card key={index} variant="hover">
                <CardBody className="p-6">
                  <h3 className="heading-card text-primary-600 mb-3">{service.name}</h3>
                  <p className="body-normal text-secondary-600">{service.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/services/videography">
              <Button variant="golden">Explore Videography Services</Button>
            </Link>
          </div>
        </section>

        {/* Sound Production Services */}
        <section>
          <div className="mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Sound Production</h2>
            <p className="body-large text-secondary-600 max-w-3xl">
              High-quality audio recording, sound engineering, and post-production services for various media projects.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              { name: 'Live Sound Production', description: 'Professional live sound engineering for events, concerts, and performances with high-quality equipment.' },
              { name: 'Post Sound Production', description: 'Audio post-production including mixing, mastering, and sound design for various media projects.' },
              { name: 'Podcast Audio', description: 'Complete podcast audio production from recording to final mastering with professional quality.' },
              { name: 'Consultation & Training', description: 'Expert audio consultation and training for sound engineering techniques and equipment setup.' },
            ].map((service, index) => (
              <Card key={index} variant="hover">
                <CardBody className="p-6">
                  <h3 className="heading-card text-primary-600 mb-3">{service.name}</h3>
                  <p className="body-normal text-secondary-600">{service.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/services/sound">
              <Button variant="golden">Explore Sound Services</Button>
            </Link>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-20"></div>
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="heading-section mb-4">Our Process</h2>
              <p className="body-large opacity-90 max-w-2xl mx-auto">
                We follow a proven process to ensure every project meets our high standards and exceeds your expectations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Consultation', description: 'We discuss your vision, requirements, and project goals.' },
                { step: '02', title: 'Planning', description: 'Detailed planning and preparation for optimal execution.' },
                { step: '03', title: 'Production', description: 'Professional execution using high-quality equipment and techniques.' },
                { step: '04', title: 'Delivery', description: 'Final delivery of polished, professional-quality content.' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="opacity-90">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <h2 className="heading-section text-secondary-900 mb-4">Ready to Get Started?</h2>
          <p className="body-large text-secondary-600 mb-8 max-w-2xl mx-auto">
            Let's discuss your project and create something amazing together. Book a consultation to get started.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/book">
              <Button variant="golden" size="lg">Book Consultation</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">Get in Touch</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicesPage;