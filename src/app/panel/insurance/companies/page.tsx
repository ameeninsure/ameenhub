'use client';

import { useState, useEffect } from 'react';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PlusCircle, Edit, Trash2, Search, Building2, Globe, Mail, Phone, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

interface InsuranceCompany {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  category: string;
  cr_number: string;
  license_number: string;
  address_en: string;
  address_ar: string;
  website: string;
  email: string;
  phone: string;
  logo_url: string;
  is_active: boolean;
  display_order: number;
  active_products_count: number;
  created_by_name: string;
  created_at: string;
}

export default function InsuranceCompaniesPage() {
  const { t, language } = useLanguage();
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    category: 'Insurance Company',
    cr_number: '',
    license_number: '',
    address_en: '',
    address_ar: '',
    website: '',
    email: '',
    phone: '',
    logo_url: '',
    is_active: true,
    display_order: 0,
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [showActiveOnly, searchTerm]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (showActiveOnly) params.append('is_active', 'true');
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/insurance/companies?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'insurance_logo');

    setUploadingLogo(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, logo_url: data.url }));
      } else {
        alert('Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Error uploading logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCompany
        ? `/api/insurance/companies/${editingCompany.id}`
        : '/api/insurance/companies';
      
      const method = editingCompany ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchCompanies();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save company');
      }
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Error saving company');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to delete this company?' : 'هل أنت متأكد من حذف هذه الشركة؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/insurance/companies/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchCompanies();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete company');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error deleting company');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      category: 'Insurance Company',
      cr_number: '',
      license_number: '',
      address_en: '',
      address_ar: '',
      website: '',
      email: '',
      phone: '',
      logo_url: '',
      is_active: true,
      display_order: 0,
    });
    setEditingCompany(null);
  };

  const openEditModal = (company: InsuranceCompany) => {
    setEditingCompany(company);
    setFormData({
      code: company.code,
      name_en: company.name_en,
      name_ar: company.name_ar,
      description_en: company.description_en || '',
      description_ar: company.description_ar || '',
      category: company.category || 'Insurance Company',
      cr_number: company.cr_number || '',
      license_number: company.license_number || '',
      address_en: company.address_en || '',
      address_ar: company.address_ar || '',
      website: company.website || '',
      email: company.email || '',
      phone: company.phone || '',
      logo_url: company.logo_url || '',
      is_active: company.is_active,
      display_order: company.display_order,
    });
    setShowModal(true);
  };

  return (
    <ProtectedPage permission="insurance.companies.view">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            {language === 'en' ? 'Insurance Companies' : 'شركات التأمين'}
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            {language === 'en' ? 'Add Company' : 'إضافة شركة'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search companies...' : 'بحث في الشركات...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activeOnly"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="activeOnly">
                {language === 'en' ? 'Active only' : 'النشطة فقط'}
              </label>
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="text-center py-12">{language === 'en' ? 'Loading...' : 'جاري التحميل...'}</div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {language === 'en' ? 'No companies found' : 'لا توجد شركات'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div key={company.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  {/* Logo */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {company.logo_url ? (
                        <img src={company.logo_url} alt={company.name_en} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(company)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Company Info */}
                  <h3 className="text-lg font-bold mb-2">
                    {language === 'en' ? company.name_en : company.name_ar}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{company.code}</span>
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{company.license_number}</span>
                    {company.is_active ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm mb-4">
                    {company.phone && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span dir="ltr">{company.phone}</span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <a
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Products Count */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-3">
                    {language === 'en' ? 'Products:' : 'المنتجات:'} <span className="font-semibold">{company.active_products_count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingCompany
                    ? language === 'en' ? 'Edit Company' : 'تعديل الشركة'
                    : language === 'en' ? 'Add New Company' : 'إضافة شركة جديدة'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Company Logo' : 'شعار الشركة'}
                    </label>
                    <div className="flex items-center gap-4">
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-20 h-20 object-contain border rounded" />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="block w-full text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Company Code *' : 'رمز الشركة *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'License Number' : 'رقم الترخيص'}
                      </label>
                      <input
                        type="text"
                        value={formData.license_number}
                        onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'English Name *' : 'الاسم بالإنجليزية *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name_en}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Arabic Name *' : 'الاسم بالعربية *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name_ar}
                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'CR Number' : 'رقم السجل التجاري'}
                      </label>
                      <input
                        type="text"
                        value={formData.cr_number}
                        onChange={(e) => setFormData({ ...formData, cr_number: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Category' : 'الفئة'}
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Phone' : 'الهاتف'}
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Website' : 'الموقع الإلكتروني'}
                      </label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'English Address' : 'العنوان بالإنجليزية'}
                      </label>
                      <textarea
                        value={formData.address_en}
                        onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Arabic Address' : 'العنوان بالعربية'}
                      </label>
                      <textarea
                        value={formData.address_ar}
                        onChange={(e) => setFormData({ ...formData, address_ar: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        dir="rtl"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'English Description' : 'الوصف بالإنجليزية'}
                      </label>
                      <textarea
                        value={formData.description_en}
                        onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Arabic Description' : 'الوصف بالعربية'}
                      </label>
                      <textarea
                        value={formData.description_ar}
                        onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Display Order' : 'ترتيب العرض'}
                      </label>
                      <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium">
                        {language === 'en' ? 'Active' : 'نشط'}
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {language === 'en' ? 'Cancel' : 'إلغاء'}
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingLogo}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {uploadingLogo
                        ? language === 'en' ? 'Uploading...' : 'جاري الرفع...'
                        : language === 'en' ? 'Save' : 'حفظ'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedPage>
  );
}
