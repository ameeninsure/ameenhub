"use client";

/**
 * Protected Page Wrapper
 * Wraps a page component and checks for permissions before rendering
 * 
 * Usage:
 * <ProtectedPage permission="customers.view" fallback={<AccessDenied />}>
 *   <CustomersPage />
 * </ProtectedPage>
 */

import React, { ReactNode } from "react";
import { usePermissions } from "@/lib/permissions/client";
import { AccessDenied } from "./AccessDenied";

interface ProtectedPageProps {
  // Single permission required
  permission?: string;
  // Multiple permissions (requires any by default, or all if requireAll is true)
  permissions?: string[];
  // If true, all permissions must be present
  requireAll?: boolean;
  // Role required
  role?: string;
  // Multiple roles (requires any)
  roles?: string[];
  // Custom fallback component (default is AccessDenied)
  fallback?: ReactNode;
  // Loading component
  loadingComponent?: ReactNode;
  // Children to render when access is granted
  children: ReactNode;
}

export function ProtectedPage({
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  fallback,
  loadingComponent,
  children,
}: ProtectedPageProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isLoading,
  } = usePermissions();

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check role-based access
  if (role && !hasRole(role)) {
    return <>{fallback || <AccessDenied />}</>;
  }

  if (roles && roles.length > 0) {
    const hasAnyRole = roles.some((r) => hasRole(r));
    if (!hasAnyRole) {
      return <>{fallback || <AccessDenied />}</>;
    }
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback || <AccessDenied />}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback || <AccessDenied />}</>;
    }
  }

  // Access granted
  return <>{children}</>;
}

/**
 * Higher-order component for page-level protection
 * 
 * Usage:
 * export default withPageProtection(CustomersPage, { permission: "customers.view" });
 */
export function withPageProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    role?: string;
    roles?: string[];
  }
) {
  return function ProtectedPageWrapper(props: P) {
    return (
      <ProtectedPage {...options}>
        <WrappedComponent {...props} />
      </ProtectedPage>
    );
  };
}
