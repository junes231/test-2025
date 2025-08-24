import React from 'react';
import './Notification.css';

interface NotificationProps {
  show: boolean;
  message: string;
  type: 'info' | 'error' | 'success';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ show, message, type, onClose }) => {
  if (!show) return null;
  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
};
