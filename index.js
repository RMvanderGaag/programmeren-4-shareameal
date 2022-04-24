const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const { get } = require("express/lib/response");
app.use(bodyParser.json());

let database = [];
let user_id = 0;

app.all("*", (req, res, next) => {
  const method = req.method;
  console.log(`Method ${method} has been called`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: 200,
    result: "Share A Meal API",
  });
});

//Register user
app
  .route("/api/user")
  .post((req, res) => {
    let user = req.body;
    user_id++;
    if (!checkEmail(user.emailAdress)) {
      user = {
        id: user_id,
        firstName: user.firstName,
        lastName: user.lastName,
        street: user.street,
        password: user.password,
        emailAdress: user.emailAdress,
      };

      console.log(user);

      database.push(user);
      res.status(201).json({
        status: 201,
        result: user,
      });
    } else {
      res.status(409).json({
        status: 409,
        result: "Email already exists",
      });
    }
  })

  //Get all users
  .get((req, res) => {
    res.status(200).json({
      status: 200,
      result: database,
    });
  });

//Request current user profile
app.get("/api/user/profile", (req, res) => {
  res.status(501).json({
    status: 501,
    result: "This endpoint is not yet implemented",
  });
});

//Get user by id
app
  .route("/api/user/:id")
  .get((req, res) => {
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
        result: "User not found",
      });
    }
  })

  //Update user
  .put((req, res) => {
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
  })

  //Delete user
  .delete((req, res) => {
    const userId = req.params.id;
    let userIndex = database.findIndex((obj) => obj.id == userId);
    if (userIndex > -1) {
      database.splice(userIndex, 1);

      res.status(202).json({
        status: 202,
        result: "Succesfully deleted user",
      });
    } else {
      res.status(404).json({
        status: 404,
        result: "User not found",
      });
    }
  });

//End-point not found
app.all("*", (req, res) => {
  res.status(401).json({
    status: 401,
    result: "End-point not found",
  });
});

function checkEmail(emailAdress) {
  const filteredArray = database.filter((o) => o.emailAdress === emailAdress);
  if (filteredArray.length > 0) {
    return true;
  }
  return false;
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
