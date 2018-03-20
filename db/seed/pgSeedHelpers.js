require('dotenv').config();
const { Pool, Client } = require('pg');
const generateRecord = require('./generateRecord');

const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT, PG_TABLENAME } = process.env;

const connectToDb = () => {
  const pool = new Pool({
    user: PGUSER,
    host: PGHOST,
    database: PGDATABASE,
    password: PGPASSWORD,
    port: PGPORT,
  });
  return { pool };
};

const disconnectFromDb = ({ pool }) => {
  pool.end();
};

// returns a promise via pool.query
const dropTable = ({ pool }, tableName) => {
  const queryString = `DROP TABLE IF EXISTS ${tableName};`;
  return pool.query(queryString);
};

// returns a promise via pool.query
const createTable = ({ pool }, tableName) => {
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
    long_description text,
    PRIMARY KEY (id)
  );`;

  return pool.query(queryString);
};

const preSeed = async () => {
  console.log('Dropping existing table if it exists');
  const { pool } = await connectToDb();
  await dropTable({ pool }, PG_TABLENAME);

  console.log('Recreating the table with proper schema');
  await createTable({ pool }, PG_TABLENAME);
  await disconnectFromDb({ pool });
};

// TODO: indexing?
const postSeed = async () => {
  console.log('Creating unique index on id column');
  const { pool } = await connectToDb();
  await pool.query(`CREATE UNIQUE INDEX id_index_${PG_TABLENAME} ON ${PG_TABLENAME} (id);`);
  await disconnectFromDb({ pool });
};

// returns a promise via pool.query
const addRow = (data) => {
  const rowValues = `(
    ${data.id},
    '${data.name}',
    '${data.tagline}',
    '${data.type}',
    '${data.vicinity}',
    ${data.priceLevel},
    ${data.zagatFood},
    ${data.zagatDecor},
    ${data.zagatService},
    '${data.longDescription}'
  )`;
  return rowValues;
};

const seedBatch = async (minId, maxId, { pool }) => {
  const rowsArr = [];
  for (let i = minId; i < maxId; i++) {
    const record = generateRecord(i);
    rowsArr.push(addRow(record));
  }
  const queryString = `INSERT INTO ${PG_TABLENAME} VALUES ${rowsArr.join(',')};`;
  await pool.query(queryString);
};

module.exports = {
  connectToDb,
  seedBatch,
  disconnectFromDb,
  preSeed,
  postSeed,
};
