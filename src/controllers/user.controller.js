const assert = require("assert");
const dbconnection = require("../database/dbconnection");
const logger = require('../config/config').logger
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../config/config').jwtSecretKey

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let {
            firstName,
            lastName,
            street,
            city,
            isActive,
            emailAdress,
            phoneNumber,
            password,
        } = user;
        try {
            assert(typeof firstName === 'string', 'Firstname must be a string');
            assert(typeof lastName === 'string', 'LastName must be a string');
            assert(typeof street === 'string', 'Street must be a string');
            assert(typeof city === 'string', 'City must be a string');
            assert(typeof isActive === 'boolean', 'IsActive must be a boolean');
            assert(typeof emailAdress === 'string', 'EmailAddress must be a string');
            assert(typeof phoneNumber === 'string', 'PhoneNumber must be a string');
            assert(typeof password === 'string', 'Password must a string');
            assert(/^\S+@\S+\.\S+$/.test(emailAdress), 'Email is not valid');
            assert(/^[a-zA-z]{4,}$/.test(password), 'Password is not valid');
            assert(/^\+316\d{8}$/.test(phoneNumber), 'Phonenumber is not valid');

            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            };
            next(error);
        }
    },

    validateId: (req, res, next) => {
        let id = req.params.id;

        try {
            assert(Number.isInteger(parseInt(id)), "Id must be an integer");

            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            };
            next(error);
        }
    },

    getAllUsers: (req, res, next) => {
        const queryParams = req.query;
        logger.debug(queryParams);

        let { firstName, isActive } = req.query;
        let queryString = "SELECT * FROM `user`";

        if (firstName || isActive) {
            queryString += " WHERE "
            if (firstName) {
                queryString += '`firstName` LIKE ?'
                firstName = '%' + firstName + '%'
            }
            if (firstName && isActive) {
                queryString += ` AND `
            }
        } if (isActive) {
            queryString += `isActive = ${isActive}`;
        }

        queryString += ";";

        logger.debug(`queryString = ${queryString}`)

        dbconnection.getConnection(function (err, connection) {
            if (err) next(err) // not connected!

            // Use the connection
            connection.query(
                queryString,
                [firstName, isActive],
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) next(error)

                    // Don't use the connection here, it has been returned to the pool.
                    res.status(200).json({
                        status: 200,
                        result: results,
                    });
                    console.log(results);
                }
            )
        })
    },
    addUser: (req, res, next) => {
        let user = req.body;
        dbconnection.getConnection(function (connError, conn) {
            //Not connected
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database"
                }); return;
            }

            //Insert the user object into the database
            conn.query(`INSERT INTO user SET ?`, user, function (dbError, result, fields) {
                // When done with the connection, release it.
                conn.release();

                // Handle error after the release.
                if (dbError) {
                    if (dbError.errno == 1062) {
                        const error = {
                            status: 409,
                            message: "User already exists",
                        };
                        next(error);
                    } else {
                        res.status(500).json({
                            status: 500,
                            result: "Error"
                        });
                    }
                } else {
                    const userRes = { id: result.insertId, ...user }
                    res.status(201).json({
                        status: 201,
                        result: userRes
                    });
                    console.log(userRes);
                }
            });
        });
    },

    getUserProfile: (req, res) => {
        if (req.headers && req.headers.authorization) {
            var authorization = req.headers.authorization.split(' ')[1],
                decoded;
            try {
                decoded = jwt.verify(authorization, jwtSecretKey);
            } catch (e) {
                return;
            }
            var userId = decoded.userId;

            dbconnection.getConnection(function (err, connection) {
                if (err) throw err; // not connected!

                // Use the connection
                connection.query(
                    `SELECT * FROM user WHERE id = ${userId};`,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release();

                        // Handle error after the release.
                        if (results.length == 0) {
                            res.status(404).json({
                                status: 404,
                                message: "User does not exist"
                            });
                        } else {
                            res.status(200).json({
                                status: 200,
                                result: results,
                            });
                            console.log(results);
                        }
                    }
                );
            });
        }

    },

    getUserById: (req, res, next) => {
        const userId = req.params.id;
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(
                `SELECT * FROM user WHERE id = ${userId};`,
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Handle error after the release.
                    if (results.length == 0) {
                        const err = {
                            status: 404,
                            message: "User does not exist"
                        }
                        next(err);
                    } else {
                        res.status(200).json({
                            status: 200,
                            result: results,
                        });
                        console.log(results[0]);
                    }
                }
            );
        });
    },

    updateUser: (req, res, next) => {
        let newUserInfo = req.body;
        const userId = req.params.id;
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(
                `UPDATE user SET ? WHERE id = ?`,
                [newUserInfo, userId],
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Handle error after the release.
                    if (results.affectedRows > 0) {
                        res.status(200).json({
                            status: 200,
                            result: results,
                        });
                        console.log(newUserInfo);
                    } else {
                        const err = {
                            status: 400,
                            message: "User does not exist"
                        }
                        next(err);
                    }

                    // Don't use the connection here, it has been returned to the pool.

                }
            );
        });
    },

    deleteUser: (req, res, next) => {
        if (req.headers && req.headers.authorization) {
            var authorization = req.headers.authorization.split(' ')[1],
                decoded;
            try {
                decoded = jwt.verify(authorization, jwtSecretKey);
            } catch (e) {
                return;
            }
            const userId = decoded.userId;
            const id = req.params.id;
            dbconnection.getConnection(function (connError, conn) {
                //Not connected
                if (connError) {
                    res.status(502).json({
                        status: 502,
                        result: "Couldn't connect to database",
                    });
                    return;
                }

                if (userId == id) {
                    conn.query(
                        "DELETE FROM user WHERE id = ?",
                        id,
                        function (dbError, results, fields) {
                            // When done with the connection, release it.
                            conn.release();

                            // Handle error after the release.
                            if (results.affectedRows > 0) {
                                res.status(200).json({
                                    status: 200,
                                    message: "User is successfully deleted",
                                });
                            } else {
                                const err = {
                                    status: 400,
                                    message: "User does not exist"
                                }
                                next(err);
                            }
                        }
                    );
                } else {
                    const err = {
                        status: 403,
                        message: "User is not the owner of this account"
                    }
                    next(err);
                }
            });

        }
    },
};

module.exports = controller;
