/**
 * Permission System - Client-Side Exports Only
 * This file should be imported in client components
 */

// Types (safe for client)
export * from './types';

// Context and Hooks (client components)
export {
  PermissionProvider,
  usePermissions,
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
  useHasRole,
} from './PermissionContext';

// Components (client components)
export {
  PermissionGate,
  PermissionButton,
  PermissionLink,
  PermissionMenuItem,
  withPermission,
} from './PermissionGate';
