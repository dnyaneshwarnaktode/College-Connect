import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = '100%', 
  height = '1rem',
  rounded = true 
}) => {
  return (
    <div
      className={`bg-dark-700 animate-pulse ${rounded ? 'rounded' : ''} ${className}`}
      style={{ width, height }}
    />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-dark-800 rounded-xl border border-dark-700 p-6 ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton width={48} height={48} className="rounded-full" />
      <div className="flex-1">
        <Skeleton width="60%" height={20} className="mb-2" />
        <Skeleton width="40%" height={16} />
      </div>
    </div>
    <Skeleton height={16} className="mb-2" />
    <Skeleton height={16} width="80%" />
  </div>
);

// Stats Skeleton
export const StatsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div 
        key={index}
        className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20"
      >
        <div className="flex flex-col items-center text-center">
          <Skeleton width={24} height={24} className="rounded mb-2" />
          <Skeleton width={60} height={24} className="mb-1" />
          <Skeleton width={80} height={12} />
        </div>
      </div>
    ))}
  </div>
);

// Event Card Skeleton
export const EventCardSkeleton: React.FC = () => (
  <div className="bg-dark-800 rounded-xl shadow-sm border border-dark-700 overflow-hidden">
    <Skeleton height={200} className="w-full" />
    <div className="p-6">
      <Skeleton height={24} className="mb-3" />
      <Skeleton height={16} className="mb-2" />
      <Skeleton height={16} width="70%" className="mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton width={80} height={20} className="rounded-full" />
        <Skeleton width={100} height={32} className="rounded-lg" />
      </div>
    </div>
  </div>
);

// Project Card Skeleton
export const ProjectCardSkeleton: React.FC = () => (
  <div className="bg-dark-800 rounded-xl shadow-sm border border-dark-700 overflow-hidden">
    <Skeleton height={200} className="w-full" />
    <div className="p-6">
      <Skeleton height={24} className="mb-3" />
      <Skeleton height={16} className="mb-2" />
      <Skeleton height={16} width="80%" className="mb-4" />
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton width={60} height={20} className="rounded-full" />
        <Skeleton width={80} height={20} className="rounded-full" />
        <Skeleton width={70} height={20} className="rounded-full" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton width={100} height={20} />
        <Skeleton width={80} height={32} className="rounded-lg" />
      </div>
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
    <div className="p-6 border-b border-dark-700">
      <Skeleton height={24} width="30%" />
    </div>
    <div className="p-6">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 mb-4 last:mb-0">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              height={20} 
              width={colIndex === 0 ? '40%' : '20%'} 
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// List Skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 bg-dark-800 rounded-lg border border-dark-700">
        <Skeleton width={40} height={40} className="rounded-full" />
        <div className="flex-1">
          <Skeleton height={20} className="mb-2" />
          <Skeleton height={16} width="60%" />
        </div>
        <Skeleton width={80} height={32} className="rounded-lg" />
      </div>
    ))}
  </div>
);

export default Skeleton;
