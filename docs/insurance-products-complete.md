# Insurance Products Database - Complete

## ✅ Status: COMPLETE

All 16 CMA-registered insurance companies in Oman now have comprehensive product portfolios in the database.

## Summary Statistics

- **Total Insurance Companies**: 16
- **Total Insurance Products**: 75
- **Companies with Products**: 16 (100%)
- **Average Products per Company**: ~4.7

## Products Distribution by Company

| Code | Company Name | Products | Status |
|------|--------------|----------|--------|
| **GIG** | Gulf Insurance Group | **6** | ✅ Complete |
| **NIA** | The New India Assurance | **6** | ✅ Complete |
| **AFIC** | Arabia Falcon Insurance | **5** | ✅ Complete |
| **AMI** | Al Madina Insurance | **5** | ✅ Complete |
| **CIGNA** | Cigna Middle East Insurance | **5** | ✅ Complete |
| **DIC** | Dhofar Insurance Company | **5** | ✅ Complete |
| **OQIC** | Oman Qatar Insurance | **5** | ✅ Complete |
| **ORIENT** | Orient Insurance Company | **5** | ✅ Complete |
| **OUIC** | Oman United Insurance | **5** | ✅ Complete |
| **SAIC** | Saudi Arabian Insurance | **5** | ✅ Complete |
| **TAKAFUL** | Takaful Oman Insurance | **5** | ✅ Complete |
| **METLIFE** | American Life Insurance (MetLife) | **4** | ✅ Complete |
| **MIC** | Muscat Insurance Company | **4** | ✅ Complete |
| **SUKOON** | Sukoon Insurance | **4** | ✅ Complete |
| **IIC** | Iran Insurance Company | **3** | ✅ Complete |
| **LIVA** | Liva Insurance | **3** | ✅ Complete |

## Product Categories Covered

### Motor Insurance (16 products)
All companies offer motor insurance products with various coverage levels:
- **Comprehensive Coverage**: Full protection with third-party and own damage
- **Third Party**: Mandatory coverage as per Oman law
- **Specialized**: Luxury vehicles, fleet management, Takaful

### Health Insurance (16 products)
Diverse health coverage options:
- **Individual & Family Plans**: Basic to premium coverage
- **Corporate Plans**: Group health insurance for employees
- **Expatriate Plans**: Specialized for expat community
- **International Plans**: Global health coverage
- **Takaful Plans**: Sharia-compliant health insurance
- **Dental & Vision**: Add-on coverage options

### Life Insurance (12 products)
Protection and savings products:
- **Term Life**: Pure protection for specific periods
- **Whole Life**: Lifetime coverage with savings
- **Family Takaful**: Islamic life insurance
- **Investment Plans**: Life insurance with investment component
- **Children Education**: Savings plans for education

### Property Insurance (12 products)
Coverage for buildings and contents:
- **Home Insurance**: Residential property protection
- **Commercial Property**: Business premises coverage
- **Fire Insurance**: Fire and allied perils
- **Villa Insurance**: Luxury property coverage
- **Takaful Property**: Sharia-compliant property insurance

### Marine Insurance (5 products)
Import/export and shipping coverage:
- **Cargo Insurance**: Import/export goods protection
- **Marine Transit**: Sea and land transport
- **Yacht Insurance**: Private vessel coverage

### Travel Insurance (4 products)
Coverage for travelers:
- **Annual Multi-Trip**: Unlimited trips per year
- **Single Trip**: One-time travel coverage
- **GCC Travel**: Regional coverage
- **International Travel**: Worldwide protection

### Liability Insurance (7 products)
Protection against third-party claims:
- **Public Liability**: General third-party coverage
- **Professional Indemnity**: Errors & omissions for professionals
- **Workers Compensation**: Mandatory employee coverage
- **Money in Transit**: Cash handling protection

### Engineering Insurance (2 products)
Industrial and construction coverage:
- **Plant & Machinery**: Equipment breakdown
- **Construction All Risk**: Building project coverage

