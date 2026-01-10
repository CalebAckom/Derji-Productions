import React from 'react';
import { Card, CardBody } from '../components/ui';
import Breadcrumb from '../components/navigation/Breadcrumb';
import { TeamMember, TestimonialsCarousel, TeamMemberData, TestimonialData } from '../components/about';

const AboutPage: React.FC = () => {
  // Team members data
  const teamMembers: TeamMemberData[] = [
    {
      id: '1',
      name: 'John Derji',
      role: 'Founder & Creative Director',
      expertise: ['Photography', 'Creative Vision', 'Project Management'],
      bio: 'With over 10 years of experience in professional photography and creative direction, John founded Derji Productions with a vision to create exceptional visual content that tells compelling stories.',
      email: 'john@derjiproductions.com',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/johnderji',
        instagram: 'https://instagram.com/johnderji',
      }
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Lead Videographer',
      expertise: ['Video Production', 'Post-Production', 'Drone Operations'],
      bio: 'Sarah brings cinematic expertise to every project, specializing in corporate videos, documentaries, and event coverage. Her attention to detail and storytelling ability make every video memorable.',
      email: 'sarah@derjiproductions.com',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        instagram: 'https://instagram.com/sarahjohnson',
      }
    },
    {
      id: '3',
      name: 'Mike Chen',
      role: 'Sound Engineer',
      expertise: ['Audio Recording', 'Sound Design', 'Live Sound'],
      bio: 'Mike is our audio specialist with expertise in both studio recording and live sound production. He ensures every project has crystal-clear audio that enhances the overall experience.',
      email: 'mike@derjiproductions.com',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/mikechen',
      }
    },
  ];

  // Testimonials data
  const testimonials: TestimonialData[] = [
    {
      id: '1',
      name: 'Emily Rodriguez',
      role: 'Bride',
      company: 'Wedding Client',
      content: 'Derji Productions captured our wedding day perfectly! Every moment was beautifully documented, and the team was so professional and unobtrusive. We couldn\'t be happier with the results.',
      rating: 5,
      projectType: 'Wedding Photography',
    },
    {
      id: '2',
      name: 'David Thompson',
      role: 'Marketing Director',
      company: 'TechStart Inc.',
      content: 'The corporate video Derji Productions created for our product launch exceeded all expectations. Their creative approach and technical expertise helped us tell our story in a compelling way.',
      rating: 5,
      projectType: 'Corporate Video',
    },
    {
      id: '3',
      name: 'Lisa Park',
      role: 'Event Coordinator',
      company: 'Park Events',
      content: 'I\'ve worked with many production companies, but Derji Productions stands out for their professionalism, creativity, and ability to deliver under tight deadlines. Highly recommended!',
      rating: 5,
      projectType: 'Event Coverage',
    },
    {
      id: '4',
      name: 'James Wilson',
      role: 'Podcast Host',
      company: 'The Business Hour',
      content: 'The audio quality and production value Derji Productions brought to our podcast was incredible. Mike\'s expertise in sound engineering really elevated our content.',
      rating: 5,
      projectType: 'Podcast Production',
    },
  ];
  return (
    <div className="space-y-8">
      <Breadcrumb />
      
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="text-center py-16 bg-gradient-to-br from-secondary-50 to-primary-50 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-5"></div>
          <div className="relative z-10">
            <h1 className="heading-hero text-secondary-900 mb-6">About Derji Productions</h1>
            <p className="body-large text-secondary-600 max-w-3xl mx-auto">
              We are a passionate team of creative professionals dedicated to capturing and creating exceptional media content that tells your story with authenticity and artistic vision.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="heading-section text-secondary-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-secondary-600">
              <p className="body-normal">
                Founded with a vision to bridge the gap between technical excellence and creative storytelling, Derji Productions has grown from a small startup to a trusted name in professional media production.
              </p>
              <p className="body-normal">
                Our journey began with a simple belief: every moment, every story, and every vision deserves to be captured with the highest quality and artistic integrity. This philosophy drives everything we do.
              </p>
              <p className="body-normal">
                Today, we serve clients across various industries, from intimate wedding ceremonies to large corporate events, always maintaining our commitment to excellence and innovation.
              </p>
            </div>
          </div>
          <div className="aspect-video bg-gradient-to-br from-secondary-200 to-primary-100 rounded-lg flex items-center justify-center">
            <span className="text-secondary-600 font-medium">Company Story Image</span>
          </div>
        </section>

        {/* Our Mission & Values */}
        <section className="py-16 bg-secondary-50 rounded-2xl">
          <div className="text-center mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Our Mission & Values</h2>
            <p className="body-large text-secondary-600 max-w-2xl mx-auto">
              We're driven by core values that shape every project and client relationship.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="hover">
              <CardBody className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="heading-card text-primary-600 mb-4">Innovation</h3>
                <p className="body-normal text-secondary-600">
                  We embrace cutting-edge technology and creative techniques to deliver exceptional results that exceed expectations.
                </p>
              </CardBody>
            </Card>

            <Card variant="hover">
              <CardBody className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="heading-card text-primary-600 mb-4">Passion</h3>
                <p className="body-normal text-secondary-600">
                  Every project is approached with genuine enthusiasm and dedication to creating something truly meaningful.
                </p>
              </CardBody>
            </Card>

            <Card variant="hover">
              <CardBody className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="heading-card text-primary-600 mb-4">Excellence</h3>
                <p className="body-normal text-secondary-600">
                  We maintain the highest standards in every aspect of our work, from initial concept to final delivery.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">Meet Our Team</h2>
            <p className="body-large text-secondary-600 max-w-2xl mx-auto">
              Our talented professionals bring years of experience and creative vision to every project.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <TeamMember key={member.id} member={member} />
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-secondary-50 rounded-2xl">
          <div className="text-center mb-12">
            <h2 className="heading-section text-secondary-900 mb-4">What Our Clients Say</h2>
            <p className="body-large text-secondary-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our clients have to say about working with us.
            </p>
          </div>
          
          <TestimonialsCarousel 
            testimonials={testimonials}
            autoPlay={true}
            autoPlayInterval={6000}
            showDots={true}
            showArrows={true}
          />
        </section>

        {/* Awards & Recognition */}
        <section className="py-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-circuit-pattern opacity-20"></div>
          <div className="relative z-10 text-center">
            <h2 className="heading-section mb-8">Awards & Recognition</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <p className="opacity-90">Happy Clients</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">200+</div>
                <p className="opacity-90">Projects Completed</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5</div>
                <p className="opacity-90">Years Experience</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;