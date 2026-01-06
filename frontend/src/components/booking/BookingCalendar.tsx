import React, { useState, useMemo } from 'react';
import { Button } from '../ui';
import { cn } from '../../utils/cn';

interface BookingCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  error?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate,
  disabledDates = [],
  error,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calculate max date (default to 3 months from now)
  const defaultMaxDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date;
  }, []);

  const effectiveMaxDate = maxDate || defaultMaxDate;

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // End at the last Saturday of the week containing the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentMonth]);

  // Check if a date is disabled
  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    // Disable dates beyond max date
    if (date > effectiveMaxDate) return true;
    
    // Disable dates before min date
    if (date < minDate) return true;
    
    // Disable weekends (optional - can be configured per service)
    // For now, we'll allow weekends but this could be service-specific
    
    // Disable specifically disabled dates
    return disabledDates.some(disabledDate => 
      date.toDateString() === disabledDate.toDateString()
    );
  };

  // Check if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && 
           date.getFullYear() === currentMonth.getFullYear();
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  // Check if we can navigate to previous month
  const canGoToPrevious = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    prevMonth.setDate(1); // First day of previous month
    return prevMonth >= minDate;
  };

  // Check if we can navigate to next month
  const canGoToNext = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1); // First day of next month
    return nextMonth <= effectiveMaxDate;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="booking-calendar">
      <div className="form-group">
        <label className="label label-required">Select Date</label>
        
        <div className="border border-secondary-200 rounded-lg p-4 bg-white">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goToPreviousMonth}
              disabled={!canGoToPrevious()}
              className="p-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            
            <h3 className="font-semibold text-secondary-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={goToNextMonth}
              disabled={!canGoToNext()}
              className="p-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-secondary-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const disabled = isDateDisabled(date);
              const selected = isSelected(date);
              const today = isToday(date);
              const currentMonthDate = isCurrentMonth(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !disabled && onDateSelect(date)}
                  disabled={disabled}
                  className={cn(
                    'aspect-square flex items-center justify-center text-sm rounded-md transition-colors',
                    'hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                    {
                      // Base styles
                      'text-secondary-900': currentMonthDate && !disabled,
                      'text-secondary-400': !currentMonthDate || disabled,
                      'cursor-not-allowed opacity-50': disabled,
                      'cursor-pointer': !disabled,
                      
                      // Today styling
                      'bg-primary-100 text-primary-900 font-semibold': today && !selected && !disabled,
                      
                      // Selected styling
                      'bg-primary-600 text-white font-semibold': selected && !disabled,
                      'hover:bg-primary-700': selected && !disabled,
                      
                      // Disabled styling
                      'bg-secondary-100 text-secondary-300': disabled,
                      
                      // Hover states
                      'hover:bg-primary-100': !disabled && !selected && currentMonthDate,
                    }
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Calendar Footer */}
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <div className="flex items-center justify-between text-xs text-secondary-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-primary-600 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-primary-100 rounded"></div>
                  <span>Today</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-secondary-100 rounded"></div>
                  <span>Unavailable</span>
                </div>
              </div>
              {selectedDate && (
                <span className="text-secondary-700 font-medium">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <p className="form-error mt-2">{error}</p>
        )}
        
        {!selectedDate && (
          <p className="form-help mt-2">
            Select a date to view available time slots
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;