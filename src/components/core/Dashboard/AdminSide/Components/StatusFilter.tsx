'use client';

import React from 'react';

export interface StatusFilterOption<T = string> {
  label: string;
  value: T;
  color: string; // e.g., 'primary', 'warning', 'info', 'success', 'error'
}

interface StatusFilterProps<T = string> {
  options: StatusFilterOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
  className?: string;
}

export const StatusFilter = <T = string,>({
  options,
  selectedValue,
  onChange,
  className = '',
}: StatusFilterProps<T>) => {
  const getButtonStyles = (color: string, isSelected: boolean) => {
    if (isSelected) {
      switch (color) {
        case 'primary':
          return 'bg-primary text-white';
        case 'warning':
          return 'bg-warning text-white';
        case 'info':
          return 'bg-info text-white';
        case 'success':
          return 'bg-success text-white';
        case 'error':
          return 'bg-error text-white';
        default:
          return 'bg-primary text-white';
      }
    }
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;
        return (
          <button
            key={String(option.value)}
            onClick={() => onChange(option.value)}
            className={`px-3 py-2 rounded-md font-medium transition-colors duration-200 text-sm whitespace-nowrap ${getButtonStyles(
              option.color,
              isSelected,
            )} min-w-0 flex-shrink-0`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
