

/**
  Do what needs to be done to support sessions with the `express-session` package!
  To respect users' privacy, do NOT send them a cookie unless they log in.
  This is achieved by setting 'saveUninitialized' to false, and by not
  changing the `req.session` object unless the user authenticates.

  Users that do authenticate should have a session persisted on the server,
  and a cookie set on the client. The name of the cookie should be "chocolatechip".

  The session can be persisted in memory (would not be adecuate for production)
  or you can use a session store like `connect-session-knex`.
 */


// Import dependencies
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require('express-session');
const store = require('connect-session-knex')(session);
const knex = require('../data/db-config')

// Import routers
const authRouter = require('./auth/auth-router');
const usersRouter = require('./users/users-router');

// Initialize server
const server = express();

// Configure session
const sessionConfig = {
  name: 'chocolatechip',
  secret: 'shh',
  saveUninitialized: false,
  resave: false,
  store: new store({
    knex,
    createTable: true,
    clearInterval: 1000 * 60 * 10,
    tablename: 'sessions',
    sidfieldname: 'sid',
  }),
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: false,
    httpOnly: true,
  }
}

// Apply middlewares
server.use(helmet());  // Security middleware
server.use(express.json());  // Parse JSON bodies
server.use(cors());  // Enable Cross-Origin Resource Sharing
server.use(session(sessionConfig));  // Session management

// Apply routers
server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);

// Default route
server.get("/", (req, res) => {
  res.json({ api: "up" });
});

// Error handling middleware
server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;