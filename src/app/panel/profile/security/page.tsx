'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ProtectedPage } from '@/components/ProtectedPage';
import {
  Smartphone,
  Monitor,
  Tablet,
  Trash2,
  Shield,
  MapPin,
  Globe,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface Device {
  id: number;
  device_type: string;
  device_name: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  ip_address: string;
  country: string;
  city: string;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
}

interface Session {
  id: number;
  session_token: string;
  device_id: number;
  device_name: string;
  device_type: string;
  ip_address: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  is_active: boolean;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

const text = {
  en: {
    title: 'Security & Devices',
    devices: 'My Devices',
    sessions: 'Active Sessions',
    noDevices: 'No devices registered',
    noSessions: 'No active sessions',
    deviceType: 'Type',
    deviceName: 'Device',
    browser: 'Browser',
    os: 'Operating System',
    lastUsed: 'Last Used',
    location: 'Location',
    ipAddress: 'IP Address',
    remove: 'Remove',
    terminate: 'Terminate',
    thisDevice: 'This Device',
    lastActivity: 'Last Activity',
    expiresAt: 'Expires',
    createdAt: 'Created',
    confirmRemove: 'Are you sure you want to remove this device? You will need to re-register it to receive notifications.',
    confirmTerminate: 'Are you sure you want to terminate this session? You will be logged out on that device.',
    desktop: 'Desktop',
    mobile: 'Mobile',
    tablet: 'Tablet',
    loading: 'Loading...',
    currentSession: 'Current Session',
  },
  ar: {
    title: 'الأمان والأجهزة',
    devices: 'أجهزتي',
    sessions: 'الجلسات النشطة',
    noDevices: 'لا توجد أجهزة مسجلة',
    noSessions: 'لا توجد جلسات نشطة',
    deviceType: 'النوع',
    deviceName: 'الجهاز',
    browser: 'المتصفح',
    os: 'نظام التشغيل',
    lastUsed: 'آخر استخدام',
    location: 'الموقع',
    ipAddress: 'عنوان IP',
    remove: 'إزالة',
    terminate: 'إنهاء',
    thisDevice: 'هذا الجهاز',
    lastActivity: 'آخر نشاط',
    expiresAt: 'تنتهي',
    createdAt: 'أُنشئت',
    confirmRemove: 'هل أنت متأكد من إزالة هذا الجهاز؟ ستحتاج إلى إعادة تسجيله لتلقي الإشعارات.',
    confirmTerminate: 'هل أنت متأكد من إنهاء هذه الجلسة؟ سيتم تسجيل خروجك من ذلك الجهاز.',
    desktop: 'كمبيوتر',
    mobile: 'جوال',
    tablet: 'تابلت',
    loading: 'جاري التحميل...',
    currentSession: 'الجلسة الحالية',
  },
};

export default function SecurityDevicesPage() {
  const { language } = useLanguage();
  const t = text[language];
  const [devices, setDevices] = useState<Device[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchData();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.data);
        fetchDevices(data.data.id);
        fetchSessions(data.data.id);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const userResponse = await fetch('/api/auth/me');
      const userData = await userResponse.json();
      if (userData.success) {
        const userId = userData.data.id;
        await Promise.all([fetchDevices(userId), fetchSessions(userId)]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/devices`);
      const data = await response.json();
      if (data.success) {
        setDevices(data.devices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchSessions = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/sessions`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleRemoveDevice = async (deviceId: number) => {
    if (!confirm(t.confirmRemove)) return;
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/users/${currentUser.id}/devices?deviceId=${deviceId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchDevices(currentUser.id);
      }
    } catch (error) {
      console.error('Error removing device:', error);
    }
  };

  const handleTerminateSession = async (sessionId: number) => {
    if (!confirm(t.confirmTerminate)) return;
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/users/${currentUser.id}/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchSessions(currentUser.id);
      }
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
  };

  if (loading) {
    return (
      <ProtectedPage>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500 dark:text-gray-400">{t.loading}</div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          </div>
        </div>

        {/* Devices Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            {t.devices}
          </h2>
          {devices.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-md border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
              {t.noDevices}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-md text-blue-600 dark:text-blue-400">
                        {getDeviceIcon(device.device_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {device.device_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t[device.device_type as keyof typeof t] || device.device_type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDevice(device.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      title={t.remove}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Globe className="w-4 h-4" />
                      <span>
                        {device.browser} {device.browser_version}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Monitor className="w-4 h-4" />
                      <span>
                        {device.os} {device.os_version}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {device.city}, {device.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <span className="text-gray-500 dark:text-gray-400">{t.ipAddress}:</span>
                      <span className="font-mono text-xs">{device.ip_address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">{formatDate(device.last_used_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sessions Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t.sessions}
          </h2>
          {sessions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-md border border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
              {t.noSessions}
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-md text-green-600 dark:text-green-400">
                        {getDeviceIcon(session.device_type)}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {session.device_name || `${session.browser} on ${session.os}`}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Globe className="w-4 h-4" />
                            <span>{session.browser}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Monitor className="w-4 h-4" />
                            <span>{session.os}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {session.city}, {session.country}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <span className="text-gray-500 dark:text-gray-400">{t.ipAddress}:</span>
                            <span className="font-mono text-xs">{session.ip_address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">
                              {t.lastActivity}: {formatDate(session.last_activity_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs">
                              {t.expiresAt}: {formatDate(session.expires_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {session.is_active && (
                      <button
                        onClick={() => handleTerminateSession(session.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm transition-colors"
                      >
                        {t.terminate}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
