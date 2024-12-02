const throwError = require("../functions/utils/throwError");
const handleError = require("../functions/utils/handleError");

module.exports = async (req, res, next) => {
  try {
    const { imdbID } = req.params;

    if (req.params && imdbID) {
      const movie = await req.db
        .from("basics")
        .select("*")
        .where("tconst", imdbID);

      if (movie.length === 0) {
        throwError(400, "imdbID not found in the database");
      }
    }
    console.log(req.params);
    next();
  } catch (error) {
    handleError(res, error);
  }
};
