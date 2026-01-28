import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

// Connection pool configuration optimized for ERP workloads
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Pool sizing - adjust based on your server capacity
  max: 20, // Maximum connections in pool
  min: 2, // Minimum connections to keep open
  // Timeouts
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Fail fast if can't connect in 5s
  // Statement timeout to prevent runaway queries (30 seconds)
  statement_timeout: 30000,
  // Query timeout
  query_timeout: 30000,
});

// Log pool errors (don't crash the app)
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Log when pool connects (useful for debugging)
pool.on("connect", () => {
  if (process.env.NODE_ENV === "development") {
    console.log("New client connected to PostgreSQL pool");
  }
});

/**
 * Execute a parameterized query
 * @example
 * const users = await query<User>('SELECT * FROM users WHERE id = $1', [userId]);
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV === "development") {
    console.log("Executed query", { text, duration, rows: result.rowCount });
  }

  return result;
}

/**
 * Get a client from the pool for transactions
 * IMPORTANT: Always release the client in a finally block
 * @example
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   // ... your queries
 *   await client.query('COMMIT');
 * } catch (e) {
 *   await client.query('ROLLBACK');
 *   throw e;
 * } finally {
 *   client.release();
 * }
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Execute multiple queries in a transaction
 * Automatically handles BEGIN, COMMIT, and ROLLBACK
 * @example
 * const results = await transaction(async (client) => {
 *   await client.query('INSERT INTO orders ...', [...]);
 *   await client.query('UPDATE inventory ...', [...]);
 *   return { success: true };
 * });
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Check database connectivity
 * Useful for health checks
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

/**
 * Get pool statistics
 * Useful for monitoring
 */
export function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Graceful shutdown - call this when the app is shutting down
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
