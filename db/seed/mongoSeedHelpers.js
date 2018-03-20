require('dotenv').config();
const Promise = require('bluebird');
const { MongoClient } = require('mongodb');
const generateRecord = require('./generateRecord');

const { MONGO_ADDRESS, MONGO_DB_NAME, MONGO_COLLECTION } = process.env;

const connectToDb = () => (
  new Promise(async (resolve, reject) => {
    try {
      const url = `mongodb://${MONGO_ADDRESS}/`;
      const client = await MongoClient.connect(url);
      const database = client.db(MONGO_DB_NAME);
      const collection = database.collection(MONGO_COLLECTION);
      resolve({ client, database, collection });
    } catch (error) {
      reject(error);
    }
  })
);

const disconnectFromDb = ({ client }) => {
  client.close();
};

const indexDb = async (collection, attributeName) => {
  const indexObj = {};
  indexObj[attributeName] = 1;
  await collection.createIndex(indexObj, { unique: true });
};

const seedBatch = (minId, maxId, { collection }) => (
  new Promise(async (resolve, reject) => {
    const docs = [];
    for (let i = minId; i < maxId; i++) {
      docs.push(generateRecord(i));
    }
    try {
      const savedDocs = await collection.insertMany(docs);
      resolve(savedDocs);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  })
);

const preSeed = async () => {
  console.log('dropping old db if it exists');
  const { client, database } = await connectToDb();
  await database.dropDatabase();
  await disconnectFromDb({ client });
};

const postSeed = async () => {
  console.log(`Master ${process.pid} indexing attribute 'id'`);
  const { client, collection } = await connectToDb();
  await indexDb(collection, 'id');
  console.log('Done indexing. closing master process now!')
  client.close();
};

module.exports = {
  connectToDb,
  seedBatch,
  disconnectFromDb,
  preSeed,
  postSeed,
};
