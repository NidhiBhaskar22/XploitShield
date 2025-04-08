// src/middlewares/iaInstrumentation.js
module.exports = (req, res, next) => {
  req.__iastContext = {
    userInput: req.body || {},
    headers: req.headers,
    url: req.originalUrl,
    timestamp: new Date(),
  };
  next();
};
