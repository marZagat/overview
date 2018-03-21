require('dotenv').config();
const { MongoClient } = require('mongodb');
const Promise = require('bluebird');
const stats = require('stats-lite');
const MongoConnection = require('./mongoHelpers');

const { MONGO_ADDRESS, MONGO_DB_NAME, MONGO_COLLECTION } = process.env;
const { DBMS } = process.env;
const dbSize = parseInt(process.env.DB_SIZE, 10) || 10000000;

const getRandomId = () => Math.floor(Math.random() * dbSize);

const getSummaryStats = array => (
  {
    min: Math.min(...array),
    median: stats.median(array),
    p95: stats.percentile(array, 0.95),
    p99: stats.percentile(array, 0.99),
    p995: stats.percentile(array, 0.995),
    max: Math.max(...array),
  }
);

const printResults = {
  one: (message, queryTime) => {
    console.log(`${message}:\n  => ${queryTime} ms`);
  },

  stats: (message, queryTimes) => {
    const { min, median, p95, p99, p995, max } = getSummaryStats(queryTimes);
    console.log(
      `${message} - distribution (ms):\n`,
      ` => min: ${min} | median: ${median} | p95: ${p95} | p99: ${p99} | p995: ${p995} | max: ${max}`,
    );
  },
};

const test = testFunction => testFunction();

const runTests = async () => {
  console.log(`\n\ntesting ${DBMS}`);
  console.log('===================================\n');

  const db = await new MongoConnection().connect(MONGO_ADDRESS, MONGO_DB_NAME, MONGO_COLLECTION);

  // 5 synchronous queries on the same item
  await test(async () => {
    const testId = getRandomId();
    for (let i = 0; i < 5; i++) {
      const queryTime = await db.getQueryTime(testId);
      printResults.one(`sequential query #${i + 1} on same id`, queryTime);
    }
  });

  // 1,000 async queries on the same id
  await test(async () => {
    const queryTimePromises = [];
    const testId = getRandomId();
    for (let i = 0; i < 1000; i++) {
      queryTimePromises.push(db.getQueryTime(testId));
    }
    const queryTimes = await Promise.all(queryTimePromises);
    printResults.stats('1,000 async queries on same id', queryTimes);
  });

  // 1,000 synchronous queries on the same id
  await test(async () => {
    const queryTimes = [];
    const testId = getRandomId();
    for (let i = 0; i < 1000; i++) {
      const queryTime = await db.getQueryTime(testId);
      queryTimes.push(queryTime);
    }
    printResults.stats('1,000 synchronous queries on same id', queryTimes);
  });

  // 10,000 queries on the same id
  await test(async () => {
  });

  // 1,000 queries on different ids
  await test(async () => {

  });

  // 10,000 queries on different ids
  await test(async () => {

  });

  // sequential queries on a batch of 1,1000 documents
  await test(async () => {

  });

  db.disconnect();
};

runTests();
