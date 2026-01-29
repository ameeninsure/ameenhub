/**
 * Permission System - Database Queries
 * CRUD operations for users, roles, and permissions
 */

import { query, transaction } from "@/db";
import type {
  Permission,
  Role,
  RoleWithPermissions,
  User,
  SafeUser,
  UserWithPermissions,
  UserPermission,
  RolePermission,
  UserRole,
  UserCustomPermission,
  PermissionAuditLog,
  CreateUserInput,
  UpdateUserInput,
  CreateRoleInput,
  UpdateRoleInput,
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionsByModule,
} from "./types";

// ============================================================================
// PERMISSION QUERIES
// ============================================================================

/**
 * Get all permissions
 */
export async function getAllPermissions(activeOnly = true): Promise<Permission[]> {
  const whereClause = activeOnly ? "WHERE is_active = true" : "";
  const result = await query<Permission>(
    `SELECT * FROM permissions ${whereClause} ORDER BY module, category, code`
  );
  return result.rows;
}

/**
 * Get permissions grouped by module
 */
export async function getPermissionsByModule(activeOnly = true): Promise<PermissionsByModule[]> {
  const permissions = await getAllPermissions(activeOnly);
  
  const grouped = permissions.reduce((acc, permission) => {
    const existing = acc.find(g => g.module === permission.module);
    if (existing) {
      existing.permissions.push(permission);
    } else {
      acc.push({ module: permission.module, permissions: [permission] });
    }
    return acc;
  }, [] as PermissionsByModule[]);
  
  return grouped;
}

/**
 * Get permission by ID
 */
