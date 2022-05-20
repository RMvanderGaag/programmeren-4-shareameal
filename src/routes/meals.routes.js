const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller");

router
    .get("/api/meal", mealController.getAllMeals)
    .get("/api/meal/:id", mealController.getMeal)
    .delete("/api/meal/:id", mealController.deleteMeal)
    .post("/api/meal", mealController.addMeal)



module.exports = router;