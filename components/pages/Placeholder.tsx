import React from 'react';
import './Placeholder.css';

interface PlaceholderProps {
  taskName: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ taskName }) => {
  return (
    <div className="placeholder-container">
      <h2 className="placeholder-title">{taskName}</h2>
      <p className="placeholder-text">This feature is under construction and will be available soon.</p>
      <div className="placeholder-icon">🚧</div>
    </div>
  );
};

export default Placeholder;
