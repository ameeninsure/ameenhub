import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';

// GET /api/insurance/products/[id] - Get a specific insurance product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const result = await query(
      `SELECT 
        ip.*,
        ic.name_en as company_name_en,
        ic.name_ar as company_name_ar,
        ic.code as company_code,
        ic.logo_url as company_logo_url,
        ic.website as company_website,
        ic.email as company_email,
        ic.phone as company_phone,
        u.full_name as created_by_name
      FROM insurance_products ip
      INNER JOIN insurance_companies ic ON ip.company_id = ic.id
      LEFT JOIN users u ON ip.created_by = u.id
      WHERE ip.id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Insurance product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching insurance product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance product' },
      { status: 500 }
    );
  }
}

// PUT /api/insurance/products/[id] - Update an insurance product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const hasPermission = await userHasPermission(payload.userId, 'insurance.products.edit');
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
      is_active,
      display_order
    } = body;

    // If company_id is being updated, check if it exists
    if (company_id) {
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
    }

    const result = await query(
      `UPDATE insurance_products SET
        code = COALESCE($1, code),
        company_id = COALESCE($2, company_id),
        name_en = COALESCE($3, name_en),
        name_ar = COALESCE($4, name_ar),
        description_en = $5,
        description_ar = $6,
        category = $7,
        coverage_type = $8,
        features_en = $9,
        features_ar = $10,
        terms_en = $11,
        terms_ar = $12,
        logo_url = $13,
        is_active = COALESCE($14, is_active),
        display_order = COALESCE($15, display_order)
      WHERE id = $16
      RETURNING *`,
      [
        code, company_id, name_en, name_ar, description_en, description_ar,
        category, coverage_type, features_en, features_ar, terms_en, terms_ar,
        logo_url, is_active, display_order,
        params.id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Insurance product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Insurance product updated successfully',
      product: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating insurance product:', error);
    
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Product code already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update insurance product' },
      { status: 500 }
    );
  }
}

// DELETE /api/insurance/products/[id] - Delete an insurance product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const hasPermission = await userHasPermission(payload.userId, 'insurance.products.delete');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const result = await query(
      'DELETE FROM insurance_products WHERE id = $1 RETURNING *',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Insurance product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Insurance product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting insurance product:', error);
    return NextResponse.json(
      { error: 'Failed to delete insurance product' },
      { status: 500 }
    );
  }
}
