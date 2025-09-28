import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 3 }) => {
  return (
    <ul className="ventures-list"> 
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="skeleton-item"></li>
      ))}
    </ul>
  );
};
