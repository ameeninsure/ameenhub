'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  UserCog,
  ArrowLeft,
  Edit,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  FileText,
  Save,
  X,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

type TabType = 'overview' | 'salary' | 'attendance' | 'leaves' | 'performance' | 'commissions' | 'documents';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const employeeId = params?.id;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hr/employees/${employeeId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/hr/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchEmployeeData();
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const t = {
    en: {
      back: 'Back to Employees',
      overview: 'Overview',
      salary: 'Salary & Benefits',
      attendance: 'Attendance',
      leaves: 'Leaves',
      performance: 'Performance',
      commissions: 'Commissions',
      documents: 'Documents',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      employeeInfo: 'Employee Information',
      contactInfo: 'Contact Information',
      employmentInfo: 'Employment Information',
      emergencyContact: 'Emergency Contact',
      employeeCode: 'Employee Code',
      joinDate: 'Join Date',
      department: 'Department',
      jobTitle: 'Job Title',
      employmentType: 'Employment Type',
      status: 'Status',
      email: 'Email',
      phone: 'Phone',
      nationalId: 'National ID',
      passportNumber: 'Passport Number',
      basicSalary: 'Basic Salary',
      allowances: 'Allowances',
      totalSalary: 'Total Salary',
      commissionRate: 'Commission Rate',
      housing: 'Housing Allowance',
      transportation: 'Transportation Allowance',
      food: 'Food Allowance',
      other: 'Other Allowances',
      effectiveDate: 'Effective Date',
      addSalary: 'Add Salary Record',
      sar: 'SAR',
      attendanceRate: 'Attendance Rate',
      totalWorkDays: 'Total Work Days',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      overtime: 'Overtime',
      leaveBalance: 'Leave Balance',
      annualLeave: 'Annual Leave',
      sickLeave: 'Sick Leave',
      emergencyLeave: 'Emergency Leave',
      total: 'Total',
      used: 'Used',
      remaining: 'Remaining',
      requestLeave: 'Request Leave',
      totalCommissions: 'Total Commissions',
      paidCommissions: 'Paid Commissions',
      pendingCommissions: 'Pending Commissions',
      viewAll: 'View All',
    },
    ar: {
      back: 'العودة للموظفين',
      overview: 'نظرة عامة',
      salary: 'الراتب والمزايا',
      attendance: 'الحضور',
      leaves: 'الإجازات',
      performance: 'الأداء',
      commissions: 'العمولات',
      documents: 'المستندات',
      edit: 'تعديل',
      save: 'حفظ',
      cancel: 'إلغاء',
      loading: 'جاري التحميل...',
      employeeInfo: 'معلومات الموظف',
      contactInfo: 'معلومات الاتصال',
      employmentInfo: 'معلومات التوظيف',
      emergencyContact: 'جهة اتصال الطوارئ',
      employeeCode: 'رقم الموظف',
      joinDate: 'تاريخ التعيين',
      department: 'القسم',
      jobTitle: 'المسمى الوظيفي',
      employmentType: 'نوع التوظيف',
      status: 'الحالة',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      nationalId: 'رقم الهوية',
      passportNumber: 'رقم الجواز',
      basicSalary: 'الراتب الأساسي',
      allowances: 'البدلات',
      totalSalary: 'إجمالي الراتب',
      commissionRate: 'نسبة العمولة',
      housing: 'بدل السكن',
      transportation: 'بدل النقل',
      food: 'بدل الطعام',
      other: 'بدلات أخرى',
      effectiveDate: 'تاريخ السريان',
      addSalary: 'إضافة سجل راتب',
      sar: 'ريال',
      attendanceRate: 'نسبة الحضور',
      totalWorkDays: 'إجمالي أيام العمل',
      present: 'حاضر',
      absent: 'غائب',
      late: 'متأخر',
      overtime: 'ساعات إضافية',
      leaveBalance: 'رصيد الإجازات',
      annualLeave: 'الإجازة السنوية',
      sickLeave: 'الإجازة المرضية',
      emergencyLeave: 'إجازة طارئة',
      total: 'المجموع',
      used: 'المستخدم',
      remaining: 'المتبقي',
      requestLeave: 'طلب إجازة',
      totalCommissions: 'إجمالي العمولات',
      paidCommissions: 'العمولات المدفوعة',
      pendingCommissions: 'العمولات المعلقة',
      viewAll: 'عرض الكل',
    },
  };

  const text = t[language];

  const tabs = [
    { id: 'overview', label: text.overview, icon: UserCog },
    { id: 'salary', label: text.salary, icon: DollarSign },
    { id: 'attendance', label: text.attendance, icon: Clock },
    { id: 'leaves', label: text.leaves, icon: Calendar },
    { id: 'performance', label: text.performance, icon: Award },
    { id: 'commissions', label: text.commissions, icon: TrendingUp },
    { id: 'documents', label: text.documents, icon: FileText },
  ];

  if (loading) {
    return (
      <ProtectedPage permission="menu.hr">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{text.loading}</p>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  if (!employee) {
    return (
      <ProtectedPage permission="menu.hr">
        <div className="p-6">
          <p>Employee not found</p>
        </div>
      </ProtectedPage>
    );
  }

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
        <div className="mb-6">
          <button
            onClick={() => router.push('/panel/hr')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            {text.back}
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {language === 'ar' && employee.full_name_ar
                      ? employee.full_name_ar
                      : employee.full_name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {language === 'ar' && employee.job_title_ar
                      ? employee.job_title_ar
                      : employee.job_title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {employee.employee_code}
                  </p>
                </div>
              </div>

              <button
                onClick={() => (editMode ? handleSave() : setEditMode(true))}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg"
              >
                {editMode ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                {editMode ? text.save : text.edit}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-orange-500" />
                  {text.employeeInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {text.employeeCode}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {employee.employee_code}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {text.joinDate}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(employee.join_date).toLocaleDateString(
                        language === 'ar' ? 'ar-SA' : 'en-US'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {text.department}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {language === 'ar' && employee.department_ar
                        ? employee.department_ar
                        : employee.department}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {text.employmentType}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {employee.employment_type}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {text.status}
                    </label>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {employee.employment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {text.contactInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {text.email}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">{employee.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {text.phone}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium" dir="ltr">
                      {employee.phone}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {text.nationalId}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {employee.national_id || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {text.passportNumber}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {employee.passport_number || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  {text.salary}
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  <Plus className="w-4 h-4" />
                  {text.addSalary}
                </button>
              </div>

              {employee.salary_info && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">{text.basicSalary}</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(employee.salary_info.basic_salary)} {text.sar}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">{text.housing}</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {formatCurrency(employee.salary_info.housing_allowance)} {text.sar}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                      {text.transportation}
                    </p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {formatCurrency(employee.salary_info.transportation_allowance)} {text.sar}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                    <p className="text-sm text-orange-600 dark:text-orange-400 mb-1">{text.food}</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {formatCurrency(employee.salary_info.food_allowance)} {text.sar}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">
                      {text.commissionRate}
                    </p>
                    <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                      {employee.salary_info.insurance_commission_rate}%
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">
                      {text.totalSalary}
                    </p>
                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {formatCurrency(employee.salary_info.total_salary)} {text.sar}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                {text.attendance}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Attendance records will be displayed here</p>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-500" />
                {text.leaves}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Leave records will be displayed here</p>
            </div>
          )}

          {activeTab === 'performance' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                {text.performance}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Performance reviews will be displayed here
              </p>
            </div>
          )}

          {activeTab === 'commissions' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                {text.commissions}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Commission records will be displayed here</p>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                {text.documents}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Documents will be displayed here</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}
