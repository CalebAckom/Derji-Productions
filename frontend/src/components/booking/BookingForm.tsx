import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card, CardBody, Modal, ModalHeader, ModalBody, ModalFooter } from '../ui';
import { useServices } from '../../hooks/useServices';
import { useCreateBooking, useBookingAvailability } from '../../hooks/useBookings';
import { BookingFormData } from '../../types';
import BookingCalendar from './BookingCalendar';
import TimeSlotSelector from './TimeSlotSelector';

// Frontend booking form validation schema
const bookingFormSchema = z.object({
  clientName: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  clientEmail: z.string().email('Invalid email address').max(255, 'Email too long'),
  clientPhone: z.string().max(50, 'Phone number too long').optional().or(z.literal('')),
  serviceId: z.string().min(1, 'Please select a service'),
  bookingDate: z.string().min(1, 'Please select a date'),
  startTime: z.string().min(1, 'Please select a start time'),
  endTime: z.string().min(1, 'Please select an end time'),
  projectDetails: z.string().max(2000, 'Project details too long').optional().or(z.literal('')),
  budgetRange: z.string().max(50, 'Budget range too long').optional().or(z.literal('')),
  location: z.string().max(255, 'Location too long').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes too long').optional().or(z.literal('')),
}).refine((data) => {
  if (!data.startTime || !data.endTime) return true; // Let required validation handle empty values
  
  const [startHour, startMinute] = data.startTime.split(':').map(Number);
  const [endHour, endMinute] = data.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return endMinutes > startMinutes;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  initialServiceId?: string;
  onSuccess?: (booking: any) => void;
  onCancel?: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  initialServiceId,
  onSuccess,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const { data: services, loading: servicesLoading } = useServices({ active: true });
  const servicesList = Array.isArray(services) ? services : [];
  const { data: availability = null, loading: availabilityLoading } = useBookingAvailability(
    selectedDate || undefined
  );
  const { execute: createBooking, loading: submitting, error: submitError } = useCreateBooking();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceId: initialServiceId || '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      bookingDate: '',
      startTime: '',
      endTime: '',
      projectDetails: '',
      budgetRange: '',
      location: '',
      notes: '',
    },
  });

  const watchedServiceId = watch('serviceId');
  const watchedDate = watch('bookingDate');
  const watchedStartTime = watch('startTime');

  // Update selected date when form date changes
  useEffect(() => {
    if (watchedDate) {
      setSelectedDate(new Date(watchedDate));
    }
  }, [watchedDate]);

  // Auto-set end time when start time changes (default 1 hour duration)
  useEffect(() => {
    if (watchedStartTime) {
      const [hours, minutes] = watchedStartTime.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours + 1, minutes, 0, 0);
      const endTimeString = endTime.toTimeString().slice(0, 5);
      setValue('endTime', endTimeString);
    }
  }, [watchedStartTime, setValue]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setValue('bookingDate', date.toISOString().split('T')[0]);
    // Reset time selection when date changes
    setValue('startTime', '');
    setValue('endTime', '');
  };

  const handleTimeSlotSelect = (startTime: string, endTime: string) => {
    setValue('startTime', startTime);
    setValue('endTime', endTime);
  };

  const onSubmit = async (data: BookingFormValues) => {
    try {
      // Convert form data to API format
      const bookingData: BookingFormData = {
        ...data,
        clientPhone: data.clientPhone || undefined,
        projectDetails: data.projectDetails || undefined,
        budgetRange: data.budgetRange || undefined,
        location: data.location || undefined,
        notes: data.notes || undefined,
      };

      const result = await createBooking(bookingData);
      setBookingResult(result);
      setShowConfirmation(true);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Booking submission failed:', error);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setBookingResult(null);
    reset();
    if (onCancel) {
      onCancel();
    }
  };

  const selectedService = servicesList.find(service => service.id === watchedServiceId);

  return (
    <>
      <Card>
        <CardBody className="p-8">
          <div className="mb-8">
            <h2 className="heading-section text-secondary-900 mb-4">Book Your Session</h2>
            <p className="body-normal text-secondary-600">
              Fill out the form below to schedule your media production session. We'll confirm your booking within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Selection */}
            <div className="form-group">
              <label htmlFor="serviceId" className="label label-required">
                Service Type
              </label>
              <select
                id="serviceId"
                {...register('serviceId')}
                className={`input ${errors.serviceId ? 'input-error' : ''}`}
                disabled={servicesLoading}
              >
                <option value="">Select a service...</option>
                {servicesList.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.category?.name}
                  </option>
                ))}
              </select>
              {errors.serviceId && (
                <p className="form-error">{errors.serviceId.message}</p>
              )}
            </div>

            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                required
                {...register('clientName')}
                error={errors.clientName?.message}
                placeholder="Enter your full name"
              />
              <Input
                label="Email Address"
                type="email"
                required
                {...register('clientEmail')}
                error={errors.clientEmail?.message}
                placeholder="Enter your email address"
              />
            </div>

            <Input
              label="Phone Number"
              type="tel"
              {...register('clientPhone')}
              error={errors.clientPhone?.message}
              placeholder="Enter your phone number (optional)"
              helpText="We'll use this to contact you about your booking"
            />

            {/* Date Selection */}
            <div className="space-y-4">
              <h3 className="heading-card text-secondary-900">Select Date & Time</h3>
              
              <Controller
                name="bookingDate"
                control={control}
                render={() => (
                  <BookingCalendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    error={errors.bookingDate?.message}
                  />
                )}
              />

              {/* Time Slot Selection */}
              {selectedDate && watchedServiceId && (
                <TimeSlotSelector
                  date={selectedDate}
                  serviceId={watchedServiceId}
                  selectedStartTime={watchedStartTime}
                  onTimeSlotSelect={handleTimeSlotSelect}
                  availability={availability}
                  loading={availabilityLoading}
                  startTimeError={errors.startTime?.message}
                  endTimeError={errors.endTime?.message}
                />
              )}
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="heading-card text-secondary-900">Project Information</h3>
              
              <div className="form-group">
                <label htmlFor="projectDetails" className="label">
                  Project Details
                </label>
                <textarea
                  id="projectDetails"
                  {...register('projectDetails')}
                  className={`input min-h-[100px] ${errors.projectDetails ? 'input-error' : ''}`}
                  placeholder="Describe your project, vision, and any specific requirements..."
                  rows={4}
                />
                {errors.projectDetails && (
                  <p className="form-error">{errors.projectDetails.message}</p>
                )}
                <p className="form-help">
                  Help us understand your project better to provide the best service
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="budgetRange" className="label">
                    Budget Range
                  </label>
                  <select
                    id="budgetRange"
                    {...register('budgetRange')}
                    className={`input ${errors.budgetRange ? 'input-error' : ''}`}
                  >
                    <option value="">Select budget range...</option>
                    <option value="under-500">Under $500</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-2500">$1,000 - $2,500</option>
                    <option value="2500-5000">$2,500 - $5,000</option>
                    <option value="5000-plus">$5,000+</option>
                    <option value="discuss">Prefer to discuss</option>
                  </select>
                  {errors.budgetRange && (
                    <p className="form-error">{errors.budgetRange.message}</p>
                  )}
                </div>

                <Input
                  label="Location"
                  {...register('location')}
                  error={errors.location?.message}
                  placeholder="Event location or studio preference"
                  helpText="Where will the session take place?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="label">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  className={`input min-h-[80px] ${errors.notes ? 'input-error' : ''}`}
                  placeholder="Any additional information or special requests..."
                  rows={3}
                />
                {errors.notes && (
                  <p className="form-error">{errors.notes.message}</p>
                )}
              </div>
            </div>

            {/* Service Summary */}
            {selectedService && (
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <h4 className="font-semibold text-primary-900 mb-2">Selected Service</h4>
                <p className="text-primary-800">
                  <strong>{selectedService.name}</strong> - {selectedService.category?.name}
                </p>
                {selectedService.description && (
                  <p className="text-sm text-primary-700 mt-1">{selectedService.description}</p>
                )}
                {selectedService.basePrice && (
                  <p className="text-sm text-primary-700 mt-1">
                    Starting at ${selectedService.basePrice}
                  </p>
                )}
              </div>
            )}

            {/* Error Display */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{submitError}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-secondary-200">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={onCancel}
                  className="sm:w-auto"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="golden"
                size="lg"
                loading={submitting}
                disabled={!isValid || submitting}
                className="flex-1 sm:flex-none sm:w-auto"
              >
                {submitting ? 'Submitting...' : 'Book Session'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        closeOnBackdropClick={false}
      >
        <ModalHeader onClose={handleConfirmationClose}>
          Booking Submitted Successfully!
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="heading-card text-secondary-900 mb-4">Thank You!</h3>
            <p className="body-normal text-secondary-600 mb-6">
              Your booking request has been submitted successfully. We'll review your request and send you a confirmation email within 24 hours.
            </p>
            {bookingResult && (
              <div className="bg-secondary-50 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-secondary-900 mb-2">Booking Details</h4>
                <div className="space-y-1 text-sm text-secondary-700">
                  <p><strong>Booking ID:</strong> {bookingResult.id}</p>
                  <p><strong>Service:</strong> {selectedService?.name}</p>
                  <p><strong>Date:</strong> {new Date(bookingResult.bookingDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {bookingResult.startTime} - {bookingResult.endTime}</p>
                  <p><strong>Status:</strong> Pending Confirmation</p>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="golden" onClick={handleConfirmationClose} className="w-full">
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default BookingForm;