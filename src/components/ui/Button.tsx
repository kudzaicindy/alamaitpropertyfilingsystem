import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
};

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
  outline: 'bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
};

const sizes = {
  sm: 'text-xs px-2.5 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-3'
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '',
  disabled = false,
  type = 'button',
  icon
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center rounded-md font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}