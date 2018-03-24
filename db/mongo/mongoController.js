require('dotenv').config();
const { MongoClient } = require('mongodb');

const {
  MONGO_ADDRESS,
  MONGO_DB_NAME,
  MONGO_COLLECTION,
} = process.env;

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
