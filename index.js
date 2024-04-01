/** @format */

//dependencies setup
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/newRoutes");

//database connection
mongoose.connection.once("open", () =>
  console.log("Now connected to MongoDB Atlas.")
);
mongoose.connect(
  "mongodb+srv://Lamji:Lamji492@cluster0.0rdew.mongodb.net/login_google?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
);

//server setup
const app = express();
const port = 22;
//bodyparser middleware
app.use(express.json()); //only looks at request where the Content-Type header is JSON
app.use(express.urlencoded({ extended: true })); //allows POST requests to include nested objects

//configure cors
// const corsOptions = {
// 	origin: 'http://localhost:3000',
// 	optionsSuccessStatus: 200
// }

app.use(cors());
app.options("*", cors());

//add all the routes
app.use("/api/users", userRoutes);
app.use("/", userRoutes);

//server listening
app.listen(port, () => console.log(`Listening to port ${port}`));
