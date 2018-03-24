const db = require('../../db/mongo/mongoController.js');

const actions = {
  GET: async (req, res) => {
    try {
      const result = await db.findOneById(req.params.id);
      res.send(result);
    } catch (error) {
      res.statusCode(404).send(error);
    }
  },
};

const requestHandler = (req, res) => {
  if (actions[req.method]) {
    actions[req.method](req, res);
  } else {
    res.sendStatus(404);
  }
};

module.exports.requestHandler = requestHandler;
