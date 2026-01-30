"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ProtectedPage } from '@/components/ProtectedPage';

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

interface Subscriber {
  id: number;
  code: string;
  full_name: string;
  email: string;
  subscription_count?: number;
  type?: string;
}

export default function NotificationsManagementPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'customers'>('users');
  const [users, setUsers] = useState<Subscriber[]>([]);
  const [customers, setCustomers] = useState<Subscriber[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectedCustomers, setSelectedCustomers] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    link: '',
  });

  // Fetch subscribers
  useEffect(() => {
    fetchSubscribers();
  }, [activeTab]);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications/subscribers?type=${activeTab === 'users' ? 'user' : 'customer'}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        if (activeTab === 'users') {
          setUsers(data.data);
        } else {
          setCustomers(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (activeTab === 'users') {
      if (selectedUsers.size === users.length) {
        setSelectedUsers(new Set());
      } else {
        setSelectedUsers(new Set(users.map(u => u.id)));
      }
    } else {
      if (selectedCustomers.size === customers.length) {
        setSelectedCustomers(new Set());
      } else {
        setSelectedCustomers(new Set(customers.map(c => c.id)));
      }
    }
  };

  const handleToggleSelect = (id: number) => {
    if (activeTab === 'users') {
      const newSet = new Set(selectedUsers);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setSelectedUsers(newSet);
    } else {
      const newSet = new Set(selectedCustomers);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setSelectedCustomers(newSet);
    }
  };

  const handleSendNotification = async () => {
    if (!notification.title || !notification.message) {
      alert(language === 'ar' ? 'يرجى ملء العنوان والرسالة' : 'Please fill in title and message');
      return;
    }

    const selectedIds = activeTab === 'users' 
      ? Array.from(selectedUsers)
      : Array.from(selectedCustomers);

    if (selectedIds.length === 0) {
      alert(language === 'ar' ? 'يرجى اختيار مستلم واحد على الأقل' : 'Please select at least one recipient');
      return;
    }

    setSending(true);
    try {
      const recipients = selectedIds.map(id => ({
        type: activeTab === 'users' ? 'user' : 'customer',
        id,
      }));

      const response = await fetch('/api/notifications', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...notification,
          recipients,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(language === 'ar' ? 'تم إرسال الإشعارات بنجاح' : 'Notifications sent successfully');
        setNotification({ title: '', message: '', type: 'info', link: '' });
        setSelectedUsers(new Set());
        setSelectedCustomers(new Set());
      } else {
        alert(data.error || (language === 'ar' ? 'فشل إرسال الإشعارات' : 'Failed to send notifications'));
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء إرسال الإشعارات' : 'Error sending notifications');
    } finally {
      setSending(false);
    }
  };

  const currentList = activeTab === 'users' ? users : customers;
  const selectedCount = activeTab === 'users' ? selectedUsers.size : selectedCustomers.size;
  const isSelected = (id: number) => 
    activeTab === 'users' ? selectedUsers.has(id) : selectedCustomers.has(id);

  return (
    <ProtectedPage permission="notifications.manage">
      <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {language === 'ar' ? 'إرسال الإشعارات' : 'Send Notifications'}
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            {language === 'ar' 
              ? 'إرسال إشعارات للمستخدمين والمشتركين' 
              : 'Send notifications to users and subscribers'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recipients Panel */}
          <div className="bg-[var(--card)] rounded-xl shadow-[var(--shadow)] border border-[var(--card-border)]">
            <div className="p-6 border-b border-[var(--card-border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {language === 'ar' ? 'المستلمون' : 'Recipients'}
              </h2>
              
              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'users'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {language === 'ar' ? 'المستخدمون' : 'Users'} ({users.length})
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'customers'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {language === 'ar' ? 'العملاء' : 'Customers'} ({customers.length})
                </button>
              </div>

              {/* Select All */}
              {currentList.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectedCount === currentList.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[var(--primary)] rounded"
                  />
                  <label htmlFor="select-all" className="text-sm text-[var(--foreground-muted)]">
                    {language === 'ar' ? 'اختيار الكل' : 'Select All'} ({selectedCount} / {currentList.length})
                  </label>
                </div>
              )}
            </div>

            {/* List */}
            <div className="max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-[var(--foreground-muted)]">
                  {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </div>
              ) : currentList.length === 0 ? (
                <div className="p-8 text-center text-[var(--foreground-muted)]">
                  {language === 'ar' 
                    ? 'لا يوجد مشتركون في الإشعارات' 
                    : 'No notification subscribers'}
                </div>
              ) : (
                currentList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelect(item.id)}
                    className="p-4 border-b border-[var(--card-border)] cursor-pointer hover:bg-[var(--background-secondary)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected(item.id)}
                        onChange={() => {}}
                        className="w-4 h-4 text-[var(--primary)] rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-[var(--foreground)]">
                          {item.full_name}
                        </div>
                        <div className="text-sm text-[var(--foreground-muted)]">
                          {item.code} • {item.email}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notification Form */}
          <div className="bg-[var(--card)] rounded-xl shadow-[var(--shadow)] border border-[var(--card-border)] p-6">
            <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              {language === 'ar' ? 'محتوى الإشعار' : 'Notification Content'}
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {language === 'ar' ? 'العنوان' : 'Title'} *
                </label>
                <input
                  type="text"
                  value={notification.title}
                  onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                  className="theme-input w-full"
                  placeholder={language === 'ar' ? 'عنوان الإشعار' : 'Notification title'}
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {language === 'ar' ? 'الرسالة' : 'Message'} *
                </label>
                <textarea
                  value={notification.message}
                  onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                  rows={4}
                  className="theme-input w-full"
                  placeholder={language === 'ar' ? 'محتوى الإشعار' : 'Notification message'}
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {language === 'ar' ? 'النوع' : 'Type'}
                </label>
                <select
                  value={notification.type}
                  onChange={(e) => setNotification({ ...notification, type: e.target.value as any })}
                  className="theme-input w-full"
                >
                  <option value="info">{language === 'ar' ? 'معلومات' : 'Info'}</option>
                  <option value="success">{language === 'ar' ? 'نجاح' : 'Success'}</option>
                  <option value="warning">{language === 'ar' ? 'تحذير' : 'Warning'}</option>
                  <option value="error">{language === 'ar' ? 'خطأ' : 'Error'}</option>
                </select>
              </div>

              {/* Link (Optional) */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {language === 'ar' ? 'الرابط (اختياري)' : 'Link (optional)'}
                </label>
                <input
                  type="text"
                  value={notification.link}
                  onChange={(e) => setNotification({ ...notification, link: e.target.value })}
                  className="theme-input w-full"
                  placeholder="/panel/orders"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendNotification}
                disabled={sending || selectedCount === 0}
                className="theme-btn theme-btn-primary w-full"
              >
                <SendIcon />
                {sending 
                  ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
                  : (language === 'ar' ? `إرسال إلى ${selectedCount} مستلم` : `Send to ${selectedCount} recipient${selectedCount !== 1 ? 's' : ''}`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
