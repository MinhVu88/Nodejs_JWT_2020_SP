const jwt = require("jsonwebtoken");
const userModel = require("../models/User");

const auth = (req, res, next) => {
  // get the token embedded within the cookie in the request to the server
  const token = req.cookies.jwt;

  // if there's a token, then it's verified based on its value & the secret
  // if the token's invalid, user's redirected to the login page
  if (token) {
    jwt.verify(token, "MonsieurLecoq", (error, verifiedToken) => {
      if (error) {
        console.log(error.message);

        res.redirect("/login");
      } else {
        console.log("\n* Verified token (authMiddleware) ->", verifiedToken);

        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

const getCurrentUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "MonsieurLecoq", async (error, verifiedToken) => {
      if (error) {
        console.log(error.message);

        res.locals.currentUser = null;

        next();
      } else {
        console.log("\n* Verified token (authMiddleware) ->", verifiedToken);

        let verifiedUser = await userModel.findById(verifiedToken.userId);

        // the currentUser property can be accessed in the views (the ejs files)
        res.locals.currentUser = verifiedUser;

        next();
      }
    });
  } else {
    res.locals.currentUser = null;

    next();
  }
};

module.exports = { auth, getCurrentUser };
