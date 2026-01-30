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
  Download,
  Eye,
  Star,
  Upload,
} from 'lucide-react';

type TabType = 'overview' | 'salary' | 'attendance' | 'leaves' | 'performance' | 'documents';

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

interface AttendanceRecord {
  id: number;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  work_hours: number | null;
  status: string;
  is_overtime: boolean;
  overtime_hours: number;
  notes: string | null;
}

interface LeaveRecord {
  id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: string;
  approval_notes: string | null;
  approval_date: string | null;
  approved_by_name: string | null;
}

interface LeaveBalance {
  annual_leave_total: number;
  annual_leave_used: number;
  annual_leave_remaining: number;
  sick_leave_total: number;
  sick_leave_used: number;
  sick_leave_remaining: number;
  emergency_leave_total: number;
  emergency_leave_used: number;
  emergency_leave_remaining: number;
}

interface PerformanceReview {
  id: number;
  review_date: string;
  review_period_start: string;
  review_period_end: string;
  overall_rating: number | null;
  strengths: string | null;
  areas_for_improvement: string | null;
  goals: string | null;
  achievements: string | null;
  comments: string | null;
  status: string;
  acknowledged_date: string | null;
  reviewer_name: string | null;
}

interface Document {
  id: number;
  document_type: string;
  document_name: string;
  file_url: string;
  issue_date: string | null;
  expiry_date: string | null;
  notes: string | null;
  created_at: string;
  uploaded_by_name: string | null;
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

