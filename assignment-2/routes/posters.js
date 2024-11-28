const express = require("express");
const router = express.Router();
const multer = require("multer");
const authorization = require("../middleware/authorization");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/:imdbID", authorization, async (req, res, next) => {
  try {
    const { imdbID } = req.params;
    const { email } = req.user;

    const imageQuery = async (req, email, imdbID) => {
      const poster = await req.db
        .from("user_images")
        .where("email", email)
        .andWhere("tconst", imdbID)
        .limit(1);

      if (poster.length === 0) {
        throw {
          statusCode: 404,
          message: "Image not found",
        };
      }

      return poster[0].image;
    };

    const posterResult = await imageQuery(req, email, imdbID);

    res.set("Content-Type", "image/png");
    res.send(posterResult);

    // Use auth to determine user's id from 'users' database
    // .where('email' from 'users' matches 'userID' in 'user_images')
  } catch (error) {
    res.json({ message: "image not found" });
  }
});

router.post(
  "/add/:imdbID",
  authorization,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { imdbID } = req.params;
      const { email } = req.user;
      const { buffer, mimetype } = req.file;

      if (!imdbID) {
        throw {
          message: "You must supply an imdbID!",
        };
      }

      if (req.params.length > 1) {
        throw {
          message:
            "Invalid query parameters. Query parameters are not permitted",
        };
      }

      if (mimetype !== "image/png") {
        throw {
          message: "Image must be a PNG file",
        };
      }


      // ENHANCE ERROR HANDLING
      const imagePostQuery = async (req, email, imdbID, buffer) => {
        try {
          await req.db.from("user_images").insert({
            email: email,
            tconst: imdbID,
            image: buffer,
          });
        } catch (error) {
          if (error.code === "ER_DUP_ENTRY") {
            throw {
              statusCode: 409,
              message: `Duplicate Entry. Poster already exists. ${error.message}`,
            };
          } else {
            throw {
              statusCode: 500,
              message: `Database operation failed: ${error.message}`,
            };
          }
        }
      };

      await imagePostQuery(req, email, imdbID, buffer);

      res.status(201).json({
        error: false,
        message: "Poster Uploaded Successfully",
      });
    } catch (error) {
      const statusCode = error.statusCode ? error.statusCode : 400;
      res.status(statusCode).json({ error: true, message: error.message });
    }
  }
);

module.exports = router;

// Store a Blob in the Database:

//     Read a file into a Buffer.
//     Insert the binary data into the database using the BLOB data type.

// const fs = require("fs");
// const knex = require("knex")({
//   client: "mysql",
//   connection: { /* Your DB config */ },
// });

// const imageBuffer = fs.readFileSync("example.jpg");
// knex("Images").insert({ name: "example", image: imageBuffer });

// Retrieve a Blob:

//     Query the database and receive the binary data as a Buffer.
//     Write the buffer back to a file or send it in a response.

// const image = await knex("Images").where({ name: "example" }).first();
// fs.writeFileSync("output.jpg", image.image); // Save the BLOB to a file
