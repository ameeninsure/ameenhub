/**
 * Example: Customer queries for an ERP system
 * Demonstrates CRUD operations with parameterized SQL
 */

import { query, transaction } from "@/db";

// Type definitions
export interface Customer {
  id: number;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  credit_limit: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCustomerInput {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  credit_limit?: number;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  credit_limit?: number;
  is_active?: boolean;
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all customers with optional pagination
 */
export async function getCustomers(
  limit = 50,
  offset = 0
): Promise<Customer[]> {
  const result = await query<Customer>(
    `SELECT id, code, name, email, phone, address, credit_limit, is_active, created_at, updated_at
     FROM customers
     WHERE is_active = true
     ORDER BY name ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

/**
 * Get a customer by ID
 */
export async function getCustomerById(id: number): Promise<Customer | null> {
  const result = await query<Customer>(
    `SELECT id, code, name, email, phone, address, credit_limit, is_active, created_at, updated_at
     FROM customers
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

/**
 * Get a customer by code (unique business identifier)
 */
export async function getCustomerByCode(
  code: string
): Promise<Customer | null> {
  const result = await query<Customer>(
    `SELECT id, code, name, email, phone, address, credit_limit, is_active, created_at, updated_at
     FROM customers
     WHERE code = $1`,
    [code]
  );
  return result.rows[0] ?? null;
}

/**
 * Search customers by name or code
 */
export async function searchCustomers(
  searchTerm: string,
  limit = 20
): Promise<Customer[]> {
  const result = await query<Customer>(
    `SELECT id, code, name, email, phone, address, credit_limit, is_active, created_at, updated_at
     FROM customers
     WHERE (name ILIKE $1 OR code ILIKE $1) AND is_active = true
     ORDER BY name ASC
     LIMIT $2`,
    [`%${searchTerm}%`, limit]
  );
  return result.rows;
}

/**
 * Create a new customer
 */
export async function createCustomer(
  input: CreateCustomerInput
): Promise<Customer> {
  const result = await query<Customer>(
    `INSERT INTO customers (code, name, email, phone, address, credit_limit)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, code, name, email, phone, address, credit_limit, is_active, created_at, updated_at`,
    [
      input.code,
      input.name,
      input.email ?? null,
      input.phone ?? null,
      input.address ?? null,
      input.credit_limit ?? 0,
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
): Promise<Customer | null> {
  // Build dynamic update query
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(input.name);
  }
  if (input.email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    values.push(input.email);
  }
  if (input.phone !== undefined) {
    updates.push(`phone = $${paramIndex++}`);
    values.push(input.phone);
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

  if (updates.length === 0) {
    return getCustomerById(id);
  }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<Customer>(
    `UPDATE customers
     SET ${updates.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING id, code, name, email, phone, address, credit_limit, is_active, created_at, updated_at`,
    values
  );
  return result.rows[0] ?? null;
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

/**
 * Get customer count (useful for pagination)
 */
export async function getCustomerCount(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM customers WHERE is_active = true`
  );
  return parseInt(result.rows[0].count, 10);
}

// ============================================================================
// TRANSACTION EXAMPLE
// ============================================================================

/**
 * Example: Create customer with initial order (transaction)
 * This demonstrates how to use transactions for operations that must be atomic
 */
export async function createCustomerWithOrder(
  customerInput: CreateCustomerInput,
  orderData: { product_id: number; quantity: number }
) {
  return transaction(async (client) => {
    // Create customer
    const customerResult = await client.query<Customer>(
      `INSERT INTO customers (code, name, email, phone, address, credit_limit)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, code, name, email, phone, address, credit_limit, is_active, created_at, updated_at`,
      [
        customerInput.code,
        customerInput.name,
        customerInput.email ?? null,
        customerInput.phone ?? null,
        customerInput.address ?? null,
        customerInput.credit_limit ?? 0,
      ]
    );
    const customer = customerResult.rows[0];

    // Create initial order
    await client.query(
      `INSERT INTO orders (customer_id, product_id, quantity, status)
       VALUES ($1, $2, $3, 'pending')`,
      [customer.id, orderData.product_id, orderData.quantity]
    );

    return customer;
  });
}
