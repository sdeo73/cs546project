
const signup = require('./signup');
const loginRoutes = require('./login');
const userPrefRoutes = require('./userPreferences');

const constructorMethod = app => {
    app.use("/login", loginRoutes);
    app.use("/signup", signup);
    app.use("/", userPrefRoutes);
  
    app.use("*", (req, res) => {
      res.sendStatus(404);
    });
};

<<<<<<< HEAD
module.exports = constructorMethod;
=======
module.exports = constructorMethod;
>>>>>>> 818ef8e16899fc852e074cc3ffeeb698257214e8
