# Insurance Module Documentation

## Overview

The Insurance Module is a comprehensive system for managing insurance companies and their products within the Ameen Hub platform. It provides complete CRUD (Create, Read, Update, Delete) operations with bilingual support (English/Arabic), role-based access control, and logo upload capabilities.

## Features

### Insurance Companies Management
- **Complete CRUD Operations**: Create, view, edit, and delete insurance companies
- **Bilingual Support**: All content available in English and Arabic
- **Logo Upload**: Upload and manage company logos
- **Rich Information**: Store company details including:
  - Code and name (EN/AR)
  - Descriptions (EN/AR)
  - CR Number and License Number
  - Contact information (email, phone, website)
  - Address (EN/AR)
  - Active/inactive status
  - Display order for sorting

### Insurance Products Management
- **Complete CRUD Operations**: Create, view, edit, and delete insurance products
- **Company Association**: Link products to insurance companies
- **Product Features**: Add multiple features in both languages
- **Category Management**: Organize products by insurance types
- **Coverage Details**: Specify coverage types and terms
- **Logo Support**: Product-specific logos
- **Bilingual Content**: Names, descriptions, features, and terms in both languages

### Security & Permissions
- **Role-Based Access Control**: 8 granular permissions
- **Protected Endpoints**: All API routes require authentication
- **Permission Checks**: View, create, edit, and delete permissions per module

## Database Schema

### Tables

#### insurance_companies
```sql
- id (serial, primary key)
- code (varchar, unique) - Company identifier (e.g., NIA, GIG, METLIFE)
- name_en (varchar) - English company name
- name_ar (varchar) - Arabic company name
- description_en (text) - English description
- description_ar (text) - Arabic description
- category (varchar) - Company category
- cr_number (varchar) - Commercial Registration number
- license_number (varchar) - CMA license number (e.g., FI/9, NI/34)
- address_en (text) - English address
- address_ar (text) - Arabic address
- website (varchar) - Company website URL
- email (varchar) - Contact email
- phone (varchar) - Contact phone
- logo_url (varchar) - Logo file path
- is_active (boolean) - Active status
- display_order (integer) - Sort order
- created_at (timestamp)
- updated_at (timestamp)
- created_by (integer, FK to users)
```

#### insurance_products
```sql
- id (serial, primary key)
- code (varchar, unique) - Product identifier
- company_id (integer, FK to insurance_companies)
- name_en (varchar) - English product name
- name_ar (varchar) - Arabic product name
- description_en (text) - English description
- description_ar (text) - Arabic description
- category (varchar) - Product category (Motor, Health, Life, etc.)
- coverage_type (varchar) - Type of coverage
- features_en (text[]) - Array of English features
- features_ar (text[]) - Array of Arabic features
- terms_en (text) - English terms and conditions
- terms_ar (text) - Arabic terms and conditions
- logo_url (varchar) - Product logo path
- is_active (boolean) - Active status
- display_order (integer) - Sort order
- created_at (timestamp)
- updated_at (timestamp)
- created_by (integer, FK to users)
```

### Seed Data

The system includes 16 pre-loaded insurance companies from the Capital Market Authority (CMA) registry:

1. The New India Assurance Company LTD (NIA)
2. Al Madina Insurance (AMI)
3. Gulf Insurance Group (GIG)
4. Saudi Arabian Insurance Company (SAIC/Damana)
5. Iran Insurance Company (IIC)
6. Liva Insurance (LIVA)
7. MetLife (METLIFE)
8. Cigna Middle East (CIGNA)
9. Dhofar Insurance (DIC)
10. Oman Qatar Insurance (OQIC)
11. Oman United Insurance (OUIC)
12. Sukoon Insurance (SUKOON)
13. Orient Insurance (ORIENT)
14. Takaful Oman (TAKAFUL)
15. Muscat Insurance (MIC)
16. Arabia Falcon Insurance (AFIC)

Each company includes:
- Official CMA license numbers
- CR numbers
- Contact details (phone, email, website)
- Bilingual addresses
- Proper categorization

## API Endpoints

### Insurance Companies

#### GET /api/insurance/companies
**Description**: List all insurance companies with optional filtering

