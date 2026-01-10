import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Card, CardBody, Input } from '../ui';
import { useSubmitContact } from '../../hooks/useContact';
import { ContactFormData } from '../../types';

// Validation schema using Zod
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().optional().refine((val) => {
    if (!val) return true;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(val.replace(/[\s\-\(\)]/g, ''));
  }, 'Please enter a valid phone number'),
  subject: z.string().min(1, 'Subject is required').min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(1, 'Message is required').min(10, 'Message must be at least 10 characters'),
  serviceInterest: z.string().optional(),
});

type ContactFormFields = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  onSuccess?: () => void;
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess, className }) => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState<string>('');
  
  const { mutate: submitContact, loading } = useSubmitContact();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormFields>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormFields) => {
    try {
      setSubmitStatus('idle');
      setSubmitMessage('');
      
      const formData: ContactFormData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        serviceInterest: data.serviceInterest,
      };
      
      await submitContact(formData);
      
      setSubmitStatus('success');
      setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
      reset();
      onSuccess?.();
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Sorry, there was an error sending your message. Please try again or contact us directly.');
      console.error('Contact form submission error:', error);
    }
  };

  return (
    <Card className={className}>
      <CardBody className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              {...register('name')}
              label="Full Name"
              placeholder="John Doe"
              required
              error={errors.name?.message}
              variant={errors.name ? 'error' : 'default'}
            />
            <Input
              {...register('email')}
              type="email"
              label="Email Address"
              placeholder="john@example.com"
              required
              error={errors.email?.message}
              variant={errors.email ? 'error' : 'default'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              {...register('phone')}
              type="tel"
              label="Phone Number"
              placeholder="(555) 123-4567"
              error={errors.phone?.message}
              variant={errors.phone ? 'error' : 'default'}
              helpText="Optional - for faster response"
            />
            <div className="form-group">
              <label htmlFor="serviceInterest" className="label">Service Interest</label>
              <select
                {...register('serviceInterest')}
                id="serviceInterest"
                className="input"
              >
                <option value="">Select a service (optional)</option>
                <option value="photography">Photography</option>
                <option value="videography">Videography</option>
                <option value="sound">Sound Production</option>
                <option value="consultation">Consultation</option>
                <option value="multiple">Multiple Services</option>
              </select>
            </div>
          </div>

          <Input
            {...register('subject')}
            label="Subject"
            placeholder="Wedding Photography Inquiry"
            required
            error={errors.subject?.message}
            variant={errors.subject ? 'error' : 'default'}
          />

          <div className="form-group">
            <label htmlFor="message" className="label label-required">Message</label>
            <textarea
              {...register('message')}
              id="message"
              rows={6}
              className={`input resize-vertical ${errors.message ? 'input-error' : ''}`}
              placeholder="Tell us about your project, event date, location, and any specific requirements..."
            />
            {errors.message && (
              <p className="form-error">{errors.message.message}</p>
            )}
          </div>

          {/* Submit Status Messages */}
          {submitStatus === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800 font-medium">{submitMessage}</p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-medium">{submitMessage}</p>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            variant="golden" 
            size="lg" 
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Sending Message...' : 'Send Message'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default ContactForm;