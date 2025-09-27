import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 3 }) => {
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-item"></div>
      ))}
    </div>
  );
};
