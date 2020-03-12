const mongoose = require('mongoose');

const startServer = require('../server');

let connection = 3;
async function connectionDB() {
  console.log('connection DB....');

  await mongoose.connect(process.env.urlDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
}

connectionDB()
  .then(() => {
    console.log('connection DB - ok');
    startServer();
  })
  .catch(() => {
    if (connection !== 0) {
      connection -= 1;

      connectionDB();
    }
    console.log('error connection DB');
  });
