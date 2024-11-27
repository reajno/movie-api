module.exports = (allowedParams) => {
  return (req, res, next) => {
    try {
      // Combine object
      const allParams = { ...req.params, ...req.query };

      //   Get all keys from the combined object
      const actualParams = Object.keys(allParams);

      //   Find invalid params
      const invalidParams = actualParams.filter(
        (param) => !allowedParams.includes(param)
      );

      if (invalidParams.length > 0) {
        throw {
          statusCode: 400,
          message: `Invalid query parameter(s): ${invalidParams.join(", ")}`,
        };
      }
      next();
    } catch (error) {
      const statusCode = error.statusCode ? error.statusCode : 400;
      res.status(statusCode).json({ error: true, message: error.message });
    }
  };
};
