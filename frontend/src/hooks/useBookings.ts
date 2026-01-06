import { useCallback } from 'react';
import { Booking, BookingFormData } from '@/types';
import { useGet, usePost, usePut, useDelete } from './useApi';
import { get, post } from '@/utils/api';

// Interface for availability slots
interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  serviceTypes: string[];
}

interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
}

// Hook for fetching booking availability
export function useBookingAvailability(date?: Date, serviceId?: string) {
  const queryParams = new URLSearchParams();
  if (date) queryParams.append('date', date.toISOString().split('T')[0]);
  if (serviceId) queryParams.append('serviceId', serviceId);
  
  const url = `/bookings/availability${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return useGet<AvailabilityResponse>(url, {
    immediate: !!(date || serviceId),
    cacheKey: `availability_${queryParams.toString()}`,
    cacheDuration: 1 * 60 * 1000, // 1 minute cache for availability
  });
}

// Hook for fetching all bookings (admin)
export function useBookings(filters?: {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  serviceId?: string;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
  if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());
  if (filters?.serviceId) queryParams.append('serviceId', filters.serviceId);
  
  const url = `/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  return useGet<Booking[]>(url, {
    immediate: true,
    cacheKey: `bookings_${queryParams.toString()}`,
    cacheDuration: 2 * 60 * 1000, // 2 minutes cache
  });
}

// Hook for fetching a single booking
export function useBooking(id: string) {
  return useGet<Booking>(`/bookings/${id}`, {
    immediate: !!id,
    cacheKey: `booking_${id}`,
  });
}

// Hook for creating bookings
export function useCreateBooking() {
  return usePost<BookingFormData, Booking>('/bookings', {
    optimistic: false, // Don't use optimistic updates for bookings due to availability constraints
  });
}

// Hook for updating booking status (admin)
export function useUpdateBookingStatus(id: string) {
  return usePut<{ status: string }, Booking>(`/bookings/${id}/status`, {
    optimistic: true,
  });
}

// Hook for canceling bookings
export function useCancelBooking(id: string) {
  return useDelete<void>(`/bookings/${id}`);
}

// Custom hook for checking availability
export function useAvailabilityChecker() {
  const checkAvailability = useCallback(async (
    date: Date,
    startTime: string,
    endTime: string,
    serviceId?: string
  ) => {
    const queryParams = new URLSearchParams({
      date: date.toISOString().split('T')[0],
      startTime,
      endTime,
    });
    
    if (serviceId) queryParams.append('serviceId', serviceId);
    
    return get<{ available: boolean; conflicts?: Booking[] }>(
      `/bookings/check-availability?${queryParams.toString()}`
    );
  }, []);
  
  return { checkAvailability };
}

// Hook for booking confirmation
export function useBookingConfirmation() {
  const sendConfirmation = useCallback(async (bookingId: string) => {
    return post<void>(`/bookings/${bookingId}/confirm`);
  }, []);
  
  const resendConfirmation = useCallback(async (bookingId: string) => {
    return post<void>(`/bookings/${bookingId}/resend-confirmation`);
  }, []);
  
  return { sendConfirmation, resendConfirmation };
}