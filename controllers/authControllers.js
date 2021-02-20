const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

const handleErrors = error => {
  let err = { email: "", password: "" };

  const { message, code } = error;

  console.log(
    "\n* The error object's message prop ->",
    message,
    "| the error object's code prop ->",
    code
  );

  // check for duplicate emails
  if (code === 11000) {
    err.email = "Duplicate emails detected";

    return err;
  }

  // "user validation failed" in the error object's message property?
  if (message.includes("user validation failed")) {
    const { errors } = error;

    console.log("\n* The error object's errors property/object ->", errors);

    Object.values(errors).forEach(e => {
      const { properties } = e;

      console.log(
        "\n* The properties property/object of each property inside errors ->",
        properties
      );

      err[properties.path] = properties.message;
    });
  }

  // validate email & password submitted in the login page
  if (message === "Invalid Email") err.email = "Invalid Email";

  if (message === "Invalid Password") err.password = "Invalid Password";

  return err;
};

const tokenDuration = 86400;
const createToken = userId =>
  jwt.sign({ userId }, "MonsieurLecoq", { expiresIn: tokenDuration });

const signup_get = (req, res, next) => {
  res.render("signup");
};

const signup_post = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const newUser = await userModel.create({ email, password });

    const token = createToken(newUser._id);

    res.cookie("jwt", token, { httpOnly: true, maxAge: 86400000 });

    res.status(201).json({ user: newUser._id });
  } catch (error) {
    res.status(400).json(handleErrors(error));
  }
};

const login_get = (req, res, next) => {
  res.render("login");
};

const login_post = async (req, res, next) => {
  const { email, password } = req.body;

  console.log("Email:", email, "| Password:", password);

  try {
    const user = await userModel.login(email, password);

    const token = createToken(user._id);

    res.cookie("jwt", token, { httpOnly: true, maxAge: 86400000 });

    res.status(200).json({ user: user._id });
  } catch (error) {
    res.status(400).json(handleErrors(error));
  }
};

const logout_get = async (req, res, next) => {
  res.cookie("jwt", "", { maxAge: 1 });

  res.redirect("/login");
};

module.exports = { signup_get, signup_post, login_get, login_post, logout_get };
