/** @format */
// const User2 = require("../models/User");
const express = require("express");
const router = express.Router();
const auth = require("../auth");
const UserController = require("../controllers/newController");

/**
 * login routes
 */
router.post("/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const clientIp = req.ip;

  // Check if the body has email
  if (!email) res.send({ error: "Email is required" });

  // Check if the body has password
  if (!password) res.send({ error: "Password is required" });

  try {
    const resultFromLogin = await UserController.login(req.body);

    // Check the status
    if (resultFromLogin.status === 401)
      return res.status(resultFromLogin.status).json(resultFromLogin);

    // if no issue return the token

    return res.status(201).json(resultFromLogin);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Get all records
 */
router.get("/get-records", auth.verify, async (req, res) => {
  // auth.verify will check if token is present in header
  const user = auth.decode(req.headers.authorization);
  const queryParams = req.query;
  try {
    if (user) {
      const result = await UserController.getAllActive({
        userId: user.id,
        queryParams,
      });
      res.status(201).json(result);
    }
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * add transactions
 */
router.post("/add-transaction", auth.verify, async (req, res) => {
  const params = {
    userId: auth.decode(req.headers.authorization).id,
    transaction: {
      categoryName: req.body.category,
      type: req.body.type,
      amount: req.body.amount,
      description: req.body.description,
    },
  };
  try {
    const result = await UserController.addTransaction(params);
    res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Add categories
 */
router.post("/addCategory", auth.verify, async (req, res) => {
  const params = {
    userId: auth.decode(req.headers.authorization).id,
    category: {
      category: req.body.category,
      amount: req.body.amount,
    },
  };
  try {
    if (!params.category.category)
      return res.json({ message: "category name is required" });
    const result = await UserController.addCategory(params);
    res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//test
router.get("/test", (req, res) => {
  res.json("test");
});

module.exports = router;
