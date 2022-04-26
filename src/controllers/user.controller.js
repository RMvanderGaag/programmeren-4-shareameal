let database = [];
let user_id = 0;

let controller = {
    getAllUsers: (req, res) => {
        res.status(200).json({
            status: 200,
            result: database,
        });
    },
    addUser: (req, res) => {
        let user = req.body;
        user_id++;
        if (!checkEmail(user.emailAdress)) {
            if (Array.isArray(user.roles)) {
                user = {
                    id: user_id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    street: user.street,
                    city: user.city,
                    phoneNumber: user.phoneNumber,
                    password: user.password,
                    emailAdress: user.emailAdress,
                    roles: user.roles,
                };

                console.log(user);

                database.push(user);
                res.status(201).json({
                    status: 201,
                    result: user,
                });
            } else {
                res.status(400).json({
                    status: 400,
                    result: "Roles must be an array",
                });
            }
        } else {
            res.status(409).json({
                status: 409,
                result: "Email already exists",
            });
        }
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
            if (Array.isArray(newUserInfo.roles)) {
                database[userIndex] = {
                    id: parseInt(userId),
                    firstName: newUserInfo.firstName,
                    lastName: newUserInfo.lastName,
                    street: newUserInfo.street,
                    city: newUserInfo.city,
                    phoneNumber: newUserInfo.phoneNumber,
                    password: newUserInfo.password,
                    emailAdress: newUserInfo.emailAdress,
                    roles: newUserInfo.roles,
                };

                res.status(200).json({
                    status: 200,
                    result: database[userIndex],
                });
            } else {
                res.status(400).json({
                    status: 400,
                    result: "Roles must be an array",
                });
            }
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

function checkEmail(emailAdress) {
    const filteredArray = database.filter((o) => o.emailAdress === emailAdress);
    if (filteredArray.length > 0) {
        return true;
    }
    return false;
}

module.exports = controller;