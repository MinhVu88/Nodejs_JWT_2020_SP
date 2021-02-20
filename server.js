const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 3000;
const authRoutes = require("./routes/authRoutes");
const { auth, getCurrentUser } = require("./middlewares/authMiddleware");

// database connection
const mongodb_uri =
  "mongodb+srv://mainUser:17Maynard04Keenan1964@nodejs.oacgl.mongodb.net/nodejs_express_jwt?retryWrites=true&w=majority";

mongoose
  .connect(mongodb_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() =>
    app.listen(port, () => console.log(`server's listening on port ${port}`))
  )
  .catch(error => console.log(error));

// middlewares
app.use(express.static("./public"));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// routes
app.get("*", getCurrentUser); // the getCurrentUser middleware is applied to every GET request
app.get("/", (req, res, next) => res.render("home"));
app.get("/smoothies", auth, (req, res, next) => res.render("smoothies"));
app.use(authRoutes); // -> /signup, /login & /logout

// dummy routes for testing cookies
app.get("/set-cookies", (req, res) => {
  // without using cookie-parser
  // res.setHeader("Set-Cookie", "newUser=true");

  // with cookie-parser
  res.cookie("newUser", false);
  res.cookie("isEmployable", true);
  res.cookie("oneHourSession", true, { maxAge: 3600000 });
  res.cookie("isSecureByHTTPS", true, { secure: true });
  res.cookie("accessedViaOnlyHTTP", true, { httpOnly: true });

  res.send("cookie is set");
});

app.get("/get-cookies", (req, res) => {
  const cookies = req.cookies;

  console.log(
    "\nreq.cookies ->",
    cookies,
    "| req.cookies.newUser ->",
    cookies.newUser
  );

  res.json(cookies);
});
