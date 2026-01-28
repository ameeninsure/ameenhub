"use client";

/**
 * Roles Management Page
 * List, create, edit, and delete roles with permission assignment
 */

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { translations } from "@/lib/i18n/translations";
import { PermissionGate } from "@/lib/permissions/client";
import type { Role, Permission } from "@/lib/permissions/types";

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

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

interface GroupedPermissions {
  [module: string]: Permission[];
}

// Role Form Modal
interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onSave: (data: Record<string, unknown>) => void;
}

function RoleFormModal({ isOpen, onClose, role, onSave }: RoleFormModalProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [formData, setFormData] = useState({
    code: "",
    name_en: "",
    name_ar: "",
    description_en: "",
    description_ar: "",
    is_active: true,
  });

  useEffect(() => {
    if (role) {
      setFormData({
        code: role.code,
        name_en: role.name_en,
        name_ar: role.name_ar || "",
        description_en: role.description_en || "",
        description_ar: role.description_ar || "",
        is_active: role.is_active,
      });
    } else {
      setFormData({
        code: "",
        name_en: "",
        name_ar: "",
        description_en: "",
        description_ar: "",
        is_active: true,
      });
    }
  }, [role]);

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
            {role ? t.roles.editRole : t.roles.addRole}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--card-hover)]"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
              {t.roles.roleCode} *
            </label>
            <input
              type="text"
              required
              disabled={role?.is_system}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., sales_manager"
              className="theme-input w-full disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.roles.nameEn} *
              </label>
              <input
                type="text"
                required
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                className="theme-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.roles.nameAr}
              </label>
              <input
                type="text"
                dir="rtl"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                className="theme-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.roles.descriptionEn}
              </label>
              <textarea
                rows={2}
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="theme-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                {t.roles.descriptionAr}
              </label>
              <textarea
                rows={2}
                dir="rtl"
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                className="theme-input w-full"
              />
            </div>
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
              {t.roles.active}
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

// Permissions Assignment Modal
interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  allPermissions: GroupedPermissions;
  rolePermissions: Permission[];
  onSave: (permissionIds: number[]) => void;
}

