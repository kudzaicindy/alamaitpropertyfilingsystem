import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  );
}

type CardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

type CardFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-6 py-3 bg-gray-50 ${className}`}>
      {children}
    </div>
  );
}