### Personal Accident (1 product)
Individual accident coverage:
- **24/7 Accident Protection**: Worldwide coverage

## Special Features

### Takaful (Islamic Insurance)
Three dedicated Takaful companies offer Sharia-compliant products:
- **Sukoon Insurance**: 4 Takaful products
- **Takaful Oman**: 5 Islamic products
- **Al Madina Insurance**: Takaful Motor & Health

**Takaful Features**:
- 100% Shariah-compliant operations
- No Riba (interest)
- Transparent contribution model
- Profit-sharing mechanism
- Supervised by Shariah board
- Halal investment portfolios

### International Coverage
Multiple companies offer global products:
- **Cigna**: Worldwide health network
- **MetLife**: International life insurance
- **GIG**: Regional and global coverage
- **NIA**: Cross-border protection

### Specialized Products
Unique offerings in Oman market:
- **Yacht Insurance** (OQIC): Private vessel coverage
- **Luxury Vehicle** (OQIC): High-end car protection
- **Cyber Insurance** (GIG): Digital risk protection
- **Wealth Builder** (OQIC): Investment-linked life insurance
- **Expatriate Health** (Orient): Expat-focused coverage

## Product Features

### Bilingual Support
All products include:
- ✅ English names and descriptions
- ✅ Arabic names (الأسماء العربية) and descriptions
- ✅ Bilingual features arrays
- ✅ Terms and conditions in both languages

### Technical Features
- **Unique Product Codes**: Format: `COMPANY-CATEGORY-TYPE-01`
- **Categories**: 9 major insurance categories
- **Coverage Types**: Multiple variants per category
- **Features Arrays**: Dynamic list of product benefits
- **Active Status**: Enable/disable products
- **Display Order**: Sorting for UI presentation
- **Company Relations**: Proper foreign key constraints

## Database Files

### Initial Setup
```
db/init/005_insurance.sql
```
- Creates tables: `insurance_companies` and `insurance_products`
- Seeds 16 CMA-registered companies
- Sets up proper constraints and indexes

### Product Seeds
```
db/migrations/seed_insurance_products.sql
```
- First batch: 32 products for 7 companies
- Companies: NIA, AMI, GIG, SAIC, IIC, LIVA, METLIFE

```
db/migrations/seed_remaining_products.sql
```
- Second batch: 43 products for 9 companies
- Companies: CIGNA, DIC, OQIC, OUIC, SUKOON, ORIENT, TAKAFUL, MIC, AFIC

## API Endpoints

All products accessible through REST API:

### Companies
- `GET /api/insurance/companies` - List all companies
- `GET /api/insurance/companies/:id` - Company details
- `POST /api/insurance/companies` - Create company
- `PUT /api/insurance/companies/:id` - Update company
- `DELETE /api/insurance/companies/:id` - Delete company

### Products
- `GET /api/insurance/products` - List all products
- `GET /api/insurance/products/:id` - Product details
- `POST /api/insurance/products` - Create product
- `PUT /api/insurance/products/:id` - Update product
- `DELETE /api/insurance/products/:id` - Delete product

**Filters Available**:
- By company
- By category
- By active status
- Search by name

## UI Pages

### Companies Management
**Path**: `/panel/insurance/companies`

Features:
- Grid layout with company cards
- Logo upload functionality
- Search and filters
- Active/inactive toggle
- Create, edit, delete operations
- Product count per company

### Products Management
**Path**: `/panel/insurance/products`

Features:
- Product cards with details
- Company filter dropdown
- Category filter
- Search functionality
- Logo upload
- Dynamic features management
- Bilingual content editing
- Create, edit, delete operations

## Permissions

Required permissions to access insurance module:

```
insurance.companies.view
insurance.companies.create
insurance.companies.edit
insurance.companies.delete

insurance.products.view
insurance.products.create
insurance.products.edit
insurance.products.delete
```

## Next Steps

### 1. Sync Permissions ⚠️
**Action Required**: Admin must sync permissions
- Login as admin user
- Navigate to: `/panel/permissions`
- Click "Sync Permissions" button
- Expected result: "Successfully synced 15 permissions"

