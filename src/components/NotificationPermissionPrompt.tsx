"use client";

import { useEffect, useState } from 'react';
import { useNotifications } from '@/lib/notifications/NotificationContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function NotificationPermissionPrompt() {
  const { hasPermission, isPushEnabled, subscribeToPush } = useNotifications();
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if already asked or enabled
    const dismissed = localStorage.getItem('notification_prompt_dismissed');
    const lastAsked = localStorage.getItem('notification_prompt_last_asked');
    const now = Date.now();

    // Don't show if dismissed forever or enabled
    if (dismissed === 'true' || isPushEnabled) {
      return;
    }

    // Don't show if asked in last 7 days
    if (lastAsked && now - parseInt(lastAsked) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Show after 3 seconds
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPushEnabled]);

  const handleEnable = async () => {
    localStorage.setItem('notification_prompt_last_asked', Date.now().toString());
    setShowModal(false);
    
    const success = await subscribeToPush();
    if (!success) {
      alert(
        language === 'ar'
          ? 'فشل تفعيل الإشعارات. يرجى المحاولة مرة أخرى.'
          : 'Failed to enable notifications. Please try again.'
      );
    }
  };

  const handleLater = () => {
    localStorage.setItem('notification_prompt_last_asked', Date.now().toString());
    setShowModal(false);
  };

  const handleNever = () => {
    localStorage.setItem('notification_prompt_dismissed', 'true');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-[var(--card)] rounded-xl shadow-xl max-w-md w-full mx-4 p-6 animate-fadeInUp"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
          </h3>
        </div>

        <p className="text-[var(--foreground-muted)] mb-6">
          {language === 'ar'
            ? 'هل تريد تفعيل الإشعارات الفورية لتلقي التحديثات المهمة والرسائل؟'
            : 'Would you like to enable push notifications to receive important updates and messages?'}
        </p>

        <div className="space-y-2">
          <button
            onClick={handleEnable}
            className="w-full theme-btn theme-btn-primary"
          >
            {language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
          </button>
          
          <button
            onClick={handleLater}
            className="w-full theme-btn theme-btn-secondary"
          >
            {language === 'ar' ? 'ربما لاحقاً' : 'Maybe Later'}
          </button>
          
          <button
            onClick={handleNever}
            className="w-full px-4 py-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            {language === 'ar' ? 'عدم السؤال مرة أخرى' : "Don't ask again"}
          </button>
        </div>
      </div>
    </div>
  );
}
