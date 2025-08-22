import React from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'success',
  onClose
}) => {
  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button className="notification-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};
