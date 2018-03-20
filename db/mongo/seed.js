require('dotenv').config();
const { MongoClient } = require('mongodb');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const generateDocument = require('./generateDocument');

const dbAddress = process.env.DB_ADDRESS || 'localhost';
const dbName = process.env.DB_NAME || 'marzagat_overview';
const collectionName = process.env.COLLECTION_NAME || 'restaurants';
const seedNum = parseInt(process.env.SEED_NUM, 10) || 10000000;
const batchSize = parseInt(process.env.SEED_BATCH_SIZE, 10) || 15000;
const schemaIdName = process.env.SCHEMA_ID_NAME || '_id';

const connectToDb = async () => {
  const url = `mongodb://${dbAddress}/`;
  const client = await MongoClient.connect(url);
  const collection = client.db(dbName).collection(collectionName);
  return { client, collection };
};

const indexDb = async (collection) => {
  const indexObj = {};
  indexObj[schemaIdName] = 1;
  await collection.createIndex(indexObj, { unique: true });
};

const seedBatch = (minId, maxId, collection) => (
  new Promise(async (resolve, reject) => {
    const docs = [];
    for (let i = minId; i < maxId; i++) {
      docs.push(generateDocument(i, schemaIdName));
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

const printRunTime = (startTime, startId, endId) => {
  const runTime = (new Date().getTime() - startTime) / 1000;
  console.log(`Worker ${process.pid} done in ${runTime} sec: ids ${startId}-${endId - 1}`);
};

const seedDb = async (startId, endId) => {
  const startTime = new Date().getTime();

  try {
    const { client, collection } = await connectToDb();

    // seed in batches up to endId
    for (let i = startId; i < endId; i += batchSize) {
      const batchStart = i;
      const batchEnd = Math.min(i + batchSize, endId);
      await seedBatch(batchStart, batchEnd, collection);
    }

    // print out the runtime and close everything out
    printRunTime(startTime, startId, endId);
    client.close();
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
};

const createWorkers = () => {
  // fork workers
  const docsPerWorker = Math.ceil(seedNum / numCPUs);
  for (let i = 0; i < numCPUs; i++) {
    const startId = i * docsPerWorker;
    const endId = Math.min(startId + docsPerWorker, seedNum);
    cluster.fork({ START_ID: startId, END_ID: endId });
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} exited`);
  });
};

// create workers and seed db with each worker
if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  createWorkers();

  // create secondary index if not using `_id` field for restaurant id
  if (schemaIdName !== '_id') {
    process.on('beforeExit', async () => {
      try {
        console.log(`Master ${process.pid} indexing attribute '${schemaIdName}'`);
        const { client, collection } = await connectToDb();
        await indexDb(collection);
        console.log('Done indexing. closing master process now!')
        client.close();
        process.exit();
      } catch (error) {
        console.error(error);
      }
    });
  }
} else {
  const startId = parseInt(process.env.START_ID, 10);
  const endId = parseInt(process.env.END_ID, 10);
  console.log(`Worker ${process.pid} starting for indices ${startId}-${endId - 1}`);
  seedDb(startId, endId);
}
