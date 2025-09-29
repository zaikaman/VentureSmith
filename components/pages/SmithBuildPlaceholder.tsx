import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SmithBuildPlaceholder.css';

export const SmithBuildPlaceholder: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="smith-build-placeholder">
      <div className="placeholder-icon-container">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <h2 className="placeholder-title">Welcome to SmithBuild</h2>
      <p className="placeholder-text">
        This is an experimental feature designed to bring your venture blueprint to life. 
        Our AI will attempt to build a functional prototype based on the context you've generated. 
        Please be aware that this tool is still in active development and may produce unexpected results.
      </p>
      <button className="placeholder-button" onClick={() => navigate('/smith-build')}>
        Proceed to SmithBuild
      </button>
    </div>
  );
};
