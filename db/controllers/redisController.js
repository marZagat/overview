const redis = require('redis');
const Promise = require('bluebird');

Promise.promisifyAll(redis.RedisClient.prototype);

let client;

const connect = async () => {
  client = await redis.createClient();
  client.on('error', error => console.error(error));
};

const disconnect = async () => {
  await client.quitAsync();
  client = null;
};

const exists = async key => ((await client.existsAsync(key)) === 1);

const get = key => client.getAsync(key);

const set = async (key, valueObj) => client.setexAsync(key, 3600, JSON.stringify(valueObj));

module.exports = {
  connect,
  disconnect,
  exists,
  get,
  set,
};
