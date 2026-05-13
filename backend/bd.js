const { Pool } = require('pg');

// Configuração da conexão Supabase
const pool = new Pool({
  host: 'Sdb.kxqhwqitmtyosmmomofj.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'CulturaMaker123',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;