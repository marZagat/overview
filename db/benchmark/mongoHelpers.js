require('dotenv').config();
const { MongoClient } = require('mongodb');
const Promise = require('bluebird');

const { MONGO_ADDRESS, MONGO_DB_NAME, MONGO_COLLECTION } = process.env;
const POOL_SIZE = parseInt(process.env.POOL_SIZE, 10) || 5;

class MongoConnection {
  constructor() {
    this.url = `mongodb://${MONGO_ADDRESS}/`;
    this.client = null;
    this.db = null;
    this.collection = null;
    this.poolSize = null;
  }

  async connect() {
    try {
      this.client = await MongoClient.connect(this.url, { poolSize: POOL_SIZE });
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
      this.poolSize = null;
    } catch (error) {
      console.error(error);
    }
  }

  // returns a cursor
  find(id) {
    return this.collection.find({ id });
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
