const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Router = require('@koa/router');
const authorizationUser = require('./authorization');

const { Schema } = mongoose;

const SchemaUsers = new Schema(
  {
    name: { type: String, default: '', index: true, unique: true },
    age: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const User = mongoose.model('User', SchemaUsers);

const router = new Router();

// Get Users
router.get('/', async (ctx) => {
  // authorization users
  const autUser = await authorizationUser(ctx);
  console.log(autUser);
  if (!autUser.status) {
    ctx.status = 403;
    ctx.body = { message: 'you are not authorized' };
    return null;
  }
  // Get Users
  const getUsers = async () => {
    return new Promise((resolve) => {
      User.find({}, (err, users) => {
        if (err) {
          ctx.status = 400;
          resolve((ctx.body = { message: 'error' }));
          return null;
        }
        resolve((ctx.body = { users }));
        return null;
      }).sort({ updatedAt: -1 });
    });
  };
  await getUsers();
  return null;
});

// Get User By Id
router.get('/:id', async (ctx) => {
  const { id } = ctx.params;

  // authorization user by token and by id
  const autUser = await authorizationUser(ctx);
  if (!autUser.status || id !== autUser.id){ 
    ctx.status = 403;
    ctx.body = { message: 'you are not authorized' };
    return null;
  }

  // get user by id
  const getUserId = async () => {
    return new Promise((resolve) => {
      User.findOne({ _id: id }, (err, users) => {
        console.error(err);
        if (err) {
          ctx.status = 400;
          resolve((ctx.body = { message: 'error' }));
          return null;
        }
        if (users === null) {
          ctx.status = 400;
          resolve((ctx.body = { message: 'no user id DB' }));
          return null;
        }
        console.log(users);
        resolve((ctx.body = { users }));
        return null;
      });
    });
  };
  await getUserId();
});

// Create User
router.post('/', async (ctx) => {
  const object = ctx.request.body;
  console.log(object);
  ctx.assert(object.name && object.age, 400, 'incorrectly entered data');
  // create user in DB
  const postUsers = async () => {
    return new Promise((resolve) => {
      User.findOne({ name: object.name }, (err, users) => {
        if (err) {
          ctx.status = 400;
          resolve((ctx.body = { message: 'error' }));
          return null;
        }
        if (users) {
          ctx.status = 400;
          resolve((ctx.body = { message: 'user in DB' }));
          return null;
        }
        new User({ name: object.name, age: object.age }).save((e, user) => {
          if (e) console.error(err);
          jwt.sign(
            { id: user.id, name: object.name },
            process.env.PRIVATE_KEY,
            { algorithm: 'HS256' },
            (error, token) => {
              console.error(error);
              console.log(token);
              resolve((ctx.body = { id: user.id, token }));
              return null;
            },
          );
        });
        return null;
      });
    });
  };
  await postUsers();
  return null;
});

// Update User
router.put('/:id', async (ctx) => {
  const { id } = ctx.params;
  const object = ctx.request.body;
  // authorization user by token and by id
  const autUser = await authorizationUser(ctx);
  if (!autUser.status || id !== autUser.id) {
    ctx.status = 403;
    ctx.body = { message: 'you are not authorized' };
    return null;
  }
  // update user by id
  const putUserId = async () => {
    return new Promise((resolve) => {
      User.findOneAndUpdate({ _id: id }, object, { new: true }, (err, users) => {
        console.error(err);
        if (err) {
          ctx.status = 400;
          resolve((ctx.body = { message: 'error' }));
          return null;
        }
        if (users === null) {
          ctx.status = 400;
          resolve((ctx.body = { message: 'no user id DB' }));
          return null;
        }
        console.log(users);
        resolve((ctx.body = { users }));
        return null;
      });
    });
  };
  await putUserId();
  return null;
});

// Delete User
router.delete('/:id', async (ctx) => {
  const { id } = ctx.params;
  // authorization user by token and by id
  const autUser = await authorizationUser(ctx);
  if (!autUser.status || id !== autUser.id) {
    ctx.status = 403;
    ctx.body = { message: 'you are not authorized' };
    return null;
  }

  // delete user by id
  const deleteUserId = async () => {
    return new Promise((resolve) => {
      User.findByIdAndDelete({ _id: id }, (err, users) => {
        console.error(err);
        if (err) {
          ctx.status = 400;
          resolve((ctx.body = { message: 'error' }));
          return null;
        }
        if (users === null) {
          ctx.status = 400;
          resolve((ctx.body = { message: 'no user id DB' }));
          return null;
        }
        console.log(users);
        resolve((ctx.body = { users: `id ${id} delete` }));
        return null;
      });
    });
  };
  await deleteUserId();
  return null;
});

module.exports = router;
