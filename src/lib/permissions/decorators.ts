/**
 * Permission Decorator
 * Utility for auto-registering permissions when defining components/features
 * 
 * This allows automatic permission registration when new features are added
 */

import { definePermission, type PermissionDefinition } from "./registry";

/**
 * Define a page permission and register it
 */
export function definePage(
  code: string,
  module: string,
  nameEn: string,
  nameAr: string,
  descriptionEn?: string,
  descriptionAr?: string
): string {
  return definePermission({
    code,
    module,
    category: "page",
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
  });
}

/**
 * Define an API permission and register it
 */
export function defineApi(
  code: string,
  module: string,
  nameEn: string,
  nameAr: string,
  descriptionEn?: string,
  descriptionAr?: string
): string {
  return definePermission({
    code,
    module,
    category: "api",
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
  });
}

/**
 * Define a button permission and register it
 */
export function defineButton(
  code: string,
  module: string,
  nameEn: string,
  nameAr: string,
  descriptionEn?: string,
  descriptionAr?: string
): string {
  return definePermission({
    code,
    module,
    category: "button",
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
  });
}

/**
 * Define a menu permission and register it
 */
export function defineMenu(
  code: string,
  module: string,
  nameEn: string,
  nameAr: string,
  descriptionEn?: string,
  descriptionAr?: string
): string {
  return definePermission({
    code,
    module,
    category: "menu",
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
  });
}

/**
 * Define a feature permission and register it
 */
export function defineFeature(
  code: string,
  module: string,
  nameEn: string,
  nameAr: string,
  descriptionEn?: string,
  descriptionAr?: string
): string {
  return definePermission({
    code,
    module,
    category: "feature",
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
  });
}

/**
 * Define multiple permissions for a module at once
 */
export interface ModulePermissions {
  module: string;
  nameEn: string;
  nameAr: string;
  permissions: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    export?: boolean;
    import?: boolean;
    custom?: Array<{
      action: string;
      category: PermissionDefinition["category"];
      nameEn: string;
      nameAr: string;
      descriptionEn?: string;
      descriptionAr?: string;
    }>;
  };
}

export function defineModulePermissions(config: ModulePermissions): Record<string, string> {
  const result: Record<string, string> = {};
  const { module, nameEn, nameAr, permissions } = config;

  if (permissions.view) {
    result.view = definePermission({
      code: `${module}.view`,
      module,
      category: "page",
      nameEn: `View ${nameEn}`,
      nameAr: `عرض ${nameAr}`,
      descriptionEn: `Can view ${nameEn.toLowerCase()} list`,
      descriptionAr: `يمكن عرض قائمة ${nameAr}`,
    });
  }

  if (permissions.create) {
    result.create = definePermission({
      code: `${module}.create`,
      module,
      category: "api",
      nameEn: `Create ${nameEn}`,
      nameAr: `إنشاء ${nameAr}`,
      descriptionEn: `Can create new ${nameEn.toLowerCase()}`,
      descriptionAr: `يمكن إنشاء ${nameAr} جديد`,
    });
  }

  if (permissions.edit) {
    result.edit = definePermission({
      code: `${module}.edit`,
      module,
      category: "api",
      nameEn: `Edit ${nameEn}`,
      nameAr: `تعديل ${nameAr}`,
      descriptionEn: `Can edit existing ${nameEn.toLowerCase()}`,
      descriptionAr: `يمكن تعديل ${nameAr}`,
    });
  }

  if (permissions.delete) {
    result.delete = definePermission({
      code: `${module}.delete`,
      module,
      category: "api",
      nameEn: `Delete ${nameEn}`,
      nameAr: `حذف ${nameAr}`,
      descriptionEn: `Can delete ${nameEn.toLowerCase()}`,
      descriptionAr: `يمكن حذف ${nameAr}`,
    });
  }

  if (permissions.export) {
    result.export = definePermission({
      code: `${module}.export`,
      module,
      category: "button",
      nameEn: `Export ${nameEn}`,
      nameAr: `تصدير ${nameAr}`,
      descriptionEn: `Can export ${nameEn.toLowerCase()} data`,
      descriptionAr: `يمكن تصدير بيانات ${nameAr}`,
    });
  }

  if (permissions.import) {
    result.import = definePermission({
      code: `${module}.import`,
      module,
      category: "button",
      nameEn: `Import ${nameEn}`,
      nameAr: `استيراد ${nameAr}`,
      descriptionEn: `Can import ${nameEn.toLowerCase()} data`,
      descriptionAr: `يمكن استيراد بيانات ${nameAr}`,
    });
  }

  // Menu permission
  result.menu = definePermission({
    code: `menu.${module}`,
    module: "navigation",
    category: "menu",
    nameEn: `${nameEn} Menu`,
    nameAr: `قائمة ${nameAr}`,
    descriptionEn: `Can see ${nameEn.toLowerCase()} in navigation`,
    descriptionAr: `يمكن رؤية ${nameAr} في القائمة`,
  });

  // Custom permissions
  if (permissions.custom) {
    for (const custom of permissions.custom) {
      result[custom.action] = definePermission({
        code: `${module}.${custom.action}`,
        module,
        category: custom.category,
        nameEn: custom.nameEn,
        nameAr: custom.nameAr,
        descriptionEn: custom.descriptionEn,
        descriptionAr: custom.descriptionAr,
      });
    }
  }

  return result;
}

// ============================================================================
// Example: How to define permissions for a new module
// ============================================================================

/*
// In your module file (e.g., src/modules/products/permissions.ts):

import { defineModulePermissions, defineButton } from "@/lib/permissions/decorators";

// Define all standard permissions for the products module
export const productPermissions = defineModulePermissions({
  module: "products",
  nameEn: "Products",
  nameAr: "المنتجات",
  permissions: {
    view: true,
    create: true,
    edit: true,
    delete: true,
    export: true,
    import: true,
    custom: [
      {
        action: "approve",
        category: "button",
        nameEn: "Approve Products",
        nameAr: "الموافقة على المنتجات",
        descriptionEn: "Can approve products for publishing",
        descriptionAr: "يمكن الموافقة على المنتجات للنشر",
      },
    ],
  },
});

// Or define individual permissions:
export const PRODUCT_BULK_DELETE = defineButton(
  "products.bulk_delete",
  "products",
  "Bulk Delete Products",
  "حذف المنتجات بالجملة",
  "Can delete multiple products at once",
  "يمكن حذف عدة منتجات دفعة واحدة"
);

// Then use them in your components:
// <PermissionGate permission={productPermissions.create}>
//   <CreateProductButton />
// </PermissionGate>
*/
