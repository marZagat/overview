require('dotenv').config();
const { Pool, Client } = require('pg');

const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT, PG_TABLENAME } = process.env;

class PgConnection {
  constructor() {}

  connect() {}

  disconnect() {}

  find(id) {}

  getExecutionStats(id) {}

  getQueryTime(id) {}
}

module.exports = PgConnection;
