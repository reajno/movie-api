import http from "http";
import dotenv from "dotenv";
import { promises as fs } from "fs";
dotenv.config();

// const SWAGGER_BASE_URL = process.env.SWAGGER_API_BASE;
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

    const data = await moviesResponse.json();

    if (data.Response === "False") {
      throw {
        statusCode: 400,
        message: data.Error,
      };
    } else {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.write(JSON.stringify(data));
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

const getMovieData = async (id) => {
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
    // LIMIT CALLS FOR MOVIE STREAMING
    const movieDetails = await getMovieData(id);
    // const movieStreaming = await getStreamingData(id);

    const result = {
      ...movieDetails,
      // ...movieStreaming,
    };

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
    if (!id) {
      throw {
        statusCode: 400,
        message: "You must supply an imdbID!",
      };
    }

    const fileName = `${id}.png`;

    const img = await fs.readFile(fileName, "binary");

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(img, "binary");
    res.end();
  } catch (error) {
    const statusCode = error.code === "ENOENT" ? 500 : error.statusCode;
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

const addMoviePoster = async (req, res, id) => {
  const path = `./${id}.png`;
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    const parsedData = JSON.parse(body);
    const params = new URLSearchParams(body);

    const fileData = parsedData.file;

    fs.writeFile(path, fileData, { encoding: "base64" }, (err) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: true, message: "Failed to save poster." })
        );
        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
      });
      res.end(
        JSON.stringify({
          error: false,
          message: "Poster UPloaded Successfully",
        })
      );
    });
  });
};

const routing = (req, res) => {
  // Create URL object, more workable
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = reqUrl.pathname;
  const method = req.method;

  if (path.startsWith("/movies/search") && method == "GET") {
    const movieTitle = path.replace("/movies/search/", "");
    getMoviesList(res, movieTitle);
  } else if (path.startsWith("/movies/data") && method == "GET") {
    // const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    // const path = reqUrl.pathname;
    const movieID = path.replace("/movies/data/", "");
    getCombinedMovieData(res, movieID);
  } else if (path.startsWith("/posters") && method == "GET") {
    // const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    // const path = reqUrl.pathname;
    const movieID = path.replace("/posters/", "");
    getMoviePoster(res, movieID);
  } else if (path.startsWith("/posters/add") && method == "POST") {
    addMoviePoster(res, movieID);
  } else {
    res.write("No matching page");
    res.end();
  }
};

http.createServer(routing).listen(3000, () => {
  console.log("Server start at port 3000");
});
