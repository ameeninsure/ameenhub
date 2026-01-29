"use client";

/**
 * Permission Context
 * Provides permission checking throughout the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { UserWithPermissions, Role } from "@/lib/permissions/types";

interface PermissionContextType {
  user: UserWithPermissions | null;
  permissions: Set<string>;
  roles: Role[];
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (roleCode: string) => boolean;
  refreshPermissions: () => Promise<void>;
  setUser: (user: UserWithPermissions | null) => void;
}

const PermissionContext = createContext<PermissionContextType | null>(null);

interface PermissionProviderProps {
  children: ReactNode;
  userId?: number;
  initialUser?: UserWithPermissions | null;
}

export function PermissionProvider({
  children,
  userId,
  initialUser = null,
}: PermissionProviderProps) {
  const [user, setUser] = useState<UserWithPermissions | null>(initialUser);
  const [permissions, setPermissions] = useState<Set<string>>(
    new Set(initialUser?.permissions || [])
  );
  const [roles, setRoles] = useState<Role[]>(initialUser?.roles || []);
  const [isLoading, setIsLoading] = useState(!initialUser && !!userId);

  // Check if user has super_admin role (super_admin has access to everything)
  const isSuperAdmin = useCallback((): boolean => {
    return roles.some((r) => r.code === "super_admin");
  }, [roles]);

  const fetchUserPermissions = useCallback(async (uid: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${uid}?includePermissions=true`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const userData = data.data as UserWithPermissions;
        setUser(userData);
        setPermissions(new Set(userData.permissions));
        setRoles(userData.roles);
      }
    } catch (error) {
      console.error("Error fetching user permissions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId && !initialUser) {
      fetchUserPermissions(userId);
    }
  }, [userId, initialUser, fetchUserPermissions]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      // Super admin users have access to everything
      if (isSuperAdmin()) return true;
      return permissions.has(permission);
    },
    [permissions, isSuperAdmin]
  );

  const hasAnyPermission = useCallback(
    (perms: string[]): boolean => {
      // Super admin users have access to everything
      if (isSuperAdmin()) return true;
      return perms.some((p) => permissions.has(p));
    },
    [permissions, isSuperAdmin]
  );

  const hasAllPermissions = useCallback(
    (perms: string[]): boolean => {
      // Super admin users have access to everything
      if (isSuperAdmin()) return true;
      return perms.every((p) => permissions.has(p));
    },
    [permissions, isSuperAdmin]
  );

  const hasRole = useCallback(
    (roleCode: string): boolean => {
      return roles.some((r) => r.code === roleCode);
    },
    [roles]
  );

  const refreshPermissions = useCallback(async () => {
    if (user?.id) {
      await fetchUserPermissions(user.id);
    }
  }, [user?.id, fetchUserPermissions]);

  const handleSetUser = useCallback((newUser: UserWithPermissions | null) => {
    setUser(newUser);
    if (newUser) {
      setPermissions(new Set(newUser.permissions));
      setRoles(newUser.roles);
    } else {
      setPermissions(new Set());
      setRoles([]);
    }
  }, []);

  const value: PermissionContextType = {
    user,
    permissions,
    roles,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    refreshPermissions,
    setUser: handleSetUser,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}

// Convenience hooks
export function useHasPermission(permission: string): boolean {
  const { hasPermission, isLoading } = usePermissions();
  return !isLoading && hasPermission(permission);
}

export function useHasAnyPermission(permissions: string[]): boolean {
  const { hasAnyPermission, isLoading } = usePermissions();
  return !isLoading && hasAnyPermission(permissions);
}

export function useHasAllPermissions(permissions: string[]): boolean {
  const { hasAllPermissions, isLoading } = usePermissions();
  return !isLoading && hasAllPermissions(permissions);
}

export function useHasRole(roleCode: string): boolean {
  const { hasRole, isLoading } = usePermissions();
  return !isLoading && hasRole(roleCode);
}
