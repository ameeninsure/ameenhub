/**
 * Customer queries for ERP system with portal support
 * Demonstrates CRUD operations with parameterized SQL
 * Country: Oman (+968)
 */

import { query, transaction } from "@/db";
import bcrypt from "bcryptjs";

// Customer types
export type CustomerType = "person" | "company";

// Type definitions
export interface Customer {
  id: number;
  code: string;
  name: string;
  full_name: string | null;
  full_name_ar: string | null;
  customer_type: CustomerType;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address: string | null;
  credit_limit: number;
  is_active: boolean;
  avatar_url: string | null;
  preferred_language: "en" | "ar";
  created_by: number | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface SafeCustomer extends Omit<Customer, "password_hash"> {
  creator_name?: string | null;
  creator_name_ar?: string | null;
  creator_avatar_url?: string | null;
  creator_email?: string | null;
  creator_position?: string | null;
  creator_position_ar?: string | null;
}

export interface CreateCustomerInput {
  code?: string;
  name?: string;
  full_name: string;
  full_name_ar?: string;
  customer_type?: CustomerType;
  company_name?: string;
  email?: string;
  phone?: string;
  mobile: string;
  address?: string;
  credit_limit?: number;
  password?: string;
  avatar_url?: string;
  preferred_language?: "en" | "ar";
  created_by?: number;
}

export interface UpdateCustomerInput {
  name?: string;
  full_name?: string;
  full_name_ar?: string;
  customer_type?: CustomerType;
  company_name?: string | null;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  credit_limit?: number;
  is_active?: boolean;
  avatar_url?: string | null;
  preferred_language?: "en" | "ar";
  password?: string;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all customers with optional pagination and filtering by created_by
 */
export async function getCustomers(
  limit = 50,
  offset = 0,
  createdBy?: number | null,
  isAdmin: boolean = false
): Promise<SafeCustomer[]> {
  let queryStr = `
    SELECT c.id, c.code, c.name, c.full_name, c.full_name_ar, c.customer_type, c.company_name, c.email, c.phone, c.mobile, c.address, c.credit_limit, 
           c.is_active, c.avatar_url, c.preferred_language, c.created_by, c.last_login_at, c.created_at, c.updated_at,
           u.full_name as creator_name, u.full_name_ar as creator_name_ar, u.avatar_url as creator_avatar_url,
           u.email as creator_email, u.position as creator_position, u.position_ar as creator_position_ar
    FROM customers c
    LEFT JOIN users u ON c.created_by = u.id
    WHERE c.is_active = true
  `;
  const params: unknown[] = [];
  let paramIndex = 1;

  // If not admin, filter by created_by
  if (!isAdmin && createdBy) {
    queryStr += ` AND c.created_by = $${paramIndex++}`;
    params.push(createdBy);
  }

  queryStr += ` ORDER BY c.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  params.push(limit, offset);

  const result = await query<SafeCustomer>(queryStr, params);
  return result.rows;
}

/**
 * Get customer count with optional filtering by created_by
 */
export async function getCustomerCount(
  createdBy?: number | null,
  isAdmin: boolean = false
): Promise<number> {
  let queryStr = `SELECT COUNT(*) as count FROM customers WHERE is_active = true`;
  const params: unknown[] = [];

  if (!isAdmin && createdBy) {
    queryStr += ` AND created_by = $1`;
    params.push(createdBy);
  }

  const result = await query<{ count: string }>(queryStr, params);
  return parseInt(result.rows[0].count, 10);
}

/**
 * Get customers created by multiple users (for manager + subordinates)
 */
export async function getCustomersByCreators(
  limit = 50,
  offset = 0,
  creatorIds: number[]
): Promise<SafeCustomer[]> {
  if (creatorIds.length === 0) return [];
  
  const placeholders = creatorIds.map((_, i) => `$${i + 1}`).join(", ");
  const result = await query<SafeCustomer>(
    `SELECT c.id, c.code, c.name, c.full_name, c.full_name_ar, c.customer_type, c.company_name, c.email, c.phone, c.mobile, c.address, c.credit_limit, 
           c.is_active, c.avatar_url, c.preferred_language, c.created_by, c.last_login_at, c.created_at, c.updated_at,
           u.full_name as creator_name, u.full_name_ar as creator_name_ar, u.avatar_url as creator_avatar_url,
           u.email as creator_email, u.position as creator_position, u.position_ar as creator_position_ar
     FROM customers c
     LEFT JOIN users u ON c.created_by = u.id
     WHERE c.is_active = true AND c.created_by IN (${placeholders})
     ORDER BY c.created_at DESC
     LIMIT $${creatorIds.length + 1} OFFSET $${creatorIds.length + 2}`,
    [...creatorIds, limit, offset]
  );
  return result.rows;
}

/**
 * Get customer count for multiple creators (for manager + subordinates)
 */
export async function getCustomerCountByCreators(
  creatorIds: number[]
): Promise<number> {
  if (creatorIds.length === 0) return 0;
  
  const placeholders = creatorIds.map((_, i) => `$${i + 1}`).join(", ");
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM customers WHERE is_active = true AND created_by IN (${placeholders})`,
    creatorIds
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Get all companies (customers with customer_type = 'company')
 * Used for dropdown selection when adding a person to a company
 */
export async function getCompanies(): Promise<{ id: number; code: string; full_name: string }[]> {
  const result = await query<{ id: number; code: string; full_name: string }>(
    `SELECT id, code, full_name
     FROM customers
     WHERE customer_type = 'company' AND is_active = true
     ORDER BY full_name ASC`
  );
  return result.rows;
}

/**
 * Get a customer by ID
 */
export async function getCustomerById(id: number): Promise<SafeCustomer | null> {
  const result = await query<SafeCustomer>(
    `SELECT id, code, name, full_name, full_name_ar, customer_type, company_name, email, phone, mobile, address, credit_limit, 
            is_active, avatar_url, preferred_language, created_by, last_login_at, created_at, updated_at
     FROM customers
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

/**
 * Get a customer by mobile (for login)
 */
export async function getCustomerByMobile(
  mobile: string
): Promise<(SafeCustomer & { password_hash: string | null }) | null> {
  const result = await query<SafeCustomer & { password_hash: string | null }>(
    `SELECT id, code, name, full_name, full_name_ar, customer_type, company_name, email, phone, mobile, address, credit_limit, 
            is_active, avatar_url, preferred_language, created_by, last_login_at, 
            created_at, updated_at, password_hash
     FROM customers
     WHERE mobile = $1 AND is_active = true`,
    [mobile]
  );
  return result.rows[0] ?? null;
}

/**
 * Get a customer by code (unique business identifier)
 */
export async function getCustomerByCode(
  code: string
): Promise<SafeCustomer | null> {
  const result = await query<SafeCustomer>(
    `SELECT id, code, name, full_name, full_name_ar, customer_type, company_name, email, phone, mobile, address, credit_limit, 
            is_active, avatar_url, preferred_language, created_by, last_login_at, created_at, updated_at
     FROM customers
     WHERE code = $1`,
    [code]
  );
  return result.rows[0] ?? null;
}

/**
 * Search customers by name, full_name, mobile, or code
 */
export async function searchCustomers(
  searchTerm: string,
  limit = 20,
  createdBy?: number | null,
  isAdmin: boolean = false
): Promise<SafeCustomer[]> {
  let queryStr = `
    SELECT id, code, name, full_name, full_name_ar, customer_type, company_name, email, phone, mobile, address, credit_limit, 
           is_active, avatar_url, preferred_language, created_by, last_login_at, created_at, updated_at
    FROM customers
    WHERE (name ILIKE $1 OR full_name ILIKE $1 OR full_name_ar ILIKE $1 OR code ILIKE $1 OR mobile ILIKE $1 OR company_name ILIKE $1) AND is_active = true
  `;
  const params: unknown[] = [`%${searchTerm}%`];
  let paramIndex = 2;

  if (!isAdmin && createdBy) {
    queryStr += ` AND created_by = $${paramIndex++}`;
    params.push(createdBy);
  }

  queryStr += ` ORDER BY full_name ASC LIMIT $${paramIndex}`;
  params.push(limit);

  const result = await query<SafeCustomer>(queryStr, params);
  return result.rows;
}

/**
 * Generate unique customer code based on customer type
 * CU- for persons, CO- for companies
 */
async function generateCustomerCode(customerType: "person" | "company" = "person"): Promise<string> {
  const prefix = customerType === "company" ? "CO" : "CU";
  const result = await query<{ max_code: string | null }>(
    `SELECT MAX(SUBSTRING(code FROM ${prefix.length + 2})::INTEGER) as max_code 
     FROM customers 
     WHERE code LIKE $1 AND SUBSTRING(code FROM ${prefix.length + 2}) ~ '^[0-9]+$'`,
    [`${prefix}-%`]
  );
  const maxNum = result.rows[0]?.max_code ? parseInt(result.rows[0].max_code, 10) : 0;
  return `${prefix}-${String(maxNum + 1).padStart(6, "0")}`;
}

/**
 * Create a new customer
 */
export async function createCustomer(
  input: CreateCustomerInput
): Promise<SafeCustomer> {
  // Generate code if not provided (CU- for person, CO- for company)
  const code = input.code || await generateCustomerCode(input.customer_type ?? "person");
  
  // Hash password if provided
  let passwordHash: string | null = null;
  if (input.password) {
    passwordHash = await bcrypt.hash(input.password, 12);
  }

  const result = await query<SafeCustomer>(
    `INSERT INTO customers (code, name, full_name, full_name_ar, customer_type, company_name, email, phone, mobile, address, credit_limit, 
                           password_hash, avatar_url, preferred_language, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING id, code, name, full_name, full_name_ar, customer_type, company_name, email, phone, mobile, address, credit_limit, 
               is_active, avatar_url, preferred_language, created_by, last_login_at, created_at, updated_at`,
    [
      code,
      input.name || input.full_name,
      input.full_name,
      input.full_name_ar ?? null,
      input.customer_type ?? "person",
      input.company_name ?? null,
      input.email ?? null,
      input.phone ?? null,
      input.mobile,
      input.address ?? null,
      input.credit_limit ?? 0,
      passwordHash,
      input.avatar_url ?? null,
      input.preferred_language ?? "en",
      input.created_by ?? null,
    ]
  );
  return result.rows[0];
}

/**
 * Update a customer
 */
export async function updateCustomer(
  id: number,
  input: UpdateCustomerInput
): Promise<SafeCustomer | null> {
  // Build dynamic update query
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.full_name !== undefined) {
    updates.push(`full_name = $${paramIndex++}`);
    values.push(input.full_name);
  }
  if (input.full_name_ar !== undefined) {
    updates.push(`full_name_ar = $${paramIndex++}`);
    values.push(input.full_name_ar);
  }
  if (input.customer_type !== undefined) {
    updates.push(`customer_type = $${paramIndex++}`);
    values.push(input.customer_type);
  }
  if (input.company_name !== undefined) {
    updates.push(`company_name = $${paramIndex++}`);
    values.push(input.company_name);
  }
  if (input.email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    values.push(input.email);
  }
  if (input.phone !== undefined) {
    updates.push(`phone = $${paramIndex++}`);
    values.push(input.phone);
  }
  if (input.mobile !== undefined) {
    updates.push(`mobile = $${paramIndex++}`);
    values.push(input.mobile);
  }
  if (input.address !== undefined) {
    updates.push(`address = $${paramIndex++}`);
    values.push(input.address);
  }
  if (input.credit_limit !== undefined) {
    updates.push(`credit_limit = $${paramIndex++}`);
    values.push(input.credit_limit);
  }
  if (input.is_active !== undefined) {
    updates.push(`is_active = $${paramIndex++}`);
    values.push(input.is_active);
  }
  if (input.avatar_url !== undefined) {
    updates.push(`avatar_url = $${paramIndex++}`);
    values.push(input.avatar_url);
  }
  if (input.preferred_language !== undefined) {
    updates.push(`preferred_language = $${paramIndex++}`);
    values.push(input.preferred_language);
  }
  if (input.password) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    updates.push(`password_hash = $${paramIndex++}`);
    values.push(passwordHash);
  }

  if (updates.length === 0) {
    return getCustomerById(id);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<SafeCustomer>(
    `UPDATE customers
     SET ${updates.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING id, code, name, full_name, full_name_ar, customer_type, company_name, email, phone, mobile, address, credit_limit, 
               is_active, avatar_url, preferred_language, created_by, last_login_at, created_at, updated_at`,
    values
  );
  return result.rows[0] ?? null;
}

/**
 * Update customer last login
 */
export async function updateCustomerLastLogin(id: number): Promise<void> {
  await query(
    `UPDATE customers SET last_login_at = NOW() WHERE id = $1`,
    [id]
  );
}

/**
 * Verify customer password
 */
export async function verifyCustomerPassword(
  mobile: string,
  password: string
): Promise<SafeCustomer | null> {
  const customer = await getCustomerByMobile(mobile);
  if (!customer || !customer.password_hash) {
    return null;
  }

  const isValid = await bcrypt.compare(password, customer.password_hash);
  if (!isValid) {
    return null;
  }

  // Update last login
  await updateCustomerLastLogin(customer.id);

  // Return customer without password_hash
  const { password_hash, ...safeCustomer } = customer;
  return safeCustomer;
}

/**
 * Soft delete a customer (set is_active = false)
 */
export async function deleteCustomer(id: number): Promise<boolean> {
  const result = await query(
    `UPDATE customers SET is_active = false, updated_at = NOW() WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

// ============================================================================
// TRANSACTION EXAMPLE
// ============================================================================

/**
 * Example: Create customer with initial order (transaction)
 */
export async function createCustomerWithOrder(
  customerInput: CreateCustomerInput,
  orderData: { product_id: number; quantity: number }
) {
  return transaction(async (client) => {
    const prefix = customerInput.customer_type === "company" ? "CO" : "CU";
    const code = customerInput.code || `${prefix}-${Date.now()}`;
    
    const customerResult = await client.query<SafeCustomer>(
      `INSERT INTO customers (code, name, full_name, email, phone, mobile, address, credit_limit, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, code, name, full_name, email, phone, mobile, address, credit_limit, 
                 is_active, avatar_url, preferred_language, created_by, last_login_at, created_at, updated_at`,
      [
        code,
        customerInput.name || customerInput.full_name,
        customerInput.full_name,
        customerInput.email ?? null,
        customerInput.phone ?? null,
        customerInput.mobile,
        customerInput.address ?? null,
        customerInput.credit_limit ?? 0,
        customerInput.created_by ?? null,
      ]
    );
    const customer = customerResult.rows[0];

    await client.query(
      `INSERT INTO orders (customer_id, product_id, quantity, status)
       VALUES ($1, $2, $3, 'pending')`,
      [customer.id, orderData.product_id, orderData.quantity]
    );

    return customer;
  });
}
