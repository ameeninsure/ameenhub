import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';

// GET /api/insurance/companies - List all insurance companies
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
    const hasPermission = await userHasPermission(payload.userId, 'insurance.companies.view');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        ic.*,
        u.full_name as created_by_name,
        (SELECT COUNT(*) FROM insurance_products WHERE company_id = ic.id AND is_active = true) as active_products_count
      FROM insurance_companies ic
      LEFT JOIN users u ON ic.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (isActive !== null) {
      sql += ` AND ic.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    if (search) {
      sql += ` AND (
        ic.name_en ILIKE $${paramIndex} OR 
        ic.name_ar ILIKE $${paramIndex} OR 
        ic.code ILIKE $${paramIndex} OR
        ic.email ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY ic.display_order ASC, ic.name_en ASC';

    const result = await query(sql, params);

    return NextResponse.json({
      companies: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching insurance companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance companies' },
      { status: 500 }
    );
  }
}

// POST /api/insurance/companies - Create a new insurance company
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
    const hasPermission = await userHasPermission(payload.userId, 'insurance.companies.create');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      code,
      name_en,
      name_ar,
      description_en,
      description_ar,
      category,
      cr_number,
      license_number,
      address_en,
      address_ar,
      website,
      email,
      phone,
      logo_url,
      is_active = true,
      display_order = 0
    } = body;

    // Validate required fields
    if (!code || !name_en || !name_ar) {
      return NextResponse.json(
        { error: 'Code, English name, and Arabic name are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO insurance_companies (
        code, name_en, name_ar, description_en, description_ar,
        category, cr_number, license_number, address_en, address_ar,
        website, email, phone, logo_url, is_active, display_order, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        code, name_en, name_ar, description_en, description_ar,
        category, cr_number, license_number, address_en, address_ar,
        website, email, phone, logo_url, is_active, display_order, payload.userId
      ]
    );

    return NextResponse.json({
      message: 'Insurance company created successfully',
      company: result.rows[0]
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating insurance company:', error);
    
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Company code already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create insurance company' },
      { status: 500 }
    );
  }
}
