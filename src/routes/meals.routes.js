const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();
const mealController = require("../controllers/meal.controller");

router
    .get("/api/meal", mealController.getAllMeals)
    .get("/api/meal/:id", mealController.getMeal)
    .delete("/api/meal/:id", authController.validateToken, mealController.deleteMeal)
    .post("/api/meal", authController.validateToken, mealController.validateMeal, mealController.addMeal)



module.exports = router;