const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    console.log(req.body);
    if (!email || !password) {
      throw {
        statusCode: 400,
        message:
          "Request body incomplete, both email and password are required",
      };
    }

    const existingUsers = await req.db
      .from("users")
      .select("*")
      .where("email", email);

    if (existingUsers.length > 0) {
      throw {
        statusCode: 409,
        message: "User already exists",
      };
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
    console.log(req.body);
    if (!email || !password) {
      throw {
        statusCode: 400,
        message:
          "Request body incomplete, both email and password are required",
      };
    }

    const queryUsers = await req.db
      .from("users")
      .select("*")
      .where("email", email);

    if (queryUsers.length === 0) {
      throw {
        statusCode: 400,
        message: "Unknown email, please register your account",
      };
    }

    const user = queryUsers[0];
    const passwordMatch = await bcrypt.compare(password, user.hash);

    if (!passwordMatch) {
      throw {
        statusCode: 401,
        message: "Incorrect password",
      };
    }

    const expires_in = 60 * 60; // 1 hour
    const exp = Math.floor(Date.now() / 1000) + expires_in;
    const token = jwt.sign({ email, exp }, process.env.JWT_SECRET);

    res.setHeader("Authorization", `Bearer ${token}`);
    res.status(200).json({
      token,
      token_type: "Bearer",
      expires_in,
    });
  } catch (error) {
    const statusCode = error.statusCode ? error.statusCode : 400;
    res.status(statusCode).json({ error: true, message: error.message });
  }
});

module.exports = router;