  // Attendance states
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [editingAttendanceId, setEditingAttendanceId] = useState<number | null>(null);
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    check_in_time: '',
    check_out_time: '',
    status: 'present',
    notes: '',
  });

  // Helper function to format hours to hours and minutes
  const formatWorkHours = (hours: number | null | string): string => {
    if (hours === null || hours === undefined) return '-';
    const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    if (isNaN(numHours)) return '-';
    const h = Math.floor(numHours);
    const m = Math.round((numHours - h) * 60);
    if (h === 0 && m === 0) return '0m';
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Leaves states
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [leavesLoading, setLeavesLoading] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: '',
  });

  // Performance states
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [performanceSummary, setPerformanceSummary] = useState<any>({});
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [performanceForm, setPerformanceForm] = useState({
    review_date: new Date().toISOString().split('T')[0],
    review_period_start: '',
    review_period_end: '',
    overall_rating: 3,
    strengths: '',
    areas_for_improvement: '',
    goals: '',
    achievements: '',
    comments: '',
  });

  // Documents states
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentForm, setDocumentForm] = useState({
    document_type: 'contract',
    document_name: '',
    file_url: '',
    issue_date: '',
    expiry_date: '',
    notes: '',
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

  useEffect(() => {
    if (employeeId && activeTab === 'attendance') {
      fetchAttendance();
    }
  }, [employeeId, activeTab]);

  useEffect(() => {
    if (employeeId && activeTab === 'leaves') {
      fetchLeaves();
    }
  }, [employeeId, activeTab]);

  useEffect(() => {
    if (employeeId && activeTab === 'performance') {
      fetchPerformance();
    }
  }, [employeeId, activeTab]);

  useEffect(() => {
    if (employeeId && activeTab === 'documents') {
      fetchDocuments();
    }
  }, [employeeId, activeTab]);

  // Fetch Attendance
  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true);
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}/attendance`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.data.records || []);
        setAttendanceStats(data.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const saveAttendance = async () => {
    // Validation
    if (!attendanceForm.date) {
      alert(language === 'ar' ? 'يرجى اختيار التاريخ' : 'Please select a date');
      return;
    }
    
    if (attendanceForm.check_in_time && attendanceForm.check_out_time) {
      if (attendanceForm.check_out_time <= attendanceForm.check_in_time) {
        alert(language === 'ar' ? 'وقت الخروج يجب أن يكون بعد وقت الدخول' : 'Check-out time must be after check-in time');
        return;
      }
    }

    try {
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceForm),
      });
      if (response.ok) {
        setShowAttendanceModal(false);
        setEditingAttendanceId(null);
        setAttendanceForm({
          date: new Date().toISOString().split('T')[0],
          check_in_time: '',
          check_out_time: '',
          status: 'present',
          notes: '',
        });
        await fetchAttendance();
      } else {
        const error = await response.json();
        alert(error.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  };

  // Fetch Leaves
  const fetchLeaves = async () => {
    try {
      setLeavesLoading(true);
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}/leaves`);
      if (response.ok) {
        const data = await response.json();
        setLeaveRecords(data.data.leaves || []);
        setLeaveBalance(data.data.balance || null);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLeavesLoading(false);
    }
  };

  const saveLeave = async () => {
    try {
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveForm),
      });
      if (response.ok) {
        setShowLeaveModal(false);
        setLeaveForm({ leave_type: 'annual', start_date: '', end_date: '', reason: '' });
        await fetchLeaves();
      }
    } catch (error) {
      console.error('Error saving leave:', error);
    }
  };

  const updateLeaveStatus = async (leaveId: number, status: string) => {
    try {
      await authenticatedFetch(`/api/hr/employees/${employeeId}/leaves`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leave_id: leaveId, status }),
      });
      await fetchLeaves();
    } catch (error) {
      console.error('Error updating leave:', error);
    }
  };

  // Fetch Performance
  const fetchPerformance = async () => {
    try {
      setPerformanceLoading(true);
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}/performance`);
      if (response.ok) {
        const data = await response.json();
        setPerformanceReviews(data.data.reviews || []);
        setPerformanceSummary(data.data.summary || {});
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const savePerformance = async () => {
    try {
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...performanceForm, status: 'completed' }),
      });
      if (response.ok) {
        setShowPerformanceModal(false);
        setPerformanceForm({
          review_date: new Date().toISOString().split('T')[0],
          review_period_start: '',
          review_period_end: '',
          overall_rating: 3,
          strengths: '',
          areas_for_improvement: '',
          goals: '',
          achievements: '',
          comments: '',
        });
        await fetchPerformance();
      }
    } catch (error) {
      console.error('Error saving performance review:', error);
    }
  };

  // Fetch Documents
  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const saveDocument = async () => {
    try {
      setDocumentUploading(true);
      let fileUrl = documentForm.file_url;

      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', 'hr-document');

        const uploadResponse = await authenticatedFetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrl = uploadData.url;
        } else {
          throw new Error('File upload failed');
        }
      }

      if (!fileUrl) {
        alert(language === 'ar' ? 'يرجى اختيار ملف للرفع' : 'Please select a file to upload');
        setDocumentUploading(false);
        return;
      }

      const response = await authenticatedFetch(`/api/hr/employees/${employeeId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...documentForm, file_url: fileUrl }),
      });
      if (response.ok) {
        setShowDocumentModal(false);
        setSelectedFile(null);
        setDocumentForm({
          document_type: 'contract',
          document_name: '',
          file_url: '',
          issue_date: '',
          expiry_date: '',
          notes: '',
        });
        await fetchDocuments();
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء رفع المستند' : 'Error uploading document');
    } finally {
      setDocumentUploading(false);
    }
  };

  const deleteDocument = async (documentId: number) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المستند؟' : 'Are you sure you want to delete this document?')) {
      return;
    }
    try {
      await authenticatedFetch(`/api/hr/employees/${employeeId}/documents`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document_id: documentId }),
      });
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

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
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {text.attendance}
                </h3>
                <button
                  onClick={() => {
                    setEditingAttendanceId(null);
                    setAttendanceForm({
                      date: new Date().toISOString().split('T')[0],
                      check_in_time: '',
                      check_out_time: '',
                      status: 'present',
                      notes: '',
                    });
                    setShowAttendanceModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'ar' ? 'تسجيل حضور' : 'Record Attendance'}
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">{text.present}</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">{attendanceStats.present_days || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-red-600 dark:text-red-400">{text.absent}</p>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">{attendanceStats.absent_days || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">{text.late}</p>
                      <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{attendanceStats.late_days || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{text.overtime}</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{attendanceStats.total_overtime_hours || 0}h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{language === 'ar' ? 'لا توجد سجلات حضور' : 'No attendance records found'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {language === 'ar' ? 'التاريخ' : 'Date'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {language === 'ar' ? 'الدخول' : 'Check In'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {language === 'ar' ? 'الخروج' : 'Check Out'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {language === 'ar' ? 'ساعات العمل' : 'Work Hours'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {language === 'ar' ? 'الحالة' : 'Status'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {language === 'ar' ? 'العمليات' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {attendanceRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {new Date(record.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {formatWorkHours(record.work_hours)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              record.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              record.status === 'absent' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              record.status === 'late' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {record.status === 'present' ? (language === 'ar' ? 'حاضر' : 'Present') :
                               record.status === 'absent' ? (language === 'ar' ? 'غائب' : 'Absent') :
                               record.status === 'late' ? (language === 'ar' ? 'متأخر' : 'Late') :
                               record.status === 'on-leave' ? (language === 'ar' ? 'إجازة' : 'On Leave') : record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setEditingAttendanceId(record.id);
                                const checkIn = record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                                const checkOut = record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
                                // Format date properly - handle both ISO and date-only formats
                                const dateStr = typeof record.date === 'string' 
                                  ? (record.date.includes('T') ? record.date.split('T')[0] : record.date.substring(0, 10))
                                  : new Date(record.date).toISOString().split('T')[0];
                                setAttendanceForm({
                                  date: dateStr,
                                  check_in_time: checkIn,
                                  check_out_time: checkOut,
                                  status: record.status,
                                  notes: record.notes || '',
                                });
                                setShowAttendanceModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title={language === 'ar' ? 'تعديل' : 'Edit'}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Attendance Modal */}
              {showAttendanceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {editingAttendanceId 
                        ? (language === 'ar' ? 'تعديل سجل الحضور' : 'Edit Attendance Record')
                        : (language === 'ar' ? 'تسجيل حضور جديد' : 'Record New Attendance')}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'التاريخ' : 'Date'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={attendanceForm.date}
                          max={new Date().toISOString().split('T')[0]}
                          disabled={!!editingAttendanceId}
                          onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                          className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${editingAttendanceId ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'}`}
                        />
                        {/* Check if date already exists */}
                        {!editingAttendanceId && attendanceForm.date && attendanceRecords.some(r => {
                          const recordDate = typeof r.date === 'string' 
                            ? (r.date.includes('T') ? r.date.split('T')[0] : r.date.substring(0, 10))
                            : new Date(r.date).toISOString().split('T')[0];
                          return recordDate === attendanceForm.date;
                        }) && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {language === 'ar' ? 'يوجد سجل لهذا التاريخ، استخدم زر التعديل' : 'Record exists for this date, use edit button'}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'وقت الدخول' : 'Check In'}
                          </label>
                          <input
                            type="time"
                            value={attendanceForm.check_in_time}
                            onChange={(e) => {
                              const newCheckIn = e.target.value;
                              // Reset check-out if it's before the new check-in
                              if (attendanceForm.check_out_time && attendanceForm.check_out_time <= newCheckIn) {
                                setAttendanceForm({ ...attendanceForm, check_in_time: newCheckIn, check_out_time: '' });
                              } else {
                                setAttendanceForm({ ...attendanceForm, check_in_time: newCheckIn });
                              }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'وقت الخروج' : 'Check Out'}
                          </label>
                          <input
                            type="time"
                            value={attendanceForm.check_out_time}
                            min={attendanceForm.check_in_time || undefined}
                            disabled={!attendanceForm.check_in_time}
                            onChange={(e) => setAttendanceForm({ ...attendanceForm, check_out_time: e.target.value })}
                            className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white ${!attendanceForm.check_in_time ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-white dark:bg-gray-700'} ${attendanceForm.check_in_time && attendanceForm.check_out_time && attendanceForm.check_out_time <= attendanceForm.check_in_time ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                          />
                          {!attendanceForm.check_in_time && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {language === 'ar' ? 'أدخل وقت الدخول أولاً' : 'Enter check-in time first'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Work Hours Preview */}
                      {attendanceForm.check_in_time && attendanceForm.check_out_time && (
                        <div className={`p-3 rounded-lg ${
                          attendanceForm.check_out_time > attendanceForm.check_in_time
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        }`}>
                          {attendanceForm.check_out_time > attendanceForm.check_in_time ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-green-700 dark:text-green-400">
                                {language === 'ar' ? 'ساعات العمل:' : 'Work Hours:'}
                              </span>
                              <span className="font-bold text-green-800 dark:text-green-300">
                                {(() => {
                                  const [inH, inM] = attendanceForm.check_in_time.split(':').map(Number);
                                  const [outH, outM] = attendanceForm.check_out_time.split(':').map(Number);
                                  const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
                                  const h = Math.floor(totalMinutes / 60);
                                  const m = totalMinutes % 60;
                                  if (h === 0) return `${m}m`;
                                  if (m === 0) return `${h}h`;
                                  return `${h}h ${m}m`;
                                })()}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">
                                {language === 'ar' ? 'وقت الخروج يجب أن يكون بعد وقت الدخول' : 'Check-out must be after check-in'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'الحالة' : 'Status'}
                        </label>
                        <select
                          value={attendanceForm.status}
                          onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="present">{language === 'ar' ? 'حاضر' : 'Present'}</option>
                          <option value="absent">{language === 'ar' ? 'غائب' : 'Absent'}</option>
                          <option value="late">{language === 'ar' ? 'متأخر' : 'Late'}</option>
                          <option value="on-leave">{language === 'ar' ? 'إجازة' : 'On Leave'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'ملاحظات' : 'Notes'}
                        </label>
                        <textarea
                          value={attendanceForm.notes}
                          onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                          rows={2}
                          placeholder={language === 'ar' ? 'ملاحظات إضافية (اختياري)' : 'Additional notes (optional)'}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowAttendanceModal(false);
                          setEditingAttendanceId(null);
                          setAttendanceForm({
                            date: new Date().toISOString().split('T')[0],
                            check_in_time: '',
                            check_out_time: '',
                            status: 'present',
                            notes: '',
                          });
                        }}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                      >
                        {text.cancel}
                      </button>
                      <button
                        onClick={saveAttendance}
                        disabled={
                          !attendanceForm.date ||
                          !!(attendanceForm.check_in_time && attendanceForm.check_out_time && attendanceForm.check_out_time <= attendanceForm.check_in_time) ||
                          // Disable if date exists and not in edit mode
                          (!editingAttendanceId && attendanceRecords.some(r => {
                            const recordDate = typeof r.date === 'string' 
                              ? (r.date.includes('T') ? r.date.split('T')[0] : r.date.substring(0, 10))
                              : new Date(r.date).toISOString().split('T')[0];
                            return recordDate === attendanceForm.date;
                          }))
                        }
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {text.save}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {text.leaves}
                </h3>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {text.requestLeave}
                </button>
              </div>

              {/* Leave Balance Cards */}
              {leaveBalance && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700">
                    <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">{text.annualLeave}</h4>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{leaveBalance.annual_leave_remaining}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">{text.remaining}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-blue-600 dark:text-blue-400">{text.used}: {leaveBalance.annual_leave_used}</p>
                        <p className="text-blue-600 dark:text-blue-400">{text.total}: {leaveBalance.annual_leave_total}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                        style={{ width: `${(leaveBalance.annual_leave_used / leaveBalance.annual_leave_total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-5 border border-red-200 dark:border-red-700">
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">{text.sickLeave}</h4>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold text-red-900 dark:text-red-100">{leaveBalance.sick_leave_remaining}</p>
                        <p className="text-xs text-red-600 dark:text-red-400">{text.remaining}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-red-600 dark:text-red-400">{text.used}: {leaveBalance.sick_leave_used}</p>
                        <p className="text-red-600 dark:text-red-400">{text.total}: {leaveBalance.sick_leave_total}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600 dark:bg-red-400 rounded-full"
                        style={{ width: `${(leaveBalance.sick_leave_used / leaveBalance.sick_leave_total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-5 border border-amber-200 dark:border-amber-700">
                    <h4 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-3">{text.emergencyLeave}</h4>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{leaveBalance.emergency_leave_remaining}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">{text.remaining}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-amber-600 dark:text-amber-400">{text.used}: {leaveBalance.emergency_leave_used}</p>
                        <p className="text-amber-600 dark:text-amber-400">{text.total}: {leaveBalance.emergency_leave_total}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-600 dark:bg-amber-400 rounded-full"
                        style={{ width: `${(leaveBalance.emergency_leave_used / leaveBalance.emergency_leave_total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Leave Records */}
              {leavesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : leaveRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{language === 'ar' ? 'لا توجد طلبات إجازة' : 'No leave requests found'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaveRecords.map((leave) => (
                    <div key={leave.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              leave.leave_type === 'annual' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                              leave.leave_type === 'sick' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                              {leave.leave_type === 'annual' ? (language === 'ar' ? 'سنوية' : 'Annual') :
                               leave.leave_type === 'sick' ? (language === 'ar' ? 'مرضية' : 'Sick') :
                               (language === 'ar' ? 'طارئة' : 'Emergency')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              leave.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              leave.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {leave.status === 'approved' ? (language === 'ar' ? 'موافق' : 'Approved') :
                               leave.status === 'rejected' ? (language === 'ar' ? 'مرفوض' : 'Rejected') :
                               (language === 'ar' ? 'قيد الانتظار' : 'Pending')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {new Date(leave.start_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - {new Date(leave.end_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            <span className="text-gray-500 dark:text-gray-400 ml-2">({leave.total_days} {language === 'ar' ? 'أيام' : 'days'})</span>
                          </p>
                          {leave.reason && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{leave.reason}</p>}
                        </div>
                        {leave.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateLeaveStatus(leave.id, 'approved')}
                              className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-lg"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => updateLeaveStatus(leave.id, 'rejected')}
                              className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Leave Request Modal */}
              {showLeaveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {text.requestLeave}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'نوع الإجازة' : 'Leave Type'}
                        </label>
                        <select
                          value={leaveForm.leave_type}
                          onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="annual">{text.annualLeave}</option>
                          <option value="sick">{text.sickLeave}</option>
                          <option value="emergency">{text.emergencyLeave}</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'من تاريخ' : 'Start Date'}
                          </label>
                          <input
                            type="date"
                            value={leaveForm.start_date}
                            onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'إلى تاريخ' : 'End Date'}
                          </label>
                          <input
                            type="date"
                            value={leaveForm.end_date}
                            onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'السبب' : 'Reason'}
                        </label>
                        <textarea
                          value={leaveForm.reason}
                          onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setShowLeaveModal(false)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                      >
                        {text.cancel}
                      </button>
                      <button
                        onClick={saveLeave}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                      >
                        {language === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {text.performance}
                  </h3>
                  {performanceSummary.averageRating && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {language === 'ar' ? 'متوسط التقييم' : 'Average Rating'}: 
                      <span className="font-medium text-orange-600 dark:text-orange-400 ml-1">
                        {performanceSummary.averageRating}/5
                      </span>
                      <span className="text-gray-400 mx-2">•</span>
                      {performanceSummary.totalReviews} {language === 'ar' ? 'تقييمات' : 'reviews'}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowPerformanceModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'ar' ? 'تقييم جديد' : 'New Review'}
                </button>
              </div>

              {/* Performance Reviews */}
              {performanceLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : performanceReviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{language === 'ar' ? 'لا توجد تقييمات أداء' : 'No performance reviews found'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {performanceReviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.review_period_start).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')} - {new Date(review.review_period_end).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {language === 'ar' ? 'بواسطة' : 'By'}: {review.reviewer_name || 'Unknown'}
                          </p>
                        </div>
                        {review.overall_rating && (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-5 h-5 ${star <= review.overall_rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                              />
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{review.overall_rating}/5</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {review.strengths && (
                          <div>
                            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">{language === 'ar' ? 'نقاط القوة' : 'Strengths'}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{review.strengths}</p>
                          </div>
                        )}
                        {review.areas_for_improvement && (
                          <div>
                            <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">{language === 'ar' ? 'مجالات التحسين' : 'Areas for Improvement'}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{review.areas_for_improvement}</p>
                          </div>
                        )}
                        {review.goals && (
                          <div>
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">{language === 'ar' ? 'الأهداف' : 'Goals'}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{review.goals}</p>
                          </div>
                        )}
                        {review.achievements && (
                          <div>
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">{language === 'ar' ? 'الإنجازات' : 'Achievements'}</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{review.achievements}</p>
                          </div>
                        )}
                      </div>
                      
                      {review.comments && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{language === 'ar' ? 'ملاحظات' : 'Comments'}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{review.comments}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Performance Review Modal */}
              {showPerformanceModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {language === 'ar' ? 'تقييم أداء جديد' : 'New Performance Review'}
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'بداية الفترة' : 'Period Start'}
                          </label>
                          <input
                            type="date"
                            value={performanceForm.review_period_start}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, review_period_start: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'نهاية الفترة' : 'Period End'}
                          </label>
                          <input
                            type="date"
                            value={performanceForm.review_period_end}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, review_period_end: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'التقييم العام' : 'Overall Rating'}
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setPerformanceForm({ ...performanceForm, overall_rating: star })}
                              className="p-1"
                            >
                              <Star className={`w-8 h-8 ${star <= performanceForm.overall_rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                            </button>
                          ))}
                          <span className="ml-2 text-lg font-medium text-gray-900 dark:text-white">{performanceForm.overall_rating}/5</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'نقاط القوة' : 'Strengths'}
                          </label>
                          <textarea
                            value={performanceForm.strengths}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, strengths: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'مجالات التحسين' : 'Areas for Improvement'}
                          </label>
                          <textarea
                            value={performanceForm.areas_for_improvement}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, areas_for_improvement: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'الأهداف' : 'Goals'}
                          </label>
                          <textarea
                            value={performanceForm.goals}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, goals: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'الإنجازات' : 'Achievements'}
                          </label>
                          <textarea
                            value={performanceForm.achievements}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, achievements: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Comments'}
                        </label>
                        <textarea
                          value={performanceForm.comments}
                          onChange={(e) => setPerformanceForm({ ...performanceForm, comments: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => setShowPerformanceModal(false)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                      >
                        {text.cancel}
                      </button>
                      <button
                        onClick={savePerformance}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg"
                      >
                        {text.save}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {text.documents}
                </h3>
                <button
                  onClick={() => setShowDocumentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {language === 'ar' ? 'رفع مستند' : 'Upload Document'}
                </button>
              </div>

              {/* Documents Grid */}
              {documentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{language === 'ar' ? 'لا توجد مستندات' : 'No documents found'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => {
                    const isExpiringSoon = doc.expiry_date && new Date(doc.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date();
                    
                    return (
                      <div 
                        key={doc.id} 
                        className={`bg-white dark:bg-gray-800 rounded-xl p-4 border-2 ${
                          isExpired ? 'border-red-300 dark:border-red-700' :
                          isExpiringSoon ? 'border-yellow-300 dark:border-yellow-700' :
                          'border-gray-200 dark:border-gray-700'
                        } hover:shadow-lg transition-shadow`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex gap-1">
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                            <a
                              href={doc.file_url}
                              download
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate">{doc.document_name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{doc.document_type}</p>
                        
                        {doc.expiry_date && (
                          <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                            isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            isExpiringSoon ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {isExpired ? (language === 'ar' ? 'منتهي الصلاحية' : 'Expired') :
                             isExpiringSoon ? (language === 'ar' ? 'قريب الانتهاء' : 'Expiring Soon') :
                             (language === 'ar' ? 'صالح حتى' : 'Valid until')}: {new Date(doc.expiry_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Document Upload Modal */}
              {showDocumentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {language === 'ar' ? 'رفع مستند جديد' : 'Upload New Document'}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'نوع المستند' : 'Document Type'}
                        </label>
                        <select
                          value={documentForm.document_type}
                          onChange={(e) => setDocumentForm({ ...documentForm, document_type: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="contract">{language === 'ar' ? 'عقد العمل' : 'Employment Contract'}</option>
                          <option value="id">{language === 'ar' ? 'بطاقة الهوية' : 'ID Card'}</option>
                          <option value="passport">{language === 'ar' ? 'جواز السفر' : 'Passport'}</option>
                          <option value="certificate">{language === 'ar' ? 'شهادة' : 'Certificate'}</option>
                          <option value="license">{language === 'ar' ? 'رخصة' : 'License'}</option>
                          <option value="other">{language === 'ar' ? 'أخرى' : 'Other'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'اسم المستند' : 'Document Name'}
                        </label>
                        <input
                          type="text"
                          value={documentForm.document_name}
                          onChange={(e) => setDocumentForm({ ...documentForm, document_name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'اختر الملف' : 'Select File'}
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            id="document-file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedFile(file);
                                if (!documentForm.document_name) {
                                  setDocumentForm({ ...documentForm, document_name: file.name.replace(/\.[^/.]+$/, '') });
                                }
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="document-file"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:border-orange-500 hover:text-orange-500 cursor-pointer transition-colors"
                          >
                            <Upload className="w-5 h-5" />
                            {selectedFile ? (
                              <span className="text-green-600 dark:text-green-400 font-medium truncate max-w-[200px]">
                                {selectedFile.name}
                              </span>
                            ) : (
                              <span>{language === 'ar' ? 'انقر لاختيار ملف' : 'Click to select file'}</span>
                            )}
                          </label>
                          {selectedFile && (
                            <button
                              type="button"
                              onClick={() => setSelectedFile(null)}
                              className="absolute top-1/2 -translate-y-1/2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {language === 'ar' ? 'PDF, Word, أو صور (حد أقصى 10MB)' : 'PDF, Word, or images (max 10MB)'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}
                          </label>
                          <input
                            type="date"
                            value={documentForm.issue_date}
                            onChange={(e) => setDocumentForm({ ...documentForm, issue_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
                          </label>
                          <input
                            type="date"
                            value={documentForm.expiry_date}
                            onChange={(e) => setDocumentForm({ ...documentForm, expiry_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'ملاحظات' : 'Notes'}
                        </label>
                        <textarea
                          value={documentForm.notes}
                          onChange={(e) => setDocumentForm({ ...documentForm, notes: e.target.value })}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowDocumentModal(false);
                          setSelectedFile(null);
                        }}
                        disabled={documentUploading}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white disabled:opacity-50"
                      >
                        {text.cancel}
                      </button>
                      <button
                        onClick={saveDocument}
                        disabled={documentUploading || (!selectedFile && !documentForm.file_url)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {documentUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            {language === 'ar' ? 'رفع' : 'Upload'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


        </div>
      </div>
    </ProtectedPage>
  );
}
