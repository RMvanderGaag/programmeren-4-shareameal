const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller')

router.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Share A Meal API",
    });
});

router
    //Post user
    .post("/api/user", userController.validateUser, userController.addUser)

    //Get all users
    .get("/api/user", userController.getAllUsers)

    //Request current user profile
    .get("/api/user/profile", userController.getUserProfile)

    //Get user by id
    .get("/api/user/:id", userController.getUserById)

    //Update user
    .put("/api/user/:id", userController.validateUser, userController.updateUser)

    //Delete user
    .delete("/api/user/:id", userController.deleteUser)




module.exports = router;