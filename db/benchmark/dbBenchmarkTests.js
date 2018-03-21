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

const test = {
  sameId: {
    sync: async (db, numQueries, testId = getRandomId()) => {
      const queryTimes = [];
      for (let i = 0; i < numQueries; i++) {
        const queryTime = await db.getQueryTime(testId);
        queryTimes.push(queryTime);
      }
      if (numQueries === 1) {
        printResults.one(`single synchronous query on id ${testId}`, queryTimes[0]);
      } else {
        printResults.stats(`${numQueries} synchronous queries on same id ${testId}`, queryTimes);
      }
    },

    async: async (db, numQueries, testId = getRandomId()) => {
      let queryTimes = [];
      for (let i = 0; i < numQueries; i++) {
        const queryTime = db.getQueryTime(testId);
        queryTimes.push(queryTime);
      }
      queryTimes = await Promise.all(queryTimes);
      if (numQueries === 1) {
        printResults.one(`single async query on id ${testId}`, queryTimes[0]);
      } else {
        printResults.stats(`${numQueries} async queries on same id ${testId}`, queryTimes);
      }
    },
  },

  randomIds: {
    sync: async (db, numQueries) => {
      const queryTimes = [];
      for (let i = 0; i < numQueries; i++) {
        const testId = getRandomId();
        const queryTime = await db.getQueryTime(testId);
        queryTimes.push(queryTime);
      }
      printResults.stats(`${numQueries} synchronous queries on different random ids`, queryTimes);
    },

    async: async (db, numQueries) => {
      let queryTimes = [];
      for (let i = 0; i < numQueries; i++) {
        const testId = getRandomId();
        const queryTime = db.getQueryTime(testId);
        queryTimes.push(queryTime);
      }
      queryTimes = await Promise.all(queryTimes);
      printResults.stats(`${numQueries} async queries on different random ids`, queryTimes);
    },
  },
};

const runTests = async () => {
  console.log(`\n\ntesting ${DBMS}`);
  console.log('===================================\n');

  const db = await new MongoConnection().connect(MONGO_ADDRESS, MONGO_DB_NAME, MONGO_COLLECTION);

  // 5 synchronous queries on the same item
  const testId = getRandomId();
  for (let i = 0; i < 5; i++) {
    await test.sameId.sync(db, 1, testId);
  }

  await test.sameId.async(db, 1000);

  await test.sameId.sync(db, 1000);

  await test.sameId.async(db, 10000);

  await test.sameId.sync(db, 10000);

  await test.randomIds.async(db, 1000);

  await test.randomIds.sync(db, 1000);

  db.disconnect();
};

runTests();
