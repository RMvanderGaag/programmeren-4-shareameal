const assert = require("assert");
const dbconnection = require("../database/dbconnection");
const logger = require('../config/config').logger
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../config/config').jwtSecretKey

let controller = {
    getAllMeals: (req, res, next) => {
        dbconnection.getConnection(function (err, connection) {
            if (err) next(err) // not connected!

            // Use the connection
            connection.query(
                "SELECT * FROM `meal`",
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) next(error)

                    // Don't use the connection here, it has been returned to the pool.
                    logger.debug('#results = ', results.length)
                    res.status(200).json({
                        statusCode: 200,
                        results: results,
                    })
                }
            )
        })
    },
    getMeal: (req, res, next) => {
        var mealId = req.params.id;
        dbconnection.getConnection(function (err, connection) {
            if (err) next(err) // not connected!

            // Use the connection
            connection.query(
                `SELECT * FROM meal WHERE id = ${mealId}`,
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) next(error)

                    // Don't use the connection here, it has been returned to the pool.
                    logger.debug('#results = ', results.length)
                    res.status(200).json({
                        statusCode: 200,
                        results: results,
                    })
                }
            )
        })
    },

    deleteMeal: (req, res, next) => {
        const mealId = req.params.id;
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
                "DELETE FROM meal WHERE id = ?",
                mealId,
                function (dbError, results, fields) {
                    // When done with the connection, release it.
                    conn.release();

                    // Handle error after the release.
                    if (results.affectedRows > 0) {
                        res.status(200).json({
                            status: 200,
                            result: `Meal is successfully deleted`,
                        });
                    } else {
                        res.status(400).json({
                            status: 400,
                            message: "Meal does not exist",
                        });
                    }
                }
            );
        });
    },

    addMeal: (req, res, next) => {
        let meal = req.body;
        meal.allergenes = meal.allergenes.join(",");
        dbconnection.getConnection(function (connError, conn) {
            //Not connected
            if (connError) {
                res.status(502).json({
                    status: 502,
                    result: "Couldn't connect to database"
                }); return;
            }

            //Insert the user object into the database
            conn.query(`INSERT INTO meal SET ?`, meal, function (dbError, result, fields) {
                // When done with the connection, release it.
                conn.release();

                // Handle error after the release.
                if (dbError) {
                    console.log(dbError);
                } else {
                    res.status(201).json({
                        status: 201,
                        result: {
                            id: result.insertId,
                            ...meal
                        }
                    });
                }
            });
        });
    }
}

module.exports = controller;
