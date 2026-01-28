Key Features
Auto-registration: New features automatically register in the permission system
Granular control: Control pages, APIs, buttons, menus, and features
Custom roles: Admins can create unlimited custom roles
Permission override: Users can have custom permissions (grant/deny) beyond their roles
Bilingual: All text in English and Arabic
Audit logging: Track all permission changes
Usage Examples:

// In components - control visibility
<PermissionGate permission="customers.create">
  <CreateButton />
</PermissionGate>

// In pages - protect entire page
<ProtectedPage permission="customers.view">
  <CustomersPage />
</ProtectedPage>

// Define new module permissions automatically
const invoicePermissions = defineModulePermissions({
  module: "invoices",
  nameEn: "Invoices",
  nameAr: "الفواتير",
  permissions: { view: true, create: true, edit: true, delete: true }
});