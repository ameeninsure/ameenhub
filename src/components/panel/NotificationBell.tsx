"use client";

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/lib/notifications/NotificationContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

const BellIcon = ({ hasUnread }: { hasUnread: boolean }) => (
  <div className="relative">
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
    {hasUnread && (
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
    )}
  </div>
);

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead([notification.id]);
    }
    setIsOpen(false);
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <BellIcon hasUnread={unreadCount > 0} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-[var(--card)] rounded-xl shadow-lg border border-[var(--card-border)] z-50"
          style={{ [language === 'ar' ? 'left' : 'right']: 0 }}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
            <h3 className="font-semibold text-[var(--foreground)]">
              {language === 'ar' ? 'الإشعارات' : 'Notifications'}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                {language === 'ar' ? 'تعليم الكل كمقروء' : 'Mark all as read'}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-[var(--foreground-muted)]">
                <BellIcon hasUnread={false} />
                <p className="mt-2">
                  {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
                </p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-[var(--card-border)] cursor-pointer transition-colors hover:bg-[var(--background-secondary)] ${
                    !notification.is_read ? 'bg-[var(--primary-light)]/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {!notification.is_read && (
                      <div className="w-2 h-2 mt-2 bg-[var(--primary)] rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[var(--foreground)] text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-[var(--foreground-muted)] mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)] mt-2">
                        {new Date(notification.created_at).toLocaleString(
                          language === 'ar' ? 'ar-EG' : 'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[var(--card-border)]">
            <Link
              href="/panel/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-[var(--primary)] hover:underline font-medium"
            >
              {language === 'ar' ? 'عرض جميع الإشعارات' : 'View all notifications'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
