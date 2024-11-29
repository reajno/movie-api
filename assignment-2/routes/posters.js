const express = require("express");
const router = express.Router();
const multer = require("multer");
const authorization = require("../middleware/authorization");
const validateQuery = require("../middleware/validateQuery");
const imageQuery = require("../functions/query/imageQuery");
const imagePostQuery = require("../functions/query/imagePostQuery");

const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/:imdbID",
  validateQuery(),
  authorization,
  async (req, res, next) => {
    try {
      const { imdbID } = req.params;
      const { email } = req.user;

      const posterResult = await imageQuery(req, email, imdbID);

      res.set({
        "Content-Type": "image/png",

        // Trigger "Save As" dialog in browser
        "Content-Disposition": `attachment; filename="${imdbID}.png"`,
      });
      // Show image
      res.send(posterResult);
    } catch (error) {
      const statusCode = error.statusCode ? error.statusCode : 400;
      res.status(statusCode).json({ error: true, message: error.message });
    }
  }
);

router.post(
  "/add/:imdbID",
  validateQuery(),
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

      if (mimetype !== "image/png") {
        throw {
          message: "Image must be a PNG file",
        };
      }

      

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
