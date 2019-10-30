const login = require('./login');

const constructorMethod = app => {
    app.use("/login", login);
  
    app.use("*", (req, res) => {
      res.sendStatus(404);
    });
};
  
module.exports = constructorMethod;