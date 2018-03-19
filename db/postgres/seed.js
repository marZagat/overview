const { Pool, Client } = require('pg');
const Promise = require('bluebird');
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

// returns a promise via client.query
const createTable = (tableName) => {
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

// returns a promise via client.query
const addRow = (data, tableName) => {
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

  return client.query(queryString);
};

// TODO: update to generate data with faker
const generateFakeRow = (idNum) => {
  return {
    id: idNum,
    name: 'foo',
    tagline: 'bar',
    type: 'hello',
    vicinity: 'world',
    priceLevel: 3,
    zagatFood: 1.4,
    zagatDecor: 2.5,
    zagatService: 4.3,
    longDescription: 'long sentence',
  };
};

const addRows = (numRows, tableName) => {
  const promises = [];
  for (let i = 0; i < numRows; i++) {
    promises.push(addRow(generateFakeRow(i), tableName));
  }
  return Promise.all(promises);
};

const seedDb = async (tableName) => {
  try {
    await dropTable(tableName);
    await createTable(tableName);
    await addRows(10, tableName);
  } catch (error) {
    console.error(error);
  }
  client.end();
};

seedDb('restaurants');
