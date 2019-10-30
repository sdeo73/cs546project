const userPrefRoutes = require("./userPreferences");

const constructorMethod = app => {
  app.use("/preferences", userPrefRoutes);

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;
