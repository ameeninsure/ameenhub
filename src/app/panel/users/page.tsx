"use client";

/**
 * Users Management Page
 * List, create, edit, and delete users
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { PermissionGate, PermissionButton } from "@/lib/permissions/client";
import type { SafeUser, Role } from "@/lib/permissions/types";
import { AvatarUpload } from "@/components/upload";
import type { UploadResult } from "@/lib/upload";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const RolesIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const OrgChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// User Form Modal
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SafeUser | null;
  allUsers: SafeUser[];
  onSave: (data: Record<string, unknown>) => void;
}

function UserFormModal({ isOpen, onClose, user, allUsers, onSave }: UserFormModalProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    full_name_ar: "",
    position: "",
    phone: "",
    password: "",
    preferred_language: "en" as "en" | "ar",
    is_active: true,
    avatar_url: "" as string | null,
    manager_id: null as number | null,
  });
  const [managerSearch, setManagerSearch] = useState("");
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const managerInputRef = useRef<HTMLInputElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, openUp: false });

  const updateDropdownPosition = useCallback(() => {
    if (!managerInputRef.current) return;
    const rect = managerInputRef.current.getBoundingClientRect();
    const dropdownHeight = 280; // Approximate dropdown height
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    
    setDropdownPosition({
      top: openUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      openUp,
    });
  }, []);

  // Filter users for manager selection (exclude current user being edited)
  const availableManagers = allUsers.filter(u => 
    u.id !== user?.id && 
    u.is_active &&
    (managerSearch === "" || 
     u.full_name.toLowerCase().includes(managerSearch.toLowerCase()) ||
     u.username.toLowerCase().includes(managerSearch.toLowerCase()) ||
     u.email.toLowerCase().includes(managerSearch.toLowerCase()))
  );

  const selectedManager = allUsers.find(u => u.id === formData.manager_id);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        full_name_ar: user.full_name_ar || "",
        position: user.position || "",
        phone: user.phone || "",
        password: "",
        preferred_language: user.preferred_language,
        is_active: user.is_active,
        avatar_url: user.avatar_url,
        manager_id: user.manager_id,
      });
    } else {
      setFormData({
        username: "",
        email: "",
        full_name: "",
        full_name_ar: "",
        position: "",
        phone: "",
        password: "",
        preferred_language: "en",
        is_active: true,
        avatar_url: null,
        manager_id: null,
      });
    }
    setManagerSearch("");
  }, [user]);

  useEffect(() => {
    if (!showManagerDropdown) return;
    updateDropdownPosition();
    const handleResize = () => updateDropdownPosition();
    const handleScroll = () => updateDropdownPosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [showManagerDropdown, updateDropdownPosition]);

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
            {user ? t.users.editUser : t.users.addUser}
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
                initials={formData.full_name ? formData.full_name[0].toUpperCase() : "U"}
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
                {language === "ar" ? "انقر لتحميل صورة الملف الشخصي" : "Click to upload profile photo"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.users.fullName} *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {language === "ar" ? "الاسم الكامل (عربي)" : "Full Name (Arabic)"}
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.full_name_ar}
                onChange={(e) => setFormData({ ...formData, full_name_ar: e.target.value })}
                placeholder={language === "ar" ? "مثال: محمد أحمد" : "e.g. محمد أحمد"}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {language === "ar" ? "المسمى الوظيفي" : "Position"}
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder={language === "ar" ? "مثال: مدير المبيعات" : "e.g. Sales Manager"}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.users.username} *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.users.email} *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.users.phone}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.users.password} {!user && "*"}
              </label>
              <input
                type="password"
                required={!user}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={user ? (language === "ar" ? "اتركه فارغاً للإبقاء على كلمة المرور الحالية" : "Leave empty to keep current password") : ""}
                className="theme-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.users.preferredLanguage}
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

            {/* Manager Selection with Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {language === "ar" ? "المدير المباشر" : "Direct Manager"}
              </label>
              <div className="relative bg-[var(--card-bg)] border border-[var(--input-border)] rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)]">
                <input
                  type="text"
                  ref={managerInputRef}
                  value={managerSearch || (selectedManager ? selectedManager.full_name : "")}
                  onChange={(e) => {
                    setManagerSearch(e.target.value);
                    updateDropdownPosition();
                    setShowManagerDropdown(true);
                  }}
                  onFocus={() => {
                    updateDropdownPosition();
                    setShowManagerDropdown(true);
                  }}
                  placeholder={language === "ar" ? "ابحث عن مدير..." : "Search for manager..."}
                  className="w-full bg-transparent px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none"
                />
                {formData.manager_id && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, manager_id: null });
                      setManagerSearch("");
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--foreground-muted)] hover:text-[var(--error)]"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>
              {showManagerDropdown && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div
                    className="fixed inset-0 z-[900] bg-black/20"
                    onClick={() => setShowManagerDropdown(false)}
                  />
                  {/* Dropdown (fixed, above modal) */}
                  <div
                    className="fixed z-[1000] rounded-xl border-2 border-[var(--primary)] overflow-hidden"
                    style={{
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                      width: dropdownPosition.width,
                      backgroundColor: 'white',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                    }}
                  >
                    <div 
                      className="px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 border-[var(--primary)]"
                      style={{ backgroundColor: '#f0f4ff', color: '#4f46e5' }}
                    >
                      {language === "ar" ? "اختر المدير" : "Select Manager"}
                    </div>
                    {availableManagers.length > 0 ? (
                      <div className="max-h-64 overflow-y-auto" style={{ backgroundColor: 'white' }}>
                        {availableManagers.slice(0, 10).map((manager) => (
                          <button
                            key={manager.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, manager_id: manager.id });
                              setManagerSearch("");
                              setShowManagerDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors"
                            style={{ backgroundColor: 'white' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f4ff'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-sm font-bold shadow-md">
                              {manager.full_name[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 truncate">{manager.full_name}</div>
                              <div className="text-xs text-gray-500 truncate">{manager.email}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500" style={{ backgroundColor: 'white' }}>
                        {language === "ar" ? "لا توجد نتائج" : "No results"}
                      </div>
                    )}
                  </div>
                </>
              )}
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
                {t.users.active}
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

// Assign Roles Modal
interface AssignRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SafeUser | null;
  allRoles: Role[];
  userRoles: Role[];
  onSave: (roleIds: number[]) => void;
}

function AssignRolesModal({ isOpen, onClose, user, allRoles, userRoles, onSave }: AssignRolesModalProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  useEffect(() => {
    setSelectedRoles(userRoles.map((r) => r.id));
  }, [userRoles]);

  if (!isOpen || !user) return null;

  const handleToggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedRoles);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div className="theme-modal relative w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {t.users.assignRoles} - {user.full_name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--card-hover)]"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allRoles.map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] hover:bg-[var(--card-hover)] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => handleToggleRole(role.id)}
                  className="w-4 h-4 text-[var(--primary)] border-[var(--input-border)] rounded focus:ring-[var(--primary)]"
                />
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {language === "ar" ? role.name_ar : role.name_en}
                  </p>
                  {(role.description_en || role.description_ar) && (
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {language === "ar" ? role.description_ar : role.description_en}
                    </p>
                  )}
                  {role.is_system && (
                    <span className="theme-badge-info mt-1">
                      {t.roles.systemRole}
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[var(--card-border)]">
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

export default function UsersPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SafeUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SafeUser | null>(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState<Role[]>([]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      const data = await response.json();
      if (data.success) {
        setAllRoles(data.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Fetch user roles
  const fetchUserRoles = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/roles`);
      const data = await response.json();
      if (data.success) {
        setSelectedUserRoles(data.data);
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: SafeUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (user: SafeUser) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setShowDeleteConfirm(false);
        setUserToDelete(null);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveUser = async (formData: Record<string, unknown>) => {
    try {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : "/api/users";
      const method = selectedUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowUserModal(false);
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleAssignRoles = async (user: SafeUser) => {
    setSelectedUser(user);
    await fetchUserRoles(user.id);
    setShowRolesModal(true);
  };

  const handleSaveRoles = async (roleIds: number[]) => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds }),
      });

      const data = await response.json();
      if (data.success) {
        setShowRolesModal(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error saving roles:", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name_ar && user.full_name_ar.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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
            {t.users.title}
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            {language === "ar" ? "إدارة مستخدمي النظام" : "Manage system users"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/panel/org-chart"
            className="theme-btn-secondary flex items-center gap-2"
          >
            <OrgChartIcon />
            <span>{language === "ar" ? "الهيكل التنظيمي" : "Organization Chart"}</span>
          </Link>
          <PermissionGate permission="users.create">
            <button
              onClick={handleCreateUser}
              className="theme-btn-primary flex items-center gap-2"
            >
              <PlusIcon />
              <span>{t.users.addUser}</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Search */}
      <div className="w-full sm:max-w-md">
        <input
          type="text"
          placeholder={t.users.searchUsers}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="theme-input w-full"
        />
      </div>

      {/* Users Table */}
      <div className="theme-table overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--table-header-bg)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {language === "ar" ? "الكود" : "Code"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {t.users.username}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {t.users.email}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {language === "ar" ? "الاسم" : "Name"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {language === "ar" ? "المدير" : "Manager"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {t.users.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {t.users.actions}
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--foreground-muted)]">
                    {t.users.noUsers}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const manager = users.find(u => u.id === user.manager_id);
                  return (
                  <tr key={user.id} className="hover:bg-[var(--table-row-hover)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[var(--foreground-secondary)] font-mono text-sm">
                        {user.code || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/panel/users/${user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        {user.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.full_name[0]}
                            </span>
                          </div>
                        )}
                        <span className="text-[var(--foreground)] font-medium hover:underline">
                          {user.username}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground-secondary)]">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground-secondary)]">
                      {language === "ar" && user.full_name_ar ? user.full_name_ar : user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {manager ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {(language === "ar" && manager.full_name_ar ? manager.full_name_ar : manager.full_name)[0]}
                            </span>
                          </div>
                          <span className="text-[var(--foreground-secondary)] text-sm">{language === "ar" && manager.full_name_ar ? manager.full_name_ar : manager.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--foreground-muted)] text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={user.is_active ? "theme-badge-success" : "theme-badge-error"}>
                        {user.is_active ? t.users.active : t.users.inactive}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <PermissionGate permission="users.view">
                          <Link
                            href={`/panel/users/${user.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-600/10 rounded-lg transition-colors"
                            title={language === "ar" ? "عرض التفاصيل" : "View Details"}
                          >
                            <EyeIcon />
                          </Link>
                        </PermissionGate>
                        <PermissionGate permission="users.manage_roles">
                          <button
                            onClick={() => handleAssignRoles(user)}
                            className="p-2 text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-colors"
                            title={t.users.assignRoles}
                          >
                            <RolesIcon />
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="users.edit">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                            title={t.users.editUser}
                          >
                            <EditIcon />
                          </button>
                        </PermissionGate>
                        <PermissionGate permission="users.delete">
                          {!user.is_system && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors"
                              title={t.users.deleteUser}
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[var(--table-border)]">
            {/* Info */}
            <div className="text-sm text-[var(--foreground-muted)]">
              {language === "ar" 
                ? `عرض ${startIndex + 1} - ${Math.min(endIndex, filteredUsers.length)} من ${filteredUsers.length}` 
                : `Showing ${startIndex + 1} - ${Math.min(endIndex, filteredUsers.length)} of ${filteredUsers.length}`}
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
      <UserFormModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        allUsers={users}
        onSave={handleSaveUser}
      />

      <AssignRolesModal
        isOpen={showRolesModal}
        onClose={() => setShowRolesModal(false)}
        user={selectedUser}
        allRoles={allRoles}
        userRoles={selectedUserRoles}
        onSave={handleSaveRoles}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title={language === "ar" ? "حذف المستخدم" : "Delete User"}
        message={language === "ar" ? "هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this user? This action cannot be undone."}
        itemName={userToDelete?.full_name}
        variant="danger"
        language={language}
        loading={deleteLoading}
      />
    </div>
  );
}
