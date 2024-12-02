module.exports = (res, error) => {
  console.log(error);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    error: true,
    message: error.code ? `Database Error: ${error.code} ${error.sqlMessage}` : error.message,
  });
};
