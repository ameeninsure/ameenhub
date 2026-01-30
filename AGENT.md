# AmeenHub - Project Documentation

## Overview

AmeenHub is a comprehensive insurance management system built with Next.js 15, TypeScript, and PostgreSQL. It features a robust permission system, bilingual support (English/Arabic), real-time notifications, and customer portal.

## Technology Stack

- **Framework**: Next.js 15.1.6 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Styling**: Tailwind CSS
- **Authentication**: JWT with HTTP-only cookies
- **Push Notifications**: Web Push API with VAPID
- **File Upload**: Local storage with avatar support

## Project Structure

```
ameenhub/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── panel/        # Admin panel pages
│   │   ├── portal/       # Customer portal pages
│   │   └── login/        # Authentication pages
│   ├── components/       # React components
│   │   ├── panel/        # Admin panel specific
│   │   └── upload/       # File upload components
│   ├── lib/              # Shared libraries
│   │   ├── auth/         # Authentication logic
│   │   ├── permissions/  # Permission system
│   │   ├── notifications/# Notification service
│   │   ├── i18n/         # Internationalization
│   │   └── settings/     # App settings
│   └── db/               # Database utilities
│       └── queries/      # SQL query functions
├── db/
│   ├── init/             # Database initialization scripts
│   └── migrations/       # Database migrations
├── public/
│   ├── sw.js             # Service worker for push
│   └── uploads/          # User uploaded files
└── docker-compose.yml    # Docker configuration
```

## Key Features

### 1. Permission System

**Auto-registration**: New features automatically register in the permission system
**Granular control**: Control pages, APIs, buttons, menus, and features
**Custom roles**: Admins can create unlimited custom roles
**Permission override**: Users can have custom permissions (grant/deny) beyond their roles
**Bilingual**: All text in English and Arabic
**Audit logging**: Track all permission changes

**Usage Examples:**

```typescript
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
```

### 2. Notification System

**Push Notifications**: Browser push notifications with service worker
**In-app Notifications**: Real-time notification inbox
**Multi-recipient**: Send to individual users, customers, or broadcast
**Type Support**: Info, success, warning, error notifications
**Database Persistence**: All notifications stored and tracked

**Quick Start:**

```typescript
import { notifyUser, notifyCustomer } from '@/lib/notifications';

// Notify a user
await notifyUser(userId, {
  title: 'New Order',
  message: 'Your order has been placed',
  type: 'success',
  link: '/panel/orders/123'
});

// Notify a customer
await notifyCustomer(customerId, {
  title: 'Order Update',
  message: 'Your order status changed',
  type: 'info'
});
```

### 3. Authentication & Authorization

**JWT Tokens**: Secure HTTP-only cookie authentication
**Refresh Tokens**: Automatic token refresh
**Session Management**: Active session tracking
**Password Security**: bcrypt hashing
**Role-based Access**: Integration with permission system

### 4. Bilingual Support

**Languages**: English and Arabic (RTL support)
**Context-based**: React Context for language management
**Database Integration**: All entities have bilingual fields
**Dynamic Switching**: Users can switch language on-the-fly

### 5. File Upload System

**Avatar Upload**: User and customer profile pictures
**File Management**: Organized storage in public/uploads
**Type Validation**: Image format and size restrictions
**Progress Tracking**: Upload progress indication

### 6. Customer Portal

**Self-service**: Customers can manage their profile
**Order Tracking**: View and track orders
**Policy Management**: Access insurance policies
**Support System**: Submit and track support tickets
**Notifications**: Receive updates via push and in-app

## Database Schema

### Core Tables

- **users**: System users with roles and permissions
- **customers**: Customer accounts
- **roles**: User roles
- **permissions**: System permissions
- **role_permissions**: Role to permission mapping
- **user_permissions**: User-specific permission overrides
- **notifications**: Notification records
- **notification_subscriptions**: Push notification subscriptions

### Key Relationships

- Users have multiple roles (many-to-many)
- Roles have multiple permissions (many-to-many)
- Users can have permission overrides
- Customers can be created by users (created_by)
- Notifications are sent to users or customers

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ameenhub
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key

