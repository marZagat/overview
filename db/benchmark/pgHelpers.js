require('dotenv').config();
const { Pool, Client } = require('pg');

const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT, PG_TABLENAME } = process.env;

class PgConnection {
  constructor() {
    this.pool = null;
    this.tableName = null;
  }

  connect() {
    this.pool = new Pool({
      PGUSER,
      PGHOST,
      PGDATABASE,
      PGPASSWORD,
      PGPORT,
      PG_TABLENAME,
    });
    this.tableName = PG_TABLENAME;
  }

  disconnect() {}

  find(id) {}

  getExecutionStats(id) {}

  getQueryTime(id) {}
}

module.exports = PgConnection;
