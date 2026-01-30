"use client";

import { useState } from 'react';
import { useNotifications } from '@/lib/notifications/NotificationContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

export default function NotificationsInboxPage() {
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();
  const { language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead([notification.id]);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {language === 'ar' ? 'الإشعارات' : 'Notifications'}
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            {language === 'ar' ? 'صندوق الإشعارات الواردة' : 'Your notifications inbox'}
          </p>
        </div>

        {notifications.filter(n => !n.is_read).length > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="theme-btn theme-btn-secondary"
          >
            {language === 'ar' ? 'تعليم الكل كمقروء' : 'Mark all as read'}
          </button>
        )}
      </div>

      <div className="flex-1 bg-[var(--card)] rounded-xl shadow-[var(--shadow)] border border-[var(--card-border)] flex flex-col overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-[var(--card-border)] flex gap-2 flex-shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'} ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {language === 'ar' ? 'غير مقروء' : 'Unread'} ({notifications.filter(n => !n.is_read).length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="p-8 text-center text-[var(--foreground-muted)]">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-[var(--foreground-muted)]">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-lg">
                {language === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 border-b border-[var(--card-border)] cursor-pointer transition-colors hover:bg-[var(--background-secondary)] ${
                  !notification.is_read ? 'bg-[var(--primary-light)]/10' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div className={`${getTypeColor(notification.type)} flex-shrink-0 mt-1`}>
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--foreground)]">
                          {notification.title}
                        </h3>
                        <p className="text-[var(--foreground-muted)] mt-1">
                          {notification.message}
                        </p>
                        {notification.sender_name && (
                          <p className="text-sm text-[var(--foreground-muted)] mt-2">
                            {language === 'ar' ? 'من: ' : 'From: '}{notification.sender_name}
                          </p>
                        )}
                        <p className="text-xs text-[var(--foreground-muted)] mt-2">
                          {new Date(notification.created_at).toLocaleString(
                            language === 'ar' ? 'ar-EG' : 'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {!notification.is_read && (
                        <div className="w-3 h-3 bg-[var(--primary)] rounded-full flex-shrink-0" />
                      )}
                    </div>

                    {/* Link */}
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="inline-block mt-3 text-sm text-[var(--primary)] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {language === 'ar' ? 'عرض التفاصيل →' : 'View details →'}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
