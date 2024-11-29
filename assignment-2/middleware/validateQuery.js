module.exports = (allowedQuery = []) => {
  return (req, res, next) => {
    try {
      // Get all queries from URL
      const query = Object.keys(req.query);

      // Define invalid queries
      const invalidQuery = query.filter((key) => !allowedQuery.includes(key));

      if (invalidQuery.length > 0) {
        throw {
          statusCode: 400,
          message: `Invalid query parameter(s): ${invalidQuery.join(", ")}`,
        };
      }
      next();
    } catch (error) {
      const statusCode = error.statusCode || 400;
      res.status(statusCode).json({ error: true, message: error.message });
    }
  };
};
