'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { authenticatedFetch } from '@/lib/auth/AuthContext';
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
  Trash2,
  Layers,
} from 'lucide-react';

type TabType = 'overview' | 'salary' | 'attendance' | 'leaves' | 'performance' | 'documents' | 'commissions';

interface CommissionTier {
  id: number | null;
  tier_order: number;
  from_amount: number;
  to_amount: number | null;
  rate: number;
}

interface CommissionSetting {
  id: number | null;
  product_type: string;
  commission_type: 'percentage' | 'fixed';
  default_rate: number;
  is_active: boolean;
  tiers: CommissionTier[];
}

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
  
  // Commission states
  const [commissionSettings, setCommissionSettings] = useState<CommissionSetting[]>([]);
  const [availableProductTypes, setAvailableProductTypes] = useState<string[]>([]);
  const [commissionLoading, setCommissionLoading] = useState(false);
  const [commissionSaving, setCommissionSaving] = useState(false);
  const [commissionEditMode, setCommissionEditMode] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<string>('');

  // Salary states
  const [salaryEditMode, setSalaryEditMode] = useState(false);
  const [salarySaving, setSalarySaving] = useState(false);
  const [salaryData, setSalaryData] = useState({
    basic_salary: 0,
    housing_allowance: 0,
    transportation_allowance: 0,
    food_allowance: 0,
    other_allowances: 0,
    insurance_commission_rate: 0,
    effective_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId && activeTab === 'salary') {
      fetchCommissionSettings();
    }
  }, [employeeId, activeTab]);

  const fetchCommissionSettings = async () => {
    try {
      setCommissionLoading(true);
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}/commissions`);
      if (response.ok) {
        const data = await response.json();
        setCommissionSettings(data.data.settings || []);
        setAvailableProductTypes(data.data.availableProductTypes || []);
      }
    } catch (error) {
      console.error('Error fetching commission settings:', error);
    } finally {
      setCommissionLoading(false);
    }
  };

  const saveCommissionSettings = async () => {
    try {
      setCommissionSaving(true);
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}/commissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: commissionSettings }),
      });
      if (response.ok) {
        setCommissionEditMode(false);
        await fetchCommissionSettings();
      }
    } catch (error) {
      console.error('Error saving commission settings:', error);
    } finally {
      setCommissionSaving(false);
    }
  };

  const addCommissionSetting = () => {
    // If selectedProductType is set, use it; otherwise add an empty one
    const productType = selectedProductType || '';
    
    if (productType) {
      const exists = commissionSettings.find(s => s.product_type === productType);
      if (exists) {
        setSelectedProductType('');
        return;
      }
    }
    
    setCommissionSettings([
      ...commissionSettings,
      {
        id: null,
        product_type: productType,
        commission_type: 'percentage',
        default_rate: 0,
        is_active: true,
        tiers: [],
      },
    ]);
    setSelectedProductType('');
  };

  const removeCommissionSetting = (index: number) => {
    const newSettings = [...commissionSettings];
    newSettings.splice(index, 1);
    setCommissionSettings(newSettings);
  };

  const updateCommissionSetting = (index: number, field: string, value: any) => {
    const newSettings = [...commissionSettings];
    newSettings[index] = { ...newSettings[index], [field]: value };
    setCommissionSettings(newSettings);
  };

  const addTier = (settingIndex: number) => {
    const newSettings = [...commissionSettings];
    const setting = newSettings[settingIndex];
    const lastTier = setting.tiers[setting.tiers.length - 1];
    const newTier: CommissionTier = {
      id: null,
      tier_order: setting.tiers.length + 1,
      from_amount: lastTier ? (lastTier.to_amount || 0) + 1 : 0,
      to_amount: null,
      rate: 0,
    };
    setting.tiers.push(newTier);
    setCommissionSettings(newSettings);
  };

  const removeTier = (settingIndex: number, tierIndex: number) => {
    const newSettings = [...commissionSettings];
    newSettings[settingIndex].tiers.splice(tierIndex, 1);
    // Reorder tiers
    newSettings[settingIndex].tiers.forEach((t, i) => {
      t.tier_order = i + 1;
    });
    setCommissionSettings(newSettings);
  };

  const updateTier = (settingIndex: number, tierIndex: number, field: string, value: any) => {
    const newSettings = [...commissionSettings];
    newSettings[settingIndex].tiers[tierIndex] = {
      ...newSettings[settingIndex].tiers[tierIndex],
      [field]: value,
    };
    setCommissionSettings(newSettings);
  };

  // Initialize salary data when employee data loads
  useEffect(() => {
    if (employee?.salary_info) {
      setSalaryData({
        basic_salary: employee.salary_info.basic_salary || 0,
        housing_allowance: employee.salary_info.housing_allowance || 0,
        transportation_allowance: employee.salary_info.transportation_allowance || 0,
        food_allowance: employee.salary_info.food_allowance || 0,
        other_allowances: employee.salary_info.other_allowances || 0,
        insurance_commission_rate: employee.salary_info.insurance_commission_rate || 0,
        effective_date: employee.salary_info.effective_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      });
    }
  }, [employee]);

  const saveSalaryData = async () => {
    try {
      setSalarySaving(true);
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}/salary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salaryData),
      });
      if (response.ok) {
        setSalaryEditMode(false);
        await fetchEmployeeData();
      }
    } catch (error) {
      console.error('Error saving salary:', error);
    } finally {
      setSalarySaving(false);
    }
  };

  const calculateTotalSalary = () => {
    return (
      (parseFloat(String(salaryData.basic_salary)) || 0) +
      (parseFloat(String(salaryData.housing_allowance)) || 0) +
      (parseFloat(String(salaryData.transportation_allowance)) || 0) +
      (parseFloat(String(salaryData.food_allowance)) || 0) +
      (parseFloat(String(salaryData.other_allowances)) || 0)
    );
  };

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}`);

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
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      omr: 'OMR',
      editSalary: 'Edit Salary',
      saveSalary: 'Save Salary',
      noSalaryInfo: 'No salary information available. Click "Edit Salary" to add.',
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
      commissionSettings: 'Commission Settings',
      addProductType: 'Add Product Type',
      selectProductType: 'Select Product Type',
      productType: 'Product Type',
      commissionType: 'Commission Type',
      percentage: 'Percentage',
      fixed: 'Fixed Amount',
      defaultRate: 'Default Rate',
      active: 'Active',
      tiers: 'Tiers',
      addTier: 'Add Tier',
      tierFrom: 'From',
      tierTo: 'To',
      tierRate: 'Rate',
      unlimited: 'Unlimited',
      noCommissionSettings: 'No commission settings configured for this employee.',
      saveCommissions: 'Save Commissions',
      editCommissions: 'Edit Commissions',
      cancelEdit: 'Cancel',
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
      omr: 'ر.ع',
      editSalary: 'تعديل الراتب',
      saveSalary: 'حفظ الراتب',
      noSalaryInfo: 'لا توجد معلومات راتب. اضغط "تعديل الراتب" للإضافة.',
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
      commissionSettings: 'إعدادات العمولات',
      addProductType: 'إضافة نوع المنتج',
      selectProductType: 'اختر نوع المنتج',
      productType: 'نوع المنتج',
      commissionType: 'نوع العمولة',
      percentage: 'نسبة مئوية',
      fixed: 'مبلغ ثابت',
      defaultRate: 'النسبة الافتراضية',
      active: 'نشط',
      tiers: 'المستويات',
      addTier: 'إضافة مستوى',
      tierFrom: 'من',
      tierTo: 'إلى',
      tierRate: 'النسبة',
      unlimited: 'غير محدود',
      noCommissionSettings: 'لا توجد إعدادات عمولات لهذا الموظف.',
      saveCommissions: 'حفظ العمولات',
      editCommissions: 'تعديل العمولات',
      cancelEdit: 'إلغاء',
    },
  };

  const text = t[language];

  const tabs = [
    { id: 'overview', label: text.overview, icon: UserCog },
    { id: 'salary', label: text.salary, icon: DollarSign },
    { id: 'attendance', label: text.attendance, icon: Clock },
    { id: 'leaves', label: text.leaves, icon: Calendar },
    { id: 'performance', label: text.performance, icon: Award },
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
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
              {/* Employee Information Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {text.employeeInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.employeeCode}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.employee_code || ''}
                        onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium">{employee.employee_code || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.joinDate}
                    </label>
                    {editMode ? (
                      <input
                        type="date"
                        value={formData.join_date?.split('T')[0] || ''}
                        onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium">
                        {employee.join_date ? new Date(employee.join_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.department}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium">
                        {(language === 'ar' && employee.department_ar ? employee.department_ar : employee.department) || '-'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'القسم (بالإنجليزية)' : 'Department (Arabic)'}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.department_ar || ''}
                        onChange={(e) => setFormData({ ...formData, department_ar: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium">{employee.department_ar || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.jobTitle}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.job_title || ''}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium">
                        {(language === 'ar' && employee.job_title_ar ? employee.job_title_ar : employee.job_title) || '-'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'المسمى الوظيفي (بالإنجليزية)' : 'Job Title (Arabic)'}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.job_title_ar || ''}
                        onChange={(e) => setFormData({ ...formData, job_title_ar: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium">{employee.job_title_ar || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.employmentType}
                    </label>
                    {editMode ? (
                      <select
                        value={formData.employment_type || 'full-time'}
                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="full-time">{language === 'ar' ? 'دوام كامل' : 'Full-time'}</option>
                        <option value="part-time">{language === 'ar' ? 'دوام جزئي' : 'Part-time'}</option>
                        <option value="contract">{language === 'ar' ? 'عقد' : 'Contract'}</option>
                        <option value="internship">{language === 'ar' ? 'تدريب' : 'Internship'}</option>
                      </select>
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium capitalize">{employee.employment_type?.replace('-', ' ') || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.status}
                    </label>
                    {editMode ? (
                      <select
                        value={formData.employment_status || 'active'}
                        onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                        <option value="on-leave">{language === 'ar' ? 'في إجازة' : 'On Leave'}</option>
                        <option value="terminated">{language === 'ar' ? 'منتهي' : 'Terminated'}</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        employee.employment_status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : employee.employment_status === 'on-leave'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {employee.employment_status === 'active' && <CheckCircle className="w-4 h-4" />}
                        {employee.employment_status || '-'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {text.contactInfo}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.email}
                    </label>
                    {editMode ? (
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium">{employee.email || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.phone}
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        dir="ltr"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium" dir="ltr">{employee.phone || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.nationalId}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.national_id || ''}
                        onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium">{employee.national_id || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.passportNumber}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.passport_number || ''}
                        onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium">{employee.passport_number || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {text.emergencyContact}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'الاسم' : 'Name'}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.emergency_contact_name || ''}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium">{employee.emergency_contact_name || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.phone}
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={formData.emergency_contact_phone || ''}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                        dir="ltr"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium" dir="ltr">{employee.emergency_contact_phone || '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'ar' ? 'العلاقة' : 'Relation'}
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={formData.emergency_contact_relation || ''}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="px-4 py-2 text-gray-900 dark:text-white font-medium">{employee.emergency_contact_relation || '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Mode Save/Cancel Buttons */}
              {editMode && (
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setFormData(employee);
                    }}
                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {text.cancel}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {text.save}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'salary' && (
            <div className="space-y-8">
              {/* Salary Information Section */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {language === 'ar' ? 'معلومات الراتب' : 'Salary Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.basicSalary} ({text.omr})
                    </label>
                    <input
                      type="number"
                      value={salaryData.basic_salary}
                      onChange={(e) => setSalaryData({ ...salaryData, basic_salary: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.housing} ({text.omr})
                    </label>
                    <input
                      type="number"
                      value={salaryData.housing_allowance}
                      onChange={(e) => setSalaryData({ ...salaryData, housing_allowance: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.transportation} ({text.omr})
                    </label>
                    <input
                      type="number"
                      value={salaryData.transportation_allowance}
                      onChange={(e) => setSalaryData({ ...salaryData, transportation_allowance: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {text.food} ({text.omr})
                    </label>
                    <input
                      type="number"
                      value={salaryData.food_allowance}
                      onChange={(e) => setSalaryData({ ...salaryData, food_allowance: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Commission Settings Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {text.commissionSettings}
                  </h3>
                  <button
                    type="button"
                    onClick={addCommissionSetting}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
                  </button>
                </div>

                {commissionLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                  </div>
                ) : (
                  commissionSettings.map((setting, settingIndex) => (
                    <div
                      key={settingIndex}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {language === 'ar' ? `المنتج #${settingIndex + 1}` : `Product #${settingIndex + 1}`}
                        </h4>
                        {commissionSettings.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCommissionSetting(settingIndex)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {text.productType}
                          </label>
                          <select
                            value={setting.product_type}
                            onChange={(e) => updateCommissionSetting(settingIndex, 'product_type', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">{text.selectProductType}</option>
                            {availableProductTypes.map((pt) => (
                              <option key={pt} value={pt}>{pt}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {text.commissionType}
                          </label>
                          <select
                            value={setting.commission_type}
                            onChange={(e) => updateCommissionSetting(settingIndex, 'commission_type', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="percentage">{text.percentage}</option>
                            <option value="fixed">{text.fixed}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {text.defaultRate} (%)
                          </label>
                          <input
                            type="number"
                            value={setting.default_rate}
                            onChange={(e) => updateCommissionSetting(settingIndex, 'default_rate', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            step="0.01"
                            min="0"
                            max="100"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Tier Settings */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {text.tiers}
                          </label>
                          <button
                            type="button"
                            onClick={() => addTier(settingIndex)}
                            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            {text.addTier}
                          </button>
                        </div>

                        {setting.tiers.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                            {language === 'ar' ? 'لم يتم تحديد شرائح' : 'No tiers defined'}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {setting.tiers.map((tier, tierIndex) => (
                              <div
                                key={tierIndex}
                                className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700"
                              >
                                <div className="col-span-3">
                                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                    {text.tierFrom} ({text.omr})
                                  </label>
                                  <input
                                    type="number"
                                    value={tier.from_amount}
                                    onChange={(e) => updateTier(settingIndex, tierIndex, 'from_amount', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>

                                <div className="col-span-3">
                                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                    {text.tierTo} ({text.omr})
                                  </label>
                                  <input
                                    type="number"
                                    value={tier.to_amount || ''}
                                    onChange={(e) => updateTier(settingIndex, tierIndex, 'to_amount', e.target.value ? parseFloat(e.target.value) : null)}
                                    placeholder={text.unlimited}
                                    min={tier.from_amount}
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>

                                <div className="col-span-5">
                                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                    {text.tierRate} (%)
                                  </label>
                                  <input
                                    type="number"
                                    value={tier.rate}
                                    onChange={(e) => updateTier(settingIndex, tierIndex, 'rate', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  />
                                </div>

                                <div className="col-span-1 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => removeTier(settingIndex, tierIndex)}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={async () => {
                    await saveSalaryData();
                    await saveCommissionSettings();
                  }}
                  disabled={salarySaving || commissionSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {salarySaving || commissionSaving ? '...' : (language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                </button>
              </div>
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
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {text.commissionSettings}
                </h3>
                <div className="flex items-center gap-2">
                  {commissionEditMode ? (
                    <>
                      <button
                        onClick={() => {
                          setCommissionEditMode(false);
                          fetchCommissionSettings();
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        {text.cancelEdit}
                      </button>
                      <button
                        onClick={saveCommissionSettings}
                        disabled={commissionSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {commissionSaving ? '...' : text.saveCommissions}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setCommissionEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {text.addProductType}
                    </button>
                  )}
                </div>
              </div>

              {/* Commission settings loading */}
              {commissionLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {commissionSettings.map((setting, settingIndex) => (
                    <div
                      key={settingIndex}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                    >
                      {/* Product Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {language === 'ar' ? `المنتج #${settingIndex + 1}` : `Product #${settingIndex + 1}`}
                        </h4>
                        {commissionEditMode && commissionSettings.length > 1 && (
                          <button
                            onClick={() => removeCommissionSetting(settingIndex)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Product Settings Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {text.productType}
                          </label>
                          {commissionEditMode ? (
                            <select
                              value={setting.product_type}
                              onChange={(e) => updateCommissionSetting(settingIndex, 'product_type', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="">{text.selectProductType}</option>
                              {availableProductTypes.map((pt) => (
                                <option key={pt} value={pt}>{pt}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                              {setting.product_type}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {text.commissionType}
                          </label>
                          {commissionEditMode ? (
                            <select
                              value={setting.commission_type}
                              onChange={(e) => updateCommissionSetting(settingIndex, 'commission_type', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="percentage">{text.percentage}</option>
                              <option value="fixed">{text.fixed}</option>
                            </select>
                          ) : (
                            <div className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                              {setting.commission_type === 'percentage' ? text.percentage : text.fixed}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {text.defaultRate} {setting.commission_type === 'percentage' ? '(%)' : `(${text.omr})`}
                          </label>
                          {commissionEditMode ? (
                            <input
                              type="number"
                              value={setting.default_rate}
                              onChange={(e) => updateCommissionSetting(settingIndex, 'default_rate', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              step="0.01"
                              min="0"
                              max={setting.commission_type === 'percentage' ? '100' : undefined}
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          ) : (
                            <div className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                              {setting.default_rate}{setting.commission_type === 'percentage' ? '%' : ` ${text.omr}`}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tier Settings */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {text.tiers}
                          </label>
                          {commissionEditMode && (
                            <button
                              onClick={() => addTier(settingIndex)}
                              className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              {text.addTier}
                            </button>
                          )}
                        </div>

                        {setting.tiers.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                            {text.noCommissionSettings}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {setting.tiers.map((tier, tierIndex) => (
                              <div
                                key={tierIndex}
                                className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700"
                              >
                                <div className="col-span-3">
                                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                    {text.tierFrom} ({text.omr})
                                  </label>
                                  {commissionEditMode ? (
                                    <input
                                      type="number"
                                      value={tier.from_amount}
                                      onChange={(e) => updateTier(settingIndex, tierIndex, 'from_amount', parseFloat(e.target.value) || 0)}
                                      placeholder="0"
                                      step="1"
                                      min="0"
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                  ) : (
                                    <div className="px-2 py-1.5 text-sm text-gray-900 dark:text-white">
                                      {formatCurrency(tier.from_amount)}
                                    </div>
                                  )}
                                </div>

                                <div className="col-span-3">
                                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                    {text.tierTo} ({text.omr})
                                  </label>
                                  {commissionEditMode ? (
                                    <input
                                      type="number"
                                      value={tier.to_amount || ''}
                                      onChange={(e) => updateTier(settingIndex, tierIndex, 'to_amount', e.target.value ? parseFloat(e.target.value) : null)}
                                      placeholder={text.unlimited}
                                      step="1"
                                      min={tier.from_amount}
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                  ) : (
                                    <div className="px-2 py-1.5 text-sm text-gray-900 dark:text-white">
                                      {tier.to_amount ? formatCurrency(tier.to_amount) : text.unlimited}
                                    </div>
                                  )}
                                </div>

                                <div className="col-span-5">
                                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                    {text.tierRate} {setting.commission_type === 'percentage' ? '(%)' : `(${text.omr})`}
                                  </label>
                                  {commissionEditMode ? (
                                    <input
                                      type="number"
                                      value={tier.rate}
                                      onChange={(e) => updateTier(settingIndex, tierIndex, 'rate', parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                      step="0.01"
                                      min="0"
                                      max={setting.commission_type === 'percentage' ? '100' : undefined}
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                  ) : (
                                    <div className="px-2 py-1.5 text-sm text-green-600 dark:text-green-400 font-bold">
                                      {tier.rate}{setting.commission_type === 'percentage' ? '%' : ` ${text.omr}`}
                                    </div>
                                  )}
                                </div>

                                <div className="col-span-1 flex justify-end">
                                  {commissionEditMode && (
                                    <button
                                      onClick={() => removeTier(settingIndex, tierIndex)}
                                      className="text-red-600 hover:text-red-700 dark:text-red-400 p-1"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Product Button when in edit mode and no products */}
                  {commissionEditMode && commissionSettings.length === 0 && (
                    <div className="text-center py-12">
                      <Layers className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400 mb-4">{text.noCommissionSettings}</p>
                    </div>
                  )}

                  {/* Add new product button at bottom */}
                  {commissionEditMode && (
                    <div className="flex justify-center">
                      <select
                        value={selectedProductType}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedProductType(e.target.value);
                            addCommissionSetting();
                          }
                        }}
                        className="px-4 py-2 border border-dashed border-gray-400 dark:border-gray-600 rounded-md bg-transparent text-gray-600 dark:text-gray-400 hover:border-orange-500 hover:text-orange-500 cursor-pointer"
                      >
                        <option value="">+ {text.addProductType}</option>
                        {availableProductTypes
                          .filter(pt => !commissionSettings.find(s => s.product_type === pt))
                          .map((pt) => (
                            <option key={pt} value={pt}>{pt}</option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
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
