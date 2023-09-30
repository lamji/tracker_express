/** @format */

const User = require("../models/user");
const auth = require("../auth");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const express = require("express");
const clientId =
  "1055007502137-5l881rml4392lgtccl7298h8butc9eoh.apps.googleusercontent.com";

//function to catch & handle errors
const errCatcher = (err) => console.log(err);

// adding transaction
// Adding a transaction
module.exports.addTransaction = async (params) => {
  try {
    const user = await User.findById(params.userId);
    if (user !== null) {
      // get the incomes
      const transactionIncome = user.transactions.filter(
        (transaction) => transaction.type === "Income"
      );

      //get the expenses
      const transactionExpenses = user.transactions.filter(
        (transaction) => transaction.type === "Expenses"
      );

      // get the total Income
      const balance = transactionIncome.reduce((acc, trans) => {
        return acc + trans.amount;
      }, 0);

      // get the total expenses
      const expenses = transactionExpenses.reduce((acc, trans) => {
        return acc + trans.amount;
      }, 0);

      // check if the category is already exist
      if (!user.categories.includes(params.transaction.categoryName)) {
        user.categories.push(params.transaction.categoryName);
      }

      // less the expenses in balance
      const totalBalance = parseFloat(balance) - parseFloat(expenses);

      if (params.transaction.type === "Income") {
        // Set the balance property of the user
        user.balance = totalBalance + parseFloat(params.transaction.amount);
        user.income = balance + parseFloat(params.transaction.amount);
      } else {
        // Set the balance property of the user
        user.balance = totalBalance - parseFloat(params.transaction.amount);
        user.expenses = expenses + parseFloat(params.transaction.amount);
      }

      user.transactions.push(params.transaction);
      await user.save();
      return { status: true, message: "Transaction added successfully", user };
    } else {
      return { status: false, message: "User not found" };
    }
  } catch (error) {
    return {
      status: false,
      message: error,
    };
  }
};

/**
 * removing transactions
 * @param {*} params
 * @returns
 */
module.exports.archive = async (params) => {
  try {
    const user = await User.findOne({ "transactions._id": params.userId });
    if (user) {
      // get the transaction
      const curTransactions = user.transactions.filter(
        (transaction) => transaction._id == params.userId
      );

      // create new transaction
      const newTransactions = user.transactions.filter(
        (transaction) => transaction._id != params.userId
      );

      //get the expenses
      const transactionExpenses = user.transactions.filter(
        (transaction) => transaction.type === "Expenses"
      );
      // get the total expenses
      const expenses = transactionExpenses.reduce((acc, trans) => {
        return acc + trans.amount;
      }, 0);

      // get the total Income
      const balance = user.balance;

      if (curTransactions[0].type === "Income") {
        user.balance = balance - parseFloat(curTransactions[0].amount); // Set the balance property of the user
        user.income = balance - parseFloat(curTransactions[0].amount);
      } else {
        user.balance = balance + parseFloat(curTransactions[0].amount); // Set the balance property of the user
        user.expenses = expenses - parseFloat(curTransactions[0].amount);
      }
      user.transactions = newTransactions;

      await user.save();
      return {
        status: true,
        message: "Transaction deleted successfully",
        user,
      };
    }
    return false;
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: error,
    };
  }
};

/**
 * Update user name
 * @param {*} params
 * @returns
 */
module.exports.updateUserName = async ({ userId, data }) => {
  try {
    const user = await User.findById(userId);
    if (user !== null) {
      user.fullName = data.newUserName;
      await user.save();
      return { status: true, message: "User name successfully updated", user };
    } else {
      return { status: false, message: "User not found" };
    }
  } catch (error) {
    return {
      status: false,
      message: error,
    };
  }
};

/**
 * Retrieve user data with optional query parameters
 * @param {Object} options - The options object
 * @param {string} options.userId - The user ID
 * @param {Object} options.queryParams - The query parameters
 * @param {string} options.queryParams.category - The category name
 * @returns {Promise} A promise that resolves to the user data
 */
module.exports.get = ({ userId, queryParams }) => {
  const query = User.findById(userId).select("-password");

  if (queryParams && queryParams.category) {
    query.populate({
      path: "transactions",
      match: {
        categoryName: queryParams.category,
        type: queryParams.type,
      },
    });
  }

  return query.exec().then((resultFromFindById) => {
    if (queryParams && queryParams.category) {
      resultFromFindById.transactions = resultFromFindById.transactions.filter(
        (transaction) => transaction.categoryName === queryParams.category
      );
    }

    if (queryParams && queryParams.type) {
      resultFromFindById.transactions = resultFromFindById.transactions.filter(
        (transaction) => transaction.type === queryParams.type
      );
    }

    return resultFromFindById;
  });
};

/**
 * update a transaction
 * @param {*} params
 * @returns
 */
