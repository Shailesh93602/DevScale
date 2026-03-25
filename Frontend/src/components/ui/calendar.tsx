'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export interface CalendarProps {
  className?: string;
  selected?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  showPopperArrow?: boolean;
  placeholderText?: string;
}

export function Calendar({
  className,
  selected,
  onChange,
  minDate,
  maxDate,
  showPopperArrow = false,
  placeholderText = 'Select date',
}: CalendarProps) {
  return (
    <div className={cn('p-3', className)}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        showPopperArrow={showPopperArrow}
        placeholderText={placeholderText}
        className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        calendarClassName="bg-white dark:bg-gray-900"
        dayClassName={() => 'text-center'}
        renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={decreaseMonth}
              className={buttonVariants({ variant: 'outline' })}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium">
              {date.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <button
              type="button"
              onClick={increaseMonth}
              className={buttonVariants({ variant: 'outline' })}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}

Calendar.displayName = 'Calendar';
