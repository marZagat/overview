require('dotenv').config();
const { Pool, Client } = require('pg');

const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT, PG_TABLENAME } = process.env;

class PgConnection {
  constructor() {
    this.pool = null;
    this.tableName = null;
  }

  connect(poolSize = 5) {
    this.pool = new Pool({
      PGUSER,
      PGHOST,
      PGDATABASE,
      PGPASSWORD,
      PGPORT,
      PG_TABLENAME,
      max: poolSize,
    });
    this.tableName = PG_TABLENAME;
    return this;
  }

  disconnect() {
    this.pool.end();
  }

  getExecutionStats(id) {
    return this.pool.query(`EXPLAIN ANALYZE SELECT * FROM ${this.tableName} WHERE id = ${id};`);
  }

  async getQueryTime(id) {
    const executionStats = await this.getExecutionStats(id);
    const str = executionStats.rows[0]['QUERY PLAN'];
    const start = str.indexOf('actual time=') + ('actual time=').length;
    const end = str.indexOf('..', start);
    const queryTime = parseFloat(str.slice(start, end));
    return queryTime;
  }
}

module.exports = PgConnection;