**Query Parameters**:
- `is_active` (boolean) - Filter by active status
- `search` (string) - Search in name, code, or email

**Response**:
```json
{
  "companies": [
    {
      "id": 1,
      "code": "NIA",
      "name_en": "The New India Assurance Company LTD",
      "name_ar": "شركة نيو إنديا للتأمين المحدودة",
      "license_number": "FI/9",
      "phone": "24838800",
      "email": "niamct@omantel.net.om",
      "website": "www.newindiaoman.com",
      "is_active": true,
      "active_products_count": 5,
      "created_by_name": "Admin User"
    }
  ],
  "total": 16
}
```

#### POST /api/insurance/companies
**Description**: Create a new insurance company

**Required Fields**:
- `code` (string) - Unique company code
- `name_en` (string) - English name
- `name_ar` (string) - Arabic name

**Optional Fields**:
- All other company fields

**Permissions Required**: `insurance.companies.create`

#### GET /api/insurance/companies/[id]
**Description**: Get specific company details

**Response**: Single company object with product counts

#### PUT /api/insurance/companies/[id]
**Description**: Update company information

**Permissions Required**: `insurance.companies.edit`

#### DELETE /api/insurance/companies/[id]
**Description**: Delete a company (only if no products exist)

**Permissions Required**: `insurance.companies.delete`

### Insurance Products

#### GET /api/insurance/products
**Description**: List all insurance products with optional filtering

**Query Parameters**:
- `company_id` (integer) - Filter by company
- `is_active` (boolean) - Filter by active status
- `category` (string) - Filter by product category
- `search` (string) - Search in name or description

**Response**:
```json
{
  "products": [
    {
      "id": 1,
      "code": "MOTOR-COMP-01",
      "company_id": 1,
      "company_name_en": "The New India Assurance Company LTD",
      "company_name_ar": "شركة نيو إنديا للتأمين المحدودة",
      "name_en": "Comprehensive Motor Insurance",
      "name_ar": "تأمين سيارات شامل",
      "category": "Motor Insurance",
      "coverage_type": "Comprehensive",
      "is_active": true
    }
  ],
  "total": 10
}
```

#### POST /api/insurance/products
**Description**: Create a new insurance product

**Required Fields**:
- `code` (string) - Unique product code
- `company_id` (integer) - Associated company
- `name_en` (string) - English name
- `name_ar` (string) - Arabic name

**Permissions Required**: `insurance.products.create`

#### GET /api/insurance/products/[id]
**Description**: Get specific product with company details

#### PUT /api/insurance/products/[id]
**Description**: Update product information

**Permissions Required**: `insurance.products.edit`

#### DELETE /api/insurance/products/[id]
**Description**: Delete a product

**Permissions Required**: `insurance.products.delete`

## Permissions

### Available Permissions

1. **insurance.companies.view** - View insurance companies list
2. **insurance.companies.create** - Create new companies
3. **insurance.companies.edit** - Edit company information
4. **insurance.companies.delete** - Delete companies
5. **insurance.products.view** - View insurance products list
6. **insurance.products.create** - Create new products
7. **insurance.products.edit** - Edit product information
8. **insurance.products.delete** - Delete products

### Syncing Permissions

After deployment, sync permissions to database:

1. Login as admin
2. Navigate to **Panel → Permissions**
3. Click **"Sync Permissions"** button
4. Verify that insurance permissions appear in the list

### Assigning Permissions

1. Navigate to **Panel → Roles**
2. Select role to edit
3. Find "Insurance" section in permissions list
4. Check desired permissions
5. Save changes

## User Interface

### Sidebar Navigation

New "Insurance" section added between "Business" and "Communication":

```
📋 Insurance (التأمين)
  ├── 🏢 Insurance Companies (شركات التأمين)
  └── 📦 Insurance Products (منتجات التأمين)
```

### Insurance Companies Page

**Location**: `/panel/insurance/companies`

**Features**:
- Grid layout with company cards
- Search functionality
- Active/inactive filter
- Logo display
- Contact information
- Product count badge
- Edit and delete buttons (permission-based)
- Modal form for create/edit

**Company Card Displays**:
- Company logo
- Name (bilingual)
- Code and license number
- Active status indicator
- Phone, email, website links
- Number of active products

