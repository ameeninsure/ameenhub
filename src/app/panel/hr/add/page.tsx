'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ProtectedPage } from '@/components/ProtectedPage';
import { ArrowLeft, Save, UserPlus, Search, Plus } from 'lucide-react';
import Link from 'next/link';

const text = {
  en: {
    title: 'Add New Employee',
    subtitle: 'Select a user and define employee information',
    selectUser: 'Select User',
    searchUser: 'Search users...',
    noUsersFound: 'No users found',
    userInfo: 'User Information',
    employeeInfo: 'Employee Information',
    salaryInfo: 'Salary Information',
    employeeCode: 'Employee Code',
    employeeCodePlaceholder: 'e.g., EMP-001',
    department: 'Department',
    departmentAr: 'Department (Arabic)',
    jobTitle: 'Job Title',
    jobTitleAr: 'Job Title (Arabic)',
    employmentType: 'Employment Type',
    fullTime: 'Full-time',
    partTime: 'Part-time',
    contract: 'Contract',
    internship: 'Internship',
    joinDate: 'Join Date',
    basicSalary: 'Basic Salary',
    housingAllowance: 'Housing Allowance',
    transportationAllowance: 'Transportation Allowance',
    foodAllowance: 'Food Allowance',
    commissionRate: 'Insurance Commission Rate (%)',
    cancel: 'Cancel',
    save: 'Save Employee',
    loading: 'Loading...',
    saving: 'Saving...',
    success: 'Employee added successfully',
    error: 'Error adding employee',
    required: 'This field is required',
    email: 'Email',
    phone: 'Phone',
    fullName: 'Full Name',
    alreadyEmployee: 'Already an employee',
    omr: 'OMR',
    commissionSettings: 'Commission Settings',
    productType: 'Insurance Product',
    commissionType: 'Commission Type',
    percentage: 'Percentage',
    fixedAmount: 'Fixed Amount',
    tierSettings: 'Tier Settings',
    addTier: 'Add Tier',
    from: 'From',
    to: 'To',
    rate: 'Rate/Amount',
    actions: 'Actions',
    remove: 'Remove',
    salesTarget: 'Sales Target (OMR)',
    above: 'Above',
    defaultRate: 'Default Commission',
    noTiers: 'No tiers defined',
  },
  ar: {
    title: 'إضافة موظف جديد',
    subtitle: 'اختر مستخدم وحدد معلومات الموظف',
    selectUser: 'اختر المستخدم',
    searchUser: 'البحث عن مستخدمين...',
    noUsersFound: 'لم يتم العثور على مستخدمين',
    userInfo: 'معلومات المستخدم',
    employeeInfo: 'معلومات الموظف',
    salaryInfo: 'معلومات الراتب',
    employeeCode: 'رمز الموظف',
    employeeCodePlaceholder: 'مثال: EMP-001',
    department: 'القسم',
    departmentAr: 'القسم (بالعربية)',
    jobTitle: 'المسمى الوظيفي',
    jobTitleAr: 'المسمى الوظيفي (بالعربية)',
    employmentType: 'نوع التوظيف',
    fullTime: 'دوام كامل',
    partTime: 'دوام جزئي',
    contract: 'عقد',
    internship: 'تدريب',
    joinDate: 'تاريخ الانضمام',
    basicSalary: 'الراتب الأساسي',
    housingAllowance: 'بدل السكن',
    transportationAllowance: 'بدل المواصلات',
    foodAllowance: 'بدل الطعام',
    commissionRate: 'نسبة عمولة التأمين (%)',
    cancel: 'إلغاء',
    save: 'حفظ الموظف',
    loading: 'جاري التحميل...',
    saving: 'جاري الحفظ...',
    success: 'تمت إضافة الموظف بنجاح',
    error: 'خطأ في إضافة الموظف',
    required: 'هذا الحقل مطلوب',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    fullName: 'الاسم الكامل',
    alreadyEmployee: 'موظف بالفعل',
    omr: 'ر.ع',
    commissionSettings: 'إعدادات العمولة',
    productType: 'المنتج التأميني',
    commissionType: 'نوع العمولة',
    percentage: 'نسبة مئوية',
    fixedAmount: 'مبلغ ثابت',
    tierSettings: 'إعدادات الشرائح',
    addTier: 'إضافة شريحة',
    from: 'من',
    to: 'إلى',
    rate: 'النسبة/المبلغ',
    actions: 'الإجراءات',
    remove: 'حذف',
    salesTarget: 'هدف المبيعات (ر.ع)',
    above: 'أعلى من',
    defaultRate: 'العمولة الافتراضية',
    noTiers: 'لم يتم تحديد شرائح',
  },
};

