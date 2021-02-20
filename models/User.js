const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Invalid Email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"]
  }
});

// Mongoose hooks (special functions that run after a specific Mongoose event)
// Ex #1: a hook is fired after a new user (doc) has been saved to the db
userSchema.post("save", (doc, next) => {
  console.log("\n* A new user was created & saved to the db ->", doc);

  // next() is called at the end of a Mongoose middleware/hook
  // so the program can move to the next middleware/hook, otherwise, it will hang
  next();
});

// Ex #2: fire a hook before a new user is saved to the db
// this time, the hook is not an arrow function as "this" is used
// to refer to the user instance that's about to be saved
userSchema.pre("save", async function (next) {
  const user = this;

  console.log(
    "\n* The user instance that's about be created & saved to the db ->",
    user
  );

  // hash a pre-created, pre-saved user's password using bcrypt
  const salt = await bcrypt.genSalt();

  user.password = await bcrypt.hash(user.password, salt);

  next();
});

// static methods are accessible on a model itself ( a.k.a model methods)
// this's a static method to log an auth user in
userSchema.statics.login = async function (email, password) {
  const user = this;

  const registeredEmail = await user.findOne({ email });

  if (registeredEmail) {
    // compare the password entered in the login form with the hashed one in the db
    const registeredPassword = await bcrypt.compare(
      password,
      registeredEmail.password
    );

    if (registeredPassword) return registeredEmail;

    throw Error("Invalid Password");
  }

  throw Error("Invalid Email");
};

const User = mongoose.model("user", userSchema);

module.exports = User;
