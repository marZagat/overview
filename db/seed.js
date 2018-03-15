const mongoose = require('mongoose');
const faker = require('faker');
const db = require('./db.js');

const dbAddress = process.env.DB_ADDRESS || 'localhost';

mongoose.connect(`mongodb://${dbAddress}/zagattest`);

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

const seedBatch = (minId, maxId) => (
  new Promise(async (resolve, reject) => {
    const docs = [];
    for (let i = minId; i < maxId; i++) {
      docs.push(generateDocument(i));
    }
    try {
      const savedDocs = await db.insertMany(docs);
      console.log(`successfully seeded ids ${minId}-${maxId}`);
      resolve(savedDocs);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  })
);

const seedDb = async (num) => {
  try {
    for (let i = 0; i < num; i += 5000) {
      await seedBatch(i, i + 5000);
    }
    console.log('done seeding db!');
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

seedDb(100000);
