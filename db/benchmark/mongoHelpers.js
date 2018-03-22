require('dotenv').config();
const { MongoClient } = require('mongodb');
const Promise = require('bluebird');

const { MONGO_ADDRESS, MONGO_DB_NAME, MONGO_COLLECTION } = process.env;

class MongoConnection {
  constructor() {
    this.url = `mongodb://${MONGO_ADDRESS}/`;
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect(poolSize = 5) {
    try {
      this.client = await MongoClient.connect(this.url, { poolSize });
      this.db = await this.client.db(MONGO_DB_NAME);
      this.collection = await this.db.collection(MONGO_COLLECTION);
      return this;
    } catch (error) {
      return console.error(error);
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.collection = null;
    } catch (error) {
      console.error(error);
    }
  }

  // returns a cursor
  find(id) {
    return this.collection.find({ id }, { projection: { _id: 0 } });
  }

  async getExecutionStats(id) {
    try {
      const { executionStats } = await this.find(id).explain();
      if (executionStats.executionSuccess === true) {
        return executionStats;
      }
      return Promise.reject(new Error('query executionSuccess !== true'));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getQueryTime(id) {
    try {
      const { executionTimeMillis } = await this.getExecutionStats(id);
      return executionTimeMillis;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

module.exports = MongoConnection;
