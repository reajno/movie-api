const throwError = require("../functions/utils/throwError");
const handleError = require("../functions/utils/handleError");

module.exports = (allowedQuery = []) => {
  return (req, res, next) => {
    try {
      // Get all queries from URL
      const query = Object.keys(req.query);

      // Define invalid queries
      const invalidQuery = query.filter((key) => !allowedQuery.includes(key));

      if (invalidQuery.length > 0) {
        throwError(
          400,
          `Invalid query parameter(s): ${invalidQuery.join(", ")}`
        );
      }
      next();
    } catch (error) {
      handleError(res, error);
    }
  };
};
