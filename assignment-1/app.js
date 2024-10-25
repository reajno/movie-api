import http from "http";
import { promises as fs } from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// must be available in .env file
const OMDB_KEY = process.env.OMDB_API_KEY;
const RAPID_KEY = process.env.RAPID_API_KEY;

// default client origin set from cli command (npm run client)
const allowedOrigin = "http://localhost:3000";

const getMoviesList = async (res, movieTitle) => {
  try {
    // throw error if no title
    if (!movieTitle) {
      throw {
        statusCode: 400,
        message: "You must supply a title!",
      };
    }

    const response = await fetch(
      `http://www.omdbapi.com/?apikey=${OMDB_KEY}&s=${movieTitle}`
    );

    const data = await response.json();

    // handle invalid 200 response (E.G. API response below is status 200)
    //   {
    //     "details": {
    //         "Response": "False",
    //         "Error": "Incorrect IMDb ID."
    //     }
    // }
    if (data.Response === "False") {
      throw {
        statusCode: 500,
        message: "The remote detail server returned an invalid response",
      };
    } else {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowedOrigin,
      });
      res.write(JSON.stringify(data));
      res.end();
    }
  } catch (error) {
    const statusCode = error.statusCode;
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
    });
    res.write(
      JSON.stringify({
        error: true,
        message: error.message,
      })
    );
    res.end();
  }
};

const getStreamingData = async (id) => {
  try {
    const response = await fetch(
      `https://streaming-availability.p.rapidapi.com/shows/${id}`,
      {
        headers: {
          "X-RapidAPI-Key": RAPID_KEY,
        },
      }
    );

    // throw all error response codes to catch block (status 500)
    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();

    // return JSON response to be combined
    return { streamingInfo: data.streamingOptions.au };
  } catch (error) {
    throw {
      statusCode: 500,
      message: "The remote streaming server returned an invalid response",
    };
  }
};

const getMovieData = async (id) => {
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${id}`
    );

    // throw all error response codes to catch block (status 500)
    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();

    // handle invalid 200 response (E.G. API response below is status 200)
    //   {
    //     "details": {
    //         "Response": "False",
    //         "Error": "Incorrect IMDb ID."
    //     }
    // }
    if (data.Response === "False") {
      throw new Error();
    }
    // return JSON response to be combined
    return { details: data };
  } catch (error) {
    throw {
      statusCode: 500,
      message: "The remote detail server returned an invalid response",
    };
  }
};

const getCombinedMovieData = async (res, id) => {
  try {
    // status 400 error is handled here
    // throw error if no id
    if (!id) {
      throw {
        statusCode: 400,
        message: "You must supply an imdbID!",
      };
    }

    const movieDetails = await getMovieData(id);
    const movieStreaming = await getStreamingData(id);

    // combine API fetch call responses
    const result = {
      ...movieDetails,
      ...movieStreaming,
    };

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
    });
    res.write(JSON.stringify(result));
    res.end();
  } catch (error) {
    const statusCode = error.statusCode;
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
    });
    res.write(
      JSON.stringify({
        error: true,
        message: error.message,
      })
    );
    res.end();
  }
};

const getMoviePoster = async (res, id) => {
  try {
    // throw error if no id
    if (!id) {
      throw {
        statusCode: 400,
        message: "You must supply an imdbID!",
      };
    }

    // define filename as IMDb ID
    const filename = `${id}.png`;

    // define file path to check
    const filepath = path.join(process.cwd(), "uploads", filename);

    // read from designated file path
    const img = await fs.readFile(filepath);

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Access-Control-Allow-Origin": allowedOrigin,
    });
    res.end(img);
  } catch (error) {
    const statusCode = error.code === "ENOENT" ? 500 : error.statusCode;
    res.writeHead(statusCode, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
    });
    res.write(
      JSON.stringify({
        error: true,
        message: error.message,
      })
    );
    res.end();
  }
};

const addMoviePoster = async (req, res, movieID) => {
  try {
    // throw error if no id
    if (!movieID) {
      throw {
        message: "You must supply an imdbID!",
      };
    }

    // define content type from request header
    const contentType = req.headers["content-type"];

    // throw error if file type is not .png
    if (contentType !== "image/png") {
      throw {
        message: "A filetype other than png has been provided.",
      };
    }

    let body = [];

    // collect transmitted chunk data
    req.on("data", (chunk) => {
      body.push(chunk);
    });

    // process data once fully received
    req.on("end", async () => {
      try {
        // create buffer from received data
        const buffer = Buffer.concat(body);

        // define new name for uploaded file to be saved
        const filename = `${movieID}.png`;

        // define path for file upload
        const savePath = path.join(process.cwd(), "uploads", filename);

        // save file to path
        await fs.writeFile(savePath, buffer);

        res.writeHead(200, {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Content-Type": "application/json",
        });
        res.end(
          JSON.stringify({
            error: false,
            message: "Poster Uploaded Successfully",
          })
        );
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": allowedOrigin,
        });
        res.write(
          JSON.stringify({
            error: true,
            message: error.message,
          })
        );
        res.end();
      }
    });
  } catch (error) {
    // all error status codes predetermined as 400
    res.writeHead(400, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
    });
    res.end(
      JSON.stringify({
        error: true,
        message: error.message,
      })
    );
  }
};

const routing = (req, res) => {
  // create URL object
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = reqUrl.pathname;
  const method = req.method;

  // set headers
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (path.startsWith("/movies/search") && method === "GET") {
    // get searched input from request URL
    const movieTitle = path.replace("/movies/search/", "");
    getMoviesList(res, movieTitle);
  } else if (path.startsWith("/movies/data") && method === "GET") {
    // get imdbID from request URL
    const movieID = path.replace("/movies/data/", "");
    getCombinedMovieData(res, movieID);
  } else if (path.startsWith("/posters") && method === "GET") {
    // get imdbID from request URL
    const movieID = path.replace("/posters/", "");
    getMoviePoster(res, movieID);
  } else if (path.startsWith("/posters/add") && method === "POST") {
    // get imdbID from request URL
    const movieID = path.replace("/posters/add/", "");
    addMoviePoster(req, res, movieID);
  } else {
    res.write("No matching page");
    res.end();
  }
};

http.createServer(routing).listen(5000, () => {
  console.log("Server start at port 5000");
});
