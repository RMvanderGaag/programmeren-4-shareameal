const assert = require("assert");
const dbconnection = require("../database/dbconnection");
const logger = require('../config/config').logger
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../config/config').jwtSecretKey

let controller = {
    validateMeal: (req, res, next) => {
        let meal = req.body;
        let {
            name,
            description,
            isActive,
            isVega,
            isVegan,
            isToTakeHome,
            dateTime,
            imageUrl,
            allergenes,
            maxAmountOfParticipants,
            price
        } = meal;

        try {
            assert(typeof name === 'string', 'name must be a string');
            assert(typeof description === 'string', 'description must be a string');
            assert(typeof isActive === 'boolean', 'IsActive must be a boolean');
            assert(typeof isVega === 'boolean', 'isVega must be a boolean');
            assert(typeof isVegan === 'boolean', 'isVegan must be a boolean');
            assert(typeof isToTakeHome === 'boolean', 'isToTakeHome must be a boolean');
            assert(typeof dateTime === 'string', 'dateTime must be a string');
            assert(typeof imageUrl === 'string', 'imageUrl must a string');
            assert(Array.isArray(allergenes), 'allergenes must an array');
            assert(typeof maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must a number');
            assert(typeof price === 'number', 'price must a number');

            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            };
            next(error);
        }
    },

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
                    res.status(200).json({
                        status: 200,
                        result: results,
                    })
                    console.log(results);
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

                    if (results.length == 0) {
                        const err = {
                            status: 404,
                            message: "Meal does not exist"
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
            )
        })
    },

    updateMeal: (req, res, next) => {
        if (req.headers && req.headers.authorization) {
            var authorization = req.headers.authorization.split(' ')[1],
                decoded;
            try {
                decoded = jwt.verify(authorization, jwtSecretKey);
            } catch (e) {
                return;
            }
            const newMealdata = req.body;
            const userId = decoded.userId;
            const mealId = req.params.id;

            newMealdata.allergenes = newMealdata.allergenes.join(",");

            dbconnection.query(
                `SELECT cookId FROM meal WHERE id = ${mealId}`,
                (err, result, fields) => {
                    if (err) {
                        const error = {
                            status: 500,
                            message: err.message,
                        };
                        next(error);
                    }
                    //Kijk of meal bestaat
                    else if (result.length > 0) {
                        //Kijk of meal van user is
                        console.log(result.length);
                        if (result[0].cookId == userId || result[0].cookId == null) {
                            dbconnection.query(
                                `UPDATE meal SET ? WHERE id = ?`,
                                [newMealdata, mealId],
                                (err, results) => {
                                    //Update meal
                                    res.status(200).json({
                                        status: 200,
                                        result: newMealdata,
                                    });
                                }
                            );
                        } else {
                            const error = {
                                status: 403,
                                message:
                                    "You are not the owner of this meal",
                            };
                            next(error);
                        }
                    } else {
                        const error = {
                            status: 404,
                            message: "Meal does not exist",
                        };
                        next(error);
                    }
                }
            );
        }
    },

    deleteMeal: (req, res, next) => {
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
            const mealId = req.params.id;

            dbconnection.query(
                `SELECT cookId FROM meal WHERE id = ${mealId}`,
                (err, result, fields) => {
                    if (err) {
                        const error = {
                            status: 500,
                            message: err.message,
                        };
                        next(error);
                    }
                    //Kijk of meal bestaat
                    else if (result.length > 0) {
                        //Kijk of meal van user is
                        console.log(result.length);
                        if (result[0].cookId == userId || result[0].cookId == null) {
                            dbconnection.query(
                                `DELET FROM meal WHERE id = ${mealId} `,
                                (err, results) => {
                                    //Update meal
                                    res.status(200).json({
                                        status: 200,
                                        message: "Meal successfully deleted",
                                    });
                                }
                            );
                        } else {
                            const error = {
                                status: 403,
                                message:
                                    "You are not the owner of this meal",
                            };
                            next(error);
                        }
                    } else {
                        const error = {
                            status: 404,
                            message: "Meal does not exist",
                        };
                        next(error);
                    }
                }
            );
        }
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
                    const resultMeal = {
                        id: result.insertId,
                        ...meal
                    }
                    res.status(201).json({
                        status: 201,
                        result: resultMeal
                    });
                    console.log(resultMeal);
                }
            });
        });
    }
}

module.exports = controller;
