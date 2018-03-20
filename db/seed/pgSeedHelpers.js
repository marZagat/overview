require('dotenv').config();
const Promise = require('bluebird');
const { Pool, Client } = require('pg');
const generateRecord = require('./generateRecord');

const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT, PG_TABLENAME } = process.env;

const connectToDb = () => {
  const client = new Client({
    user: PGUSER,
    host: PGHOST,
    database: PGDATABASE,
    password: PGPASSWORD,
    port: PGPORT,
  });
  client.connect();
  return { client };
};

const disconnectFromDb = ({ client }) => {
  client.end();
};

// returns a promise via client.query
const dropTable = ({ client }, tableName) => {
  const queryString = `DROP TABLE ${tableName};`;
  return client.query(queryString);
};

// returns a promise via client.query
const createTable = ({ client }, tableName) => {
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

  return client.query(queryString);
};

const preSeed = async () => {
  console.log('Dropping existing table if it exists');
  const { client } = await connectToDb();
  await dropTable({ client }, PG_TABLENAME);

  console.log('Recreating the table with proper schema');
  await createTable({ client }, PG_TABLENAME);
  await disconnectFromDb({ client });
};

// TODO: indexing?
const postSeed = async () => {

};

// returns a promise via client.query
const addRow = (data, tableName, { client }) => (
  new Promise((resolve, reject) => {
    const queryString = `INSERT INTO ${tableName} values (
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
    );`;

    try {
      resolve(client.query(queryString));
    } catch (error) {
      console.log('error at this query:', queryString, error);
      reject(error);
    }
  })
);

const seedBatch = (minId, maxId, { client }) => {
  const promises = [];
  for (let i = minId; i < maxId; i++) {
    const record = generateRecord(i);
    promises.push(addRow(record, PG_TABLENAME, { client }));
  }
  return Promise.all(promises);
};

module.exports = {
  connectToDb,
  seedBatch,
  disconnectFromDb,
  preSeed,
  postSeed,
};
