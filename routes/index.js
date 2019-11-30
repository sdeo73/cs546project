
const signup = require('./signup');
const loginRoutes = require('./login');
const userPrefRoutes = require('./userPreferences');
const itineraryRoutes = require('./itinerary');

const constructorMethod = app => {
    app.use("/", loginRoutes);
    app.use("/", signup);
    app.use("/", userPrefRoutes);
    app.use("/", itineraryRoutes);
  
    app.use("*", (req, res) => {
      res.sendStatus(404);
    });
};

module.exports = constructorMethod;
