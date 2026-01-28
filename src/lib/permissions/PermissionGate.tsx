"use client";

/**
 * Permission Gate Component
 * Conditionally renders children based on permissions
 * 
 * Usage:
 * <PermissionGate permission="customers.create">
 *   <CreateCustomerButton />
 * </PermissionGate>
 * 
 * <PermissionGate permissions={["orders.edit", "orders.delete"]} requireAll={false}>
 *   <OrderActionsMenu />
 * </PermissionGate>
 */

import React, { ReactNode } from "react";
import { usePermissions } from "./PermissionContext";

interface PermissionGateProps {
  // Single permission
  permission?: string;
  // Multiple permissions
  permissions?: string[];
  // If true, all permissions are required. If false, any permission is enough.
  requireAll?: boolean;
  // Role-based access
  role?: string;
  roles?: string[];
  // Content to render when access is denied
  fallback?: ReactNode;
  // Children to render when access is granted
  children: ReactNode;
  // If true, shows loading state while permissions are being fetched
  showLoading?: boolean;
  // Loading component
  loadingComponent?: ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  fallback = null,
  children,
  showLoading = false,
  loadingComponent = null,
}: PermissionGateProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isLoading,
  } = usePermissions();

  // Show loading state if requested
  if (isLoading && showLoading) {
    return <>{loadingComponent}</>;
  }

  // Don't render anything while loading (unless fallback is provided)
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Check role-based access
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (roles && roles.length > 0) {
    const hasAnyRole = roles.some((r) => hasRole(r));
    if (!hasAnyRole) {
      return <>{fallback}</>;
    }
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // Access granted
  return <>{children}</>;
}

/**
 * Higher-order component for permission-based access control
 * 
 * Usage:
 * const ProtectedComponent = withPermission(MyComponent, "customers.view");
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: string,
  FallbackComponent?: React.ComponentType
) {
  return function PermissionWrappedComponent(props: P) {
    const { hasPermission, isLoading } = usePermissions();

    if (isLoading) {
      return null;
    }

    if (!hasPermission(permission)) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Button component that only renders if user has permission
 * 
 * Usage:
 * <PermissionButton
 *   permission="customers.create"
 *   onClick={handleCreate}
 *   className="btn-primary"
 * >
 *   Create Customer
 * </PermissionButton>
 */
interface PermissionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
  children: ReactNode;
}

export function PermissionButton({
  permission,
  permissions,
  requireAll = false,
  role,
  children,
  ...buttonProps
}: PermissionButtonProps) {
  return (
    <PermissionGate
      permission={permission}
      permissions={permissions}
      requireAll={requireAll}
      role={role}
    >
      <button {...buttonProps}>{children}</button>
    </PermissionGate>
  );
}

/**
 * Link component that only renders if user has permission
 */
interface PermissionLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
  children: ReactNode;
}

export function PermissionLink({
  permission,
  permissions,
  requireAll = false,
  role,
  children,
  ...linkProps
}: PermissionLinkProps) {
  return (
    <PermissionGate
      permission={permission}
      permissions={permissions}
      requireAll={requireAll}
      role={role}
    >
      <a {...linkProps}>{children}</a>
    </PermissionGate>
  );
}

/**
 * Menu item component that only renders if user has permission
 */
interface PermissionMenuItemProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
  label: string;
  labelAr?: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  language?: "en" | "ar";
}

export function PermissionMenuItem({
  permission,
  permissions,
  requireAll = false,
  role,
  label,
  labelAr,
  icon,
  href,
  onClick,
  className = "",
  language = "en",
}: PermissionMenuItemProps) {
  const displayLabel = language === "ar" && labelAr ? labelAr : label;

  return (
    <PermissionGate
      permission={permission}
      permissions={permissions}
      requireAll={requireAll}
      role={role}
    >
      {href ? (
        <a href={href} className={className}>
          {icon && <span className="menu-icon">{icon}</span>}
          <span className="menu-label">{displayLabel}</span>
        </a>
      ) : (
        <button onClick={onClick} className={className}>
          {icon && <span className="menu-icon">{icon}</span>}
          <span className="menu-label">{displayLabel}</span>
        </button>
      )}
    </PermissionGate>
  );
}
