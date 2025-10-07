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
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Only auto-close if duration is specified and not 0
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'info':
        return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
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

  const handleClose = () => {
    if (isClosing) return;
    
    setIsClosing(true);
    
    // Add a small delay for animation
    setTimeout(() => {
      onClose(notification.id);
    }, 150);
  };

  return (
    <div 
      className={`${getBgColor()} border rounded-md p-2 shadow-md flex items-center justify-between mb-2 transition-all duration-300 ${
        isClosing ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
      }`}
    >
      <div className="flex items-center space-x-2 flex-1">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <p className="text-gray-800 font-medium text-sm leading-tight">{notification.message}</p>
      </div>
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2 p-0.5 rounded hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300"
        type="button"
        aria-label="Close notification"
        disabled={isClosing}
      >
        <X className="w-3 h-3" />
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
      duration: duration || (type === 'error' ? 0 : 5000) // Errors don't auto-close by default
    };

    this.notifications.push(notification);
    this.notifyListeners();
  }

  static remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  static clearAll(): void {
    this.notifications = [];
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

  static warning(message: string, duration?: number): void {
    this.show('error', message, duration); // Use error type for warning styling
  }

  static getNotifications(): Notification[] {
    return [...this.notifications];
  }

  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }
}

const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = NotificationManager.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  const handleClearAll = () => {
    NotificationManager.clearAll();
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-md">
      {/* Clear all button - only show if there are notifications */}
      {notifications.length > 0 && (
        <div className="mb-1 flex justify-end">
          <button
            onClick={handleClearAll}
            className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
            title="Clear all notifications"
          >
            Clear All ({notifications.length})
          </button>
        </div>
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
