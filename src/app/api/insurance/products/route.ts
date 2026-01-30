import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';

// GET /api/insurance/products - List all insurance products
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await userHasPermission(payload.userId, 'insurance.products.view');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const isActive = searchParams.get('is_active');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        ip.*,
        ic.name_en as company_name_en,
        ic.name_ar as company_name_ar,
        ic.code as company_code,
        ic.logo_url as company_logo_url,
        u.full_name as created_by_name
      FROM insurance_products ip
      INNER JOIN insurance_companies ic ON ip.company_id = ic.id
      LEFT JOIN users u ON ip.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (companyId) {
      sql += ` AND ip.company_id = $${paramIndex}`;
      params.push(companyId);
      paramIndex++;
    }

    if (isActive !== null) {
      sql += ` AND ip.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    if (category) {
      sql += ` AND ip.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (
        ip.name_en ILIKE $${paramIndex} OR 
        ip.name_ar ILIKE $${paramIndex} OR 
        ip.code ILIKE $${paramIndex} OR
        ip.description_en ILIKE $${paramIndex} OR
        ip.description_ar ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY ip.display_order ASC, ip.name_en ASC';

    const result = await query(sql, params);

    return NextResponse.json({
      products: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching insurance products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance products' },
      { status: 500 }
    );
  }
}

// POST /api/insurance/products - Create a new insurance product
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await userHasPermission(payload.userId, 'insurance.products.create');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      company_id,
      name_en,
      name_ar,
      description_en,
      description_ar,
      category,
      coverage_type,
      features_en,
      features_ar,
      terms_en,
      terms_ar,
      logo_url,
      is_active = true,
      display_order = 0
    } = body;

    // Validate required fields
    if (!code || !company_id || !name_en || !name_ar) {
      return NextResponse.json(
        { error: 'Code, company ID, English name, and Arabic name are required' },
        { status: 400 }
      );
    }

    // Check if company exists
    const companyCheck = await query(
      'SELECT id FROM insurance_companies WHERE id = $1',
      [company_id]
    );

    if (companyCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Insurance company not found' },
        { status: 404 }
      );
    }

    const result = await query(
      `INSERT INTO insurance_products (
        code, company_id, name_en, name_ar, description_en, description_ar,
        category, coverage_type, features_en, features_ar, terms_en, terms_ar,
        logo_url, is_active, display_order, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        code, company_id, name_en, name_ar, description_en, description_ar,
        category, coverage_type, features_en, features_ar, terms_en, terms_ar,
        logo_url, is_active, display_order, payload.userId
      ]
    );

    return NextResponse.json({
      message: 'Insurance product created successfully',
      product: result.rows[0]
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating insurance product:', error);
    
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Product code already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create insurance product' },
      { status: 500 }
    );
  }
}
