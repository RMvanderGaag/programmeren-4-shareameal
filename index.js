const express = require("express");
require('dotenv').config();
const app = express();
const port = process.env.PORT;

const bodyParser = require("body-parser");
const { get } = require("express/lib/response");

const userRoutes = require('./src/routes/user.routes');
const authRoutes = require('./src/routes/auth.routes');

const logger = require('./src/config/config').logger

app.use(bodyParser.json());

app.all("*", (req, res, next) => {
  const method = req.method;
  logger.debug(`Method ${method} is aangeroepen`)
  next();
});

app.use(userRoutes);
app.use(authRoutes);

//End-point not found
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

//Error handler
app.use((err, req, res, next) => {
  console.log("Error: " + err.toString())
  res.status(err.status).json(err)
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

process.on('SIGINT', () => {
  logger.debug('SIGINT signal received: closing HTTP server')
  dbconnection.end((err) => {
    logger.debug('Database connection closed')
  })
  app.close(() => {
    logger.debug('HTTP server closed')
  })
})

module.exports = app;
