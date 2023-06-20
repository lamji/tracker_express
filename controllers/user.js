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
module.exports.addTransaction = (params) => {
  return User.findById(params.userId).then((resultFromFindById) => {
    if (resultFromFindById !== null) {
      resultFromFindById.transactions.push(params.transaction);
      return resultFromFindById.save().then((updatedUser, err) => {
        return err ? false : true;
      });
    } else {
    }
  });
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
  console.log(params);
  return User.updateOne(
    { _id: params.userId },
    { $set: { balance: params.balanceAfterTransaction } }
  ).then((user, err) => {
    return err ? false : true;
  });
};

//archive a reacord - set isActive to false
module.exports.archive = (params) => {
  return User.updateOne(
    { "transactions._id": params.userId },
    { $set: { "transactions.$.isActive": false } }
  ).then((user, err) => {
    return err ? false : true;
  });
};

module.exports.getAllActive = (params) => {
  return User.find({ "transactions.isActive": { $gte: true } }).then((user) => {
    return user;
  });
};

//get user profile
module.exports.get = (params) => {
  return User.findById(params.userId).then((resultFromFindById) => {
    resultFromFindById._id;
    return resultFromFindById;
  });
};

module.exports.addExpenses = (params) => {
  console.log(params);
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
