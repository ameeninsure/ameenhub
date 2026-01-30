'use client';

import { useState, useEffect } from 'react';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PlusCircle, Edit, Trash2, Search, Package, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

interface InsuranceProduct {
  id: number;
  code: string;
  company_id: number;
  company_name_en: string;
  company_name_ar: string;
  company_code: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  category: string;
  coverage_type: string;
  features_en: string[];
  features_ar: string[];
  terms_en: string;
  terms_ar: string;
  logo_url: string;
  is_active: boolean;
  display_order: number;
  created_by_name: string;
  created_at: string;
}

interface Company {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
}

export default function InsuranceProductsPage() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InsuranceProduct | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    company_id: 0,
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    category: '',
    coverage_type: '',
    features_en: [] as string[],
    features_ar: [] as string[],
    terms_en: '',
    terms_ar: '',
    logo_url: '',
    is_active: true,
    display_order: 0,
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [featureInput_en, setFeatureInput_en] = useState('');
  const [featureInput_ar, setFeatureInput_ar] = useState('');

  const categories = [
    'Motor Insurance',
    'Health Insurance',
    'Life Insurance',
    'Property Insurance',
    'Travel Insurance',
    'Marine Insurance',
    'Engineering Insurance',
    'Liability Insurance',
  ];

  useEffect(() => {
    fetchCompanies();
    fetchProducts();
  }, [selectedCompany, selectedCategory, showActiveOnly, searchTerm]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/insurance/companies?is_active=true', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCompany) params.append('company_id', selectedCompany);
      if (selectedCategory) params.append('category', selectedCategory);
      if (showActiveOnly) params.append('is_active', 'true');
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/insurance/products?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('type', 'insurance_logo');

    setUploadingLogo(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formDataUpload,
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

  const addFeature = (lang: 'en' | 'ar') => {
    if (lang === 'en' && featureInput_en.trim()) {
      setFormData(prev => ({
        ...prev,
        features_en: [...prev.features_en, featureInput_en.trim()]
      }));
      setFeatureInput_en('');
    } else if (lang === 'ar' && featureInput_ar.trim()) {
      setFormData(prev => ({
        ...prev,
        features_ar: [...prev.features_ar, featureInput_ar.trim()]
      }));
      setFeatureInput_ar('');
    }
  };

  const removeFeature = (lang: 'en' | 'ar', index: number) => {
    if (lang === 'en') {
      setFormData(prev => ({
        ...prev,
        features_en: prev.features_en.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        features_ar: prev.features_ar.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProduct
        ? `/api/insurance/products/${editingProduct.id}`
        : '/api/insurance/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchProducts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to delete this product?' : 'هل أنت متأكد من حذف هذا المنتج؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/insurance/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchProducts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      company_id: 0,
      name_en: '',
      name_ar: '',
      description_en: '',
      description_ar: '',
      category: '',
      coverage_type: '',
      features_en: [],
      features_ar: [],
      terms_en: '',
      terms_ar: '',
      logo_url: '',
      is_active: true,
      display_order: 0,
    });
    setEditingProduct(null);
    setFeatureInput_en('');
    setFeatureInput_ar('');
  };

  const openEditModal = (product: InsuranceProduct) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      company_id: product.company_id,
      name_en: product.name_en,
      name_ar: product.name_ar,
      description_en: product.description_en || '',
      description_ar: product.description_ar || '',
      category: product.category || '',
      coverage_type: product.coverage_type || '',
      features_en: product.features_en || [],
      features_ar: product.features_ar || [],
      terms_en: product.terms_en || '',
      terms_ar: product.terms_ar || '',
      logo_url: product.logo_url || '',
      is_active: product.is_active,
      display_order: product.display_order,
    });
    setShowModal(true);
  };

  return (
    <ProtectedPage permission="insurance.products.view">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-8 h-8" />
            {language === 'en' ? 'Insurance Products' : 'منتجات التأمين'}
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            {language === 'en' ? 'Add Product' : 'إضافة منتج'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search products...' : 'بحث في المنتجات...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">{language === 'en' ? 'All Companies' : 'جميع الشركات'}</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {language === 'en' ? company.name_en : company.name_ar}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">{language === 'en' ? 'All Categories' : 'جميع الفئات'}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">{language === 'en' ? 'Loading...' : 'جاري التحميل...'}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {language === 'en' ? 'No products found' : 'لا توجد منتجات'}
          </div>
        ) : !selectedCompany && !selectedCategory ? (
          // Group by company when no filters are selected
          <div className="space-y-8">
            {(() => {
              // Group products by company
              const grouped = products.reduce((acc, product) => {
                const key = product.company_id;
                if (!acc[key]) {
                  acc[key] = {
                    company_name_en: product.company_name_en,
                    company_name_ar: product.company_name_ar,
                    company_code: product.company_code,
                    products: []
                  };
                }
                acc[key].products.push(product);
                return acc;
              }, {} as Record<number, { company_name_en: string; company_name_ar: string; company_code: string; products: InsuranceProduct[] }>);

              return Object.entries(grouped).map(([companyId, group]) => (
                <div key={companyId} className="mb-8">
                  {/* Company Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 text-white px-6 py-4 rounded-t-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {language === 'en' ? group.company_name_en : group.company_name_ar}
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">
                          {group.products.length} {language === 'en' ? 'Products' : 'منتجات'}
                        </p>
                      </div>
                      <span className="bg-white/20 px-4 py-2 rounded-lg text-sm font-mono">
                        {group.company_code}
                      </span>
                    </div>
                  </div>
                  
                  {/* Products Grid for this company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {group.products.map((product) => (
                      <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="p-6">
                          {/* Logo & Actions */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.logo_url ? (
                                <img src={product.logo_url} alt={product.name_en} className="w-full h-full object-contain" />
                              ) : (
                                <Package className="w-8 h-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(product)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Product Info */}
                          <h3 className="text-lg font-bold mb-2">
                            {language === 'en' ? product.name_en : product.name_ar}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{product.code}</span>
                            {product.is_active ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>

                          {/* Category & Coverage */}
                          {product.category && (
                            <div className="text-sm mb-2">
                              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                                {product.category}
                              </span>
                              {product.coverage_type && (
                                <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
                                  {product.coverage_type}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Description */}
                          {(product.description_en || product.description_ar) && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mt-3">
                              {language === 'en' ? product.description_en : product.description_ar}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        ) : (
          // Regular grid when filters are active
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  {/* Logo & Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.logo_url ? (
                        <img src={product.logo_url} alt={product.name_en} className="w-full h-full object-contain" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <h3 className="text-lg font-bold mb-2">
                    {language === 'en' ? product.name_en : product.name_ar}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{product.code}</span>
                    {product.is_active ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {/* Company */}
                  <div className="text-sm mb-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      {language === 'en' ? 'Company:' : 'الشركة:'}
                    </span>
                    <span className="font-semibold ml-1">
                      {language === 'en' ? product.company_name_en : product.company_name_ar}
                    </span>
                  </div>

                  {/* Category & Coverage */}
                  {product.category && (
                    <div className="text-sm mb-2">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {(product.description_en || product.description_ar) && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mt-3">
                      {language === 'en' ? product.description_en : product.description_ar}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full my-8">
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                  {editingProduct
                    ? language === 'en' ? 'Edit Product' : 'تعديل المنتج'
                    : language === 'en' ? 'Add New Product' : 'إضافة منتج جديد'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Product Logo' : 'شعار المنتج'}
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
                        {language === 'en' ? 'Product Code *' : 'رمز المنتج *'}
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
                        {language === 'en' ? 'Company *' : 'الشركة *'}
                      </label>
                      <select
                        required
                        value={formData.company_id}
                        onChange={(e) => setFormData({ ...formData, company_id: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value={0}>{language === 'en' ? 'Select Company' : 'اختر الشركة'}</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>
                            {language === 'en' ? company.name_en : company.name_ar}
                          </option>
                        ))}
                      </select>
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
                        {language === 'en' ? 'Category' : 'الفئة'}
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="">{language === 'en' ? 'Select Category' : 'اختر الفئة'}</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Coverage Type' : 'نوع التغطية'}
                      </label>
                      <input
                        type="text"
                        value={formData.coverage_type}
                        onChange={(e) => setFormData({ ...formData, coverage_type: e.target.value })}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
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

                    {/* English Features */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'English Features' : 'الميزات بالإنجليزية'}
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={featureInput_en}
                          onChange={(e) => setFeatureInput_en(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature('en'))}
                          placeholder="Add feature and press Enter"
                          className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => addFeature('en')}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.features_en.map((feature, index) => (
                          <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {feature}
                            <button type="button" onClick={() => removeFeature('en', index)} className="text-red-600 hover:text-red-800">×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arabic Features */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Arabic Features' : 'الميزات بالعربية'}
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={featureInput_ar}
                          onChange={(e) => setFeatureInput_ar(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature('ar'))}
                          placeholder="أضف ميزة واضغط Enter"
                          className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                          dir="rtl"
                        />
                        <button
                          type="button"
                          onClick={() => addFeature('ar')}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          إضافة
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.features_ar.map((feature, index) => (
                          <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2" dir="rtl">
                            {feature}
                            <button type="button" onClick={() => removeFeature('ar', index)} className="text-red-600 hover:text-red-800">×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'English Terms & Conditions' : 'الشروط والأحكام بالإنجليزية'}
                      </label>
                      <textarea
                        value={formData.terms_en}
                        onChange={(e) => setFormData({ ...formData, terms_en: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        {language === 'en' ? 'Arabic Terms & Conditions' : 'الشروط والأحكام بالعربية'}
                      </label>
                      <textarea
                        value={formData.terms_ar}
                        onChange={(e) => setFormData({ ...formData, terms_ar: e.target.value })}
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
