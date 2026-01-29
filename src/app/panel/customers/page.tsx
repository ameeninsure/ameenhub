"use client";

/**
 * Customers Management Page
 * List, create, edit, and delete customers
 * Each user sees only their own customers (unless admin)
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { PermissionGate } from "@/lib/permissions/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { AvatarUpload } from "@/components/upload";
import type { UploadResult } from "@/lib/upload";
import { ConfirmDialog } from "@/components/ConfirmDialog";

// Types
type CustomerType = "person" | "company";

interface SafeCustomer {
  id: number;
  code: string;
  name: string;
  full_name: string | null;
  customer_type: CustomerType;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  credit_limit: number;
  is_active: boolean;
  avatar_url: string | null;
  preferred_language: "en" | "ar";
  created_by: number | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// Customer Form Modal
interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: SafeCustomer | null;
  onSave: (data: Record<string, unknown>) => void;
}

interface Company {
  id: number;
  code: string;
  full_name: string;
}

function CustomerFormModal({ isOpen, onClose, customer, onSave }: CustomerFormModalProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [formData, setFormData] = useState({
    full_name: "",
    customer_type: "person" as CustomerType,
    company_name: "",
    mobile: "",
    email: "",
    phone: "",
    address: "",
    credit_limit: 0,
    password: "",
    preferred_language: "en" as "en" | "ar",
    is_active: true,
    avatar_url: "" as string | null,
  });

  // Company dropdown state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  // Load companies
  useEffect(() => {
    if (isOpen) {
      fetch("/api/customers/companies")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCompanies(data.data);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || "",
        customer_type: customer.customer_type || "person",
        company_name: customer.company_name || "",
        mobile: customer.mobile || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        credit_limit: customer.credit_limit || 0,
        password: "",
        preferred_language: customer.preferred_language || "en",
        is_active: customer.is_active,
        avatar_url: customer.avatar_url,
      });
      setCompanySearch(customer.company_name || "");
    } else {
      setFormData({
        full_name: "",
        customer_type: "person",
        company_name: "",
        mobile: "",
        email: "",
        phone: "",
        address: "",
        credit_limit: 0,
        password: "",
        preferred_language: "en",
        is_active: true,
        avatar_url: null,
      });
      setCompanySearch("");
    }
  }, [customer]);

  // Filter companies based on search
  const filteredCompanies = companies.filter((company) =>
    company.full_name.toLowerCase().includes(companySearch.toLowerCase()) ||
    company.code.toLowerCase().includes(companySearch.toLowerCase())
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div className="theme-modal relative w-full max-w-lg max-h-[90vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)] flex-shrink-0">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {customer ? t.customers.editCustomer : t.customers.addCustomer}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--card-hover)]"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center pb-4 border-b border-[var(--card-border)]">
              <AvatarUpload
                currentImage={formData.avatar_url || undefined}
                initials={formData.full_name ? formData.full_name[0].toUpperCase() : "C"}
                size="lg"
                language={language}
                showRemoveButton={!!formData.avatar_url}
                onUpload={(result: UploadResult) => {
                  setFormData({ ...formData, avatar_url: result.url || null });
                }}
                onRemove={() => {
                  setFormData({ ...formData, avatar_url: null });
                }}
              />
              <p className="mt-2 text-xs text-[var(--foreground-muted)]">
                {language === "ar" ? "انقر لتحميل صورة العميل" : "Click to upload customer photo"}
              </p>
            </div>

            {/* Customer Type */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {language === "ar" ? "نوع العميل" : "Customer Type"} *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="customer_type"
                    value="person"
                    checked={formData.customer_type === "person"}
                    onChange={() => setFormData({ ...formData, customer_type: "person" })}
                    className="w-4 h-4 text-[var(--primary)]"
                  />
                  <span className="text-[var(--foreground)]">
                    {language === "ar" ? "شخص" : "Person"}
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="customer_type"
                    value="company"
                    checked={formData.customer_type === "company"}
                    onChange={() => setFormData({ ...formData, customer_type: "company" })}
                    className="w-4 h-4 text-[var(--primary)]"
                  />
                  <span className="text-[var(--foreground)]">
                    {language === "ar" ? "شركة" : "Company"}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {formData.customer_type === "company" 
                  ? (language === "ar" ? "اسم الشركة" : "Company Name") 
                  : t.customers.fullName} *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="theme-input w-full"
              />
            </div>

            {/* Company Name for Person (optional) - Searchable Dropdown */}
            {formData.customer_type === "person" && (
              <div className="relative">
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                  {language === "ar" ? "اسم الشركة (اختياري)" : "Company Name (Optional)"}
                </label>
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => {
                    setCompanySearch(e.target.value);
                    setShowCompanyDropdown(true);
                    // If input is cleared, clear the company_name
                    if (!e.target.value) {
                      setFormData({ ...formData, company_name: "" });
                    }
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  className="theme-input w-full"
                  placeholder={language === "ar" ? "ابحث عن شركة..." : "Search for a company..."}
                  autoComplete="off"
                />
                
                {/* Clear button */}
                {companySearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setCompanySearch("");
                      setFormData({ ...formData, company_name: "" });
                    }}
                    className="absolute right-2 top-8 p-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  >
                    <CloseIcon />
                  </button>
                )}

                {/* Dropdown */}
                {showCompanyDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowCompanyDropdown(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto bg-[var(--background)] border border-[var(--card-border)] rounded-lg shadow-xl backdrop-blur-none">
                      {filteredCompanies.length === 0 ? (
                        <div className="p-3 text-sm text-[var(--foreground-muted)] text-center bg-[var(--background)]">
                          {language === "ar" ? "لا توجد شركات" : "No companies found"}
                        </div>
                      ) : (
                        filteredCompanies.map((company) => (
                          <button
                            key={company.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, company_name: company.full_name });
                              setCompanySearch(company.full_name);
                              setShowCompanyDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left bg-[var(--background)] hover:bg-[var(--card-hover)] transition-colors flex items-center justify-between border-b border-[var(--card-border)] last:border-b-0"
                          >
                            <span className="text-[var(--foreground)]">{company.full_name}</span>
                            <span className="text-xs text-[var(--foreground-muted)] font-mono">{company.code}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.customers.mobile} *
              </label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="theme-input w-full"
                placeholder="+968 9999 9999"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.customers.email}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.customers.phone}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="theme-input w-full"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.customers.address}
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="theme-input w-full"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.customers.creditLimit}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.credit_limit}
                onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.customers.password} {!customer && "(optional)"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={customer ? (language === "ar" ? "اتركه فارغاً للإبقاء على كلمة المرور الحالية" : "Leave empty to keep current password") : (language === "ar" ? "للسماح بدخول البوابة" : "For portal login access")}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.customers.preferredLanguage}
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value as "en" | "ar" })}
                className="theme-input w-full"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-[var(--primary)] border-[var(--input-border)] rounded focus:ring-[var(--primary)]"
              />
              <label htmlFor="is_active" className="text-sm text-[var(--foreground-secondary)]">
                {t.customers.active}
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-[var(--card-border)] flex-shrink-0 bg-[var(--card-bg)]">
            <button
              type="button"
              onClick={onClose}
              className="theme-btn-secondary"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="theme-btn-primary"
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const [customers, setCustomers] = useState<SafeCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<SafeCustomer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<SafeCustomer | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers", {
        credentials: "include",
      });
      
      if (!response.ok) {
        console.error("Failed to fetch customers:", response.status);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
        setIsAdmin(data.isAdmin || false);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch customers after authentication is confirmed
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchCustomers();
    }
  }, [authLoading, isAuthenticated]);

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer: SafeCustomer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleDeleteCustomer = async (customer: SafeCustomer) => {
    setCustomerToDelete(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchCustomers();
        setShowDeleteConfirm(false);
        setCustomerToDelete(null);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveCustomer = async (formData: Record<string, unknown>) => {
    try {
      const url = selectedCustomer ? `/api/customers/${selectedCustomer.id}` : "/api/customers";
      const method = selectedCustomer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Failed to save customer:", response.status);
        const data = await response.json();
        alert(data.error || "Failed to save customer");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setShowCustomerModal(false);
        fetchCustomers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.mobile?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.code?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {t.customers.title}
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            {isAdmin ? t.customers.allCustomers : t.customers.myCustomers}
          </p>
        </div>
        <PermissionGate permission="customers.create">
          <button
            onClick={handleCreateCustomer}
            className="theme-btn-primary flex items-center gap-2"
          >
            <PlusIcon />
            <span>{t.customers.addCustomer}</span>
          </button>
        </PermissionGate>
      </div>

      {/* Search */}
      <div className="w-full sm:max-w-md">
        <input
          type="text"
          placeholder={t.customers.searchCustomers}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="theme-input w-full"
        />
      </div>

      {/* Customers Table */}
      <div className="theme-table overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--table-header-bg)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {t.customers.code}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {t.customers.fullName}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider hidden sm:table-cell">
                  {t.customers.customerType}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {t.customers.mobile}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider hidden lg:table-cell">
                  {t.customers.email}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider hidden md:table-cell">
                  {t.customers.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {t.customers.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--table-border)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--foreground-muted)]">
                    {t.customers.noCustomers}
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[var(--table-row-hover)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[var(--foreground)] font-mono text-sm">
                        {customer.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {customer.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={customer.avatar_url}
                            alt={customer.full_name || ""}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {customer.customer_type === "company" ? "C" : customer.full_name?.[0] || "P"}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-[var(--foreground)] font-medium">
                            {customer.full_name}
                          </span>
                          {customer.customer_type === "person" && customer.company_name && (
                            <span className="text-xs text-[var(--foreground-muted)]">
                              {customer.company_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className={customer.customer_type === "company" ? "theme-badge-primary" : "theme-badge-secondary"}>
                        {customer.customer_type === "company" ? t.customers.company : t.customers.person}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                        <PhoneIcon />
                        <span dir="ltr">{customer.mobile}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      {customer.email ? (
                        <div className="flex items-center gap-2 text-[var(--foreground-secondary)]">
                          <MailIcon />
                          <span>{customer.email}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--foreground-muted)]">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span className={customer.is_active ? "theme-badge-success" : "theme-badge-error"}>
                        {customer.is_active ? t.customers.active : t.customers.inactive}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <PermissionGate permission="customers.edit">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                            title={t.customers.editCustomer}
                          >
                            <EditIcon />
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="customers.delete">
                          <button
                            onClick={() => handleDeleteCustomer(customer)}
                            className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors"
                            title={t.customers.deleteCustomer}
                          >
                            <TrashIcon />
                          </button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCustomers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[var(--table-border)]">
            {/* Info */}
            <div className="text-sm text-[var(--foreground-muted)]">
              {language === "ar" 
                ? `عرض ${startIndex + 1} - ${Math.min(endIndex, filteredCustomers.length)} من ${filteredCustomers.length}` 
                : `Showing ${startIndex + 1} - ${Math.min(endIndex, filteredCustomers.length)} of ${filteredCustomers.length}`}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Items per page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--foreground-muted)]">
                  {language === "ar" ? "لكل صفحة:" : "Per page:"}
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="theme-input py-1 px-2 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--card-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={language === "ar" ? "الصفحة الأولى" : "First page"}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--card-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={language === "ar" ? "الصفحة السابقة" : "Previous page"}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 5) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="text-[var(--foreground-muted)] px-1">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? "bg-[var(--primary)] text-white"
                              : "text-[var(--foreground-muted)] hover:bg-[var(--card-hover)]"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--card-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={language === "ar" ? "الصفحة التالية" : "Next page"}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--card-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={language === "ar" ? "الصفحة الأخيرة" : "Last page"}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomerFormModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCustomerToDelete(null);
        }}
        onConfirm={confirmDeleteCustomer}
        title={language === "ar" ? "حذف العميل" : "Delete Customer"}
        message={language === "ar" ? "هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this customer? This action cannot be undone."}
        itemName={customerToDelete?.full_name || undefined}
        variant="danger"
        language={language}
        loading={deleteLoading}
      />
    </div>
  );
}
