const Koa = require('koa');
const helmet = require('koa-helmet'); // Secure your app by setting various HTTP headers
const cors = require('@koa/cors'); // CORS support
const morgan = require('koa-morgan'); // Log HTTP requests (Method, status, endpoint, serve time, etc...)
const bodyParser = require('koa-bodyparser'); // Parse JSON to ctx.request.body (from raw body of POST request)
const rootRouter = require('./routes'); // All our routes are here

async function startServer() {
  const app = new Koa();

  app.use(helmet());
  app.use(morgan('dev'));

  const corsOptions = {
    origin: '*',
    allowMethods: 'GET,PUT,POST,DELETE,OPTIONS',
  };
  app.use(cors(corsOptions));
  app.use(bodyParser());

  app.use(rootRouter.routes()).use(rootRouter.allowedMethods());
  app.use((ctx) => {
    ctx.body = { message: 'server work' };
  });

  app.listen(process.env.SERVER_PORT, () =>
    console.log(`start server port: ${process.env.SERVER_PORT}`),
  );
}

module.exports = startServer;
