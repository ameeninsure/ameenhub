/**
 * Permission Types
 * Type definitions for the permission system
 */

// Permission categories
export type PermissionCategory = 'page' | 'api' | 'button' | 'menu' | 'feature';

// Permission from database
export interface Permission {
  id: number;
  code: string;
  module: string;
  category: PermissionCategory;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Role from database
export interface Role {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Role with permissions
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

// User from database
export interface User {
  id: number;
  code: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string;
  full_name_ar: string | null;
  position: string | null;
  position_ar: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: 'en' | 'ar';
  is_active: boolean;
  is_system: boolean;
  manager_id: number | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// User without sensitive data
export interface SafeUser {
  id: number;
  code: string;
  username: string;
  email: string;
  full_name: string;
  full_name_ar: string | null;
  position: string | null;
  position_ar: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: 'en' | 'ar';
  is_active: boolean;
  is_system: boolean;
  manager_id: number | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  has_active_device?: boolean;
}

// User with roles and permissions
export interface UserWithPermissions extends SafeUser {
  roles: Role[];
  permissions: string[]; // Array of permission codes
}

// User permission from get_user_permissions function
export interface UserPermission {
  permission_code: string;
  permission_name_en: string;
  permission_name_ar: string;
  module: string;
  category: string;
  source: 'role' | 'custom';
}

// Role permission assignment
export interface RolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  granted_at: Date;
  granted_by: number | null;
}

// User role assignment
export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  assigned_at: Date;
  assigned_by: number | null;
}

// User custom permission
export interface UserCustomPermission {
  id: number;
  user_id: number;
  permission_id: number;
  is_granted: boolean;
  assigned_at: Date;
  assigned_by: number | null;
}

// Permission audit log
export interface PermissionAuditLog {
  id: number;
  action: string;
  actor_user_id: number | null;
  target_user_id: number | null;
  target_role_id: number | null;
  permission_id: number | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: Date;
}

// Input types for creating/updating
export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  full_name: string;
  full_name_ar?: string;
  position?: string;
  position_ar?: string;
  phone?: string;
  avatar_url?: string;
  preferred_language?: 'en' | 'ar';
  manager_id?: number | null;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  full_name?: string;
  full_name_ar?: string;
  position?: string;
  position_ar?: string;
  phone?: string;
  avatar_url?: string;
  preferred_language?: 'en' | 'ar';
  is_active?: boolean;
  manager_id?: number | null;
}

export interface CreateRoleInput {
  code: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
}

export interface UpdateRoleInput {
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  is_active?: boolean;
}

export interface CreatePermissionInput {
  code: string;
  module: string;
  category: PermissionCategory;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
}

export interface UpdatePermissionInput {
  name_en?: string;
  name_ar?: string;
  description_en?: string;
  description_ar?: string;
  is_active?: boolean;
}

// Permission grouped by module (for UI)
export interface PermissionsByModule {
  module: string;
  permissions: Permission[];
}

// Permission grouped by category (for UI)
export interface PermissionsByCategory {
  category: PermissionCategory;
  permissions: Permission[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
