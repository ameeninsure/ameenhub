'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ProtectedPage } from '@/components/ProtectedPage';
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  Tablet,
  Trash2,
  Activity,
  Shield,
  Clock,
  MapPin,
  Globe,
  Search,
  Filter,
  Download,
} from 'lucide-react';

interface Device {
  id: number;
  device_type: string;
  device_name: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  device_model: string;
  ip_address: string;
  country: string;
  city: string;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
}

interface ActivityLog {
  id: number;
  action: string;
  module: string;
  entity_type: string;
  entity_id: number;
  method: string;
  endpoint: string;
  status_code: number;
  description: string;
  description_ar: string;
  ip_address: string;
  user_agent: string;
  browser: string;
  os: string;
  device_type: string;
  country: string;
  city: string;
  duration_ms: number;
  is_suspicious: boolean;
  risk_level: string;
  created_at: string;
}

interface Session {
  id: number;
  session_token: string;
  device_id: number;
  device_name: string;
  device_type: string;
  device_model: string;
  ip_address: string;
  user_agent: string;
  browser: string;
  os: string;
  country: string;
  city: string;
  is_active: boolean;
  last_activity_at: string;
  expires_at: string;
  created_at: string;
}

interface User {
  id: number;
  code: string;
  full_name: string;
  full_name_ar: string;
  email: string;
  phone: string;
  position: string;
  position_ar: string;
  department: string;
  is_active: boolean;
  created_at: string;
}

