require('dotenv').config();
const { MongoClient } = require('mongodb');
const Promise = require('bluebird');

const dbAddress = process.env.DB_ADDRESS || 'localhost';
const dbName = process.env.DB_NAME || 'marzagat_overview';
const collectionName = process.env.COLLECTION_NAME || 'restaurants';
const dbSize = parseInt(process.env.DB_SIZE, 10) || 10000000;
const index = process.env.INDEX || '_id';

const connectToDb = async () => {
  const url = `mongodb://${dbAddress}/`;
  const client = await MongoClient.connect(url);
  const collection = client.db(dbName).collection(collectionName);
  return { client, collection };
};

const timer = async (testDescription, callback) => {
  const startTime = new Date().getTime();
  await callback();
  const endTime = new Date().getTime();
  const executionTime = endTime - startTime;
  console.log(`${testDescription}: executed in ${executionTime} ms`);
};

const getRandomId = () => Math.floor(Math.random() * dbSize);

const getOptions = (id) => {
  const options = {};
  if (index !== '_id') {
    options[index] = id.toString();
  } else {
    options[index] = id;
  }

  return options;
}

const runTests = async (name1, name2) => {
  const { client, collection } = await connectToDb();

  let testId = 9782583;
  await timer(`single query on ${index}`, async () => (
    collection.find(getOptions(testId))
  ));

  await timer(`1000 async queries on ${index}`, async () => {
    const promises = [];
    for (let i = 0; i < 1000; i++) {
      promises.push(collection.find(getOptions(testId)));
    }
    return Promise.all(promises);
  });

  await timer(`10000 async queries on ${index}`, async () => {
    const promises = [];
    for (let i = 0; i < 10000; i++) {
      promises.push(collection.find(getOptions(testId)));
    }
    return Promise.all(promises);
  });

  client.close();
};

runTests();
