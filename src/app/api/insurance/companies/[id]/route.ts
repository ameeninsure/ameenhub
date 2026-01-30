import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';

// GET /api/insurance/companies/[id] - Get a specific insurance company
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
    const hasPermission = await userHasPermission(payload.userId, 'insurance.companies.view');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const result = await query(
      `SELECT 
        ic.*,
        u.full_name as created_by_name,
        (SELECT COUNT(*) FROM insurance_products WHERE company_id = ic.id) as total_products_count,
        (SELECT COUNT(*) FROM insurance_products WHERE company_id = ic.id AND is_active = true) as active_products_count
      FROM insurance_companies ic
      LEFT JOIN users u ON ic.created_by = u.id
      WHERE ic.id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Insurance company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching insurance company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance company' },
      { status: 500 }
    );
  }
}

// PUT /api/insurance/companies/[id] - Update an insurance company
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
    const hasPermission = await userHasPermission(payload.userId, 'insurance.companies.edit');
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
      is_active,
      display_order
    } = body;

    const result = await query(
      `UPDATE insurance_companies SET
        code = COALESCE($1, code),
        name_en = COALESCE($2, name_en),
        name_ar = COALESCE($3, name_ar),
        description_en = $4,
        description_ar = $5,
        category = $6,
        cr_number = $7,
        license_number = $8,
        address_en = $9,
        address_ar = $10,
        website = $11,
        email = $12,
        phone = $13,
        logo_url = $14,
        is_active = COALESCE($15, is_active),
        display_order = COALESCE($16, display_order)
      WHERE id = $17
      RETURNING *`,
      [
        code, name_en, name_ar, description_en, description_ar,
        category, cr_number, license_number, address_en, address_ar,
        website, email, phone, logo_url, is_active, display_order,
        params.id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Insurance company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Insurance company updated successfully',
      company: result.rows[0]
    });
  } catch (error: any) {
    console.error('Error updating insurance company:', error);
    
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Company code already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update insurance company' },
      { status: 500 }
    );
  }
}

// DELETE /api/insurance/companies/[id] - Delete an insurance company
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
    const hasPermission = await userHasPermission(payload.userId, 'insurance.companies.delete');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Check if company has products
    const productsCheck = await query(
      'SELECT COUNT(*) as count FROM insurance_products WHERE company_id = $1',
      [params.id]
    );

    if (parseInt(productsCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete company with existing products. Delete products first.' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM insurance_companies WHERE id = $1 RETURNING *',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Insurance company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Insurance company deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting insurance company:', error);
    return NextResponse.json(
      { error: 'Failed to delete insurance company' },
      { status: 500 }
    );
  }
}
