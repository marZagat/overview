require('newrelic');

const express = require('express');
const cors = require('cors');
const db = require('../db/controllers/db');

const app = express();
db.connect();

app.use(cors());
app.use('/restaurants/:id', express.static('client/dist'));
app.use(express.static('client/dist'));

app.get('/api/restaurants/:id/overview', async (request, response) => {
  try {
    const result = await db.findOneById(request.params.id);
    response.send(result);
  } catch (error) {
    response.status(404).send(error);
  }
});

app.get('/', (request, response) => {
  const randomId = Math.floor(Math.random() * 10000000);
  response.redirect(`/restaurants/${randomId}`);
});

app.listen(3002, () => {
  console.log('Listening on port 3002');
});

process.on('beforeExit', async () => {
  try {
    await db.disconnect();
  } catch (error) {
    console.error(error);
  }
  process.exit();
});
