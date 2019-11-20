<<<<<<< HEAD
=======

>>>>>>> 818ef8e16899fc852e074cc3ffeeb698257214e8
const dbConnection = require("./mongoConnection");

const getCollectionFn = collection => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

module.exports = {
<<<<<<< HEAD
  users: getCollectionFn("users"),
  destinations: getCollectionFn("destinations")
};
=======
  users: getCollectionFn("users")
};
>>>>>>> 818ef8e16899fc852e074cc3ffeeb698257214e8
