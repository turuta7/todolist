const mongoose = require('mongoose');

const startServer = require('../server');

let connection = 3;
async function connectionDB() {
  console.log('connection DB....');

  await mongoose.connect(
    `mongodb://${process.env.userDB}:${process.env.passwordDB}@${process.env.serverDB}/${process.env.mongoDB}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    },
  );
}

connectionDB()
  .then(() => {
    console.log('connection DB - ok');
    startServer();
  })
  .catch(() => {
    if (connection !== 0) {
      connection -= 1;
      setTimeout(async () => {
        await startServer();
      }, 2000);
    }
    console.log('error connection DB');
  });
