import React, { useState } from 'react';
import { Button, Card, CardBody } from '../components/ui';
import Breadcrumb from '../components/navigation/Breadcrumb';

type FilterCategory = 'all' | 'photography' | 'videography' | 'sound';

const PortfolioPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const portfolioItems = [
    { id: 1, title: 'Wedding at Sunset Beach', category: 'photography', type: 'Wedding', client: 'Sarah & John' },
    { id: 2, title: 'Corporate Conference 2024', category: 'videography', type: 'Corporate', client: 'Tech Corp' },
    { id: 3, title: 'Podcast Studio Session', category: 'sound', type: 'Podcast', client: 'Creative Minds' },
    { id: 4, title: 'Birthday Celebration', category: 'photography', type: 'Birthday', client: 'Johnson Family' },
    { id: 5, title: 'Live Event Stream', category: 'videography', type: 'Live Stream', client: 'Music Festival' },
    { id: 6, title: 'Church Service Audio', category: 'sound', type: 'Live Sound', client: 'Community Church' },
    { id: 7, title: 'Graduation Ceremony', category: 'photography', type: 'Graduation', client: 'University' },
    { id: 8, title: 'Product Launch Video', category: 'videography', type: 'Commercial', client: 'StartupXYZ' },
    { id: 9, title: 'Travel Documentary', category: 'photography', type: 'Travel', client: 'Adventure Co' },
  ];

  const filteredItems = activeFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeFilter);

  const filterButtons: { key: FilterCategory; label: string }[] = [
    { key: 'all', label: 'All Work' },
    { key: 'photography', label: 'Photography' },
    { key: 'videography', label: 'Videography' },
    { key: 'sound', label: 'Sound Production' },
  ];

  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-16 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
          <div className="relative z-10">
            <h1 className="heading-hero text-secondary-900 mb-6">Our Portfolio</h1>
            <p className="body-large text-secondary-600 max-w-3xl mx-auto">
              Explore our collection of professional work showcasing the quality and creativity we bring to every project.
            </p>
          </div>
        </section>

        {/* Filter Buttons */}
        <section>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filterButtons.map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? 'golden' : 'outline'}
                onClick={() => setActiveFilter(filter.key)}
                className="transition-all duration-200"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <Card key={item.id} variant="hover" className="group cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-secondary-200 to-primary-100 rounded-t-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-secondary-300/50 group-hover:bg-secondary-300/30 transition-colors">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-glow transition-all duration-300">
                        {item.category === 'photography' && (
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        {item.category === 'videography' && (
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                        {item.category === 'sound' && (
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        )}
                      </div>
                      <span className="text-secondary-600 font-medium capitalize">{item.category}</span>
                    </div>
                  </div>
                </div>
                <CardBody className="p-6">
                  <h3 className="heading-card text-secondary-900 mb-2">{item.title}</h3>
                  <div className="flex justify-between items-center text-sm text-secondary-600">
                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full">{item.type}</span>
                    <span>{item.client}</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="body-large text-secondary-600">No items found for the selected category.</p>
            </div>
          )}
        </section>

        {/* Featured Projects */}
        <section className="py-16 bg-secondary-50 rounded-2xl">
          <div className="text-center mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Featured Projects</h2>
            <p className="body-large text-secondary-600 max-w-2xl mx-auto">
              Highlighting some of our most impactful and creative work across different media types.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="hover">
              <div className="aspect-video bg-gradient-to-br from-secondary-200 to-primary-100 rounded-t-lg flex items-center justify-center">
                <span className="text-secondary-600 font-medium">Featured Project Video</span>
              </div>
              <CardBody className="p-6">
                <h3 className="heading-card text-secondary-900 mb-2">Award-Winning Wedding Film</h3>
                <p className="body-normal text-secondary-600 mb-4">
                  A cinematic wedding film that captured the essence of love and celebration, recognized at the Regional Film Awards.
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">Videography</span>
                  <Button variant="outline" size="sm">View Project</Button>
                </div>
              </CardBody>
            </Card>

            <Card variant="hover">
              <div className="aspect-video bg-gradient-to-br from-secondary-200 to-primary-100 rounded-t-lg flex items-center justify-center">
                <span className="text-secondary-600 font-medium">Featured Project Gallery</span>
              </div>
              <CardBody className="p-6">
                <h3 className="heading-card text-secondary-900 mb-2">Corporate Brand Photography</h3>
                <p className="body-normal text-secondary-600 mb-4">
                  A comprehensive brand photography project that elevated a startup's visual identity and marketing materials.
                </p>
                <div className="flex items-center justify-between">
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">Photography</span>
                  <Button variant="outline" size="sm">View Project</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <div className="text-center mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Client Testimonials</h2>
            <p className="body-large text-secondary-600 max-w-2xl mx-auto">
              Hear what our clients have to say about their experience working with us.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Bride',
                testimonial: 'Derji Productions captured our wedding day perfectly. Every moment was beautifully documented with such artistic vision.',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'CEO, Tech Startup',
                testimonial: 'The corporate event coverage was exceptional. Professional, creative, and delivered exactly what we needed for our marketing.',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                role: 'Podcast Host',
                testimonial: 'The audio quality and production value they brought to our podcast was incredible. Highly recommend their sound services.',
                rating: 5
              },
            ].map((testimonial, index) => (
              <Card key={index} variant="hover">
                <CardBody className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="body-normal text-secondary-600 mb-4 italic">"{testimonial.testimonial}"</p>
                  <div>
                    <p className="font-semibold text-secondary-900">{testimonial.name}</p>
                    <p className="text-sm text-secondary-600">{testimonial.role}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-20"></div>
          <div className="relative z-10">
            <h2 className="heading-section mb-4">Ready to Create Something Amazing?</h2>
            <p className="body-large mb-8 max-w-2xl mx-auto opacity-90">
              Let's discuss your project and create content that exceeds your expectations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="secondary" size="lg">Book Consultation</Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                Get Quote
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PortfolioPage;