require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_ADDRESS = process.env.MONGO_ADDRESS || 'localhost';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'marzagat_overview';
const MONGO_COLLECTION = process.env.MONGO_COLLECTION || 'restaurants';

let client;
let collection;

const connect = async () => {
  const url = `mongodb://${MONGO_ADDRESS}/`;
  client = await MongoClient.connect(url);
  collection = client.db(MONGO_DB_NAME).collection(MONGO_COLLECTION);
};

const disconnect = async () => {
  await client.close();
  client = null;
  collection = null;
};

const findOneById = id => (
  collection.find({ id }).toArray()
);

module.exports = {
  findOneById,
  connect,
  disconnect,
};
