/** @format */

const jwt = require("jsonwebtoken");
const secret = "CourseBookingAPI"; //can be any phrase

//JWT is like a gift-wrapping service but with secrets
//Only the "person" who knows the secret can open the gift
//If the gift has been tampered with, JWT can recognize that and disregard the gift

//createAccessToken -> analog: pack the gift, sign with the secret
module.exports.createAccessToken = (user) => {
  const expiresIn = 3600;
  //the user paramater comes from logging in
  const data = {
    id: user._id,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(data, secret, { expiresIn });
};

//verify the token -> analog: receive the gift, and verify if the sender is legit
module.exports.verify = (req, res, next) => {
  let token = req.headers.authorization;

  if (typeof token !== "undefined") {
    token = token.slice(7, token.length);

    jwt.verify(token, secret, (err, data) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          // Token has expired
          return res.status(401).send({ Error: "Token Expired" });
        } else {
          // Unauthorized due to other reasons (e.g., invalid token)
          return res.status(401).send({ Error: "Unauthorized" });
        }
      } else {
        // Token is valid, proceed to the next middleware
        next();
      }
    });
  } else {
    return res.status(401).send({ Error: "Unauthorized" });
  }
};

//decode the token -> analog: open the gift and get the contents
module.exports.decode = (token) => {
  if (typeof token !== "undefined") {
    //the token exists
    token = token.slice(7, token.length);

    return jwt.verify(token, secret, (err, data) => {
      return err ? null : jwt.decode(token, { complete: true }).payload;
      //jwt.decode decodes the token and gets the "payload"
      //payload contains the data from createAccessToken
    });
  }
};
