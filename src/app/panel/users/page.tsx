"use client";

/**
 * Users Management Page
 * List, create, edit, and delete users
 */

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { PermissionGate, PermissionButton } from "@/lib/permissions/client";
import type { SafeUser, Role } from "@/lib/permissions/types";

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

// User Form Modal
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SafeUser | null;
  onSave: (data: Record<string, unknown>) => void;
}

function UserFormModal({ isOpen, onClose, user, onSave }: UserFormModalProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    preferred_language: "en" as "en" | "ar",
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || "",
        password: "",
        preferred_language: user.preferred_language,
        is_active: user.is_active,
      });
    } else {
      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        password: "",
        preferred_language: "en",
        is_active: true,
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div className="theme-modal relative w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
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

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.users.firstName} *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="theme-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.users.lastName} *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="theme-input w-full"
              />
            </div>
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

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
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
            {t.users.assignRoles} - {user.first_name} {user.last_name}
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
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
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
    if (!confirm(t.users.confirmDelete)) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
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
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* Search */}
      <div className="max-w-md">
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
                  {t.users.username}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {t.users.email}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                  {language === "ar" ? "الاسم" : "Name"}
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
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--foreground-muted)]">
                    {t.users.noUsers}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--table-row-hover)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.first_name[0]}
                          </span>
                        </div>
                        <span className="text-[var(--foreground)] font-medium">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground-secondary)]">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground-secondary)]">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={user.is_active ? "theme-badge-success" : "theme-badge-error"}>
                        {user.is_active ? t.users.active : t.users.inactive}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
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
    </div>
  );
}
