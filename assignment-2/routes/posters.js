const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/:imdbID", async (req, res, next) => {
  try {
    const imdbID = req.params.imdbID;

    const posters = await req.body
      .from("user_images")
      .select("*")
      .where("tconst", imdbID);

    // Use auth to determine user's id from 'users' database
    // .where('email' from 'users' matches 'userID' in 'user_images')
  } catch (error) {
    res.json({ message: "image not found" });
  }
});

router.post("/add/:imdbID", upload.single("image"), async (req, res, next) => {
  try {
    const { imdbID } = req.params;
    console.log(req.file);

    await req.db("images").insert({
      tconst: imdbID,
      image: req.file.buffer,
    });

    res.json({ message: `${imdbID}: Image uploaded successfully!` });
  } catch (error) {
    console.log(console.error(error));
    res.status(400).json({ message: "error from post request" });
  }
});

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
