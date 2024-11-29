const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const throwError = require("../functions/utils/throwError");
const userQuery = require("../functions/query/userQuery.js")




/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throwError(
        400,
        "Request body incomplete, both email and password are required"
      );
    }


    const userResult = await userQuery(req, email);

    // If user exists
    if (userResult.length > 0) {
      throwError(409, "User already exists");
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    await req.db.from("users").insert({ email, hash });

    res.status(201).json({ message: "User created" });
  } catch (error) {
    const statusCode = error.statusCode ? error.statusCode : 400;
    res.status(statusCode).json({ error: true, message: error.message });
  }
});

router.post("/login", async (req, res, next) => {
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

    if (userResult.length === 0) {
      throwError(400, "Unknown email, please register your account");
    }

    // Define valid user
    const user = userResult[0];

    // Match password input with user hash stored in DB
    const passwordMatch = await bcrypt.compare(password, user.hash);

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
    const statusCode = error.statusCode || 400;
    res.status(statusCode).json({ error: true, message: error.message });
  }
});

module.exports = router;
