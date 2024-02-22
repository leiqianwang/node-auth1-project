const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require('express-session');
const knexSessionStore = require('connect-session-knex')(session);

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

  const authRouter = require('./auth/auth-router');
  const usersRouter = require('./users/users-router');

const server = express();

const sessionConfig = {
     name: 'chocolatechip',
     secret: 'keep it secret, keep it safe!',
     cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false, // if true the cookie is not set unless it's an https connection
        httpOnly: false, // if true the cookie is not accessible through 
     },
     rolling: true,
     resave: false,
     saveUninitialized: false, //achived setting within privacy implications, if false, no cookie is set on client unless req.session changed
     store: new knexSessionStore({
         knex: require('../data/db-config.js'), //configured instance of knex
         tablename: 'sessions',   //table that will store sessions inside the db
         sidfieldname: 'sid', //column that will hold the session id, name anything 
         createtable: true, // if table does not exist, it'll create it automatically
         clearInterval: 1000 * 60 * 60,

     }),
}

//server.use(express.static(path.join(_dirname, '../client')))
server.use(helmet());
server.use(express.json());
server.use(session(sessionConfig));
server.use(cors());

server.use('/api/auth', authRouter);
server.use('/api/users', usersRouter);


server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use((err, req, res, next) => { // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
