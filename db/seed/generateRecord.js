const faker = require('faker');

module.exports = id => (
  {
    id: id.toString(),
    name: faker.commerce.productName(),
    tagline: faker.lorem.words((id % 4) + 3),
    type: faker.lorem.word(),
    vicinity: faker.lorem.words(3),
    priceLevel: faker.random.number({ min: 1, max: 4 }),
    zagatFood: faker.finance.amount(0, 5, 1),
    zagatDecor: faker.finance.amount(0, 5, 1),
    zagatService: faker.finance.amount(0, 5, 1),
    longDescription: faker.lorem.paragraph((id % 2) + 11),
  }
);
