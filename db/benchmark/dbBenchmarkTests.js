require('dotenv').config();
const Promise = require('bluebird');
const stats = require('stats-lite');
const MongoConnection = require('./mongoHelpers');
const PgConnection = require('./pgHelpers');
const fs = require('fs-extra');
const path = require('path');

const { DBMS } = process.env;
const DB_SIZE = parseInt(process.env.DB_SIZE, 10) || 10000000;
const POOL_MIN = parseInt(process.env.POOL_MIN, 10) || 5;
const POOL_MAX = parseInt(process.env.POOL_MAX, 10) || 5;

const dbOptions = {
  mongo: MongoConnection,
  postgres: PgConnection,
};
const Database = dbOptions[DBMS];

const getTimeStamp = () => {
  const date = new Date();
  const timestamp = ([
    `${date.getFullYear() % 100}-${date.getMonth() + 1}-${date.getDate()}`,
    `${date.getHours()}-${date.getMinutes()}`,
  ]).join(' ');
  return timestamp;
};

const OUTPUT_FILE = path.resolve(__dirname, 'results', `${DBMS} benchmarks ${getTimeStamp()}.csv`);

const getRandomId = () => Math.floor(Math.random() * DB_SIZE);

const getSummaryStats = array => (
  {
    min: Math.min(...array),
    p25: stats.percentile(array, 0.25),
    median: stats.median(array),
    p95: stats.percentile(array, 0.95),
    p99: stats.percentile(array, 0.99),
    p995: stats.percentile(array, 0.995),
    max: Math.max(...array),
    avg: stats.mean(array),
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

const writeResults = {
  one: async (queryTime, syncOrAsync, sameOrRandomId, poolSize) => {
    const row = [new Date().toString(), DBMS, poolSize, 1, syncOrAsync, sameOrRandomId, queryTime];
    await fs.appendFile(OUTPUT_FILE, `${row.join(', ')}\n`);
  },

  stats: async (queryTimes, syncOrAsync, sameOrRandomId, poolSize) => {
    const { min, p25, median, p95, p99, p995, max, avg } = getSummaryStats(queryTimes);
    const row = [new Date().toString(), DBMS, poolSize, queryTimes.length, syncOrAsync, sameOrRandomId, min, p25, median, p95, p99, p995, max, avg];
    await fs.appendFile(OUTPUT_FILE, `${row.join(', ')}\n`);
  },
};

const test = {
  sameId: {
    sync: async (db, numQueries, poolSize, testId = getRandomId()) => {
      try {
        const queryTimes = [];
        for (let i = 0; i < numQueries; i++) {
          const queryTime = await db.getQueryTime(testId);
          queryTimes.push(queryTime);
        }
        if (numQueries === 1) {
          printResults.one(`single synchronous query on id ${testId}`, queryTimes[0]);
          await writeResults.one(queryTimes[0], 'sync', 'same', poolSize);
        } else {
          printResults.stats(`${numQueries} synchronous queries on same id ${testId}`, queryTimes);
          await writeResults.stats(queryTimes, 'sync', 'same', poolSize);
        }
      } catch (error) {
        console.error(error);
      }
    },

    async: async (db, numQueries, poolSize, testId = getRandomId()) => {
      try {
        let queryTimes = [];
        for (let i = 0; i < numQueries; i++) {
          const queryTime = db.getQueryTime(testId);
          queryTimes.push(queryTime);
        }
        queryTimes = await Promise.all(queryTimes);
        if (numQueries === 1) {
          printResults.one(`single async query on id ${testId}`, queryTimes[0]);
          await writeResults.one(queryTimes[0], 'async', 'same', poolSize);
        } else {
          printResults.stats(`${numQueries} async queries on same id ${testId}`, queryTimes);
          await writeResults.stats(queryTimes, 'async', 'same', poolSize);
        }
      } catch (error) {
        console.error(error);
      }
    },
  },

  randomIds: {
    sync: async (db, numQueries, poolSize) => {
      try {
        const queryTimes = [];
        for (let i = 0; i < numQueries; i++) {
          const testId = getRandomId();
          const queryTime = await db.getQueryTime(testId);
          queryTimes.push(queryTime);
        }
        printResults.stats(`${numQueries} synchronous queries on different random ids`, queryTimes);
        await writeResults.stats(queryTimes, 'sync', 'random', poolSize);
      } catch (error) {
        console.error(error);
      }
    },

    async: async (db, numQueries, poolSize) => {
      try {
        let queryTimes = [];
        for (let i = 0; i < numQueries; i++) {
          const testId = getRandomId();
          const queryTime = db.getQueryTime(testId);
          queryTimes.push(queryTime);
        }
        queryTimes = await Promise.all(queryTimes);
        printResults.stats(`${numQueries} async queries on different random ids`, queryTimes);
        await writeResults.stats(queryTimes, 'async', 'random', poolSize);
      } catch (error) {
        console.error(error);
      }
    },
  },
};

const runTests = async (poolSize) => {
  try {
    console.log(OUTPUT_FILE);
    const fd = await fs.open(OUTPUT_FILE, 'wx');
    const row = ['timestamp', 'DBMS', 'pool size', 'numQueries', 'sync or async', 'same id or random', 'min', 'p25', 'median', 'p95', 'p99', 'p995', 'max', 'average'];
    console.log('writing first row', row.join(', '));
    await fs.write(fd, `${row.join(', ')}\n`);
  } catch (error) {
    console.log('file already exists');
  }
  try {
    console.log(`\n\ntesting ${DBMS}. Pool size: ${poolSize}`);
    console.log('===================================\n');

    console.log('connecting');
    const db = await new Database().connect(poolSize);
    console.log('connected');

    // 5 synchronous queries on the same item
    const testId = getRandomId();
    for (let i = 0; i < 5; i++) {
      await test.sameId.sync(db, 1, poolSize, testId);
    }

    await test.sameId.async(db, 1000, poolSize);

    await test.sameId.sync(db, 1000, poolSize);

    await test.sameId.async(db, 10000, poolSize);

    await test.sameId.sync(db, 10000, poolSize);

    await test.randomIds.async(db, 1000, poolSize);

    await test.randomIds.sync(db, 1000, poolSize);

    db.disconnect();
  } catch (error) {
    console.error(error);
  }
};

const testAllPoolSizes = async (poolMin, poolMax) => {
  for (let poolSize = poolMin; poolSize <= poolMax; poolSize++) {
    await runTests(poolSize);
  }
};

testAllPoolSizes(POOL_MIN, POOL_MAX);
