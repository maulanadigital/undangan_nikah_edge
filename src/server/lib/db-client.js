/**
 * Database connection helper
 * Supports Cloudflare D1, Cloudflare Hyperdrive, and Node.js/Bun PostgreSQL.
 *
 * Cloudflare Workers use the D1 binding at `c.env.DB`. Node.js/Bun environments
 * use `DATABASE_URL` and PostgreSQL. Hyperdrive connection strings remain
 * supported for deployments that already use that binding.
 *
 * PostgreSQL pools are created lazily and cached per connection string for the
 * lifetime of the runtime instance, so they are not constructed per request.
 */

// Module-scoped cache: connectionString -> pg.Pool
// Reused across requests within the same runtime instance.
const poolCache = new Map();

/**
 * Adapt numbered PostgreSQL placeholders and timestamp expressions for SQLite.
 * @param {string} sql
 * @returns {string}
 */
function toD1Sql(sql) {
  return sql
    .replace(
      /created_at\s+AT TIME ZONE 'UTC'\s+AT TIME ZONE 'Asia\/Jakarta'/gi,
      "datetime(created_at, '+7 hours')",
    )
    .replace(
      /CURRENT_TIMESTAMP\s+AT TIME ZONE 'Asia\/Jakarta'/gi,
      "CURRENT_TIMESTAMP",
    )
    .replace(/\$\d+/g, "?");
}

/**
 * Create the query interface used by the API routes for a D1 binding.
 * @param {object} binding
 * @returns {{ query: (sql: string, params?: unknown[]) => Promise<{ rows: object[], rowCount: number }> }}
 */
function createD1Client(binding) {
  return {
    async query(sql, params = []) {
      const result = await binding
        .prepare(toD1Sql(sql))
        .bind(...params)
        .all();

      const rows = result.results ?? [];
      const isWrite = /^(INSERT|UPDATE|DELETE|REPLACE)\b/i.test(sql.trim());
      return {
        rows,
        rowCount: isWrite
          ? Number(result.meta?.changes ?? rows.length)
          : rows.length,
      };
    },
  };
}

/**
 * Get a database client based on the environment.
 *
 * The returned client exposes an async `query(sql, params)` method resolving to
 * a result with a `rows` array, matching the contract relied upon by the
 * invitation, wishes, and stats routes.
 *
 * @param {import('hono').Context} c - Hono context
 * @returns {Promise<import('pg').Pool | ReturnType<typeof createD1Client>>}
 */
export async function getDbClient(c) {
  const binding = c.env?.DB;

  if (binding && typeof binding.prepare === "function") {
    return createD1Client(binding);
  }

  const connectionString =
    (typeof binding === "string" ? binding : binding?.connectionString) ??
    c.env?.DATABASE_URL;
  if (typeof connectionString !== "string" || connectionString.length === 0) {
    throw new Error(
      "No database connection available. Configure a D1 binding (env.DB), a Hyperdrive connection, or DATABASE_URL for local PostgreSQL.",
    );
  }

  // Reuse an existing pool for this connection string if we have one.
  const cached = poolCache.get(connectionString);
  if (cached) {
    return cached;
  }

  // Lazily import pg so the driver isn't evaluated until a connection is needed.
  const pg = await import("pg");
  const { Pool } = pg.default || pg;

  const pool = new Pool({ connectionString });
  poolCache.set(connectionString, pool);

  return pool;
}
