# Insurance Module - Quick Start Guide

## 🚀 Getting Started

### 1. Initial Setup (Already Completed)

✅ Database tables created  
✅ 16 insurance companies seeded  
✅ API endpoints configured  
✅ UI pages built  
✅ Permissions defined  
✅ Sidebar menu added

### 2. Activate Permissions

1. Login as **admin** or **super_admin**
2. Navigate to **Panel → Permissions**
3. Click **"Sync Permissions"** button
4. You should see message: "Successfully synced 15 permissions"

### 3. Assign Permissions to Roles

1. Navigate to **Panel → Roles**
2. Edit the desired role (e.g., "Manager", "Employee")
3. Scroll to **"Insurance"** section
4. Check the permissions you want to grant:
   - ✅ View Insurance Companies
   - ✅ Create Insurance Company
   - ✅ Edit Insurance Company
   - ✅ Delete Insurance Company
   - ✅ View Insurance Products
   - ✅ Create Insurance Product
   - ✅ Edit Insurance Product
   - ✅ Delete Insurance Product
5. Click **Save**

### 4. Access Insurance Module

After permissions are assigned:

1. **Refresh the browser**
2. Look for new **"Insurance"** (التأمين) section in sidebar
3. Click on:
   - **Insurance Companies** → View 16 pre-loaded companies from CMA
   - **Insurance Products** → Add products for each company

## 📋 Quick Actions

### Add a New Insurance Company

1. Go to **Panel → Insurance → Insurance Companies**
2. Click **"Add Company"** button
3. Fill required fields:
   - Code (e.g., "XYZ")
   - English Name
   - Arabic Name
4. Optional: Upload logo, add contact details, addresses
5. Click **Save**

### Add a New Insurance Product

1. Go to **Panel → Insurance → Insurance Products**
2. Click **"Add Product"** button
3. Fill required fields:
   - Code (e.g., "MOTOR-COMP-01")
   - Select Company
   - English Name
   - Arabic Name
4. Optional: Add category, features, terms, logo
5. Click **Save**

## 🎯 Pre-Loaded Companies

16 companies are already in the database:

| Code | Company Name | License |
|------|-------------|---------|
| NIA | The New India Assurance | FI/9 |
| AMI | Al Madina Insurance | NI/34 |
| GIG | Gulf Insurance Group | FI/6 |
| SAIC | Saudi Arabian Insurance (Damana) | FI/35 |
| IIC | Iran Insurance Company | FI/18 |
| LIVA | Liva Insurance | NI/31 |
| METLIFE | MetLife | FI/15 |
| CIGNA | Cigna Middle East | FI/33 |
| DIC | Dhofar Insurance | NI/21 |
| OQIC | Oman Qatar Insurance | NI/32 |
| OUIC | Oman United Insurance | NI/20 |
| SUKOON | Sukoon Insurance | FI/32 |
| ORIENT | Orient Insurance | FI/34 |
| TAKAFUL | Takaful Oman | NI/37 |
| MIC | Muscat Insurance | NI/38 |
| AFIC | Arabia Falcon Insurance | NI/33 |

## 🔒 Permission Matrix

| Action | Required Permission |
|--------|-------------------|
| View companies list | `insurance.companies.view` |
| Add new company | `insurance.companies.create` |
| Edit company | `insurance.companies.edit` |
| Delete company | `insurance.companies.delete` |
| View products list | `insurance.products.view` |
| Add new product | `insurance.products.create` |
| Edit product | `insurance.products.edit` |
| Delete product | `insurance.products.delete` |

## 💡 Tips

1. **Upload Logos**: Recommended size 200x200px, transparent PNG format
2. **Company Codes**: Use uppercase (e.g., NIA, GIG, METLIFE)
3. **Product Codes**: Use descriptive format (e.g., MOTOR-COMP-01, HEALTH-FAMILY-01)
4. **Categories**: Use standard types:
   - Motor Insurance
   - Health Insurance
   - Life Insurance
   - Property Insurance
   - Travel Insurance
   - Marine Insurance
5. **Display Order**: Lower numbers appear first (0, 10, 20, 30...)
6. **Deactivate vs Delete**: Use "Active" checkbox to hide items instead of deleting

## 🐛 Troubleshooting

**Can't see Insurance menu?**
- Ensure you synced permissions
- Check that your role has `insurance.companies.view` or `insurance.products.view`
- Refresh browser

**Can't delete company?**
- Delete all products first, OR
- Just deactivate the company

**Logo not uploading?**
- Check file size (max 5MB)
- Use JPG, PNG, GIF, or WebP format

## 📱 API Examples

### Get All Companies
```bash
GET /api/insurance/companies
```

### Get Active Companies Only
```bash
GET /api/insurance/companies?is_active=true
```

### Search Companies
```bash
GET /api/insurance/companies?search=gulf
```

### Get Products by Company
```bash
GET /api/insurance/products?company_id=3
```

### Get Products by Category
```bash
GET /api/insurance/products?category=Motor%20Insurance
```

## 📊 Sample Data Structure

### Company Object
```json
{
  "id": 3,
  "code": "GIG",
  "name_en": "Gulf Insurance Group",
  "name_ar": "مجموعة الخليج للتأمين",
  "license_number": "FI/6",
  "phone": "24400100",
  "email": "hassan.abdulali@gig-gulf.com",
  "website": "www.gig-gulf.com",
  "is_active": true,
  "active_products_count": 5
}
```

### Product Object
```json
{
  "id": 1,
  "code": "MOTOR-COMP-01",
  "company_id": 3,
  "company_name_en": "Gulf Insurance Group",
  "name_en": "Comprehensive Motor Insurance",
  "name_ar": "تأمين سيارات شامل",
  "category": "Motor Insurance",
  "features_en": ["24/7 Roadside Assistance", "Free Towing", "Agency Repair"],
  "is_active": true
}
```

## 🎓 Next Steps

1. ✅ Sync permissions
2. ✅ Assign to roles
3. ✅ Test company management
4. ✅ Add sample products
5. ✅ Upload company logos
6. 📝 Train staff on using the module
7. 🚀 Go live!

---

**Need Help?** Check [docs/insurance-module.md](insurance-module.md) for complete documentation.
