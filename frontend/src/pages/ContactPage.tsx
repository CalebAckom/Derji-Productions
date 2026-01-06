import React from 'react';
import { Button, Card, CardBody } from '../components/ui';
import Breadcrumb from '../components/navigation/Breadcrumb';

const ContactPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-16 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
          <div className="relative z-10">
            <h1 className="heading-hero text-secondary-900 mb-6">Get in Touch</h1>
            <p className="body-large text-secondary-600 max-w-3xl mx-auto">
              Ready to discuss your project? We'd love to hear from you. Reach out through any of the methods below.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card variant="hover" className="text-center">
              <CardBody className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="heading-card text-primary-600 mb-4">Phone</h3>
                <p className="body-normal text-secondary-600 mb-4">
                  Call us directly for immediate assistance
                </p>
                <p className="font-semibold text-secondary-900 mb-4">(555) 123-4567</p>
                <Button variant="outline" size="sm">Call Now</Button>
              </CardBody>
            </Card>

            <Card variant="hover" className="text-center">
              <CardBody className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="heading-card text-primary-600 mb-4">Email</h3>
                <p className="body-normal text-secondary-600 mb-4">
                  Send us a detailed message about your project
                </p>
                <p className="font-semibold text-secondary-900 mb-4">hello@derjiproductions.com</p>
                <Button variant="outline" size="sm">Send Email</Button>
              </CardBody>
            </Card>

            <Card variant="hover" className="text-center">
              <CardBody className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="heading-card text-primary-600 mb-4">Visit Us</h3>
                <p className="body-normal text-secondary-600 mb-4">
                  Come to our studio for an in-person consultation
                </p>
                <p className="font-semibold text-secondary-900 mb-4">
                  123 Creative Street<br />
                  Studio City, CA 90210
                </p>
                <Button variant="outline" size="sm">Get Directions</Button>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Contact Form */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="heading-section text-secondary-900 mb-6">Send Us a Message</h2>
            <p className="body-large text-secondary-600 mb-8">
              Fill out the form below and we'll get back to you within 24 hours. The more details you provide, the better we can assist you.
            </p>
            
            <Card>
              <CardBody className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-secondary-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-secondary-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-secondary-700 mb-2">
                      Service Interest
                    </label>
                    <select
                      id="service"
                      name="service"
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                      <option value="">Select a service</option>
                      <option value="photography">Photography</option>
                      <option value="videography">Videography</option>
                      <option value="sound">Sound Production</option>
                      <option value="consultation">Consultation</option>
                      <option value="multiple">Multiple Services</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Wedding Photography Inquiry"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-vertical"
                      placeholder="Tell us about your project, event date, location, and any specific requirements..."
                    ></textarea>
                  </div>

                  <Button type="submit" variant="golden" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Business Hours */}
            <Card>
              <CardBody className="p-8">
                <h3 className="heading-card text-secondary-900 mb-6">Business Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Monday - Friday</span>
                    <span className="font-medium text-secondary-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Saturday</span>
                    <span className="font-medium text-secondary-900">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Sunday</span>
                    <span className="font-medium text-secondary-900">By Appointment</span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700">
                    <strong>Note:</strong> We're available for events and shoots outside regular hours. Contact us to discuss your schedule.
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* FAQ */}
            <Card>
              <CardBody className="p-8">
                <h3 className="heading-card text-secondary-900 mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">How quickly do you respond?</h4>
                    <p className="text-sm text-secondary-600">We typically respond to all inquiries within 24 hours during business days.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">Do you travel for projects?</h4>
                    <p className="text-sm text-secondary-600">Yes, we travel for projects. Travel fees may apply depending on location and distance.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900 mb-2">What's included in a consultation?</h4>
                    <p className="text-sm text-secondary-600">Free consultations include project planning, service recommendations, and detailed pricing.</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Social Media */}
            <Card>
              <CardBody className="p-8">
                <h3 className="heading-card text-secondary-900 mb-6">Follow Us</h3>
                <p className="text-secondary-600 mb-6">Stay updated with our latest work and behind-the-scenes content.</p>
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm">Instagram</Button>
                  <Button variant="outline" size="sm">Facebook</Button>
                  <Button variant="outline" size="sm">YouTube</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 bg-secondary-50 rounded-2xl">
          <div className="text-center mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Find Our Studio</h2>
            <p className="body-large text-secondary-600 max-w-2xl mx-auto">
              Visit us at our creative studio space for in-person consultations and project discussions.
            </p>
          </div>
          
          <div className="aspect-video bg-gradient-to-br from-secondary-200 to-primary-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-secondary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-secondary-600 font-medium">Interactive Map</p>
              <p className="text-sm text-secondary-500">123 Creative Street, Studio City, CA 90210</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;