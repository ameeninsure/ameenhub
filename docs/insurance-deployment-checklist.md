# Insurance Module - Deployment Checklist

## ✅ Pre-Deployment Verification

### Database
- [x] Tables created (insurance_companies, insurance_products)
- [x] Indexes added (5 indexes for performance)
- [x] Triggers configured (automatic timestamps)
- [x] Foreign keys set (referential integrity)
- [x] Seed data loaded (16 companies)
- [x] Constraints applied (unique codes, cascades)

### Backend API
- [x] Companies endpoint (GET /api/insurance/companies)
- [x] Companies create (POST /api/insurance/companies)
- [x] Companies details (GET /api/insurance/companies/[id])
- [x] Companies update (PUT /api/insurance/companies/[id])
- [x] Companies delete (DELETE /api/insurance/companies/[id])
- [x] Products endpoint (GET /api/insurance/products)
- [x] Products create (POST /api/insurance/products)
- [x] Products details (GET /api/insurance/products/[id])
- [x] Products update (PUT /api/insurance/products/[id])
- [x] Products delete (DELETE /api/insurance/products/[id])

### Frontend UI
- [x] Companies page created
- [x] Products page created
- [x] Sidebar menu added
- [x] Icons configured
- [x] Forms implemented
- [x] Logo upload working
- [x] Search functionality
- [x] Filters implemented
- [x] Bilingual support

### Security
- [x] Authentication required on all routes
- [x] Permission checks implemented
- [x] 8 permissions defined
- [x] Permission registry updated
- [x] Sync endpoint includes insurance permissions
- [x] Protected pages configured
- [x] Protected buttons configured

### Documentation
- [x] Main documentation (insurance-module.md)
- [x] Quick start guide (insurance-quickstart.md)
- [x] Implementation summary
- [x] Architecture diagrams
- [x] This checklist

### Dependencies
- [x] lucide-react installed
- [x] No missing dependencies
- [x] No TypeScript errors
- [x] No compilation errors

## 🚀 Deployment Steps

### Step 1: Verify Database ✅
```bash
# Check if tables exist
psql -d ameenhub -c "\dt insurance_*"

# Verify seed data
psql -d ameenhub -c "SELECT COUNT(*) FROM insurance_companies;"
# Expected: 16 rows

# Check indexes
psql -d ameenhub -c "\d insurance_companies"
```

### Step 2: Sync Permissions ⚠️ REQUIRED
1. Login to admin panel as super_admin
2. Navigate to: **Panel → Permissions**
3. Click **"Sync Permissions"** button
4. Verify message: "Successfully synced 15 permissions"
5. Confirm insurance permissions appear in list

### Step 3: Assign Permissions to Roles
1. Navigate to: **Panel → Roles**
2. For each role, click **Edit**
3. Scroll to **Insurance** section
4. Check appropriate permissions:
   - **Manager Role**: All insurance permissions
   - **Employee Role**: View only permissions
   - **Other Roles**: As needed
5. Click **Save** for each role

### Step 4: Test Basic Functionality
- [ ] Login with admin account
- [ ] Verify "Insurance" appears in sidebar
- [ ] Click "Insurance Companies"
- [ ] Verify 16 companies display
- [ ] Try search function
- [ ] Try filter by active/inactive
- [ ] Click "Add Company" button
- [ ] Upload a test logo
- [ ] Submit form and verify success
- [ ] Click "Insurance Products"
- [ ] Click "Add Product"
- [ ] Select a company from dropdown
- [ ] Add features in both languages
- [ ] Submit and verify

### Step 5: Test Permissions
- [ ] Login as user with only view permission
- [ ] Verify cannot see Add/Edit/Delete buttons
- [ ] Login as user without any insurance permission
- [ ] Verify Insurance menu is hidden
- [ ] Login as manager with full permissions
- [ ] Verify all features accessible

### Step 6: Test Edge Cases
- [ ] Try to delete company with products (should fail)
- [ ] Try to create company with duplicate code (should fail)
- [ ] Try to create product without company (should fail)
- [ ] Test search with special characters
- [ ] Test with very long text in descriptions
- [ ] Test logo upload with large file
- [ ] Test with non-image file (should fail)

### Step 7: Performance Testing
- [ ] Load companies list (should be instant)
- [ ] Search functionality (should be fast)
- [ ] Filter by company (should be fast)
- [ ] Create new record (should be < 1 second)
- [ ] Upload logo (should complete < 5 seconds)

## 📋 Post-Deployment Tasks

### Immediate (First Day)
- [ ] Monitor error logs for issues
- [ ] Check database performance
- [ ] Verify all users can access appropriately
- [ ] Test on different browsers
- [ ] Test on mobile devices

