const jwt = require("jsonwebtoken");
const throwError = require("../functions/utils/throwError");
const handleError = require("../functions/utils/handleError");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader || !authHeader.match(/^Bearer /)) {
      throwError(401, "Authorization header ('Bearer token') not found");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throwError(401, "JWT token has expired");
      } else {
        throwError(401, "Invalid JWT Token");
      }
    }
    next();
  } catch (error) {
    handleError(res, error);
  }
};
