const assert = require('assert');
let database = [];
let user_id = 0;

let controller = {
    validateUser: (req, res, next) => {
        let user = req.body;
        let { firstName, lastName, street, city, isActive, emailAdress, phoneNumber, password } = user;
        try {
            assert(typeof firstName === 'string', 'Firstname must be a string');
            assert(typeof lastName === 'string', 'Lastname must be a string');
            assert(typeof street === 'string', 'Street must be a string');
            assert(typeof city === 'string', 'City must be a string');
            assert(typeof isActive === 'boolean', 'isActive must be a boolean');
            assert(typeof emailAdress === 'string', 'Email must be a string');
            assert(typeof phoneNumber === 'string', 'Phonenumber must be a string');
            assert(typeof password === 'string', 'Password must be a string');
            assert((database.filter((o) => o.emailAdress === emailAdress)) < 1, 'Email must be unique');

            next();
        } catch (err) {
            const error = {
                status: 400,
                result: err.message
            };
            next(error);
        }
    },
    getAllUsers: (req, res) => {
        res.status(200).json({
            status: 200,
            result: database,
        });
    },
    addUser: (req, res, next) => {
        let user = req.body;
        user_id++;
        user = {
            id: user_id,
            firstName: user.firstName,
            lastName: user.lastName,
            street: user.street,
            city: user.city,
            phoneNumber: user.phoneNumber,
            password: user.password,
            emailAdress: user.emailAdress,
        };

        console.log(user);

        database.push(user);
        res.status(201).json({
            status: 201,
            result: user,
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
        let user = database.find((item) => item.id == userId);
        if (user) {
            console.log(user);
            res.status(200).json({
                status: 200,
                result: user,
            });
        } else {
            res.status(404).json({
                status: 404,
                result: `User with id ${userId} could not be found`,
            });
        }
    },

    updateUser: (req, res) => {
        let newUserInfo = req.body;
        const userId = req.params.id;
        let userIndex = database.findIndex((obj) => obj.id == userId);

        if (userIndex > -1) {
            database[userIndex] = {
                id: parseInt(userId),
                firstName: newUserInfo.firstName,
                lastName: newUserInfo.lastName,
                street: newUserInfo.street,
                city: newUserInfo.city,
                phoneNumber: newUserInfo.phoneNumber,
                password: newUserInfo.password,
                emailAdress: newUserInfo.emailAdress,
            };

            res.status(200).json({
                status: 200,
                result: database[userIndex],
            });
        } else {
            res.status(404).json({
                status: 404,
                result: "User not found",
            });
        }
    },

    deleteUser: (res, req) => {
        const userId = req.params.id;
        let userIndex = database.findIndex((obj) => obj.id == userId);
        if (userIndex > -1) {
            database.splice(userIndex, 1);

            res.status(202).json({
                status: 202,
                result: `Succesfully deleted user ${userId}`,
            });
        } else {
            res.status(404).json({
                status: 404,
                result: `User with id ${userId} is succesfully deleted`,
            });
        }
    }
}

module.exports = controller;