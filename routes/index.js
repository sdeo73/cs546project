const signup = require('./signup');
const loginRoutes = require('./login');
const userPrefRoutes = require('./userPreferences');
const editPrefRoutes = require('./editPreferences');

const constructorMethod = app => {
    app.use("/", loginRoutes);
    app.use("/", signup);
    app.use("/", userPrefRoutes);
    app.use("/", editPrefRoutes);
  
    app.use("*", (req, res) => {
      res.sendStatus(404);
    });
};

module.exports = constructorMethod;