### Short-term (First Week)
- [ ] Train staff on using the module
- [ ] Add logos for existing companies
- [ ] Create sample products for each company
- [ ] Get user feedback
- [ ] Document any issues

### Medium-term (First Month)
- [ ] Review permission assignments
- [ ] Optimize based on usage patterns
- [ ] Add more product categories if needed
- [ ] Consider additional features based on feedback

## 🔍 Verification Queries

### Check Insurance Module Data
```sql
-- Count companies
SELECT COUNT(*) FROM insurance_companies;

-- Count active companies
SELECT COUNT(*) FROM insurance_companies WHERE is_active = true;

-- Count products
SELECT COUNT(*) FROM insurance_products;

-- Companies with product counts
SELECT 
  ic.code,
  ic.name_en,
  COUNT(ip.id) as product_count
FROM insurance_companies ic
LEFT JOIN insurance_products ip ON ic.id = ip.company_id
GROUP BY ic.id, ic.code, ic.name_en
ORDER BY product_count DESC;

-- Recent activities
SELECT 
  'Company' as type,
  name_en,
  created_at
FROM insurance_companies
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'Product' as type,
  name_en,
  created_at
FROM insurance_products
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Check Permissions
```sql
-- List insurance permissions
SELECT code, name_en, name_ar, category
FROM permissions
WHERE code LIKE 'insurance%'
ORDER BY code;

-- Check which roles have insurance permissions
SELECT 
  r.name as role_name,
  p.code as permission_code,
  p.name_en
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.code LIKE 'insurance%'
ORDER BY r.name, p.code;

-- Check users with insurance access
SELECT DISTINCT
  u.full_name,
  u.email,
  r.name as role_name
FROM users u
JOIN roles r ON u.role = r.name
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE p.code LIKE 'insurance%'
ORDER BY u.full_name;
```

## ⚠️ Common Issues & Solutions

### Issue: Insurance menu not visible
**Solution**: 
1. Sync permissions (Panel → Permissions → Sync)
2. Assign permissions to user's role
3. Have user logout and login again
4. Refresh browser

### Issue: Cannot create company/product
**Solution**:
1. Check user has create permission
2. Verify required fields are filled
3. Check for duplicate code
4. Verify database connection

### Issue: Logo not uploading
**Solution**:
1. Check file size (< 5MB)
2. Verify file type (JPG, PNG, GIF, WebP)
3. Check /public/uploads/ directory permissions
4. Verify upload API is working

### Issue: Products not showing
**Solution**:
1. Check product has associated company
2. Verify company is active
3. Check filters are not hiding results
4. Clear search if active

## 📊 Success Metrics

After deployment, these metrics indicate success:

- ✅ All 16 companies visible
- ✅ Zero permission errors in logs
- ✅ Logo upload works consistently
- ✅ Search returns results in < 1 second
- ✅ UI responsive on mobile
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Users can perform their tasks
- ✅ No data integrity issues

## 🎯 Rollback Plan (If Needed)

If critical issues found:

1. **Database Rollback**:
   ```sql
   DROP TABLE IF EXISTS insurance_products CASCADE;
   DROP TABLE IF EXISTS insurance_companies CASCADE;
   ```

2. **Remove Permissions**:
   ```sql
   DELETE FROM permissions WHERE code LIKE 'insurance%';
   ```

3. **Revert Code**:
   ```bash
   git checkout HEAD~1 src/app/api/insurance/
   git checkout HEAD~1 src/app/panel/insurance/
   git checkout HEAD~1 src/components/panel/Sidebar.tsx
   git checkout HEAD~1 src/lib/permissions/registry.ts
   ```

4. **Restart Application**

## 📞 Support Contacts

**Technical Issues**: Development Team  
**Permission Issues**: System Administrator  
**User Training**: IT Support Team  
**Bug Reports**: Project Manager  

## ✨ Final Checklist

Before marking as complete:

- [ ] Database verified
- [ ] Permissions synced
- [ ] Roles configured
- [ ] Basic testing passed
- [ ] Permission testing passed
- [ ] Edge cases tested
- [ ] Performance acceptable
- [ ] Documentation reviewed
- [ ] Team trained
- [ ] Backup created
- [ ] Monitoring active

## 🎉 Deployment Complete!

When all items above are checked:

**Status**: ✅ DEPLOYED  
**Date**: _________________  
**Deployed By**: _________________  
**Verified By**: _________________  
**Notes**: _________________

---

**Module**: Insurance Management v1.0  
**Platform**: Ameen Insurance Hub  
**Environment**: Production  
**Last Updated**: January 30, 2026
