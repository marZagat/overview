require('dotenv').config();
const { Pool, Client } = require('pg');

const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT, PG_TABLENAME } = process.env;

class PgConnection {
  constructor() {
    this.pool = null;
    this.tableName = null;
  }

  connect() {}

  disconnect() {}

  find(id) {}

  getExecutionStats(id) {}

  getQueryTime(id) {}
}

module.exports = PgConnection;
