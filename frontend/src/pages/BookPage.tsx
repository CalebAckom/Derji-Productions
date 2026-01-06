import React from 'react';
import { Button, Card, CardBody } from '../components/ui';
import Breadcrumb from '../components/navigation/Breadcrumb';

const BookPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-16 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
          <div className="relative z-10">
            <h1 className="heading-hero text-secondary-900 mb-6">Book Your Session</h1>
            <p className="body-large text-secondary-600 max-w-3xl mx-auto">
              Ready to bring your vision to life? Schedule a consultation or book your media production session with our professional team.
            </p>
          </div>
        </section>

        {/* Booking Options */}
        <section>
          <div className="text-center mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Choose Your Service</h2>
            <p className="body-large text-secondary-600 max-w-2xl mx-auto">
              Select the type of service you're interested in to get started with your booking.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
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
                  Book a photography session for weddings, events, portraits, or commercial projects.
                </p>
                <Button variant="golden" className="w-full">Book Photography</Button>
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
                  Schedule video production, live streaming, or post-production services.
                </p>
                <Button variant="golden" className="w-full">Book Videography</Button>
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
                  Book audio recording, sound engineering, or podcast production services.
                </p>
                <Button variant="golden" className="w-full">Book Sound Services</Button>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Consultation Option */}
        <section className="py-16 bg-secondary-50 rounded-2xl">
          <div className="text-center mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Free Consultation</h2>
            <p className="body-large text-secondary-600 max-w-2xl mx-auto">
              Not sure which service is right for you? Book a free consultation to discuss your project and get expert recommendations.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardBody className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="heading-card text-secondary-900 mb-2">30-Minute Consultation</h3>
                  <p className="body-normal text-secondary-600">
                    Discuss your project, get expert advice, and receive a customized quote.
                  </p>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-secondary-700">Project planning and timeline discussion</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-secondary-700">Service recommendations based on your needs</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-secondary-700">Detailed quote and pricing information</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-secondary-700">Portfolio review and style matching</span>
                  </div>
                </div>
                
                <Button variant="golden" size="lg" className="w-full">
                  Schedule Free Consultation
                </Button>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Booking Process */}
        <section>
          <div className="text-center mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">How It Works</h2>
            <p className="body-large text-secondary-600 max-w-2xl mx-auto">
              Our simple booking process ensures a smooth experience from initial contact to project completion.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Choose Service',
                description: 'Select the type of media production service you need.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )
              },
              {
                step: '02',
                title: 'Book Consultation',
                description: 'Schedule a free consultation to discuss your project details.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                step: '03',
                title: 'Confirm Details',
                description: 'Finalize project scope, timeline, and pricing agreement.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                step: '04',
                title: 'Production Day',
                description: 'Professional execution of your media production project.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {step.icon}
                </div>
                <div className="text-sm font-bold text-primary-600 mb-2">STEP {step.step}</div>
                <h3 className="heading-card text-secondary-900 mb-2">{step.title}</h3>
                <p className="body-normal text-secondary-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Information */}
        <section className="py-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-20"></div>
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="heading-section mb-4">Transparent Pricing</h2>
              <p className="body-large opacity-90 max-w-2xl mx-auto">
                We believe in transparent, fair pricing with no hidden fees. Get a detailed quote during your consultation.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">Free</div>
                <p className="opacity-90 mb-4">Initial Consultation</p>
                <p className="text-sm opacity-75">30-minute project discussion</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">Custom</div>
                <p className="opacity-90 mb-4">Project Pricing</p>
                <p className="text-sm opacity-75">Based on scope and requirements</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">24-48h</div>
                <p className="opacity-90 mb-4">Quote Delivery</p>
                <p className="text-sm opacity-75">Fast turnaround on estimates</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="text-center">
          <h2 className="heading-section text-secondary-900 mb-4">Questions?</h2>
          <p className="body-large text-secondary-600 mb-8 max-w-2xl mx-auto">
            Have questions about our services or booking process? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" size="lg">
              Call (555) 123-4567
            </Button>
            <Button variant="outline" size="lg">
              Email Us
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookPage;