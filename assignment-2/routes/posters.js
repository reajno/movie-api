const express = require("express");
const router = express.Router();
const multer = require("multer");
const authorization = require("../middleware/authorization");
const imageQuery = require("../functions/query/imageQuery");
const imagePostQuery = require("../functions/query/imagePostQuery");
const throwError = require("../functions/utils/throwError");
const handleError = require("../functions/utils/handleError");
const validateIDParam = require("../middleware/validateIDParam");
const validateQuery = require("../middleware/validateQuery");

const upload = multer({
  storage: multer.memoryStorage(),
});

router.get(
  "/:imdbID",
  authorization,
  validateIDParam,
  validateQuery(),
  async (req, res, next) => {
    const { imdbID } = req.params;
    // Extract authenticated user's email
    // (populated by "authorization" middleware)
    const { email } = req.user;

    try {
      // Return image
      const posterResult = await imageQuery(req, email, imdbID);

      // Check if image is found
      if (posterResult.length === 0) {
        throwError(500, "Requested image is not found");
      }

      const poster = posterResult[0].image;
      res.set({
        "Content-Type": "image/png",
        // Trigger "Save As" dialog in browser
        "Content-Disposition": `attachment; filename="${imdbID}.png"`,
      });
      // Show image
      res.send(poster);
    } catch (error) {
      handleError(res, error);
    }
  }
);

router.post(
  "/add/:imdbID",
  authorization,
  validateIDParam,
  validateQuery(),
  upload.single("image"),
  async (req, res, next) => {
    const { imdbID } = req.params;
    // Extract authenticated user's email
    // (populated by "authorization" middleware)
    const { email } = req.user;

    try {
      // Check if file is added to request body
      if (!req.file) {
        throwError(400, "File is missing from the request");
      }

      // Get image buffer and file type from request
      const { buffer, mimetype } = req.file;

      // Check if file type is PNG
      if (mimetype !== "image/png") {
        throwError(400, "Image must be a PNG file");
      }

      // Post image to DB
      await imagePostQuery(req, email, imdbID, buffer);

      res.status(201).json({
        error: false,
        message: "Poster Uploaded Successfully",
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

module.exports = router;
