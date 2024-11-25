const express = require("express");
const router = express.Router();

router.get("/search", async (req, res, next) => {
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

    const paginationQuery = await req.db
      .from("basics")
      .where("primaryTitle", "like", `%${title}%`)
      .modify((initQuery) => {
        if (year) initQuery.andWhere("startYear", year);
      })
      .count("* as total")
      .then((countTotal) => {
        const total = countTotal[0].total;
        const lastPage = Math.ceil(total / perPage);

        const result = {
          pagination: {
            total: total,
            lastPage: lastPage,
            perPage: perPage,
            currentPage: currentPage,
            from: (currentPage - 1) * perPage,
            to: currentPage * perPage > total ? total : currentPage * perPage,
          },
        };

        if (currentPage > 1) {
          delete result.pagination.total;
          delete result.pagination.lastPage;
        }

        return result;
      });

    const moviesQuery = await req.db
      .from("basics")
      .select("*")
      .where("primaryTitle", "like", `%${title}%`)
      .modify((query) => {
        if (year) query.andWhere("startYear", year);
      })
      .limit(perPage)
      .modify((query) => {
        if (page) query.offset(offset);
      })
      .then((rows) => {
        const transformedRows = rows.map((row) => {
          return {
            Title: row.primaryTitle,
            Year: row.startYear,
            imdbID: row.tconst,
            Type: row.titleType,
          };
        });

        return transformedRows;
      })
      .catch((error) => {
        throw {
          message: "Error in MySQL query: " + error.message,
        };
      });

    res.json({
      data: moviesQuery,
      pagination: paginationQuery,
    });
  } catch (error) {
    const statusCode = error.statusCode ? error.statusCode : 400;
    res.status(statusCode).json({ error: true, message: error.message });
  }
});

router.get("/data/:imdbID", async (req, res, next) => {
  try {
    const { imdbID } = req.params;

    const movieInfo = await req.db
      .from("basics")
      .select("*")
      .where("tconst", imdbID)
      .then((rows) => {
        const movie = rows[0];
        return {
          Title: movie.primaryTitle,
          Year: movie.startYear,
          Runtime: movie.runtimeMinutes,
          Genre: movie.genres,
        };
      });

    const movieCrew = await req.db
      .from("principals")
      .where("tconst", imdbID)
      .whereIn("category", ["writer", "director", "actor", "actress"])
      .innerJoin("names", "principals.nconst", "=", "names.nconst")
      .then((rows) => {
        const transformedCrew = rows.reduce(
          (result, row) => {
            const { category, primaryName } = row;

            if (category === "director") {
              result.Director = result.Director
                ? `${result.Director}, ${primaryName}`
                : primaryName;
            } else if (category === "writer") {
              result.Writer = result.Writer
                ? `${result.Writer}, ${primaryName}`
                : primaryName;
            } else if (category === "actor" || category === "actress") {
              result.Actors = result.Actors
                ? `${result.Actors}, ${primaryName}`
                : primaryName;
            }

            return result;
          },
          { Director: null, Writer: null, Actors: null }
        );

        return transformedCrew;
      });

    const movieRating = await req.db
      .from("ratings")
      .select("*")
      .where("tconst", imdbID)
      .then((rows) => {
        const rating = rows[0].averageRating;

        return {
          Ratings: [
            {
              Source: "Internet Movie Database",
              Value: `${rating}/10`,
            },
          ],
        };
      });

    const data = [{ ...movieInfo, ...movieCrew, ...movieRating }];

    res.json(data);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
