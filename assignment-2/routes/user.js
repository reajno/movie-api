const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userQuery = require("../functions/query/userQuery");
const throwError = require("../functions/utils/throwError");
const handleError = require("../functions/utils/handleError");
const validateQuery = require("../middleware/validateQuery");

router.post("/register", validateQuery(), async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if "email" and "password" fields are populated
    if (!email || !password) {
      throwError(
        400,
        "Request body incomplete, both email and password are required"
      );
    }

    const userResult = await userQuery(req, email);

    // Check if user already exists in DB
    if (userResult.length > 0) {
      throwError(409, "User already exists");
    }

    // Define salt rounds
    const saltRounds = 10;

    // Generate password hash
    const hash = await bcrypt.hash(password, saltRounds);

    // Insert user email and hashed password to DB
    await req.db.from("users").insert({ email, hash });

    res.status(201).json({ message: "User created" });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/login", validateQuery(), async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throwError(
        400,
        "Request body incomplete, both email and password are required"
      );
    }

    // Find user email from DB
    const userResult = await userQuery(req, email);

    // Check if email exists
    if (userResult.length === 0) {
      throwError(401, "Unknown email, please register your account");
    }

    // Define valid user
    const user = userResult[0];

    // Match password input with user hash stored in DB
    const passwordMatch = await bcrypt.compare(password, user.hash);

    // Check if password matches
    if (!passwordMatch) {
      throwError(401, "Incorrect password");
    }

    const expires_in = 60 * 60 * 24; // 24 hours
    const exp = Math.floor(Date.now() / 1000) + expires_in;

    // Define token
    const token = jwt.sign({ email, exp }, process.env.JWT_SECRET);

    // Set Auth token header
    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(200).json({
      token,
      token_type: "Bearer",
      expires_in,
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
