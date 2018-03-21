require('dotenv').config();
const { MongoClient } = require('mongodb');

const { MONGO_ADDRESS, MONGO_DB_NAME, MONGO_COLLECTION } = process.env;

class MongoConnection {
  constructor() {}

  connect() {}

  disconnect() {}

  getRecord(id) {}

  getExecutionStats(id) {}

  getQueryTime(id) {}
}

module.exports = MongoConnection;