const text = {
  en: {
    userDetails: 'User Details',
    back: 'Back',
    overview: 'Overview',
    devices: 'Devices',
    activity: 'Activity Logs',
    sessions: 'Sessions',
    userInfo: 'User Information',
    code: 'Code',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    position: 'Position',
    department: 'Department',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    joinedDate: 'Joined Date',
    noDevices: 'No devices registered',
    noActivity: 'No activity logs found',
    noSessions: 'No active sessions',
    deviceType: 'Device Type',
    deviceName: 'Device Name',
    browser: 'Browser',
    operatingSystem: 'Operating System',
    lastUsed: 'Last Used',
    location: 'Location',
    ipAddress: 'IP Address',
    remove: 'Remove',
    removeDevice: 'Remove Device',
    confirmRemove: 'Are you sure you want to remove this device?',
    action: 'Action',
    module: 'Module',
    description: 'Description',
    timestamp: 'Timestamp',
    duration: 'Duration',
    riskLevel: 'Risk Level',
    suspicious: 'Suspicious',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    desktop: 'Desktop',
    mobile: 'Mobile',
    tablet: 'Tablet',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    terminateSession: 'Terminate',
    sessionInfo: 'Session Information',
    lastActivity: 'Last Activity',
    expiresAt: 'Expires At',
    loading: 'Loading...',
    error: 'Error loading data',
  },
  ar: {
    userDetails: 'تفاصيل المستخدم',
    back: 'رجوع',
    overview: 'نظرة عامة',
    devices: 'الأجهزة',
    activity: 'سجل النشاط',
    sessions: 'الجلسات',
    userInfo: 'معلومات المستخدم',
    code: 'الكود',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    position: 'الوظيفة',
    department: 'القسم',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    joinedDate: 'تاريخ الانضمام',
    noDevices: 'لا توجد أجهزة مسجلة',
    noActivity: 'لا توجد سجلات نشاط',
    noSessions: 'لا توجد جلسات نشطة',
    deviceType: 'نوع الجهاز',
    deviceName: 'اسم الجهاز',
    browser: 'المتصفح',
    operatingSystem: 'نظام التشغيل',
    lastUsed: 'آخر استخدام',
    location: 'الموقع',
    ipAddress: 'عنوان IP',
    remove: 'إزالة',
    removeDevice: 'إزالة الجهاز',
    confirmRemove: 'هل أنت متأكد من إزالة هذا الجهاز؟',
    action: 'الإجراء',
    module: 'الوحدة',
    description: 'الوصف',
    timestamp: 'الوقت',
    duration: 'المدة',
    riskLevel: 'مستوى المخاطر',
    suspicious: 'مشبوه',
    search: 'بحث',
    filter: 'تصفية',
    export: 'تصدير',
    desktop: 'كمبيوتر',
    mobile: 'جوال',
    tablet: 'تابلت',
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالي',
    critical: 'حرج',
    terminateSession: 'إنهاء',
    sessionInfo: 'معلومات الجلسة',
    lastActivity: 'آخر نشاط',
    expiresAt: 'تنتهي في',
    loading: 'جاري التحميل...',
    error: 'خطأ في تحميل البيانات',
  },
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = text[language];
  const isRTL = language === 'ar';

  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'activity' | 'sessions'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  const userId = params.id as string;

  useEffect(() => {
    fetchUserData();
    fetchDevices();
    fetchActivityLogs();
    fetchSessions();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUser(data.data || data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
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

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/activity?limit=100`);
      const data = await response.json();
      if (data.success) {
        setActivityLogs(data.activities);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const fetchSessions = async () => {
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

    try {
      const response = await fetch(`/api/users/${userId}/devices?deviceId=${deviceId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchDevices();
      }
    } catch (error) {
      console.error('Error removing device:', error);
    }
  };

  const handleTerminateSession = async (sessionId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchSessions();
      }
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const getDeviceIcon = (type: string | null | undefined) => {
    if (!type) return <Monitor className="w-5 h-5" />;
    
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
  };

  const filteredActivityLogs = activityLogs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description_ar.includes(searchQuery);
    const matchesAction = !actionFilter || log.action === actionFilter;
    const matchesModule = !moduleFilter || log.module === moduleFilter;
    return matchesSearch && matchesAction && matchesModule;
  });

  if (loading) {
    return (
      <ProtectedPage permission="users.view">
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500 dark:text-gray-400">{t.loading}</div>
        </div>
      </ProtectedPage>
    );
  }

  if (!user) {
    return (
      <ProtectedPage permission="users.view">
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500">{t.error}</div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage permission="users.view">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/panel/users')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? user.full_name_ar : user.full_name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.code}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${
            user.is_active
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {user.is_active ? t.active : t.inactive}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'devices', 'activity', 'sessions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                {t[tab as keyof typeof t]}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                {t.userInfo}
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.code}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.email}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.phone}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.position}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {language === 'ar' ? user.position_ar : user.position}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.department}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t.joinedDate}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {devices.length}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{t.devices}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {activityLogs.length}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">{t.activity}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-md border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {sessions.filter(s => s.is_active).length}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">{t.sessions}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="space-y-4">
            {devices.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t.noDevices}
              </div>
            ) : (
              devices.map((device) => (
                <div
                  key={device.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                        {getDeviceIcon(device.device_type)}
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {device.device_name}
                        </h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              {t.deviceType}:
                            </span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {t[device.device_type as keyof typeof t] || device.device_type}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">{t.browser}:</span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {device.browser} {device.browser_version}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              {t.operatingSystem}:
                            </span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {device.os} {device.os_version}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              {t.ipAddress}:
                            </span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {device.ip_address}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              {t.location}:
                            </span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {device.city}, {device.country}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              {t.lastUsed}:
                            </span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {formatDate(device.last_used_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDevice(device.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                      title={t.remove}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t.action}</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                </select>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">{t.module}</option>
                  <option value="users">Users</option>
                  <option value="customers">Customers</option>
                  <option value="orders">Orders</option>
                  <option value="hr">HR</option>
                  <option value="insurance">Insurance</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  {t.export}
                </button>
              </div>
            </div>

            {/* Activity Logs Table */}
            {filteredActivityLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t.noActivity}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t.timestamp}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t.action}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t.module}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t.description}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t.location}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          {t.riskLevel}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredActivityLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {log.module}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {language === 'ar' ? log.description_ar : log.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {log.city}, {log.country}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Globe className="w-3 h-3" />
                              {log.ip_address}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(
                                log.risk_level
                              )}`}
                            >
                              {t[log.risk_level as keyof typeof t] || log.risk_level}
                            </span>
                            {log.is_suspicious && (
                              <span className="ml-2 text-red-600">
                                <Shield className="w-4 h-4 inline" />
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t.noSessions}
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                        {getDeviceIcon(session.device_type)}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {t.deviceName}:
                          </span>{' '}
                          <span className="text-gray-900 dark:text-white">
                            {session.device_name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t.browser}:</span>{' '}
                          <span className="text-gray-900 dark:text-white">{session.browser}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {t.operatingSystem}:
                          </span>{' '}
                          <span className="text-gray-900 dark:text-white">{session.os}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {t.ipAddress}:
                          </span>{' '}
                          <span className="text-gray-900 dark:text-white">
                            {session.ip_address}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {t.location}:
                          </span>{' '}
                          <span className="text-gray-900 dark:text-white">
                            {session.city}, {session.country}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {t.lastActivity}:
                          </span>{' '}
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(session.last_activity_at)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            {t.expiresAt}:
                          </span>{' '}
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(session.expires_at)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t.status}:</span>{' '}
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              session.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {session.is_active ? t.active : t.inactive}
                          </span>
                        </div>
                      </div>
                    </div>
                    {session.is_active && (
                      <button
                        onClick={() => handleTerminateSession(session.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        {t.terminateSession}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
