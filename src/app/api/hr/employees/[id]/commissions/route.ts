import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userHasPermission } from '@/lib/permissions/queries';
import { query } from '@/db';

/**
 * GET /api/hr/employees/[id]/commissions
 * Get commission settings for an employee
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const hasPermission = await userHasPermission(payload.userId, 'menu.hr');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the user_id from hr_employees
    const employeeResult = await query(
      'SELECT user_id FROM hr_employees WHERE id = $1',
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const userId = employeeResult.rows[0].user_id;

    // Get commission settings with tiers
    const settingsResult = await query(`
      SELECT 
        ucs.id,
        ucs.product_type,
        ucs.commission_type,
        ucs.default_rate,
        ucs.is_active,
        COALESCE(
          json_agg(
            json_build_object(
              'id', uct.id,
              'tier_order', uct.tier_order,
              'from_amount', uct.from_amount,
              'to_amount', uct.to_amount,
              'rate', uct.rate
            ) ORDER BY uct.tier_order
          ) FILTER (WHERE uct.id IS NOT NULL),
          '[]'
        ) as tiers
      FROM user_commission_settings ucs
      LEFT JOIN user_commission_tiers uct ON ucs.id = uct.setting_id
      WHERE ucs.user_id = $1
      GROUP BY ucs.id
      ORDER BY ucs.product_type
    `, [userId]);

    // Get available product types from insurance_products
    const productTypesResult = await query(`
      SELECT DISTINCT category as product_type
      FROM insurance_products
      WHERE category IS NOT NULL AND is_active = true
      ORDER BY category
    `);

    return NextResponse.json({
      success: true,
      data: {
        settings: settingsResult.rows,
        availableProductTypes: productTypesResult.rows.map(r => r.product_type),
        userId: userId,
      },
    });
  } catch (error) {
    console.error('Error fetching commission settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/hr/employees/[id]/commissions
 * Create or update commission settings for an employee
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const hasPermission = await userHasPermission(payload.userId, 'menu.hr');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the user_id from hr_employees
    const employeeResult = await query(
      'SELECT user_id FROM hr_employees WHERE id = $1',
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const userId = employeeResult.rows[0].user_id;
    const body = await request.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Settings array is required' },
        { status: 400 }
      );
    }

    // Process each setting
    for (const setting of settings) {
      const { product_type, commission_type, default_rate, tiers, is_active } = setting;

      // Upsert commission setting
      const upsertResult = await query(`
        INSERT INTO user_commission_settings (user_id, product_type, commission_type, default_rate, is_active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, product_type)
        DO UPDATE SET
          commission_type = EXCLUDED.commission_type,
          default_rate = EXCLUDED.default_rate,
          is_active = EXCLUDED.is_active,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `, [userId, product_type, commission_type || 'percentage', default_rate || 0, is_active !== false]);

      const settingId = upsertResult.rows[0].id;

      // Delete existing tiers and re-insert
      await query('DELETE FROM user_commission_tiers WHERE setting_id = $1', [settingId]);

      // Insert new tiers
      if (tiers && Array.isArray(tiers) && tiers.length > 0) {
        for (let i = 0; i < tiers.length; i++) {
          const tier = tiers[i];
          await query(`
            INSERT INTO user_commission_tiers (setting_id, tier_order, from_amount, to_amount, rate)
            VALUES ($1, $2, $3, $4, $5)
          `, [settingId, i + 1, tier.from_amount || 0, tier.to_amount || null, tier.rate || 0]);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Commission settings saved successfully',
    });
  } catch (error) {
    console.error('Error saving commission settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/hr/employees/[id]/commissions
 * Delete a commission setting
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const hasPermission = await userHasPermission(payload.userId, 'menu.hr');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { settingId } = body;

    if (!settingId) {
      return NextResponse.json(
        { error: 'Setting ID is required' },
        { status: 400 }
      );
    }

    // Delete the setting (tiers will cascade delete)
    await query('DELETE FROM user_commission_settings WHERE id = $1', [settingId]);

    return NextResponse.json({
      success: true,
      message: 'Commission setting deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting commission setting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
