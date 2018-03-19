require('dotenv').config();
const { MongoClient } = require('mongodb');
const Promise = require('bluebird');
const stats = require('stats-lite');

const dbAddress = process.env.DB_ADDRESS || 'localhost';
const dbName = process.env.DB_NAME || 'marzagat_overview';
const collectionName = process.env.COLLECTION_NAME || 'restaurants';
const dbSize = parseInt(process.env.DB_SIZE, 10) || 10000000;
const index = process.env.INDEX || '_id';
const idType = process.env.ID_TYPE || 'number';

const connectToDb = async () => {
  const url = `mongodb://${dbAddress}/`;
  const client = await MongoClient.connect(url);
  const collection = client.db(dbName).collection(collectionName);
  return { client, collection };
};

const getId = idNum => (
  idType === 'string'
    ? idNum.toString()
    : idNum
);
const getRandomId = () => getId(Math.floor(Math.random() * dbSize));
const getOptions = (id) => {
  const options = {};
  options[index] = id;
  return options;
};

const getExecutionStats = (queryFunction) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { executionStats } = await queryFunction().explain();
      if (executionStats.executionSuccess === true) {
        resolve(executionStats);
      } else {
        reject(new Error('query execusionSuccess !== true'));
      }
    } catch (error) {
      reject(error);
    }
  });
}

const getQueryTime = (queryFunction) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { executionTimeMillis } = await getExecutionStats(queryFunction);
      resolve(executionTimeMillis);
    } catch (error) {
      reject(error);
    }
  });
};

const timer = async (message, queryFunction) => {
  try {
    const { executionTimeMillis } = await getExecutionStats(queryFunction);
    console.log(`${message}:\n  => success: ${executionTimeMillis} ms`);
  } catch (error) {
    console.warn(`${message}: UNSUCCESSFUL QUERY`, error);
  }
};

const summaryStats = array => (
  {
    min: Math.min(...array),
    median: stats.median(array),
    p95: stats.percentile(array, 0.95),
    p99: stats.percentile(array, 0.99),
    p995: stats.percentile(array, 0.995),
    max: Math.max(...array),
  }
);

const test = testFunction => testFunction();

const runTests = async () => {
  console.log(`\n\nTESTING SCHEMA WITH INDEX: ${index}, ID TYPE: ${idType}`);
  console.log('===================================\n');

  const { client, collection } = await connectToDb();

  // 5 sequential queries on the same item
  await test(async () => {
    const testId = getRandomId();
    const options = getOptions(testId);
    for (let i = 0; i < 5; i++) {
      await timer(`query #${i} on same id`, () => collection.find(options));
    }
  });

  // 1,000 queries on the same id
  await test(async () => {
    const queryTimePromises = [];
    const testId = getRandomId();
    const options = getOptions(testId);
    for (let i = 0; i < 1000; i++) {
      queryTimePromises.push(getQueryTime(() => collection.find(options)));
    }
    const queryTimes = await Promise.all(queryTimePromises);
    const { min, median, p95, p99, p995, max } = summaryStats(queryTimes);

    console.log('1,000 queries on same id: distribution (ms)');
    console.log(`  => min: ${min} | median: ${median} | p95: ${p95} | p99: ${p99} | p995: ${p995} | max: ${max}`);
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

  client.close();
};

runTests();
