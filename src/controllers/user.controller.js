const assert = require("assert");
const dbconnection = require("../../database/dbconnection");
let database = [];
let user_id = 0;

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
            assert(typeof firstName === "string", "Firstname must be a string");
            assert(typeof lastName === "string", "Lastname must be a string");
            assert(typeof street === "string", "Street must be a string");
            assert(typeof city === "string", "City must be a string");
            assert(typeof isActive === "boolean", "isActive must be a boolean");
            assert(typeof emailAdress === "string", "Email must be a string");
            assert(
                typeof phoneNumber === "string",
                "Phonenumber must be a string"
            );
            assert(typeof password === "string", "Password must be a string");

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

    getAllUsers: (req, res) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(
                "SELECT * FROM user;",
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();

                    // Handle error after the release.
                    if (error) throw error;

                    // Don't use the connection here, it has been returned to the pool.
                    console.log(results.length);
                    res.status(200).json({
                        status: 200,
                        result: results,
                    });
                }
            );
        });
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
                    console.log(dbError);
                    if (dbError.errno == 1062) {
                        res.status(409).json({
                            status: 409,
                            message: "Email is already used"
                        });
                    } else {
                        res.status(500).json({
                            status: 500,
                            result: "Error"
                        });
                    }
                } else {
                    res.status(201).json({
                        status: 201,
                        result: {
                            id: result.insertId,
                            ...user
                        }
                    });
                }
            });
        });
    },

    getUserProfile: (req, res) => {
        res.status(501).json({
            status: 501,
            result: "This endpoint is not yet implemented",
        });
    },

    getUserById: (req, res) => {
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
                        res.status(404).json({
                            status: 404,
                            message: "User does not exist"
                        });
                    } else {
                        res.status(200).json({
                            status: 200,
                            result: results,
                        });
                    }
                }
            );
        });
    },

    updateUser: (req, res) => {
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
                    } else {
                        res.status(404).json({
                            status: 404,
                            message: "User does not exist",
                        });
                    }

                    // Don't use the connection here, it has been returned to the pool.

                }
            );
        });
    },

    deleteUser: (req, res) => {
        const userId = req.params.id;
        dbconnection.getConnection(function (connError, conn) {
            //Not connected
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database",
                });
                return;
            }

            conn.query(
                "DELETE FROM user WHERE id = ?",
                userId,
                function (dbError, results, fields) {
                    // When done with the connection, release it.
                    conn.release();

                    // Handle error after the release.
                    if (results.affectedRows > 0) {
                        res.status(200).json({
                            status: 200,
                            result: `User is successfully deleted`,
                        });
                    } else {
                        res.status(400).json({
                            status: 400,
                            message: "User does not exist",
                        });
                    }
                }
            );
        });
    },
};

module.exports = controller;