# App Configuration
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_NODE_VERSION=22.20.0
NEXT_PUBLIC_NEXTJS_VERSION=15.1.6
```

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users (paginated)
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user details
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Customers
- `GET /api/customers` - List customers (paginated)
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer details
- `PATCH /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Send notification
- `PATCH /api/notifications` - Mark as read
- `GET /api/notifications/subscribe` - Check subscription
- `POST /api/notifications/subscribe` - Subscribe to push
- `DELETE /api/notifications/subscribe` - Unsubscribe

### Permissions & Roles
- `GET /api/permissions` - List all permissions
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create role
- `PATCH /api/roles/[id]` - Update role
- `DELETE /api/roles/[id]` - Delete role

### File Upload
- `POST /api/upload/avatar` - Upload avatar image

## Development Setup

### Prerequisites
- Node.js 22.20.0 or higher
- PostgreSQL 14 or higher
- pnpm package manager

### Installation

```bash
# Clone repository
git clone <repository-url>
cd ameenhub

# Install dependencies
pnpm install

# Setup database
psql -U postgres -c "CREATE DATABASE ameenhub;"
psql -U postgres -d ameenhub -f db/init/001_init.sql
psql -U postgres -d ameenhub -f db/init/002_users_roles_permissions.sql
psql -U postgres -d ameenhub -f db/init/003_customers_portal.sql
psql -U postgres -d ameenhub -f db/init/004_notifications.sql

# Generate VAPID keys for push notifications
npx web-push generate-vapid-keys

# Create .env.local file with your configuration
cp .env.example .env.local

# Run development server
pnpm dev
```

### Docker Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Common Tasks

### Adding a New Permission

```typescript
// In src/lib/permissions/registry.ts
definePermission({
  code: 'my_module.view',
  module: 'my_module',
  category: 'page',
  nameEn: 'View My Module',
  nameAr: 'عرض الوحدة',
  descriptionEn: 'Can view my module',
  descriptionAr: 'يمكن عرض الوحدة',
  isSystem: true,
});

// Also add menu permission if needed
definePermission({
  code: 'menu.my_module',
  module: 'navigation',
  category: 'menu',
  nameEn: 'My Module Menu',
  nameAr: 'قائمة الوحدة',
  descriptionEn: 'Can see my module in navigation',
  descriptionAr: 'يمكن رؤية الوحدة في القائمة',
  isSystem: true,
});
```

**After adding permissions, sync them to database:**

```bash
# Call the sync API endpoint (requires authentication)
curl -X POST http://localhost:3000/api/permissions/sync \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Or visit in browser after login:
# POST /api/permissions/sync
```

### Sending a Notification

```typescript
// In API route or server action
import { notifyUser } from '@/lib/notifications';

await notifyUser(userId, {
  title: 'Action Complete',
  message: 'Your action was successful',
  type: 'success',
  link: '/panel/resource/123'
});
```

### Adding a New Page

```typescript
// src/app/panel/my-page/page.tsx
import { ProtectedPage } from '@/components/ProtectedPage';

export default function MyPage() {
  return (
    <ProtectedPage permission="my_module.view">
      <div>
        {/* Your page content */}
      </div>
    </ProtectedPage>
  );
}
```

## Testing

```bash
# Run tests (when available)
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Deployment

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Checklist

- [ ] Set all environment variables
- [ ] Generate and configure VAPID keys
- [ ] Setup PostgreSQL database
- [ ] Run all database migrations
- [ ] Configure HTTPS (required for push notifications)
- [ ] Setup file upload directory permissions
- [ ] Configure backup strategy

## Documentation

See additional documentation files:
- [NOTIFICATIONS.md](./NOTIFICATIONS.md) - Notification system guide
- [NOTIFICATION_SERVICE_USAGE.md](./NOTIFICATION_SERVICE_USAGE.md) - Service usage examples

## Support & Contribution

For issues, questions, or contributions, please contact the development team.

## License

All rights reserved © AmeenHub 2026