interface User {
  id: string;
  full_name: string;
  full_name_ar: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_employee: boolean;
}

interface CommissionTier {
  id: string;
  from: number;
  to: number | null;
  rate: number;
}

interface CommissionSetting {
  id: string;
  productType: string;
  commissionType: 'percentage' | 'fixed';
  defaultRate: number;
  tiers: CommissionTier[];
}

export default function AddEmployeePage() {
  const { language } = useLanguage();
  const t = text[language];
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    employee_code: '',
    department: '',
    department_ar: '',
    job_title: '',
    job_title_ar: '',
    employment_type: 'full-time',
    join_date: new Date().toISOString().split('T')[0],
    basic_salary: '',
    housing_allowance: '',
    transportation_allowance: '',
    food_allowance: '',
    insurance_commission_rate: '',
  });

  const [commissionSettings, setCommissionSettings] = useState<CommissionSetting[]>([
    {
      id: '1',
      productType: 'motor',
      commissionType: 'percentage',
      defaultRate: 0,
      tiers: [],
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.full_name.toLowerCase().includes(query) ||
            user.full_name_ar?.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users?limit=1000&activeOnly=false');
      if (response.ok) {
        const result = await response.json();
        
        // API returns { success: true, data: [...] }
        const usersList = result.success && Array.isArray(result.data) ? result.data : [];
        
        if (usersList.length === 0) {
          console.warn('No users found');
          setUsers([]);
          setFilteredUsers([]);
          setLoading(false);
          return;
        }
        
        // Get list of existing employees
        const empResponse = await fetch('/api/hr/employees');
        const empData = empResponse.ok ? await empResponse.json() : { employees: [] };
        const employeeUserIds = new Set(
          Array.isArray(empData.employees) 
            ? empData.employees.map((emp: any) => emp.user_id) 
            : []
        );
        
        // Mark users who are already employees
        const usersWithStatus = usersList.map((user: User) => ({
          ...user,
          is_employee: employeeUserIds.has(user.id),
        }));
        
        setUsers(usersWithStatus);
        setFilteredUsers(usersWithStatus);
      } else {
        console.error('Failed to fetch users:', response.status);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const addCommissionProduct = () => {
    const newId = (commissionSettings.length + 1).toString();
    setCommissionSettings([
      ...commissionSettings,
      {
        id: newId,
        productType: 'life',
        commissionType: 'percentage',
        defaultRate: 0,
        tiers: [],
      },
    ]);
  };

  const removeCommissionProduct = (id: string) => {
    setCommissionSettings(commissionSettings.filter((s) => s.id !== id));
  };

  const updateCommissionSetting = (id: string, field: keyof CommissionSetting, value: any) => {
    setCommissionSettings(
      commissionSettings.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const addTier = (settingId: string) => {
    setCommissionSettings(
      commissionSettings.map((s) => {
        if (s.id === settingId) {
          const newTierId = (s.tiers.length + 1).toString();
          return {
            ...s,
            tiers: [
              ...s.tiers,
              {
                id: newTierId,
                from: 0,
                to: null,
                rate: 0,
              },
            ],
          };
        }
        return s;
      })
    );
  };

  const removeTier = (settingId: string, tierId: string) => {
    setCommissionSettings(
      commissionSettings.map((s) => {
        if (s.id === settingId) {
          return {
            ...s,
            tiers: s.tiers.filter((t) => t.id !== tierId),
          };
        }
        return s;
      })
    );
  };

  const updateTier = (
    settingId: string,
    tierId: string,
    field: keyof CommissionTier,
    value: any
  ) => {
    setCommissionSettings(
      commissionSettings.map((s) => {
        if (s.id === settingId) {
          return {
            ...s,
            tiers: s.tiers.map((t) => (t.id === tierId ? { ...t, [field]: value } : t)),
          };
        }
        return s;
      })
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedUserId) {
      newErrors.user_id = t.required;
    }
    if (!formData.employee_code.trim()) {
      newErrors.employee_code = t.required;
    }
    if (!formData.join_date) {
      newErrors.join_date = t.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserId,
          ...formData,
          basic_salary: formData.basic_salary ? parseFloat(formData.basic_salary) : 0,
          housing_allowance: formData.housing_allowance ? parseFloat(formData.housing_allowance) : 0,
          transportation_allowance: formData.transportation_allowance
            ? parseFloat(formData.transportation_allowance)
            : 0,
          food_allowance: formData.food_allowance ? parseFloat(formData.food_allowance) : 0,
          insurance_commission_rate: formData.insurance_commission_rate
            ? parseFloat(formData.insurance_commission_rate)
            : 0,
        }),
      });

      if (response.ok) {
        alert(t.success);
        router.push('/panel/hr');
      } else {
        const data = await response.json();
        alert(data.error || t.error);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      alert(t.error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedPage permission="menu.hr">
      <div className="min-h-screen p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/panel/hr"
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <UserPlus className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mr-14">{t.subtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                {t.selectUser}
              </h2>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder={t.searchUser}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* User List */}
              {loading ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t.loading}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 col-span-2 text-center py-4">
                      {t.noUsersFound}
                    </p>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => !user.is_employee && setSelectedUserId(user.id)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          user.is_employee
                            ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                            : selectedUserId === user.id
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 cursor-pointer'
                            : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-lg">
                              {user.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {language === 'ar' && user.full_name_ar
                                ? user.full_name_ar
                                : user.full_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                            {user.is_employee && (
                              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                {t.alreadyEmployee}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {errors.user_id && (
                <p className="text-red-500 text-sm mt-2">{errors.user_id}</p>
              )}
            </div>

            {/* Selected User Info */}
            {selectedUser && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl shadow-sm border border-orange-200 dark:border-orange-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t.userInfo}
                </h3>
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  {selectedUser.avatar_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={selectedUser.avatar_url}
                        alt={selectedUser.full_name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-orange-300 dark:border-orange-600"
                      />
                    </div>
                  )}
                  
                  {/* User Info */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t.fullName}</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {language === 'ar' && selectedUser.full_name_ar
                          ? selectedUser.full_name_ar
                          : selectedUser.full_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t.email}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t.phone}</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedUser.phone || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Employee Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.employeeInfo}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.employeeCode} *
                  </label>
                  <input
                    type="text"
                    name="employee_code"
                    value={formData.employee_code}
                    onChange={handleInputChange}
                    placeholder={t.employeeCodePlaceholder}
                    className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.employee_code
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.employee_code && (
                    <p className="text-red-500 text-sm mt-1">{errors.employee_code}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.joinDate} *
                  </label>
                  <input
                    type="date"
                    name="join_date"
                    value={formData.join_date}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.join_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.join_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.join_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.department}
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.departmentAr}
                  </label>
                  <input
                    type="text"
                    name="department_ar"
                    value={formData.department_ar}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.jobTitle}
                  </label>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.jobTitleAr}
                  </label>
                  <input
                    type="text"
                    name="job_title_ar"
                    value={formData.job_title_ar}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.employmentType}
                  </label>
                  <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white "
                  >
                    <option value="full-time">{t.fullTime}</option>
                    <option value="part-time">{t.partTime}</option>
                    <option value="contract">{t.contract}</option>
                    <option value="internship">{t.internship}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t.salaryInfo}
              </h2>
              
              {/* Basic Salary & Allowances */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.basicSalary} ({t.omr})
                  </label>
                  <input
                    type="number"
                    name="basic_salary"
                    value={formData.basic_salary}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.housingAllowance} ({t.omr})
                  </label>
                  <input
                    type="number"
                    name="housing_allowance"
                    value={formData.housing_allowance}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.transportationAllowance} ({t.omr})
                  </label>
                  <input
                    type="number"
                    name="transportation_allowance"
                    value={formData.transportation_allowance}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.foodAllowance} ({t.omr})
                  </label>
                  <input
                    type="number"
                    name="food_allowance"
                    value={formData.food_allowance}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Commission Settings */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t.commissionSettings}
                  </h3>
                  <button
                    type="button"
                    onClick={addCommissionProduct}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>

                {commissionSettings.map((setting, index) => (
                  <div
                    key={setting.id}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Product #{index + 1}
                      </h4>
                      {commissionSettings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCommissionProduct(setting.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t.productType}
                        </label>
                        <select
                          value={setting.productType}
                          onChange={(e) =>
                            updateCommissionSetting(setting.id, 'productType', e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="motor">Motor Insurance</option>
                          <option value="life">Life Insurance</option>
                          <option value="health">Health Insurance</option>
                          <option value="property">Property Insurance</option>
                          <option value="marine">Marine Insurance</option>
                          <option value="travel">Travel Insurance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t.commissionType}
                        </label>
                        <select
                          value={setting.commissionType}
                          onChange={(e) =>
                            updateCommissionSetting(
                              setting.id,
                              'commissionType',
                              e.target.value as 'percentage' | 'fixed'
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="percentage">{t.percentage}</option>
                          <option value="fixed">{t.fixedAmount}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t.defaultRate} {setting.commissionType === 'percentage' ? '(%)' : `(${t.omr})`}
                        </label>
                        <input
                          type="number"
                          value={setting.defaultRate}
                          onChange={(e) =>
                            updateCommissionSetting(
                              setting.id,
                              'defaultRate',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          max={setting.commissionType === 'percentage' ? '100' : undefined}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Tiers */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t.tierSettings}
                        </label>
                        <button
                          type="button"
                          onClick={() => addTier(setting.id)}
                          className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          {t.addTier}
                        </button>
                      </div>

                      {setting.tiers.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                          {t.noTiers}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {setting.tiers.map((tier) => (
                            <div
                              key={tier.id}
                              className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700"
                            >
                              <div className="col-span-3">
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                  {t.from} ({t.omr})
                                </label>
                                <input
                                  type="number"
                                  value={tier.from}
                                  onChange={(e) =>
                                    updateTier(
                                      setting.id,
                                      tier.id,
                                      'from',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0"
                                  step="1"
                                  min="0"
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>

                              <div className="col-span-3">
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                  {t.to} ({t.omr})
                                </label>
                                <input
                                  type="number"
                                  value={tier.to || ''}
                                  onChange={(e) =>
                                    updateTier(
                                      setting.id,
                                      tier.id,
                                      'to',
                                      e.target.value ? parseFloat(e.target.value) : null
                                    )
                                  }
                                  placeholder={t.above}
                                  step="1"
                                  min={tier.from}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>

                              <div className="col-span-5">
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                  {t.rate} {setting.commissionType === 'percentage' ? '(%)' : `(${t.omr})`}
                                </label>
                                <input
                                  type="number"
                                  value={tier.rate}
                                  onChange={(e) =>
                                    updateTier(
                                      setting.id,
                                      tier.id,
                                      'rate',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0.00"
                                  step="0.01"
                                  min="0"
                                  max={setting.commissionType === 'percentage' ? '100' : undefined}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                              </div>

                              <div className="col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => removeTier(setting.id, tier.id)}
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <Link
                href="/panel/hr"
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t.cancel}
              </Link>
              <button
                type="submit"
                disabled={saving || !selectedUserId}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? t.saving : t.save}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedPage>
  );
}
