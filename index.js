'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport'); 

const { error404, error500 } = require('./error-middleware');
const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');

// Security
const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

// Create an Express application
const app = express();

//Routers
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const platesRouter = require('./routes/plates');
const reviewsRouter = require('./routes/reviews');

// logs all requests
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

//allow cross origin communication b/w front-end & backend
app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", '*');
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization,authorization');
//   next();
// });

// Create a static webserver
app.use(express.static('public'));

// Parse request body
app.use(express.json());

passport.use(localStrategy);
passport.use(jwtStrategy);

// Mount routers
app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/plates', platesRouter);
app.use('/api/auth', authRouter);

// Error handlers
app.use(error404);
app.use(error500);

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };