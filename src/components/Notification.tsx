import React, { useState, useEffect } from 'react';
import { CheckCircle, X, ShoppingCart, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface NotificationProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationItem: React.FC<NotificationProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Auto-closing notification:', notification.id);
      onClose(notification.id);
    }, notification.duration || 3000);

    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <ShoppingCart className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    console.log('Manual close triggered for:', notification.id);
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    onClose(notification.id);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    console.log('Backdrop clicked for:', notification.id);
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  return (
    <div 
      className={`${getBgColor()} border rounded-lg p-4 shadow-lg flex items-center justify-between mb-3 animate-slide-in cursor-pointer hover:shadow-xl transition-all relative`}
      onClick={handleBackdropClick}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center space-x-3 flex-1">
        {getIcon()}
        <p className="text-gray-800 font-medium">{notification.message}</p>
      </div>
      <button
        onClick={(e) => {
          console.log('X button clicked for:', notification.id);
          e.stopPropagation();
          e.preventDefault();
          handleClose(e);
        }}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2 p-1 rounded hover:bg-gray-100"
        type="button"
        aria-label="Close notification"
        style={{ pointerEvents: 'auto' }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export class NotificationManager {
  private static listeners: Array<(notifications: Notification[]) => void> = [];
  private static notifications: Notification[] = [];

  static subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static show(type: 'success' | 'error' | 'info', message: string, duration?: number): void {
    const notification: Notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      duration
    };

    this.notifications.push(notification);
    this.notifyListeners();
  }

  static remove(id: string): void {
    console.log('NotificationManager.remove called with id:', id);
    console.log('Current notifications:', this.notifications.map(n => n.id));
    this.notifications = this.notifications.filter(n => n.id !== id);
    console.log('Notifications after removal:', this.notifications.map(n => n.id));
    this.notifyListeners();
  }

  static success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  static error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  static info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }
}

const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = NotificationManager.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  // Debug: Add test button in development
  const handleTestNotification = () => {
    NotificationManager.success('Test notification - click to close!', 10000);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md">
      {/* Debug test button - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={handleTestNotification}
          className="mb-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
        >
          Test Notification
        </button>
      )}
      
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={NotificationManager.remove}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
