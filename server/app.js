const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const handler = require('./routes/requestHandler.js');

const app = express();

app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  const randomId = Math.floor(Math.random() * 10000000);
  res.redirect(`/restaurants/${randomId}`);
});

app.use('/restaurants/:id', express.static('client/dist'));
app.get('/api/restaurants/:id/overview', handler.requestHandler);

module.exports = app;