### 2. Assign Permissions to Roles
- Go to: `/panel/roles`
- Edit each role (Manager, Employee, etc.)
- Check appropriate insurance permissions:
  - **Manager**: All insurance permissions
  - **Employee**: View-only permissions
  - **Others**: Custom as needed

### 3. Test Module
- Login with different user roles
- Test accessing:
  - `/panel/insurance/companies`
  - `/panel/insurance/products`
- Verify permission-based access control

### 4. Upload Company Logos (Optional)
- Navigate to companies page
- Click edit on each company
- Upload official company logo
- Supported formats: JPG, PNG (max 5MB)

### 5. Upload Product Logos (Optional)
- Navigate to products page
- Edit products requiring logos
- Upload product-specific images

## Verification Queries

### Check All Companies Have Products
```sql
SELECT ic.code, ic.name_en, COUNT(ip.id) as products
FROM insurance_companies ic
LEFT JOIN insurance_products ip ON ic.id = ip.company_id
GROUP BY ic.id, ic.code, ic.name_en
ORDER BY products DESC;
```

### Products by Category
```sql
SELECT category, COUNT(*) as count
FROM insurance_products
GROUP BY category
ORDER BY count DESC;
```

### Total Statistics
```sql
SELECT 
  COUNT(*) as total_products,
  COUNT(DISTINCT company_id) as companies_with_products,
  COUNT(DISTINCT category) as unique_categories
FROM insurance_products;
```

## Compliance

### CMA Registration
All 16 companies are officially registered with:
- **Capital Market Authority (CMA)** - Sultanate of Oman
- License Type: Insurance Operations
- Jurisdiction: Oman

### Oman Market Focus
Products designed specifically for Oman market:
- Local regulations compliance
- Arabic language support (RTL)
- Islamic insurance (Takaful) options
- GCC regional coverage
- Local hospital networks
- Oman labor law compliance (Workers Compensation)

## Technical Notes

### Product Code Convention
```
COMPANY-CATEGORY-TYPE-SEQUENCE
```

Examples:
- `NIA-MOTOR-COMP-01`: New India Assurance - Motor Comprehensive
- `CIGNA-HEALTH-GLOBAL-01`: Cigna - Global Health
- `TAKAFUL-MOTOR-ISLAMIC-01`: Takaful Oman - Islamic Motor

### Database Schema
```sql
insurance_products
├── id (SERIAL PRIMARY KEY)
├── code (VARCHAR UNIQUE)
├── company_id (INTEGER FK → insurance_companies)
├── name_en (VARCHAR)
├── name_ar (VARCHAR)
├── description_en (TEXT)
├── description_ar (TEXT)
├── category (VARCHAR)
├── coverage_type (VARCHAR)
├── features_en (TEXT[])
├── features_ar (TEXT[])
├── terms_en (TEXT)
├── terms_ar (TEXT)
├── logo_url (VARCHAR)
├── is_active (BOOLEAN)
├── display_order (INTEGER)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Maintenance

### Adding New Products
1. Use product create API: `POST /api/insurance/products`
2. Or add via UI: `/panel/insurance/products` → "Create Product"
3. Or execute SQL INSERT in migrations folder

### Updating Products
- Via API: `PUT /api/insurance/products/:id`
- Via UI: Edit button on product cards
- Via SQL: UPDATE statements

### Bulk Operations
For bulk updates, use SQL migrations:
```sql
-- Example: Activate all motor products
UPDATE insurance_products 
SET is_active = true 
WHERE category = 'Motor Insurance';
```

## Support

For technical support or questions:
- Check API documentation: `/docs/insurance-module.md`
- View architecture: `/docs/insurance-architecture.md`
- Deployment guide: `/docs/insurance-deployment-checklist.md`
- Quick start: `/docs/insurance-quickstart.md`

---

**Status**: ✅ **Production Ready**  
**Last Updated**: 2024  
**Total Products**: 75  
**Coverage**: 100% of CMA-registered companies
