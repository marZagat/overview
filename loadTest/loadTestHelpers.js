const numPopularIds = 1000;
const sizeOfDb = 10000000;

const setPopularId = (requestParams, context, ee, next) => {
  context.vars.id = Math.floor(Math.random() * numPopularIds);
  return next();
};

const setRegularId = (requestParams, context, ee, next) => {
  context.vars.id = Math.floor(Math.random() * (sizeOfDb - numPopularIds)) + numPopularIds;
  return next();
};

module.exports = { setPopularId, setRegularId };