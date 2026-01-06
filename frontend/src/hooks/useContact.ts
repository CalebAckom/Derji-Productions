import { useCallback } from 'react';
import { ContactInquiry, ContactFormData } from '@/types';
import { useGet, usePost, usePut } from './useApi';

// Hook for fetching contact inquiries (admin)
export function useContactInquiries(filters?: {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
  if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());
  
  const url = `/contact${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return useGet<ContactInquiry[]>(url, {
    immediate: true,
    cacheKey: `contact_inquiries_${queryParams.toString()}`,
    cacheDuration: 2 * 60 * 1000, // 2 minutes cache
  });
}

// Hook for fetching a single contact inquiry (admin)
export function useContactInquiry(id: string) {
  return useGet<ContactInquiry>(`/contact/${id}`, {
    immediate: !!id,
    cacheKey: `contact_inquiry_${id}`,
  });
}

// Hook for submitting contact forms
export function useSubmitContact() {
  return usePost<ContactFormData, ContactInquiry>('/contact', {
    optimistic: false, // Don't use optimistic updates for contact forms
  });
}

// Hook for updating inquiry status (admin)
export function useUpdateInquiryStatus(id: string) {
  return usePut<{ status: string; notes?: string }, ContactInquiry>(`/contact/${id}/status`, {
    optimistic: true,
  });
}

// Hook for contact form validation
export function useContactValidation() {
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);
  
  const validatePhone = useCallback((phone: string): boolean => {
    // Basic phone validation - adjust regex based on requirements
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }, []);
  
  const validateForm = useCallback((formData: ContactFormData): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) {
      errors.push('Name is required');
    }
    
    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!validateEmail(formData.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    if (!formData.message.trim()) {
      errors.push('Message is required');
    } else if (formData.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    
    return errors;
  }, [validateEmail, validatePhone]);
  
  return {
    validateEmail,
    validatePhone,
    validateForm,
  };
}