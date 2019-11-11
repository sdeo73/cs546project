
const signup = require('./signup');
const loginRoutes = require('./login');
const userPrefRoutes = require('./userPreferences');

const constructorMethod = app => {
    app.use("/", loginRoutes);
    app.use("/signup", signup);
    app.use("/", userPrefRoutes);
  
    app.use("*", (req, res) => {
      res.sendStatus(404);
    });
};

module.exports = constructorMethod;
