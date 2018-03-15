const mongoose = require('mongoose');
const db = require('./db.js');
// const allRestaurantData = require('./finData.json');
const faker = require('faker');

const dbAddress = process.env.DB_ADDRESS || 'localhost';

mongoose.connect(`mongodb://${dbAddress}/marZagat_overview`);

const generateDocument = async (id) => {
  return new Promise(resolve => resolve({
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
  }));
};

const seedBatch = async (min, max) => (
  new Promise((resolve, reject) => {
    const docs = [];
    for (let i = min; i < max; i++) {
      docs.push(generateDocument(i));
    }
    Promise.all(docs)
      .then(results => db.insertMany(results))
      .then(() => {
        console.log(`successfully seeded ids ${min}-${max}`);
        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  })
);

const seedDb = async (num) => {
  for (var i = 0; i < num; i += 5000) {
    await seedBatch(i, i + 5000);
  }
  console.log('done seeding db!');
  mongoose.connection.close();
};

seedDb(10000000);






// const seedDb = (data) => {
//   db.count().then((counts) => {
//     if (counts === 0) {
//       const overviewInfo = data.map(({ result }) => (
//         {
//           id: result.place_id,
//           name: result.name,
//           tagline: result.tagline,
//           type: 'Restaurant',
//           vicinity: result.vicinity,
//           priceLevel: result.price_level,
//           zagatFood: Number(result.zagat_food),
//           zagatDecor: Number(result.zagat_decor),
//           zagatService: Number(result.zagat_service),
//           longDescription: result.long_description,
//         }
//       ));
//       db.insertMany(overviewInfo, () => {
//         console.log('done seeding!');
//         mongoose.disconnect();
//       });
//     } else {
//       console.log('already seeded!');
//       mongoose.disconnect();
//     }
//   });
// };

// seedDb(allRestaurantData);
