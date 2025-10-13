import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = false,
  textClassName = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden`}>
        <img 
          src="https://img.logo.dev/collaboration.ai?token=pk_OObMwZ4FST-Z1JVUmiKETQ&retina=true" 
          alt="CollegeConnect Logo" 
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <div className={textClassName}>
          <h1 className={`font-semibold text-dark-100 dark:text-dark-100 ${textSizeClasses[size]}`}>
            CollegeConnect
          </h1>
          {size === 'lg' || size === 'xl' ? (
            <p className="text-xs text-dark-400 dark:text-dark-400">Student Platform</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Logo;
