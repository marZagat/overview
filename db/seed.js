const faker = require('faker');
const { MongoClient } = require('mongodb');

const dbAddress = process.env.DB_ADDRESS || 'localhost';
const url = `mongodb://${dbAddress}:27017`;
const dbName = 'marzagat_overview';

const settings = {
  numToAdd: 10000000,
  batchSize: 10000,
};

const generateDocument = id => (
  {
    _id: id,
    name: faker.commerce.productName(),
    tagline: faker.lorem.words((id % 4) + 3),
    type: faker.lorem.word(),
    vicinity: `${faker.address.streetAddress()}, ${faker.address.city()}`,
    priceLevel: faker.random.number({ min: 1, max: 4 }),
    zagatFood: faker.finance.amount(0, 5, 1),
    zagatDecor: faker.finance.amount(0, 5, 1),
    zagatService: faker.finance.amount(0, 5, 1),
    longDescription: faker.lorem.paragraph((id % 2) + 11),
  }
);

const seedBatch = (minId, maxId, collection) => (
  new Promise(async (resolve, reject) => {
    const docs = [];
    for (let i = minId; i < maxId; i++) {
      docs.push(generateDocument(i));
    }
    try {
      const savedDocs = await collection.insertMany(docs);
      console.log(`successfully seeded ids ${minId}-${maxId}`);
      resolve(savedDocs);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  })
);

const seedDb = async (num, collection) => {
  try {
    for (let i = 0; i < num; i += settings.batchSize) {
      await seedBatch(i, i + settings.batchSize, collection);
    }
    console.log('done seeding db!');
  } catch (error) {
    console.error(error);
  }
};

MongoClient.connect(url)
  .then(async (client) => {
    const collection = client.db(dbName).collection('restaurants');
    await seedDb(settings.numToAdd, collection);
    client.close();
  })
  .catch((error) => {
    console.error(error);
  });