module.exports.update = async (params) => {
  try {
    const user = await User.findOne({ "transactions._id": params.userId });
    if (user) {
      const transactionIndex = user.transactions.findIndex(
        (transaction) => transaction._id.toString() === params.userId
      );
      if (transactionIndex !== -1) {
        user.transactions[transactionIndex].isActive = false;
        await user.save();
        return true;
      }
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// adding toDo
module.exports.addToDo = (params) => {
  return User.findById(params.userId).then((resultFromFindById) => {
    if (resultFromFindById !== null) {
      resultFromFindById.toDo.push(params.toDo);
      return resultFromFindById.save().then((updatedUser, err) => {
        return err ? false : true;
      });
    } else {
    }
  });
};

module.exports.addBalance = (params) => {
  // console.log(params);
  return User.updateOne(
    { _id: params.userId },
    { $set: { balance: params.balanceAfterTransaction } }
  ).then((user, err) => {
    return err ? false : true;
  });
};

module.exports.getAllActive = (params) => {
  return User.find({ "transactions.isActive": { $gte: true } }).then((user) => {
    return user;
  });
};

module.exports.addExpenses = (params) => {
  return User.updateOne(
    { _id: params.userId },
    { $set: { balance: params.balanceAfterTransaction } }
  ).then((user, err) => {
    return err ? false : true;
  });
};

//changepass
module.exports.changePassword = (params) => {
  let updatedPassword = {
    password: bcrypt.hashSync(params.newPassword, 10),
  };
  return User.updateOne({ _id: params.userId }, updatedPassword).then(
    (user, err) => {
      return err ? false : true;
    }
  );
};

//Regular registration
module.exports.Emailregister = (params) => {
  return User.findOne({ email: params.email }).then((resultFromFindOne) => {
    if (resultFromFindOne === null) {
      return User.findOne({ EmailRecovery: params.recovery }).then(
        (resultFromFindOneRecovery) => {
          console.log("resultFromFindOne", resultFromFindOneRecovery);
          if (resultFromFindOne === null) {
            let newUser = new User({
              fullName: params.fullName,
              email: params.email,
              image: params.image,
              balance: 0,
              expenses: 0,
              EmailRecovery: params.recovery,
              loginType: params.loginType,
              password: bcrypt.hashSync(params.password, 10),
              //hashSync() encrypts the password, and the 10 makes it happen 10 times
            });
            return newUser.save().then((resultFromFindOneRecovery, err) => {
              return {
                accessToken: auth.createAccessToken(
                  resultFromFindOneRecovery.toObject()
                ),
              };
            });
          } else if (resultFromFindOne !== null) {
            return { error: "email-recovery-exist" };
          } else {
            return {
              accessToken: auth.createAccessToken(
                resultFromFindOneRecovery.toObject()
              ),
            };
          }
        }
      );
    } else if (resultFromFindOne !== null) {
      return { error: "Email-Exist" };
    } else {
      return {
        accessToken: auth.createAccessToken(resultFromFindOne.toObject()),
      };
    }
  });
};

//login
module.exports.login = (params) => {
  //find a user with matching email
  return User.findOne({ email: params.email }).then((user) => {
    //if no match found, return false
    if (user === null) return { error: "Email-not-found" };

    //check if submitted password matches password on record
    const isPasswordMatched = bcrypt.compareSync(
      params.password,
      user.password
    );

    //if matching password
    if (isPasswordMatched) {
      //generate JWT
      return { accessToken: auth.createAccessToken(user.toObject()) };
    } else {
      return { error: "Incorrect-Password" };
    }
  });
};

//Facebook registration
module.exports.verifyFacebookTokenId = (params) => {
  console.log(params);
  return User.findOne({ email: params.email }).then((resultFromFindOne) => {
    if (resultFromFindOne === null) {
      //user does not exist
      console.log(params);
      const newUser = new User({
        fullName: params.fullName,
        image: params.image,
        email: params.email,
        balance: 0,
        expenses: 0,
        loginType: params.loginType,
      });

      return newUser.save().then((resultFromFindOne, err) => {
        return {
          accessToken: auth.createAccessToken(resultFromFindOne.toObject()),
        };
      });
    } else if (resultFromFindOne !== null) {
      if (resultFromFindOne.loginType === "Facebook") {
        return {
          accessToken: auth.createAccessToken(resultFromFindOne.toObject()),
        };
      } else {
        return { error: "Registration Failed" };
      }
    } else {
      return {
        accessToken: auth.createAccessToken(resultFromFindOne.toObject()),
      };
    }
  });
};

module.exports.verifyGoogleTokenId = async (tokenId) => {
  const client = new OAuth2Client(clientId);
  const data = await client.verifyIdToken({
    idToken: tokenId,
    audience: clientId,
  });
  console.log(tokenId);
  if (data.payload.email_verified === true) {
    const user = await User.findOne({ email: data.payload.email }).exec();

    if (user !== null) {
      if (user.loginType === "Google") {
        return { accessToken: auth.createAccessToken(user.toObject()) };
      } else {
        return { error: "login-type-error" };
      }
    } else {
      const newUser = new User({
        fullName: data.payload.name,
        image: data.payload.picture,
        balance: 0,
        expenses: 0,
        email: data.payload.email,
        loginType: "Google",
      });

      return newUser.save().then((user, err) => {
        return { accessToken: auth.createAccessToken(user.toObject()) };
      });
    }
  } else {
    return { error: "google-auth-error" };
  }
};
