require('dotenv').config();
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const helpers = require('./seedHelpers.js');

const { connectToDb, seedBatch, disconnectFromDb } = helpers;
const seedNum = parseInt(process.env.SEED_NUM, 10) || 10000000;
const batchSize = parseInt(process.env.SEED_BATCH_SIZE, 10) || 15000;

const printRunTime = (startTime, startId, endId) => {
  const runTime = (new Date().getTime() - startTime) / 1000;
  console.log(`Worker ${process.pid} done in ${runTime} sec: ids ${startId}-${endId - 1}`);
};

const seedDb = async (startId, endId) => {
  const startTime = new Date().getTime();

  try {
    const db = await connectToDb();
    // seed in batches up to endId
    for (let i = startId; i < endId; i += batchSize) {
      const batchStart = i;
      const batchEnd = Math.min(i + batchSize, endId);
      await seedBatch(batchStart, batchEnd, db);
    }

    // print out the runtime and close everything out
    printRunTime(startTime, startId, endId);
    await disconnectFromDb(db);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit();
  }
};

const runWorkers = () => {
  const recordsPerWorker = Math.ceil(seedNum / numCPUs);
  for (let i = 0; i < numCPUs; i++) {
    const startId = i * recordsPerWorker;
    const endId = Math.min(startId + recordsPerWorker, seedNum);
    cluster.fork({ START_ID: startId, END_ID: endId });
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} exited`);
  });
};

const runPreSeedActions = async () => {
  if (helpers.hasOwnProperty('preSeed')) {
    await helpers.preSeed();
  }
};

const runPostSeedActions = async () => {
  if (helpers.hasOwnProperty('postSeed')) {
    process.on('beforeExit', async () => {
      try {
        await helpers.postSeed();
      } catch (error) {
        console.error(error);
      }
      process.exit();
    });
  }
};

const run = async () => {
  if (cluster.isMaster) { // master process: create workers
    console.log(`Master ${process.pid} is running`);
    await runPreSeedActions();
    runWorkers();
    await runPostSeedActions();
  } else { // worker process: seed its section of db
    const startId = parseInt(process.env.START_ID, 10);
    const endId = parseInt(process.env.END_ID, 10);
    console.log(`Worker ${process.pid} starting for indices ${startId}-${endId - 1}`);
    seedDb(startId, endId);
  }
};
run();
