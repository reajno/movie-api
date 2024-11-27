const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  try {
    if (!authHeader || !authHeader.match(/^Bearer /)) {
      throw {
        statusCode: 401,
        message: "Authorization header ('Bearer token') not found",
      };
    }

    const token = authHeader.split(" ")[1];
    console.log(token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      req.user = decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw {
          statusCode: 401,
          message: "JWT token has expired",
        };
      } else {
        throw {
          statusCode: 401,
          message: "Invalid JWT Token",
        };
      }
    }
    next();
  } catch (error) {
    const statusCode = error.statusCode ? error.statusCode : 400;
    res.status(statusCode).json({ error: true, message: error.message });
  }
};
