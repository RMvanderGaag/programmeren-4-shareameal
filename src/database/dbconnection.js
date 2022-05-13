const mysql = require('mysql2')
const logger = require('../config/config').logger
require('dotenv').config()

const dbConfig = {
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
}

logger.debug(dbConfig)

const pool = mysql.createPool(dbConfig)

pool.on('connection', function (connection) {
    logger.debug(`Connected to database '${connection.config.database}'`)
})

pool.on('acquire', function (connection) {
    logger.debug('Connection %d acquired', connection.threadId)
})

pool.on('release', function (connection) {
    logger.debug('Connection %d released', connection.threadId)
})

module.exports = pool