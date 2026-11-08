import pg from 'pg';
import { config } from './config.js';
const { Pool } = pg;
export const pool = new Pool({ connectionString: config.databaseUrl, ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }, max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 });
export async function initDb() {
  await pool.query(`CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, address TEXT NOT NULL,
    service_type TEXT NOT NULL, frequency TEXT NOT NULL, notes TEXT DEFAULT '', source TEXT NOT NULL DEFAULT 'telegram',
    telegram_user_id TEXT, telegram_username TEXT, status TEXT NOT NULL DEFAULT 'new', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  ); CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC); CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);`);
}
export async function createLead(lead) {
  const { rows } = await pool.query(`INSERT INTO leads (name,phone,address,service_type,frequency,notes,source,telegram_user_id,telegram_username) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,name,phone,address,service_type,frequency,notes,source,created_at`,
    [lead.name,lead.phone,lead.address,lead.serviceType,lead.frequency,lead.notes || '',lead.source || 'telegram',lead.telegramUserId || null,lead.telegramUsername || null]);
  return rows[0];
}
export async function recentLeads(limit = 10) {
  const { rows } = await pool.query('SELECT id,name,phone,address,service_type,frequency,status,source,created_at FROM leads ORDER BY created_at DESC LIMIT $1',[Math.min(Math.max(Number(limit)||10,1),25)]);
  return rows;
}
