/**
 * Permission System - Main Export
 * 
 * WARNING: This file contains server-only modules (pg database).
 * For client components, import from './client' instead:
 * import { PermissionGate, usePermissions } from '@/lib/permissions/client';
 */

// Re-export client-safe modules
export * from './client';

// Server-only exports below - DO NOT import in client components

// Registry (server-only - uses database)
export {
  definePermission,
  getRegisteredPermissions,
  syncPermissionsToDatabase,
  registerPermissionToDatabase,
  type PermissionDefinition,
} from './registry';

// Queries (server-only - uses database)
export * from './queries';

// Decorators for auto-registration (can be used anywhere, but registration is server-only)
export {
  definePage,
  defineApi,
  defineButton,
  defineMenu,
  defineFeature,
  defineModulePermissions,
  type ModulePermissions,
} from './decorators';

// API Middleware (server-only)
export {
  getUserIdFromRequest,
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  unauthorizedResponse,
  forbiddenResponse,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
} from './middleware';
