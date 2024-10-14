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
      `${OMDB_BASE_URL}/?apikey=${OMDB_KEY}&s=${movieTitle}`
    );

    // if (!moviesResponse.ok) {
    //   //  Throw error for fetch failure
    //   throw {
    //     statusCode: 500,
    //     message: "The remote detail server returned an invalid response",
    //   };
    // }

    const data = await moviesResponse.json();

    if (data.Response === "False") {
      throw {
        statusCode: 400,
        message: data.Error,
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
      res.write(JSON.stringify({ search: data.Search }));
      // res.write(JSON.stringify({ Movies: mappedData }));
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
        message:
          error.message ||
          "The remote detail server returned an invalid response",
      })
    );
    res.end();
  }
};

const getStreamingData = async (id) => {
  try {
    const rapidResponse = await fetch(`${RAPID_BASE_URL}/${id}`, {
      headers: {
        "X-RapidAPI-Key": RAPID_KEY,
      },
    });

    if (rapidResponse.status === 404) {
      throw {
        statusCode: 400,
        message: "Incorrect IMDb ID.",
      };
    }

    // if (!rapidResponse.ok) {
    //   console.log(rapidResponse);
    //   throw {
    //     statusCode: 500,
    //     message: "The remote streaming server returned an invalid response",
    //   };
    // }

    const data = await rapidResponse.json();

    return { streamingInfo: data.streamingOptions.au };
  } catch (error) {
    throw error;
  }
};

const getDetailData = async (id) => {
  try {
    const omdbResponse = await fetch(
      `${OMDB_BASE_URL}/?apikey=${OMDB_KEY}&i=${id}`
    );

    const omdbData = await omdbResponse.json();

    if (omdbData.Response === "False") {
      throw {
        statusCode: 400,
        message: omdbData.Error,
      };
    }
    //////////////////////////////////////
    // const { Title, Year, Director, Actors, Plot, Genre, Poster, Ratings } =
    //   omdbData;

    // const movieDetails = {
    //   Title,
    //   Year,
    //   Director,
    //   Actors,
    //   Plot,
    //   Genre,
    //   Poster,
    //   Ratings,
    // };
    return { details: omdbData };
  } catch (error) {
    throw error;
  }
};

const getCombinedMovieData = async (res, id) => {
  try {
    if (!id) {
      throw {
        statusCode: 400,
        message: "You must supply an imdbID!",
      };
    }
    const movieDetails = await getDetailData(id);
    const movieStreaming = await getStreamingData(id);

    const result = { ...movieDetails, ...movieStreaming };

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(JSON.stringify(result));
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
        message:
          error.message || "The remote server returned an invalid response",
      })
    );
    res.end();
  }
};

const getMoviePoster = async (res, id) => {
  try {
    const omdbResponse = await fetch(
      `${OMDB_BASE_URL}/?apikey=${OMDB_KEY}&i=${id}`
    );
    const omdbData = await omdbResponse.json();
    const poster = omdbData.Poster;

    const imageRes = await fetch(poster);

    const arrayBuffer = await imageRes.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);
    // Set response headers for the image
    res.writeHead(200, {
      "Content-Type": imageRes.headers.get("content-type") || "image/jpeg", // Set content type based on the image response
      "Access-Control-Allow-Origin": "*",
    });

    res.end(buffer);
  } catch (error) {
    console.log(error);
  }
};

const routing = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url.startsWith("/movies") && url.includes("/search")) {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const movieTitle = reqUrl.searchParams.get("movie");
    getMoviesList(res, movieTitle);
  } else if (url.startsWith("/movies") && url.includes("/data?id=")) {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const movieID = reqUrl.searchParams.get("id");
    getCombinedMovieData(res, movieID);
  } else if (url.startsWith("/posters")) {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const movieID = reqUrl.searchParams.get("id");
    getMoviePoster(res, movieID);
    // } else if (url.startsWith("/posters") && url.includes("/add")) {
    //   addMoviePoster();
  } else {
    res.write("No matching page");
    res.end();
  }
};

http.createServer(routing).listen(3000, () => {
  console.log("Server start at port 3000");
});
