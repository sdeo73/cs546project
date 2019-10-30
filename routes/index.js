const signup = require('./signup');

const constructorMethod = app => {
    app.use("/signup", signup);
  
    app.use("*", (req, res) => {
      res.sendStatus(404);
    });
};
  
  module.exports = constructorMethod;
  