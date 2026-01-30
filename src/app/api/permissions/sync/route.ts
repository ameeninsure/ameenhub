import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/db';

/**
 * Sync all registered permissions to database
 * This should be called after deploying new features
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    console.log('Starting permission sync...');
    
    // Define new message permissions
    const newPermissions = [
      {
        code: 'messages.view',
        module: 'messages',
        category: 'page',
        nameEn: 'View Messages',
        nameAr: 'عرض الرسائل',
        descriptionEn: 'Can view messages page and history',
        descriptionAr: 'يمكن عرض صفحة الرسائل والسجل',
      },
      {
        code: 'messages.send',
        module: 'messages',
        category: 'api',
        nameEn: 'Send Messages',
        nameAr: 'إرسال الرسائل',
        descriptionEn: 'Can send direct messages to users and customers',
        descriptionAr: 'يمكن إرسال رسائل مباشرة للمستخدمين والعملاء',
      },
      {
        code: 'messages.send_to_users',
        module: 'messages',
        category: 'api',
        nameEn: 'Send Messages to Users',
        nameAr: 'إرسال رسائل للمستخدمين',
        descriptionEn: 'Can send messages to system users',
        descriptionAr: 'يمكن إرسال رسائل لمستخدمي النظام',
      },
      {
        code: 'messages.send_to_customers',
        module: 'messages',
        category: 'api',
        nameEn: 'Send Messages to Customers',
        nameAr: 'إرسال رسائل للعملاء',
        descriptionEn: 'Can send messages to customers',
        descriptionAr: 'يمكن إرسال رسائل للعملاء',
      },
      {
        code: 'messages.send_broadcast',
        module: 'messages',
        category: 'api',
        nameEn: 'Send Broadcast Messages',
        nameAr: 'إرسال رسائل جماعية',
        descriptionEn: 'Can send broadcast messages to multiple recipients',
        descriptionAr: 'يمكن إرسال رسائل جماعية لمستقبلين متعددين',
      },
      {
        code: 'messages.view_history',
        module: 'messages',
        category: 'api',
        nameEn: 'View Messages History',
        nameAr: 'عرض سجل الرسائل',
        descriptionEn: 'Can view sent messages history',
        descriptionAr: 'يمكن عرض سجل الرسائل المرسلة',
      },
      {
        code: 'messages.delete',
        module: 'messages',
        category: 'api',
        nameEn: 'Delete Messages',
        nameAr: 'حذف الرسائل',
        descriptionEn: 'Can delete sent messages',
        descriptionAr: 'يمكن حذف الرسائل المرسلة',
      },
    ];
    
    let syncedCount = 0;
    let errorCount = 0;
    
    // Sync each permission
    for (const perm of newPermissions) {
      try {
        await query(
          `SELECT register_permission($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            perm.code,
            perm.module,
            perm.category,
            perm.nameEn,
            perm.nameAr,
            perm.descriptionEn || null,
            perm.descriptionAr || null,
            true, // is_system
          ]
        );
        syncedCount++;
        console.log(`✓ Synced: ${perm.code}`);
      } catch (err) {
        errorCount++;
        console.error(`✗ Failed to sync: ${perm.code}`, err);
      }
    }
    
    console.log(`Permission sync completed: ${syncedCount} synced, ${errorCount} errors`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} permissions`,
      details: {
        synced: syncedCount,
        errors: errorCount,
        total: newPermissions.length,
      }
    });
  } catch (error: any) {
    console.error('Error syncing permissions:', error);
    console.error('Error stack:', error?.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync permissions',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
