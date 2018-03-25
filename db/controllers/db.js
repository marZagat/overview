const Promise = require('bluebird');
const redis = require('./redisController');
const mongo = require('./mongoController');

const connect = () => {
  const openConnections = [
    redis.connect(),
    mongo.connect(),
  ];
  return Promise.all(openConnections);
};

const disconnect = () => {
  const closeConnections = [
    redis.disconnect(),
    mongo.disconnect(),
  ];
  return Promise.all(closeConnections);
};

const findOneById = async (id) => {
  const inRedis = await redis.exists(id);
  if (inRedis) {
    const itemString = await redis.get(id);
    return JSON.parse(itemString);
  }
  const item = await mongo.findOneById(id);
  redis.set(id, item);
  return item;
};

module.exports = {
  connect,
  disconnect,
  findOneById,
};
