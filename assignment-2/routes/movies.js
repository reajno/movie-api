const express = require("express");
const router = express.Router();
const paginationQuery = require("../functions/query/paginationQuery");
const movieSearchQuery = require("../functions/query/movieSearchQuery");
const movieInfoQuery = require("../functions/query/movieInfoQuery");
const movieCrewQuery = require("../functions/query/movieCrewQuery");
const movieRatingQuery = require("../functions/query/movieRatingQuery");
const throwError = require("../functions/utils/throwError");
const handleError = require("../functions/utils/handleError");
const validateQuery = require("../middleware/validateQuery");
const validateIDParam = require("../middleware/validateIDParam");

router.get(
  "/search",
  validateQuery(["title", "year", "page"]),
  async (req, res, next) => {
    const { title, year, page } = req.query;
    const perPage = 100;
    const currentPage = page && page > 1 ? page : 1;
    const offset = (currentPage - 1) * perPage;

    try {
      // Check if title exists
      if (!title) {
        throwError(400, "Title query parameter is required");
      }

      // Check if year is NOT a 4 digit number
      if (year && !/^\d{4}$/.test(year)) {
        throwError(400, "Invalid year format. Format must be YYYY");
      }

      const moviesResult = await movieSearchQuery(
        req,
        title,
        year,
        page,
        perPage,
        offset
      );
      const paginationResult = await paginationQuery(
        req,
        title,
        year,
        currentPage,
        perPage
      );

      res.json({
        data: moviesResult,
        pagination: paginationResult,
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

router.get(
  "/data/:imdbID",
  validateIDParam,
  validateQuery(),
  async (req, res, next) => {
    const { imdbID } = req.params;

    try {
      // Check if imdbID exists in DB
      const movie = await req.db
        .from("basics")
        .select("*")
        .where("tconst", imdbID);

      if (movie.length === 0) {
        throwError(400, "imdbID not found in the database");
      }

      const movieInfoResult = await movieInfoQuery(req, imdbID);
      const movieCrewResult = await movieCrewQuery(req, imdbID);
      const movieRatingResult = await movieRatingQuery(req, imdbID);

      const combinedResult = [
        { ...movieInfoResult, ...movieCrewResult, ...movieRatingResult },
      ];

      res.json(combinedResult);
    } catch (error) {
      handleError(res, error);
    }
  }
);

module.exports = router;
