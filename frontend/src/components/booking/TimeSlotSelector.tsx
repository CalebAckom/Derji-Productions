import React, { useMemo } from 'react';
import { Button, Spinner } from '../ui';
import { cn } from '../../utils/cn';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  serviceTypes?: string[];
}

interface AvailabilityData {
  date: string;
  slots: TimeSlot[];
}

interface TimeSlotSelectorProps {
  date: Date;
  serviceId: string;
  selectedStartTime?: string;
  onTimeSlotSelect: (startTime: string, endTime: string) => void;
  availability: AvailabilityData | null;
  loading: boolean;
  startTimeError?: string;
  endTimeError?: string;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  date,
  serviceId,
  selectedStartTime,
  onTimeSlotSelect,
  availability,
  loading,
  startTimeError,
  endTimeError,
}) => {
  // Generate default time slots if no availability data
  const defaultTimeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      slots.push({
        startTime,
        endTime,
        available: true,
      });
    }
    
    return slots;
  }, []);

  // Use availability data or fall back to default slots
  const timeSlots = availability?.slots || defaultTimeSlots;

  // Filter slots that are available for the selected service
  const availableSlots = useMemo(() => {
    return timeSlots.filter(slot => {
      if (!slot.available) return false;
      
      // If slot has service type restrictions, check if our service is included
      if (slot.serviceTypes && slot.serviceTypes.length > 0) {
        return slot.serviceTypes.includes(serviceId);
      }
      
      // If no service type restrictions, slot is available for all services
      return true;
    });
  }, [timeSlots, serviceId]);

  // Format time for display (12-hour format)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Check if a time slot is selected
  const isSelected = (startTime: string) => {
    return selectedStartTime === startTime;
  };

  // Get time slot duration in minutes
  const getSlotDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  };

  if (loading) {
    return (
      <div className="form-group">
        <label className="label label-required">Select Time</label>
        <div className="border border-secondary-200 rounded-lg p-8 bg-white">
          <div className="flex items-center justify-center">
            <Spinner size="md" />
            <span className="ml-3 text-secondary-600">Loading available times...</span>
          </div>
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="form-group">
        <label className="label label-required">Select Time</label>
        <div className="border border-secondary-200 rounded-lg p-6 bg-white">
          <div className="text-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-secondary-900 mb-2">No Available Times</h4>
            <p className="text-sm text-secondary-600">
              No time slots are available for the selected date and service. Please choose a different date.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      <label className="label label-required">Select Time</label>
      
      <div className="border border-secondary-200 rounded-lg p-4 bg-white">
        <div className="mb-4">
          <p className="text-sm text-secondary-600">
            Available time slots for {date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {availableSlots.map((slot, index) => {
            const selected = isSelected(slot.startTime);
            const duration = getSlotDuration(slot.startTime, slot.endTime);
            
            return (
              <Button
                key={index}
                type="button"
                variant={selected ? 'golden' : 'outline'}
                size="sm"
                onClick={() => onTimeSlotSelect(slot.startTime, slot.endTime)}
                className={cn(
                  'flex flex-col items-center justify-center py-3 px-2 h-auto',
                  'hover:border-primary-300 hover:bg-primary-50',
                  {
                    'border-primary-600 bg-primary-600 text-white': selected,
                    'hover:border-primary-600 hover:bg-primary-600 hover:text-white': selected,
                  }
                )}
              >
                <span className="font-medium">
                  {formatTime(slot.startTime)}
                </span>
                <span className="text-xs opacity-75 mt-1">
                  {duration} min
                </span>
              </Button>
            );
          })}
        </div>

        {/* Selected Time Display */}
        {selectedStartTime && (
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-900">Selected Time:</p>
                <p className="text-sm text-secondary-600">
                  {formatTime(selectedStartTime)} - {
                    availableSlots.find(slot => slot.startTime === selectedStartTime)?.endTime &&
                    formatTime(availableSlots.find(slot => slot.startTime === selectedStartTime)!.endTime)
                  }
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onTimeSlotSelect('', '')}
                className="text-secondary-500 hover:text-secondary-700"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Time Slot Legend */}
        <div className="mt-4 pt-4 border-t border-secondary-200">
          <div className="flex items-center justify-between text-xs text-secondary-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-secondary-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-primary-600 rounded"></div>
                <span>Selected</span>
              </div>
            </div>
            <span>All times shown in local timezone</span>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {(startTimeError || endTimeError) && (
        <div className="mt-2">
          {startTimeError && <p className="form-error">{startTimeError}</p>}
          {endTimeError && <p className="form-error">{endTimeError}</p>}
        </div>
      )}

      {!selectedStartTime && (
        <p className="form-help mt-2">
          Select a time slot to continue with your booking
        </p>
      )}
    </div>
  );
};

export default TimeSlotSelector;