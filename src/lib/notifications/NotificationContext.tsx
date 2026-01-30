"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authenticatedFetch } from '@/lib/auth/AuthContext';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  link?: string;
  sender_id?: number;
  sender_name?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasPermission: boolean;
  isPushEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationIds: number[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  // Check if push is enabled
  useEffect(() => {
    checkPushSubscription();
  }, []);

  const checkPushSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsPushEnabled(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/notifications?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Subscribe to push notifications
  const subscribeToPush = async (): Promise<boolean> => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Push notifications are not supported in this browser');
        return false;
      }

      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID public key
      const response = await authenticatedFetch('/api/notifications/subscribe');
      const data = await response.json();
      
      if (!data.success || !data.data.vapidPublicKey) {
        throw new Error('Failed to get VAPID key');
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.data.vapidPublicKey),
      });

      // Get device information
      const userAgent = navigator.userAgent;
      const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/?([\d.]+)/);
      const browser = browserMatch?.[1] || 'Unknown';
      const browserVersion = browserMatch?.[2] || '';
      
      let os = 'Unknown';
      let deviceType = 'desktop';
      let deviceModel = '';
      
      if (userAgent.includes('Windows')) {
        os = 'Windows';
        const winMatch = userAgent.match(/Windows NT ([\d.]+)/);
        deviceModel = winMatch ? `Windows ${winMatch[1]}` : 'Windows';
      } else if (userAgent.includes('Mac OS X')) {
        os = 'macOS';
        const macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
        deviceModel = macMatch ? `macOS ${macMatch[1].replace(/_/g, '.')}` : 'macOS';
      } else if (userAgent.includes('Linux')) {
        os = 'Linux';
        deviceModel = 'Linux';
      } else if (userAgent.includes('Android')) {
        os = 'Android';
        deviceType = 'mobile';
        const androidMatch = userAgent.match(/Android ([\d.]+)/);
        deviceModel = androidMatch ? `Android ${androidMatch[1]}` : 'Android';
      } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')) {
        os = 'iOS';
        deviceType = userAgent.includes('iPad') ? 'tablet' : 'mobile';
        const iosMatch = userAgent.match(/OS ([\d_]+)/);
        deviceModel = iosMatch ? `iOS ${iosMatch[1].replace(/_/g, '.')}` : 'iOS';
      }
      
      if (userAgent.includes('Mobile') && deviceType === 'desktop') {
        deviceType = 'mobile';
      } else if (userAgent.includes('Tablet')) {
        deviceType = 'tablet';
      }

      // Generate device name
      const deviceName = `${browser} on ${os}`;

      const deviceInfo = {
        deviceType,
        deviceName,
        browser,
        browserVersion,
        os,
        deviceModel,
      };

      // Send subscription to server
      const subscribeResponse = await authenticatedFetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription, deviceInfo }),
      });

      const subscribeData = await subscribeResponse.json();
      
      if (subscribeData.success) {
        setIsPushEnabled(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return false;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPush = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        await authenticatedFetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setIsPushEnabled(false);
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
    }
  };

  // Mark notifications as read
  const markAsRead = async (notificationIds: number[]) => {
    try {
      const response = await authenticatedFetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: notificationIds }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n.id) ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await authenticatedFetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        hasPermission,
        isPushEnabled,
        requestPermission,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        subscribeToPush,
        unsubscribeFromPush,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray as Uint8Array<ArrayBuffer>;
}
