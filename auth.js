const jwt = require("jsonwebtoken");
const secret = "CourseBookingAPI" //can be any phrase

//JWT is like a gift-wrapping service but with secrets
//Only the "person" who knows the secret can open the gift
//If the gift has been tampered with, JWT can recognize that and disregard the gift

//createAccessToken -> analog: pack the gift, sign with the secret
module.exports.createAccessToken = (user) => {
	//the user paramater comes from logging in
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	}

	return jwt.sign(data, secret, {})
}

//verify the token -> analog: receive the gift, and verify if the sender is legit
module.exports.verify = (req, res, next) => {
	let token = req.headers.authorization //we put the JWT token in the headers of the request

	if(typeof token !== "undefined"){ //the token exists
		token = token.slice(7, token.length)
		//slice from string position 7 and end at the last character
		//strings are arrays of characters
		//the first 7 characters are not relevant to the data that we need

		return jwt.verify(token, secret, (err, data) => {
			//jwt.verify verifies the token the secret and fails if the secret doesn't match with our secret phases(i.e. the token has been tampered with)

			return (err) ? res.send({auth: "failed"}) : next()
			//next is a function that allows us to proceed to the next request
		})
	}else{
		//if token is empty
		return res.send({auth: "failed"})
	}
}

//decode the token -> analog: open the gift and get the contents
module.exports.decode = (token) => {
	if(typeof token !== "undefined"){ //the token exists
		token = token.slice(7, token.length)

		return jwt.verify(token, secret, (err, data) => {
			return (err) ? null : jwt.decode(token, {complete: true}).payload
			//jwt.decode decodes the token and gets the "payload"
			//payload contains the data from createAccessToken
		})
	}
}