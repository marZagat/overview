const { Pool, Client } = require('pg');
require('dotenv').config();

const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT } = process.env;

const client = new Client({
  user: PGUSER,
  host: PGHOST,
  database: PGDATABASE,
  password: PGPASSWORD,
  port: PGPORT,
});
client.connect();

// returns a promise via client.query
const dropTable = (tableName) => {
  const queryString = `DROP TABLE ${tableName};`;
  return client.query(queryString);
};

const createTable = async (tableName) => {
  const queryString = `CREATE TABLE ${tableName} (
    id              int       NOT NULL,
    name            text,
    tagline         text,
    type            text,
    vicinity        text,
    price_level     int,
    zagat_food      real,
    zagat_decor     real,
    zagat_service   real,
    longDescription text,
    PRIMARY KEY (id)
  );`;
  try {
    await dropTable(tableName);
    const result = await client.query(queryString);
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

createTable('restaurants')
  .then(() => client.end())
  .catch(() => client.end());
