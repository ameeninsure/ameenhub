"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { authenticatedFetch } from '@/lib/auth/AuthContext';
import { ProtectedPage } from '@/components/ProtectedPage';

const MessageIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const Avatar = ({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl'
  };

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-medium`}>
      {user.full_name[0]?.toUpperCase()}
    </div>
  );
};

interface User {
  id: number;
  code: string;
  full_name: string;
  email: string;
  position?: string;
  avatar_url?: string;
  type: 'user' | 'customer';
}

export default function MessagingPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'customers'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [message, setMessage] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  // Fetch users and customers
  useEffect(() => {
    fetchUsers();
    fetchCustomers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/users');
      const data = await response.json();
      if (data.success && data.data) {
        setUsers(data.data.map((u: any) => ({ ...u, type: 'user' as const })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await authenticatedFetch('/api/customers');
      const data = await response.json();
      if (data.success && data.data) {
        setCustomers(data.data.map((c: any) => ({ 
          ...c, 
          full_name: c.full_name || c.name || 'Unknown',
          type: 'customer' as const 
        })));
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedRecipient || !message.title || !message.content) {
      alert(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    setSending(true);
    try {
      const response = await authenticatedFetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: message.title,
          message: message.content,
          type: message.type,
          recipients: [{
            type: selectedRecipient.type,
            id: selectedRecipient.id,
          }],
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(language === 'ar' ? 'تم إرسال الرسالة بنجاح' : 'Message sent successfully');
        setMessage({ title: '', content: '', type: 'info' });
      } else {
        alert(data.error || (language === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة' : 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  const currentList = activeTab === 'users' ? users : customers;
  const filteredList = currentList.filter(item =>
    item.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedPage permission="messages.view">
      <div className="h-full flex flex-col overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {language === 'ar' ? 'إرسال رسالة' : 'Send Message'}
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            {language === 'ar' ? 'إرسال رسالة مباشرة للمستخدمين والعملاء' : 'Send direct message to users and customers'}
          </p>
        </div>

        <div className="flex-1 grid lg:grid-cols-3 gap-6 min-h-0 overflow-hidden">
            {/* Recipients List */}
            <div className="lg:col-span-1 bg-[var(--card)] rounded-xl shadow-[var(--shadow)] border border-[var(--card-border)] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-[var(--card-border)] flex-shrink-0">
                <h2 className="font-semibold text-[var(--foreground)] mb-4">
                  {language === 'ar' ? 'اختر المستلم' : 'Select Recipient'}
                </h2>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'users'
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)]'
                    }`}
                  >
                    {language === 'ar' ? 'المستخدمون' : 'Users'} ({users.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('customers')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'customers'
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)]'
                    }`}
                  >
                    {language === 'ar' ? 'العملاء' : 'Customers'} ({customers.length})
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                    className="theme-input w-full pl-10"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
                    <SearchIcon />
                  </span>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-[var(--foreground-muted)]">
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </div>
                ) : filteredList.length === 0 ? (
                  <div className="p-8 text-center text-[var(--foreground-muted)]">
                    {language === 'ar' ? 'لا توجد نتائج' : 'No results'}
                  </div>
                ) : (
                  filteredList.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => setSelectedRecipient(item)}
                      className={`w-full p-4 border-b border-[var(--card-border)] hover:bg-[var(--background-secondary)] transition-colors text-left ${
                        selectedRecipient?.id === item.id && selectedRecipient?.type === item.type
                          ? 'bg-[var(--primary-light)] border-l-4 border-l-[var(--primary)]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar user={item} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[var(--foreground)] truncate">
                            {item.full_name}
                          </div>
                          <div className="text-sm text-[var(--foreground-muted)] truncate">
                            {item.email}
                          </div>
                          {item.position && (
                            <div className="text-xs text-[var(--foreground-muted)]">
                              {item.position}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Message Form */}
            <div className="lg:col-span-2 bg-[var(--card)] rounded-xl shadow-[var(--shadow)] border border-[var(--card-border)] flex flex-col overflow-hidden">
              {selectedRecipient ? (
                <>
                  {/* Selected Recipient Header */}
                  <div className="p-4 border-b border-[var(--card-border)] flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <Avatar user={selectedRecipient} size="md" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--foreground)]">
                          {selectedRecipient.full_name}
                        </h3>
                        <p className="text-sm text-[var(--foreground-muted)]">
                          {selectedRecipient.email} • {selectedRecipient.code}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedRecipient.type === 'user'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {selectedRecipient.type === 'user'
                          ? (language === 'ar' ? 'مستخدم' : 'User')
                          : (language === 'ar' ? 'عميل' : 'Customer')
                        }
                      </span>
                    </div>
                  </div>

                  {/* Message Form */}
                  <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto min-h-0">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                        {language === 'ar' ? 'العنوان' : 'Title'} *
                      </label>
                      <input
                        type="text"
                        value={message.title}
                        onChange={(e) => setMessage({ ...message, title: e.target.value })}
                        className="theme-input w-full"
                        placeholder={language === 'ar' ? 'عنوان الرسالة' : 'Message title'}
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                        {language === 'ar' ? 'النوع' : 'Type'}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 'info', label: language === 'ar' ? 'معلومات' : 'Info', color: 'blue' },
                          { value: 'success', label: language === 'ar' ? 'نجاح' : 'Success', color: 'green' },
                          { value: 'warning', label: language === 'ar' ? 'تحذير' : 'Warning', color: 'yellow' },
                          { value: 'error', label: language === 'ar' ? 'خطأ' : 'Error', color: 'red' },
                        ].map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setMessage({ ...message, type: type.value as any })}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              message.type === type.value
                                ? `bg-${type.color}-500 text-white`
                                : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)]'
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
                        {language === 'ar' ? 'الرسالة' : 'Message'} *
                      </label>
                      <textarea
                        value={message.content}
                        onChange={(e) => setMessage({ ...message, content: e.target.value })}
                        className="theme-input w-full flex-1 resize-none min-h-[200px]"
                        placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                      />
                    </div>
                  </div>

                  {/* Send Button */}
                  <div className="p-4 border-t border-[var(--card-border)] flex-shrink-0">
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !message.title || !message.content}
                      className="theme-btn theme-btn-primary w-full"
                    >
                      <SendIcon />
                      {sending 
                        ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
                        : (language === 'ar' ? 'إرسال الرسالة' : 'Send Message')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center text-[var(--foreground-muted)]">
                    <MessageIcon />
                    <p className="mt-4">
                      {language === 'ar' 
                        ? 'اختر مستلماً من القائمة لإرسال رسالة' 
                        : 'Select a recipient from the list to send a message'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>
    </ProtectedPage>
  );
}
