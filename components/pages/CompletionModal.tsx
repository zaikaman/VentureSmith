import React from 'react';
import './CompletionModal.css';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ isOpen, onClose, onConfirm, title, children, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="completion-modal-overlay" onClick={onClose}>
      <div className="completion-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="completion-modal-title">{title}</h2>
        <div className="completion-modal-message">{children}</div>
        <div className="completion-modal-actions">
          <button onClick={onClose} className="completion-modal-button cancel-button">{cancelText}</button>
          <button onClick={onConfirm} className="completion-modal-button confirm-button">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};
