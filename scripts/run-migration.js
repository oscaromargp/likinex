const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Force IPv4
dns.setDefaultResultOrder('ipv4first');

async function runMigration() {
  const client = new Client({
    host: 'db.tmcqyscstxlilfbsdcwn.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to Supabase database');

    const sql = fs.readFileSync(
      path.join(__dirname, '../supabase/migrations/001_initial_schema.sql'),
      'utf8'
    );

    await client.query(sql);
    console.log('Migration executed successfully');

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
