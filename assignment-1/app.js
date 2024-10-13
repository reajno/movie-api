import http from "http";
import dotenv from "dotenv";
dotenv.config();

const SWAGGER_BASE_URL = process.env.SWAGGER_API_BASE;
const OMDB_BASE_URL = process.env.OMDB_API_BASE;
const OMDB_KEY = process.env.OMDB_API_KEY;
const RAPID_BASE_URL = process.env.RAPID_API_BASE;
const RAPID_KEY = process.env.RAPID_API_KEY;

const getMoviesList = async (res, movieTitle) => {
  try {
    if (!movieTitle) {
      // Throw error for no title
      throw {
        statusCode: 400,
        message: "You must supply a title!",
      };
    }

    const moviesResponse = await fetch(
      `${SWAGGER_BASE_URL}/movies/search/${movieTitle}`
    );

    if (!moviesResponse.ok) {
      //  Throw error for fetch failure
      throw {
        statusCode: 500,
        message: "The remote detail server returned an invalid response",
      };
    }

    const data = await moviesResponse.json();

    if (data.Response === "False") {
      throw {
        statusCode: 400,
        message: data.Error,
        // new Error(data.Error );
      };
    } else {
      const mappedData = data.Search.map((movie) => {
        const { Title, Year, imdbID, Poster } = movie;

        return {
          Title,
          Year,
          imdbID,
          Poster,
        };
      });

      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.write(JSON.stringify({ Movies: mappedData }));
      res.end();
    }
  } catch (error) {
    // Default to 500
    const statusCode = error.statusCode || 500;
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(
      JSON.stringify({
        error: true,
        message: error.message || "An internal server error occurred",
      })
    );
    res.end();
  }
};

const getStreamingData = async (res, id) => {
  try {
    const rapidResponse = await fetch(`${RAPID_BASE_URL}/${id}`, {
      headers: {
        "X-RapidAPI-Key": RAPID_KEY,
      },
    });
    const rapidData = await rapidResponse.json();
    return { streamingInfo: rapidData.streamingOptions.au };
  } catch (error) {}

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.write(
    JSON.stringify({ streamingOptions: rapidData.streamingOptions.au })
  );
  res.end();
};

const getMovieData = async (res, id) => {
  try {
    if (!id) {
      throw {
        statusCode: 400,
        message: "You must supply an imdbID!",
      };
    }

    const omdbResponse = await fetch(
      `${OMDB_BASE_URL}/?apikey=${OMDB_KEY}&i=${id}`
    );

    const swaggerResponse = await fetch(
      `${SWAGGER_BASE_URL}/movies/data/${id}`
    );

    if (!omdbResponse.ok) {
      throw {
        statusCode: 500,
        message: "The remote detail server returned an invalid response",
      };
    }

    const omdbData = await omdbResponse.json();
    const swaggerData = await swaggerResponse.json();
    // handle data.Response = 'False'
    const { Title, Year, Director, Actors, Plot, Genre, Poster, Ratings } =
      omdbData;

    const movieDetails = {
      Title,
      Year,
      Director,
      Actors,
      Plot,
      Genre,
      Poster,
      Ratings,
    };

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(JSON.stringify(swaggerData));
    res.end();
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(
      JSON.stringify({
        error: true,
        message: error.message || "An internal server error occurred",
      })
    );
    res.end();
  }
};

const routing = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url.startsWith("/movies") && url.includes("/search")) {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const movieTitle = reqUrl.searchParams.get("movie");
    getMoviesList(res, movieTitle);
  } else if (url.startsWith("/movies") && url.includes("/data")) {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const movieID = reqUrl.searchParams.get("id");
    getMovieData(res, movieID);
    // getStreamingData(res, movieID);
  } else {
    res.write("No matching page");
    res.end();
  }
};

http.createServer(routing).listen(3000, () => {
  console.log("Server start at port 3000");
});
