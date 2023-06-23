/** @format */
// const User2 = require("../models/User");
const express = require("express");
const router = express.Router();
const auth = require("../auth");
const UserController = require("../controllers/user");

//get details of a user
//auth.verify ensures that a user is logged in before proceeding to the next part of the code
router.get("/details", auth.verify, (req, res) => {
  const user = auth.decode(req.headers.authorization);
  //the result is the data from auth.js (id, email, isAdmin)

  //we use the id of the user from the token to search for the user's information
  UserController.get({ userId: user.id }).then((user) => res.send(user));
});

//test
router.get("/test", (req, res) => {
  res.send("test");
});
//getRecords
router.get("/GetRecords", auth.verify, (req, res) => {
  const user = auth.decode(req.headers.authorization);
  UserController.getAllActive({ userId: user.id }).then((user) =>
    res.send(user)
  );
});
//login
router.post("/login", (req, res) => {
  UserController.login(req.body).then((resultFromLogin) =>
    res.send(resultFromLogin)
  );
});
router.post("/verify-facebook-id-token", (req, res) => {
  UserController.verifyFacebookTokenId(req.body).then(
    (resultFromRegisterEmail) => res.send(resultFromRegisterEmail)
  );
});

router.post("/verify-Emailregister-id-token", (req, res) => {
  UserController.Emailregister(req.body).then((resultFromRegister) =>
    res.send(resultFromRegister)
  );
});
//verify Google Login token
router.post("/verify-google-id-token", async (req, res) => {
  res.send(await UserController.verifyGoogleTokenId(req.body.tokenId));
});

router.post("/updateBalance", auth.verify, (req, res) => {
  UserController.addBalance(req.body).then((result) => res.send(result));
});

//update Expenses
router.post("/updateExpences", auth.verify, (req, res) => {
  UserController.addExpenses(req.body).then((resultFromUpdate) =>
    res.send(resultFromUpdate)
  );
});
//archive (delete) a course
router.delete("/DeleteRecords", auth.verify, (req, res) => {
  UserController.archive(req.body).then((resultFromArchive) =>
    res.send(resultFromArchive)
  );
});
//change password
router.post("/changePass", auth.verify, (req, res) => {
  UserController.changePassword(req.body).then((resultFromRegister) =>
    res.send(resultFromRegister)
  );
});
//for recording user history
router.post("/addTransaction", auth.verify, async (req, res) => {
  const params = {
    userId: auth.decode(req.headers.authorization).id,
    transaction: {
      categoryName: req.body.categoryName,
      type: req.body.type,
      amount: req.body.amount,
      Sort: req.body.Sort,
      description: req.body.description,
      balanceAfterTransaction: req.body.balanceAfterTransaction,
    },
  };

  UserController.addTransaction(params).then((result) => {
    res.send(result);
  });
});

router.post("/addTodo", auth.verify, (req, res) => {
  const params = {
    userId: auth.decode(req.headers.authorization).id,
    toDo: {
      items: req.body.items,
      quantity: req.body.quantity,
      price: req.body.amount,
    },
  };
  UserController.addToDo(params).then((result) => res.send(result));
});
module.exports = router;
