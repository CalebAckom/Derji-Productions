import React from 'react';
import { Card, CardBody } from '../ui';

export interface TeamMemberData {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  bio?: string;
  photoUrl?: string;
  email?: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
}

interface TeamMemberProps {
  member: TeamMemberData;
  variant?: 'default' | 'compact';
  className?: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ 
  member, 
  variant = 'default',
  className 
}) => {
  const { name, role, expertise, bio, photoUrl, email, socialLinks } = member;

  return (
    <Card variant="hover" className={className}>
      <CardBody className={`text-center ${variant === 'compact' ? 'p-6' : 'p-8'}`}>
        {/* Profile Photo */}
        <div className={`${variant === 'compact' ? 'w-20 h-20' : 'w-24 h-24'} mx-auto mb-4 rounded-full overflow-hidden`}>
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={`${name} - ${role}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary-200 to-primary-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Name and Role */}
        <h3 className="heading-card text-secondary-900 mb-2">{name}</h3>
        <p className="text-primary-600 font-medium mb-3">{role}</p>

        {/* Expertise */}
        <div className="mb-4">
          <p className="body-small text-secondary-600 mb-2">Expertise:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {expertise.map((skill, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Bio (only in default variant) */}
        {variant === 'default' && bio && (
          <p className="body-small text-secondary-600 mb-4 text-left">{bio}</p>
        )}

        {/* Contact and Social Links */}
        <div className="flex justify-center items-center space-x-4">
          {email && (
            <a 
              href={`mailto:${email}`}
              className="text-secondary-600 hover:text-primary-600 transition-colors"
              title={`Email ${name}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          )}
          
          {socialLinks?.linkedin && (
            <a 
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-600 hover:text-primary-600 transition-colors"
              title={`${name} on LinkedIn`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          )}
          
          {socialLinks?.instagram && (
            <a 
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-600 hover:text-primary-600 transition-colors"
              title={`${name} on Instagram`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.864 3.708 13.713 3.708 12.416s.49-2.448 1.297-3.323C5.832 8.218 6.983 7.728 8.28 7.728s2.448.49 3.323 1.297c.827.827 1.317 1.978 1.317 3.275s-.49 2.448-1.297 3.323c-.875.827-2.026 1.317-3.323 1.317zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.827-.827-1.317-1.978-1.317-3.275s.49-2.448 1.297-3.323c.875-.827 2.026-1.317 3.323-1.317s2.448.49 3.323 1.297c.827.827 1.317 1.978 1.317 3.275s-.49 2.448-1.297 3.323c-.875.827-2.026 1.317-3.323 1.317z"/>
              </svg>
            </a>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default TeamMember;