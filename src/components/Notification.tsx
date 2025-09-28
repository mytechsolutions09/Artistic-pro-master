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

  return (
    <div className={`${getBgColor()} border rounded-lg p-4 shadow-lg flex items-center justify-between mb-3 animate-slide-in`}>
      <div className="flex items-center space-x-3">
        {getIcon()}
        <p className="text-gray-800 font-medium">{notification.message}</p>
      </div>
      <button
        onClick={() => onClose(notification.id)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
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
    this.notifications = this.notifications.filter(n => n.id !== id);
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

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
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