### Insurance Products Page

**Location**: `/panel/insurance/products`

**Features**:
- Grid layout with product cards
- Search functionality
- Filter by company
- Filter by category
- Active/inactive filter
- Logo display
- Company association
- Modal form for create/edit

**Product Card Displays**:
- Product logo
- Name (bilingual)
- Code
- Company name
- Category badge
- Active status indicator
- Description preview

### Create/Edit Forms

#### Company Form Fields:
- Logo upload
- Code (auto-uppercase)
- License number
- English name*
- Arabic name*
- CR number
- Category
- Phone, email, website
- English address
- Arabic address
- English description
- Arabic description
- Display order
- Active checkbox

#### Product Form Fields:
- Logo upload
- Code (auto-uppercase)
- Company selection*
- English name*
- Arabic name*
- Category dropdown
- Coverage type
- English description
- Arabic description
- Features (EN) - dynamic list
- Features (AR) - dynamic list
- Terms & Conditions (EN)
- Terms & Conditions (AR)
- Display order
- Active checkbox

*Required fields

## Logo Upload

### Supported Features
- Automatic upload to `/uploads/insurance_logo/` directory
- Image preview before saving
- Accepts all common image formats
- Automatic file handling
- Separate logos for companies and products

### Usage
1. Click logo upload field in form
2. Select image file
3. Wait for upload to complete
4. Logo preview appears
5. Continue with form submission

## Product Categories

Pre-defined categories:
- Motor Insurance
- Health Insurance
- Life Insurance
- Property Insurance
- Travel Insurance
- Marine Insurance
- Engineering Insurance
- Liability Insurance

## Best Practices

### Company Management
1. Use standard code format (uppercase, 3-10 characters)
2. Keep license numbers in CMA format (FI/## or NI/##)
3. Always provide both English and Arabic names
4. Upload high-quality logos (recommended: 200x200px, transparent PNG)
5. Use display_order to control company listing order
6. Deactivate companies instead of deleting (maintains data integrity)

### Product Management
1. Use descriptive code format: `[CATEGORY]-[TYPE]-[NUMBER]`
2. Always link to active companies
3. Add comprehensive features in both languages
4. Include clear terms and conditions
5. Use appropriate categories for filtering
6. Set logical display orders within categories

### Security
1. Always assign minimum necessary permissions
2. Test permission changes before deploying to production
3. Regularly audit user permissions
4. Use roles instead of individual permission assignments
5. Keep sensitive company information protected

## Troubleshooting

### Common Issues

**Problem**: Permissions not appearing
- **Solution**: Navigate to Permissions page and click "Sync Permissions"

**Problem**: Cannot delete company
- **Solution**: Delete all associated products first, or deactivate instead

**Problem**: Logo not uploading
- **Solution**: Check file size (<5MB) and format (JPG, PNG, GIF, WebP)

**Problem**: Cannot see Insurance menu
- **Solution**: Ensure user has `insurance.companies.view` or `insurance.products.view` permission

**Problem**: API returns 403 Forbidden
- **Solution**: Check that user has required permission for the action

### Database Maintenance

**View company product counts**:
```sql
SELECT ic.name_en, COUNT(ip.id) as product_count
FROM insurance_companies ic
LEFT JOIN insurance_products ip ON ic.id = ip.company_id
GROUP BY ic.id, ic.name_en
ORDER BY product_count DESC;
```

**Find inactive items**:
```sql
SELECT 'Company' as type, name_en as name, code 
FROM insurance_companies WHERE is_active = false
UNION ALL
SELECT 'Product' as type, name_en as name, code 
FROM insurance_products WHERE is_active = false;
```

## Future Enhancements

Potential features for future versions:
- Bulk import/export functionality
- Product comparison tools
- Customer reviews and ratings
- Integration with CMA API for automatic updates
- Document attachments (policy documents, brochures)
- Analytics dashboard for popular products
- Customer portal integration
- Quotation system
- Claims management integration

## Support

For technical support or feature requests, contact the development team or create an issue in the project repository.

---

**Version**: 1.0  
**Last Updated**: January 30, 2026  
**Module Status**: Production Ready
