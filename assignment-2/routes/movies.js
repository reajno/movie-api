const express = require("express");
const router = express.Router();
const validateQuery = require("../middleware/validateQuery");
const paginationQuery = require("../functions/query/paginationQuery");
const movieSearchQuery = require("../functions/query/movieSearchQuery");

router.get(
  "/search",
  validateQuery(["title", "year", "page"]),
  async (req, res, next) => {
    try {
      const { title, year, page } = req.query;
      const perPage = 100;
      const currentPage = page && page > 1 ? page : 1;
      const offset = (currentPage - 1) * perPage;

      // Check if title exists
      if (!title) {
        throw {
          statusCode: 400,
          message: "Title query parameter is required",
        };
      }

      // Check if year is NOT a 4 digit number
      if (year && !/^\d{4}$/.test(year)) {
        throw {
          statusCode: 400,
          message: " Invalid year format. Format must be yyyy",
        };
      }

      // const moviesQuery = async (req, title, year, offset) => {
      //   const movies = await req.db
      //     .from("basics")
      //     .select("*")
      //     .where("primaryTitle", "like", `%${title}%`)
      //     .modify((query) => {
      //       if (year) query.andWhere("startYear", year);
      //     })
      //     .limit(perPage)
      //     .modify((query) => {
      //       if (page) query.offset(offset);
      //     });

      //   const result = movies.map((movie) => {
      //     return {
      //       Title: movie.primaryTitle,
      //       Year: movie.startYear,
      //       imdbID: movie.tconst,
      //       Type: movie.titleType,
      //     };
      //   });

      //   return result;
      // };

      // const paginationQuery = await req.db
      //   .from("basics")
      //   .where("primaryTitle", "like", `%${title}%`)
      //   .modify((initQuery) => {
      //     if (year) initQuery.andWhere("startYear", year);
      //   })
      //   .count("* as total")
      //   .then((countTotal) => {
      //     const total = countTotal[0].total;
      //     const lastPage = Math.ceil(total / perPage);

      //     const result = {
      //       pagination: {
      //         total: total,
      //         lastPage: lastPage,
      //         perPage: perPage,
      //         currentPage: currentPage,
      //         from: (currentPage - 1) * perPage,
      //         to: currentPage * perPage > total ? total : currentPage * perPage,
      //       },
      //     };

      //     if (currentPage > 1) {
      //       delete result.pagination.total;
      //       delete result.pagination.lastPage;
      //     }

      //     return result;
      //   });

      // const moviesQuery = await req.db
      //   .from("basics")
      //   .select("*")
      //   .where("primaryTitle", "like", `%${title}%`)
      //   .modify((query) => {
      //     if (year) query.andWhere("startYear", year);
      //   })
      //   .limit(perPage)
      //   .modify((query) => {
      //     if (page) query.offset(offset);
      //   })
      //   .then((rows) => {
      //     const transformedRows = rows.map((row) => {
      //       return {
      //         Title: row.primaryTitle,
      //         Year: row.startYear,
      //         imdbID: row.tconst,
      //         Type: row.titleType,
      //       };
      //     });

      //     return transformedRows;
      //   })
      //   .catch((error) => {
      //     throw {
      //       message: "Error in MySQL query: " + error.message,
      //     };
      //   });

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
      const statusCode = error.statusCode ? error.statusCode : 400;
      res.status(statusCode).json({ error: true, message: error.message });
    }
  }
);

router.get("/data/:imdbID", validateQuery(), async (req, res, next) => {
  try {
    const { imdbID } = req.params;

    // Check if title exists
    if (!imdbID) {
      throw {
        statusCode: 400,
        message: "An imdbID parameter is required",
      };
    }

    const movieInfoQuery = async (imdbID, req) => {
      const movieInfo = await req.db
        .from("basics")
        .select("*")
        .where("tconst", imdbID);

      if (movieInfo.length === 0) {
        throw {
          statusCode: 400,
          message: "imdbID not found in the database",
        };
      }

      const movie = movieInfo[0];
      const result = {
        Title: movie.primaryTitle,
        Year: movie.startYear,
        Runtime: `${movie.runtimeMinutes} min`,
        Genre: movie.genres,
      };

      return result;
    };

    const movieCrewQuery = async (imdbID, req) => {
      const movieCrew = await req.db
        .from("principals")
        .where("tconst", imdbID)
        .whereIn("category", ["writer", "director", "actor", "actress"])
        .innerJoin("names", "principals.nconst", "=", "names.nconst");

      const result = movieCrew.reduce(
        (crewObject, person) => {
          const { category, primaryName } = person;

          if (category === "director") {
            crewObject.Director = crewObject.Director
              ? `${crewObject.Director}, ${primaryName}`
              : primaryName;
          } else if (category === "writer") {
            crewObject.Writer = crewObject.Writer
              ? `${crewObject.Writer}, ${primaryName}`
              : primaryName;
          } else if (category === "actor" || category === "actress") {
            crewObject.Actors = crewObject.Actors
              ? `${crewObject.Actors}, ${primaryName}`
              : primaryName;
          }

          return crewObject;
        },
        { Director: null, Writer: null, Actors: null }
      );

      return result;
    };

    const movieRatingQuery = async (imdbID, req) => {
      const movieRating = await req.db
        .from("ratings")
        .select("*")
        .where("tconst", imdbID);

      const rating = movieRating[0].averageRating;

      return {
        Ratings: [
          {
            Source: "Internet Movie Database",
            Value: `${rating}/10`,
          },
        ],
      };
    };

    const movieInfoResult = await movieInfoQuery(imdbID, req);
    const movieCrewResult = await movieCrewQuery(imdbID, req);
    const movieRatingResult = await movieRatingQuery(imdbID, req);

    const data = [
      { ...movieInfoResult, ...movieCrewResult, ...movieRatingResult },
    ];

    res.json(data);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