export async function getPermissionById(id: number): Promise<Permission | null> {
  const result = await query<Permission>(
    "SELECT * FROM permissions WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Get permission by code
 */
export async function getPermissionByCode(code: string): Promise<Permission | null> {
  const result = await query<Permission>(
    "SELECT * FROM permissions WHERE code = $1",
    [code]
  );
  return result.rows[0] || null;
}

/**
 * Create a permission
 */
export async function createPermission(input: CreatePermissionInput): Promise<Permission> {
  const result = await query<Permission>(
    `INSERT INTO permissions (code, module, category, name_en, name_ar, description_en, description_ar)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.code,
      input.module,
      input.category,
      input.name_en,
      input.name_ar,
      input.description_en || null,
      input.description_ar || null,
    ]
  );
  
  // Auto-grant to super_admin
  await query(
    `INSERT INTO role_permissions (role_id, permission_id)
     SELECT r.id, $1
     FROM roles r
     WHERE r.code = 'super_admin'
     ON CONFLICT (role_id, permission_id) DO NOTHING`,
    [result.rows[0].id]
  );
  
  return result.rows[0];
}

/**
 * Update a permission
 */
export async function updatePermission(
  id: number,
  input: UpdatePermissionInput
): Promise<Permission | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (input.name_en !== undefined) {
    fields.push(`name_en = $${paramCount++}`);
    values.push(input.name_en);
  }
  if (input.name_ar !== undefined) {
    fields.push(`name_ar = $${paramCount++}`);
    values.push(input.name_ar);
  }
  if (input.description_en !== undefined) {
    fields.push(`description_en = $${paramCount++}`);
    values.push(input.description_en);
  }
  if (input.description_ar !== undefined) {
    fields.push(`description_ar = $${paramCount++}`);
    values.push(input.description_ar);
  }
  if (input.is_active !== undefined) {
    fields.push(`is_active = $${paramCount++}`);
    values.push(input.is_active);
  }

  if (fields.length === 0) return getPermissionById(id);

  values.push(id);
  const result = await query<Permission>(
    `UPDATE permissions SET ${fields.join(", ")} WHERE id = $${paramCount} AND is_system = false RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

/**
 * Delete a permission (only non-system permissions)
 */
export async function deletePermission(id: number): Promise<boolean> {
  const result = await query(
    "DELETE FROM permissions WHERE id = $1 AND is_system = false",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

// ============================================================================
// ROLE QUERIES
// ============================================================================

/**
 * Get all roles
 */
export async function getAllRoles(activeOnly = true): Promise<Role[]> {
  const whereClause = activeOnly ? "WHERE r.is_active = true" : "";
  const result = await query<Role>(
    `SELECT r.*,
            COUNT(DISTINCT rp.permission_id)::int AS permissions_count,
            COUNT(DISTINCT ur.user_id)::int AS users_count
     FROM roles r
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN user_roles ur ON ur.role_id = r.id
     ${whereClause}
     GROUP BY r.id
     ORDER BY r.is_system DESC, r.name_en`
  );
  return result.rows;
}

/**
 * Get role by ID
 */
export async function getRoleById(id: number): Promise<Role | null> {
  const result = await query<Role>("SELECT * FROM roles WHERE id = $1", [id]);
  return result.rows[0] || null;
}

/**
 * Get role by code
 */
export async function getRoleByCode(code: string): Promise<Role | null> {
  const result = await query<Role>("SELECT * FROM roles WHERE code = $1", [code]);
  return result.rows[0] || null;
}

/**
 * Get role with permissions
 */
export async function getRoleWithPermissions(id: number): Promise<RoleWithPermissions | null> {
  const role = await getRoleById(id);
  if (!role) return null;

  const permissionsResult = await query<Permission>(
    `SELECT p.*
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = $1 AND p.is_active = true
     ORDER BY p.module, p.category, p.code`,
    [id]
  );

  return {
    ...role,
    permissions: permissionsResult.rows,
  };
}

/**
 * Create a role
 */
export async function createRole(input: CreateRoleInput): Promise<Role> {
  const result = await query<Role>(
    `INSERT INTO roles (code, name_en, name_ar, description_en, description_ar)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      input.code,
      input.name_en,
      input.name_ar,
      input.description_en || null,
      input.description_ar || null,
    ]
  );
  return result.rows[0];
}

/**
 * Update a role
 */
export async function updateRole(
  id: number,
  input: UpdateRoleInput
): Promise<Role | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (input.name_en !== undefined) {
    fields.push(`name_en = $${paramCount++}`);
    values.push(input.name_en);
  }
  if (input.name_ar !== undefined) {
    fields.push(`name_ar = $${paramCount++}`);
    values.push(input.name_ar);
  }
  if (input.description_en !== undefined) {
    fields.push(`description_en = $${paramCount++}`);
    values.push(input.description_en);
  }
  if (input.description_ar !== undefined) {
    fields.push(`description_ar = $${paramCount++}`);
    values.push(input.description_ar);
  }
  if (input.is_active !== undefined) {
    fields.push(`is_active = $${paramCount++}`);
    values.push(input.is_active);
  }

  if (fields.length === 0) return getRoleById(id);

  values.push(id);
  const result = await query<Role>(
    `UPDATE roles SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

/**
 * Delete a role (only non-system roles)
 */
export async function deleteRole(id: number): Promise<boolean> {
  const result = await query(
    "DELETE FROM roles WHERE id = $1 AND is_system = false",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Assign permission to role
 */
export async function assignPermissionToRole(
  roleId: number,
  permissionId: number,
  grantedBy?: number
): Promise<RolePermission | null> {
  const result = await query<RolePermission>(
    `INSERT INTO role_permissions (role_id, permission_id, granted_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (role_id, permission_id) DO NOTHING
     RETURNING *`,
    [roleId, permissionId, grantedBy || null]
  );
  return result.rows[0] || null;
}

/**
 * Remove permission from role
 */
export async function removePermissionFromRole(
  roleId: number,
  permissionId: number
): Promise<boolean> {
  const result = await query(
    "DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2",
    [roleId, permissionId]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Set role permissions (replace all)
 */
export async function setRolePermissions(
  roleId: number,
  permissionIds: number[],
  grantedBy?: number
): Promise<void> {
  await transaction(async (client) => {
    // Remove all existing permissions
    await client.query("DELETE FROM role_permissions WHERE role_id = $1", [roleId]);

    // Add new permissions
    if (permissionIds.length > 0) {
      const values = permissionIds
        .map((_, i) => `($1, $${i + 2}, $${permissionIds.length + 2})`)
        .join(", ");
      await client.query(
        `INSERT INTO role_permissions (role_id, permission_id, granted_by) VALUES ${values}`,
        [roleId, ...permissionIds, grantedBy || null]
      );
    }
  });
}

// ============================================================================
// USER QUERIES
// ============================================================================

/**
 * Get all users
 */
export async function getAllUsers(
  activeOnly = true,
  limit = 50,
  offset = 0
): Promise<SafeUser[]> {
  const whereClause = activeOnly ? "WHERE is_active = true" : "";
  const result = await query<SafeUser>(
    `SELECT id, username, email, full_name, phone, avatar_url,
            preferred_language, is_active, is_system, last_login_at, created_at, updated_at
     FROM users ${whereClause}
     ORDER BY full_name
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

/**
 * Get user count
 */
export async function getUserCount(activeOnly = true): Promise<number> {
  const whereClause = activeOnly ? "WHERE is_active = true" : "";
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) FROM users ${whereClause}`
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  const result = await query<User>("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

/**
 * Get user by ID (safe, without password)
 */
export async function getSafeUserById(id: number): Promise<SafeUser | null> {
  const result = await query<SafeUser>(
    `SELECT id, username, email, full_name, phone, avatar_url,
            preferred_language, is_active, is_system, last_login_at, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await query<User>(
    "SELECT * FROM users WHERE username = $1",
    [username]
  );
  return result.rows[0] || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Get user with all permissions
 */
export async function getUserWithPermissions(id: number): Promise<UserWithPermissions | null> {
  const user = await getSafeUserById(id);
  if (!user) return null;

  // Get user roles
  const rolesResult = await query<Role>(
    `SELECT r.*
     FROM roles r
     JOIN user_roles ur ON r.id = ur.role_id
     WHERE ur.user_id = $1 AND r.is_active = true`,
    [id]
  );

  // Get all permissions using the database function
  const permissionsResult = await query<UserPermission>(
    "SELECT * FROM get_user_permissions($1)",
    [id]
  );

  return {
    ...user,
    roles: rolesResult.rows,
    permissions: permissionsResult.rows.map((p) => p.permission_code),
  };
}

/**
 * Check if user is an admin (super_admin or admin role)
 * Admin users have access to all permissions
 */
export async function isUserAdmin(userId: number): Promise<boolean> {
  const result = await query<{ is_admin: boolean }>(
    `SELECT EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1 
        AND r.code IN ('super_admin', 'admin')
        AND r.is_active = true
    ) as is_admin`,
    [userId]
  );
  return result.rows[0]?.is_admin ?? false;
}

/**
 * Check if user has a specific permission
 */
export async function userHasPermission(
  userId: number,
  permissionCode: string
): Promise<boolean> {
  // Admin users have access to everything
  if (await isUserAdmin(userId)) {
    return true;
  }
  
  const result = await query<{ user_has_permission: boolean }>(
    "SELECT user_has_permission($1, $2)",
    [userId, permissionCode]
  );
  return result.rows[0]?.user_has_permission ?? false;
}

/**
 * Check if user has any of the specified permissions
 */
export async function userHasAnyPermission(
  userId: number,
  permissionCodes: string[]
): Promise<boolean> {
  // Admin users have access to everything
  if (await isUserAdmin(userId)) {
    return true;
  }
  
  for (const code of permissionCodes) {
    if (await userHasPermission(userId, code)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user has all of the specified permissions
 */
export async function userHasAllPermissions(
  userId: number,
  permissionCodes: string[]
): Promise<boolean> {
  // Admin users have access to everything
  if (await isUserAdmin(userId)) {
    return true;
  }
  
  for (const code of permissionCodes) {
    if (!(await userHasPermission(userId, code))) {
      return false;
    }
  }
  return true;
}

/**
 * Create a user
 */
export async function createUser(
  input: CreateUserInput,
  passwordHash: string
): Promise<SafeUser> {
  const result = await query<SafeUser>(
    `INSERT INTO users (username, email, password_hash, full_name, phone, avatar_url, preferred_language)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, username, email, full_name, phone, avatar_url,
               preferred_language, is_active, is_system, last_login_at, created_at, updated_at`,
    [
      input.username,
      input.email,
      passwordHash,
      input.full_name,
      input.phone || null,
      input.avatar_url || null,
      input.preferred_language || "en",
    ]
  );
  return result.rows[0];
}

/**
 * Update a user
 */
export async function updateUser(
  id: number,
  input: UpdateUserInput
): Promise<SafeUser | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (input.username !== undefined) {
    fields.push(`username = $${paramCount++}`);
    values.push(input.username);
  }
  if (input.email !== undefined) {
    fields.push(`email = $${paramCount++}`);
    values.push(input.email);
  }
  if (input.full_name !== undefined) {
    fields.push(`full_name = $${paramCount++}`);
    values.push(input.full_name);
  }
  if (input.phone !== undefined) {
    fields.push(`phone = $${paramCount++}`);
    values.push(input.phone);
  }
  if (input.avatar_url !== undefined) {
    fields.push(`avatar_url = $${paramCount++}`);
    values.push(input.avatar_url);
  }
  if (input.preferred_language !== undefined) {
    fields.push(`preferred_language = $${paramCount++}`);
    values.push(input.preferred_language);
  }
  if (input.is_active !== undefined) {
    fields.push(`is_active = $${paramCount++}`);
    values.push(input.is_active);
  }

  if (fields.length === 0) return getSafeUserById(id);

  values.push(id);
  const result = await query<SafeUser>(
    `UPDATE users SET ${fields.join(", ")}
     WHERE id = $${paramCount}
     RETURNING id, username, email, full_name, phone, avatar_url,
               preferred_language, is_active, is_system, last_login_at, created_at, updated_at`,
    values
  );
  return result.rows[0] || null;
}

/**
 * Update user password
 */
export async function updateUserPassword(
  id: number,
  passwordHash: string
): Promise<boolean> {
  const result = await query(
    "UPDATE users SET password_hash = $1 WHERE id = $2",
    [passwordHash, id]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Update user last login
 */
export async function updateUserLastLogin(id: number): Promise<void> {
  await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [id]);
}

/**
 * Delete a user (only non-system users)
 */
export async function deleteUser(id: number): Promise<boolean> {
  const result = await query(
    "DELETE FROM users WHERE id = $1 AND is_system = false",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(
  userId: number,
  roleId: number,
  assignedBy?: number
): Promise<UserRole | null> {
  const result = await query<UserRole>(
    `INSERT INTO user_roles (user_id, role_id, assigned_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, role_id) DO NOTHING
     RETURNING *`,
    [userId, roleId, assignedBy || null]
  );
  return result.rows[0] || null;
}

/**
 * Remove role from user
 */
export async function removeRoleFromUser(
  userId: number,
  roleId: number
): Promise<boolean> {
  const result = await query(
    "DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2",
    [userId, roleId]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Set user roles (replace all)
 */
export async function setUserRoles(
  userId: number,
  roleIds: number[],
  assignedBy?: number
): Promise<void> {
  await transaction(async (client) => {
    // Remove all existing roles
    await client.query("DELETE FROM user_roles WHERE user_id = $1", [userId]);

    // Add new roles
    if (roleIds.length > 0) {
      const values = roleIds
        .map((_, i) => `($1, $${i + 2}, $${roleIds.length + 2})`)
        .join(", ");
      await client.query(
        `INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ${values}`,
        [userId, ...roleIds, assignedBy || null]
      );
    }
  });
}

/**
 * Get user roles
 */
export async function getUserRoles(userId: number): Promise<Role[]> {
  const result = await query<Role>(
    `SELECT r.*
     FROM roles r
     JOIN user_roles ur ON r.id = ur.role_id
     WHERE ur.user_id = $1 AND r.is_active = true
     ORDER BY r.name_en`,
    [userId]
  );
  return result.rows;
}

/**
 * Assign custom permission to user
 */
export async function assignCustomPermissionToUser(
  userId: number,
  permissionId: number,
  isGranted: boolean,
  assignedBy?: number
): Promise<UserCustomPermission | null> {
  const result = await query<UserCustomPermission>(
    `INSERT INTO user_custom_permissions (user_id, permission_id, is_granted, assigned_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, permission_id) DO UPDATE SET is_granted = $3, assigned_by = $4
     RETURNING *`,
    [userId, permissionId, isGranted, assignedBy || null]
  );
  return result.rows[0] || null;
}

/**
 * Remove custom permission from user
 */
export async function removeCustomPermissionFromUser(
  userId: number,
  permissionId: number
): Promise<boolean> {
  const result = await query(
    "DELETE FROM user_custom_permissions WHERE user_id = $1 AND permission_id = $2",
    [userId, permissionId]
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get user custom permissions
 */
export async function getUserCustomPermissions(
  userId: number
): Promise<(UserCustomPermission & { permission: Permission })[]> {
  const result = await query<UserCustomPermission & { permission: Permission }>(
    `SELECT ucp.*, 
            row_to_json(p.*) as permission
     FROM user_custom_permissions ucp
     JOIN permissions p ON ucp.permission_id = p.id
     WHERE ucp.user_id = $1
     ORDER BY p.module, p.code`,
    [userId]
  );
  return result.rows;
}

// ============================================================================
// AUDIT LOG QUERIES
// ============================================================================

/**
 * Log a permission change
 */
export async function logPermissionChange(
  action: string,
  actorUserId: number | null,
  options: {
    targetUserId?: number;
    targetRoleId?: number;
    permissionId?: number;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }
): Promise<PermissionAuditLog> {
  const result = await query<PermissionAuditLog>(
    `INSERT INTO permission_audit_log 
     (action, actor_user_id, target_user_id, target_role_id, permission_id, details, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      action,
      actorUserId,
      options.targetUserId || null,
      options.targetRoleId || null,
      options.permissionId || null,
      options.details || null,
      options.ipAddress || null,
    ]
  );
  return result.rows[0];
}

/**
 * Get audit log entries
 */
export async function getAuditLog(
  limit = 50,
  offset = 0,
  filters?: {
    actorUserId?: number;
    targetUserId?: number;
    action?: string;
  }
): Promise<PermissionAuditLog[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (filters?.actorUserId !== undefined) {
    conditions.push(`actor_user_id = $${paramCount++}`);
    values.push(filters.actorUserId);
  }
  if (filters?.targetUserId !== undefined) {
    conditions.push(`target_user_id = $${paramCount++}`);
    values.push(filters.targetUserId);
  }
  if (filters?.action !== undefined) {
    conditions.push(`action = $${paramCount++}`);
    values.push(filters.action);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(limit, offset);
  const result = await query<PermissionAuditLog>(
    `SELECT * FROM permission_audit_log ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramCount++} OFFSET $${paramCount}`,
    values
  );
  return result.rows;
}
