import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import { ServiceCatalog } from '../components/services';
import Breadcrumb from '../components/navigation/Breadcrumb';
import { Service } from '../types';

const ServicesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleServiceSelect = (service: Service) => {
    // Navigate to service detail page or open booking modal
    // For now, we'll navigate to the booking page with the service pre-selected
    navigate('/book', { state: { selectedService: service } });
  };

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-16 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 circuit-bg-light"></div>
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6">Our Services</h1>
            <p className="text-lg md:text-xl text-secondary-600 max-w-3xl mx-auto">
              Comprehensive media production services designed to bring your vision to life with professional quality and creative excellence.
            </p>
          </div>
        </section>

        {/* Service Catalog */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">Browse Our Services</h2>
            <p className="text-lg text-secondary-600 max-w-3xl">
              Explore our comprehensive range of photography, videography, and sound production services. 
              Use the filters to find exactly what you need, or compare services to make the best choice for your project.
            </p>
          </div>
          
          <ServiceCatalog
            showFilters={true}
            showComparison={true}
            layout="grid"
            onServiceSelect={handleServiceSelect}
          />
        </section>

        {/* Process Section */}
        <section className="py-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 circuit-bg-dark"></div>
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Process</h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">
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
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
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