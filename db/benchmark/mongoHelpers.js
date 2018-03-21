require('dotenv').config();
const { MongoClient } = require('mongodb');

const { MONGO_ADDRESS, MONGO_DB_NAME, MONGO_COLLECTION } = process.env;

class MongoConnection {
  constructor() {
    this.url = null;
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect(address, dbName, collection) {
    try {
      this.url = `mongodb://${address}/`;
      this.client = await MongoClient.connect(this.url);
      this.db = await this.client.db(dbName);
      this.collection = await this.db.collection(collection);
    } catch (error) {
      console.error(error);
    }
  }

  disconnect() {}

  getRecord(id) {}

  getExecutionStats(id) {}

  getQueryTime(id) {}
}

module.exports = MongoConnection;
