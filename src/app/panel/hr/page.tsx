'use client';

import { useState, useEffect } from 'react';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { authenticatedFetch } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import {
  UserCog,
  Search,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface HREmployee {
  id: number;
  user_id: number;
  employee_code: string;
  full_name: string;
  full_name_ar: string;
  email: string;
  phone: string;
  avatar_url: string;
  department: string;
  department_ar: string;
  job_title: string;
  job_title_ar: string;
  employment_type: string;
  employment_status: string;
  join_date: string;
  current_salary: number;
  commission_rate: number;
  total_commissions: number;
  leave_balance: number;
  attendance_rate: number;
}

interface HRStats {
  total_employees: number;
  active_employees: number;
  on_leave: number;
  total_payroll: number;
  pending_leaves: number;
  avg_attendance: number;
}

export default function HRPage() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [employees, setEmployees] = useState<HREmployee[]>([]);
  const [stats, setStats] = useState<HRStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterDepartment, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterDepartment !== 'all') params.append('department', filterDepartment);
      if (searchTerm) params.append('search', searchTerm);

      const [employeesRes, statsRes] = await Promise.all([
        authenticatedFetch(`/api/hr/employees?${params}`),
        authenticatedFetch('/api/hr/stats'),
      ]);

      if (employeesRes.ok) {
        const data = await employeesRes.json();
        setEmployees(data.employees || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching HR data:', error);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    en: {
      title: 'Human Resources',
      subtitle: 'Manage employees, salaries, attendance, and performance',
      search: 'Search employees...',
      addEmployee: 'Add Employee',
      totalEmployees: 'Total Employees',
      activeEmployees: 'Active',
      onLeave: 'On Leave',
      totalPayroll: 'Total Payroll',
      pendingLeaves: 'Pending Leaves',
      avgAttendance: 'Avg Attendance',
      filterStatus: 'Filter by Status',
      filterDepartment: 'Filter by Department',
      all: 'All',
      active: 'Active',
      onLeaveStatus: 'On Leave',
      suspended: 'Suspended',
      terminated: 'Terminated',
      employeeCode: 'Employee Code',
      name: 'Name',
      department: 'Department',
      jobTitle: 'Job Title',
      commission: 'Commission',
      status: 'Status',
      actions: 'Actions',
      viewDetails: 'View Details',
      noEmployees: 'No employees found',
      loading: 'Loading...',
      omr: 'OMR',
    },
    ar: {
      title: 'الموارد البشرية',
      subtitle: 'إدارة الموظفين والرواتب والحضور والأداء',
      search: 'البحث عن موظف...',
      addEmployee: 'إضافة موظف',
      totalEmployees: 'إجمالي الموظفين',
      activeEmployees: 'نشط',
      onLeave: 'في إجازة',
      totalPayroll: 'إجمالي الرواتب',
      pendingLeaves: 'الإجازات المعلقة',
      avgAttendance: 'متوسط الحضور',
      filterStatus: 'تصفية حسب الحالة',
      filterDepartment: 'تصفية حسب القسم',
      all: 'الكل',
      active: 'نشط',
      onLeaveStatus: 'في إجازة',
      suspended: 'معلق',
      terminated: 'منتهي',
      employeeCode: 'رقم الموظف',
      name: 'الاسم',
      department: 'القسم',
      jobTitle: 'المسمى الوظيفي',
      commission: 'العمولة',
      status: 'الحالة',
      actions: 'الإجراءات',
      viewDetails: 'عرض التفاصيل',
      noEmployees: 'لا يوجد موظفون',
      loading: 'جاري التحميل...',
      omr: 'ر.ع',
    },
  };

  const text = t[language];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'suspended':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ProtectedPage permission="menu.hr">
      <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <UserCog className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{text.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">{text.subtitle}</p>
              </div>
            </div>
            <Link
              href="/panel/hr/add"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              {text.addEmployee}
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-500" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.total_employees}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{text.totalEmployees}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.active_employees}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{text.activeEmployees}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-yellow-500" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.on_leave}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{text.onLeave}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-orange-500" />
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.pending_leaves}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{text.pendingLeaves}</p>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={text.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">{text.all}</option>
                <option value="active">{text.active}</option>
                <option value="on-leave">{text.onLeaveStatus}</option>
                <option value="suspended">{text.suspended}</option>
                <option value="terminated">{text.terminated}</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">{text.all}</option>
                <option value="sales">{language === 'ar' ? 'المبيعات' : 'Sales'}</option>
                <option value="operations">{language === 'ar' ? 'العمليات' : 'Operations'}</option>
                <option value="customer-service">{language === 'ar' ? 'خدمة العملاء' : 'Customer Service'}</option>
                <option value="it">{language === 'ar' ? 'تقنية المعلومات' : 'IT'}</option>
                <option value="hr">{language === 'ar' ? 'الموارد البشرية' : 'HR'}</option>
                <option value="finance">{language === 'ar' ? 'المالية' : 'Finance'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">{text.loading}</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{text.noEmployees}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {text.employeeCode}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {text.name}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {text.department}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {text.jobTitle}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {text.commission}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {text.status}
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {text.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {employee.employee_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                            {employee.avatar_url ? (
                              <img
                                src={employee.avatar_url}
                                alt={employee.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{employee.full_name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {language === 'ar' && employee.full_name_ar
                                ? employee.full_name_ar
                                : employee.full_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {language === 'ar' && employee.department_ar
                            ? employee.department_ar
                            : employee.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {language === 'ar' && employee.job_title_ar
                            ? employee.job_title_ar
                            : employee.job_title}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {employee.commission_rate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            employee.employment_status
                          )}`}
                        >
                          {text[employee.employment_status as keyof typeof text] || employee.employment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                          href={`/panel/hr/${employee.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          {text.viewDetails}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
