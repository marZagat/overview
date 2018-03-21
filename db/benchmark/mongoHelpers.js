require('dotenv').config();
const { MongoClient } = require('mongodb');
const Promise = require('bluebird');

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

  disconnect() {
    this.client.close();
  }

  // returns a cursor
  find(id) {
    return this.collection.find({ id });
  }

  async getExecutionStats(id) {
    try {
      const { executionStats } = await this.find(id).explain();
      if (executionStats.executionSuccess === true) {
        return Promise.resolve(executionStats);
      }
      return Promise.reject(new Error('query executionSuccess !== true'));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  getQueryTime(id) {}
}

module.exports = MongoConnection;
