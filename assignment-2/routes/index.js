var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/movies/search", async (req, res, next) => {
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

router.get("/movies/data/:imdbID", async (req, res, next) => {
  try {
    const result = await req.db
      .from("basic")
      .select("*")
      .where("tconst", req.params.imdbID)
      .then((rows) => {

      })
      
  } catch (error) {}
});

module.exports = router;



// [
//   {
//     "Title": "Cowboys & Aliens",
//     "Year": "2011",
//     "Runtime": "119 min",
//     "Genre": "Action,Sci-Fi,Thriller",
//     "Director": "Jon Favreau",
//     "Writer": "Hawk Ostby,Roberto Orci,Alex Kurtzman,Damon Lindelof,Mark Fergus",
//     "Actors": "Daniel Craig,Harrison Ford",
//     "Ratings": [
//       {
//         "Source": "Internet Movie Database",
//         "Value": "6.0/10"
//       }
//     ]
//   }
// ]

////////////////////
// from "basics" table
////////////////////
// primaryTitle
// startYear
// runtimeMinutes
// genres
////////////////////
// from "principals" table
////////////////////
// director
// writer
// actor
////////////////////
// from "names" table
////////////////////
// primaryName