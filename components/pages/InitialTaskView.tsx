
import React from 'react';
import './InitialTaskView.css';

interface InitialTaskViewProps {
  title: string;
  description: React.ReactNode;
  buttonText: string;
  buttonIcon?: React.ReactNode;
  onAction: () => void;
  disabled?: boolean;
}

export const InitialTaskView: React.FC<InitialTaskViewProps> = ({
  title,
  description,
  buttonText,
  buttonIcon,
  onAction,
  disabled = false,
}) => {
  return (
    <div className="initial-task-view">
      <h2 className="initial-task-title">{title}</h2>
      <p className="initial-task-description">{description}</p>
      <div className="initial-task-action">
        <button onClick={onAction} className="cta-button" disabled={disabled}>
          {buttonIcon && <span className="icon">{buttonIcon}</span>}
          {buttonText}
        </button>
      </div>
    </div>
  );
};