function PermissionsModal({ isOpen, onClose, role, allPermissions, rolePermissions, onSave }: PermissionsModalProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  useEffect(() => {
    setSelectedPermissions(rolePermissions.map((p) => p.id));
    setExpandedModules(Object.keys(allPermissions));
  }, [rolePermissions, allPermissions]);

  if (!isOpen || !role) return null;

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleToggleModule = (module: string) => {
    setExpandedModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module]
    );
  };

  const handleSelectAllInModule = (module: string, select: boolean) => {
    const modulePermissions = allPermissions[module] || [];
    const modulePermissionIds = modulePermissions.map((p) => p.id);
    setSelectedPermissions((prev) => {
      if (select) {
        return [...new Set([...prev, ...modulePermissionIds])];
      } else {
        return prev.filter((id) => !modulePermissionIds.includes(id));
      }
    });
  };

  const isModuleFullySelected = (module: string) => {
    const modulePermissions = allPermissions[module] || [];
    if (modulePermissions.length === 0) return false;
    const modulePermissionIds = modulePermissions.map((p) => p.id);
    return modulePermissionIds.every((id) => selectedPermissions.includes(id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedPermissions);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[var(--overlay)]" onClick={onClose} />
      <div className="theme-modal relative w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {t.roles.assignPermissions} - {language === "ar" ? role.name_ar || role.name_en : role.name_en}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--card-hover)]"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(allPermissions).map(([module, permissions]) => (
              <div key={module} className="border border-[var(--card-border)] rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 bg-[var(--background-secondary)] cursor-pointer"
                  onClick={() => handleToggleModule(module)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isModuleFullySelected(module)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectAllInModule(module, e.target.checked);
                      }}
                      className="w-4 h-4 text-[var(--primary)] border-[var(--input-border)] rounded focus:ring-[var(--primary)]"
                    />
                    <span className="font-medium text-[var(--foreground)] capitalize">
                      {module.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-[var(--foreground-muted)]">
                      ({permissions.filter((p) => selectedPermissions.includes(p.id)).length}/{permissions.length})
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${expandedModules.includes(module) ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {expandedModules.includes(module) && (
                  <div className="p-3 space-y-2 bg-[var(--card)]">
                    {permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-start gap-3 p-2 rounded hover:bg-[var(--card-hover)] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handleTogglePermission(permission.id)}
                          className="mt-0.5 w-4 h-4 text-[var(--primary)] border-[var(--input-border)] rounded focus:ring-[var(--primary)]"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--foreground)]">
                            {language === "ar" ? permission.name_ar || permission.name_en : permission.name_en}
                          </p>
                          <p className="text-xs text-[var(--foreground-muted)]">
                            {permission.code}
                          </p>
                          {(permission.description_en || permission.description_ar) && (
                            <p className="text-xs text-[var(--foreground-muted)] mt-1">
                              {language === "ar" ? permission.description_ar || permission.description_en : permission.description_en}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 mt-4 border-t border-[var(--card-border)]">
            <span className="text-sm text-[var(--foreground-muted)]">
              {selectedPermissions.length} {language === "ar" ? "صلاحية محددة" : "permissions selected"}
            </span>
            <div className="flex gap-3">
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
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RolesPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<GroupedPermissions>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<Permission[]>([]);

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch permissions grouped by module
  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/permissions?groupByModule=true");
      const data = await response.json();
      if (data.success) {
        // Transform array to object: [{ module, permissions }] -> { [module]: permissions }
        const grouped: GroupedPermissions = {};
        for (const item of data.data) {
          if (item.module && Array.isArray(item.permissions)) {
            grouped[item.module] = item.permissions;
          }
        }
        setAllPermissions(grouped);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  // Fetch role permissions
  const fetchRolePermissions = async (roleId: number) => {
    try {
      const response = await fetch(`/api/roles/${roleId}/permissions`);
      const data = await response.json();
      if (data.success) {
        setSelectedRolePermissions(data.data);
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (role: Role) => {
    if (!confirm(t.roles.confirmDelete)) return;

    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchRoles();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const handleSaveRole = async (formData: Record<string, unknown>) => {
    try {
      const url = selectedRole ? `/api/roles/${selectedRole.id}` : "/api/roles";
      const method = selectedRole ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowRoleModal(false);
        fetchRoles();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const handleManagePermissions = async (role: Role) => {
    setSelectedRole(role);
    await fetchRolePermissions(role.id);
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async (permissionIds: number[]) => {
    if (!selectedRole) return;

    try {
      const response = await fetch(`/api/roles/${selectedRole.id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds }),
      });

      const data = await response.json();
      if (data.success) {
        setShowPermissionsModal(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
    }
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.name_ar && role.name_ar.includes(searchQuery))
  );

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {t.roles.title}
          </h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            {language === "ar" ? "إدارة الأدوار والصلاحيات" : "Manage roles and permissions"}
          </p>
        </div>
        <PermissionGate permission="roles.create">
          <button
            onClick={handleCreateRole}
            className="theme-btn-primary flex items-center gap-2"
          >
            <PlusIcon />
            <span>{t.roles.addRole}</span>
          </button>
        </PermissionGate>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder={t.roles.searchRoles}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="theme-input w-full"
        />
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[var(--foreground-muted)]">
            {t.roles.noRoles}
          </div>
        ) : (
          filteredRoles.map((role) => (
            <div
              key={role.id}
              className="theme-card p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--foreground)]">
                      {language === "ar" ? role.name_ar || role.name_en : role.name_en}
                    </h3>
                    {role.is_system && (
                      <span className="theme-badge-info">
                        {t.roles.systemRole}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">
                    {role.code}
                  </p>
                  {(role.description_en || role.description_ar) && (
                    <p className="text-sm text-[var(--foreground-secondary)] mt-2">
                      {language === "ar" ? role.description_ar || role.description_en : role.description_en}
                    </p>
                  )}
                </div>
                <span className={`flex-shrink-0 ${role.is_active ? "theme-badge-success" : "theme-badge-error"}`}>
                  {role.is_active ? t.roles.active : t.roles.inactive}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[var(--card-border)]">
                <div className="flex items-center gap-1 text-sm text-[var(--foreground-muted)]">
                  <ShieldIcon />
                  <span>
                    {(role as Role & { permissions_count?: number }).permissions_count || 0} {language === "ar" ? "صلاحية" : "permissions"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-[var(--foreground-muted)]">
                  <UsersIcon />
                  <span>
                    {(role as Role & { users_count?: number }).users_count || 0} {language === "ar" ? "مستخدم" : "users"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <PermissionGate permission="roles.manage_permissions">
                  <button
                    onClick={() => handleManagePermissions(role)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-[var(--accent)] bg-[var(--accent)]/10 rounded-lg hover:bg-[var(--accent)]/20 transition-colors"
                  >
                    <ShieldIcon />
                    <span>{t.roles.managePermissions}</span>
                  </button>
                </PermissionGate>
                <PermissionGate permission="roles.edit">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                    title={t.roles.editRole}
                  >
                    <EditIcon />
                  </button>
                </PermissionGate>
                <PermissionGate permission="roles.delete">
                  {!role.is_system && (
                    <button
                      onClick={() => handleDeleteRole(role)}
                      className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors"
                      title={t.roles.deleteRole}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </PermissionGate>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <RoleFormModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        role={selectedRole}
        onSave={handleSaveRole}
      />

      <PermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        role={selectedRole}
        allPermissions={allPermissions}
        rolePermissions={selectedRolePermissions}
        onSave={handleSavePermissions}
      />
    </div>
  );
}
