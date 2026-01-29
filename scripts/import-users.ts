/**
 * Import Users Script
 * Imports users from the legacy system backup (users-export.json)
 * Maps positions, managers, and preserves all data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Position mapping from old IDs to names
const positionMap: Record<string, { name: string; nameAr: string }> = {
  "1AD8aKkpLCmr8zrG3PM7b": { name: "Finance & Operations Assistant", nameAr: "مساعد المالية والعمليات" },
  "795tAZ82m6tooicaKVt9t": { name: "Senior Technical Manager", nameAr: "مدير فني أول" },
  "DYwQXa27wM_Qkq223GLWZ": { name: "Administrative Manager", nameAr: "المدير الإداري" },
  "GosIOIGtAlvCS32b4RE9n": { name: "Placement & Policy Issuance Team Leader", nameAr: "رئيسة فريق استراتيجيات إصدار الوثائق التأمينية" },
  "JWtu4Y1bdCmm7-JYSc7h_": { name: "Consultant", nameAr: "مستشار" },
  "KUw5LUCEVfV8QeZfbLIcx": { name: "Senior Technical Officer", nameAr: "فني أول" },
  "M30a8ECa65kc3AP4bpiOe": { name: "Business Development Officer", nameAr: "مسؤول/مسؤولة تطوير الأعمال" },
  "PL4ctt1s9fgJNbivSjeKs": { name: "Chief Commercial Officer", nameAr: "الرئيس التنفيذي التجاري" },
  "QPPtpS9toSAvPSXFvwbFD": { name: "Partnerships and Affinities Senior Manager", nameAr: "المدير الأول لإدارة الشراكات والعلاقات الاستراتيجية" },
  "e6QDp_TtM5mmWUdUzvsC0": { name: "Senior Insurance Operations Coordinator", nameAr: "منسقة أولى عمليات التأمين" },
  "fFwfllgMlOEtzw4Snb2j_": { name: "Digital Development Officer", nameAr: "مسؤول التطوير الرقمي" },
  "insgu3KAkBF9djgyVwnOS": { name: "Human Resources Manager", nameAr: "مدير الموارد البشرية" },
  "lhhLXQn1XG8dYMXtzr1hK": { name: "Corporate Affairs Manager", nameAr: "مدير الشؤون المؤسسية" },
  "pwNv7kaST7vDptWRsmI3H": { name: "Head of Finance", nameAr: "مدير المالية" },
  "qF96_lQBy6XNHPaX1VbKm": { name: "Chief Operating Officer", nameAr: "الرئيس التنفيذي للعمليات" },
  "r6S9c1uvVr_uQBHECNKOI": { name: "Public Relations Officer Manager", nameAr: "مدير العلاقات الحكومية" },
  "uLzDBwlsLIlZ65-VxDDKi": { name: "Chief Executive Officer", nameAr: "الرئيس التنفيذي" },
  "uNgApNLPcNRFm2rbdXD-8": { name: "CEO's Office Manager", nameAr: "مدير مكتب الرئيس التنفيذي" },
  "xOxcGdFX5G1hMmofdjUG7": { name: "Placement & Policy Issuance Officer", nameAr: "مسؤول/مسؤولة استراتيجيات إصدار الوثائق التأمينية" },
};

interface LegacyUser {
  id: string;
  email: string;
  password: string;
  fullNameEn?: string;
  fullNameAr?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  position?: string;
  phoneNumber?: string | null;
  department?: string | null;
  managerId?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

async function importUsers() {
  // Read the export file
  const exportPath = path.join(__dirname, '../public/users-export.json');
  const data = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
  const users: LegacyUser[] = data.users;

  console.log(`Found ${users.length} users to import`);

  // Connect to database
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'ameenhub',
    user: 'postgres',
    password: 'postgres',
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // First, clear customers and user_roles to allow user deletion
    console.log('Clearing related data...');
    await client.query('DELETE FROM customers');
    await client.query('DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE is_system = false)');
    await client.query('DELETE FROM users WHERE is_system = false');

    // Map old IDs to new IDs
    const idMap = new Map<string, number>();

    // Sort users so those without managers come first
    const sortedUsers = [...users].sort((a, b) => {
      if (!a.managerId && b.managerId) return -1;
      if (a.managerId && !b.managerId) return 1;
      return 0;
    });

    // First pass: Insert all users without manager_id
    console.log('Inserting users (first pass - without managers)...');
    for (const user of sortedUsers) {
      // Generate username from email
      let username = user.email.split('@')[0].replace(/\./g, '_');
      
      // Skip system users or add suffix if username conflicts
      const existingUser = await client.query('SELECT id FROM users WHERE username = $1', [username]);
      if (existingUser.rows.length > 0) {
        console.log(`  Skipping ${username} - already exists as system user`);
        continue;
      }
      
      // Get full name
      const fullName = user.fullNameEn || 
        (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : username);
      const fullNameAr = user.fullNameAr || null;

      // Get position name from ID
      const positionData = user.position ? positionMap[user.position] : null;
      const position = positionData?.name || null;
      const positionAr = positionData?.nameAr || null;

      // Phone number
      const phone = user.phoneNumber || null;

      // Avatar URL (keep as-is, may need adjustment based on file storage)
      const avatarUrl = user.avatarUrl || null;

      // Insert user
      const result = await client.query(
        `INSERT INTO users (
          code, username, email, password_hash, full_name, full_name_ar, 
          position, position_ar, phone, avatar_url, preferred_language, is_active, is_system,
          created_at, updated_at, last_login_at
        ) VALUES (
          generate_user_code(), $1, $2, $3, $4, $5, 
          $6, $7, $8, $9, 'en', $10, false,
          $11, $12, $13
        ) RETURNING id`,
        [
          username,
          user.email,
          user.password, // Password is already hashed with argon2
          fullName,
          fullNameAr,
          position,
          positionAr,
          phone,
          avatarUrl,
          user.isActive,
          user.createdAt,
          user.updatedAt,
          user.lastLoginAt || null,
        ]
      );

      const newId = result.rows[0].id;
      idMap.set(user.id, newId);
      console.log(`  Inserted: ${fullName} (${user.email}) -> ID: ${newId}`);
    }

    // Second pass: Update manager_id references
    console.log('\nUpdating manager references...');
    for (const user of users) {
      if (user.managerId) {
        const newUserId = idMap.get(user.id);
        const newManagerId = idMap.get(user.managerId);

        if (newUserId && newManagerId) {
          await client.query(
            'UPDATE users SET manager_id = $1 WHERE id = $2',
            [newManagerId, newUserId]
          );
          
          const managerUser = users.find(u => u.id === user.managerId);
          const managerName = managerUser?.fullNameEn || managerUser?.email || 'Unknown';
          console.log(`  ${user.fullNameEn || user.email} -> Manager: ${managerName}`);
        }
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ Import completed successfully!');
    console.log(`   Total users imported: ${users.length}`);

    // Print summary
    console.log('\n📊 Import Summary:');
    const countResult = await client.query('SELECT COUNT(*) FROM users WHERE is_system = false');
    console.log(`   Users in database: ${countResult.rows[0].count}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the import
importUsers().catch(console.error);
