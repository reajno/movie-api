const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const authorization = require("../middleware/authorization");
const imageQuery = require("../functions/query/imageQuery");
const imagePostQuery = require("../functions/query/imagePostQuery");
const throwError = require("../functions/utils/throwError");
const handleError = require("../functions/utils/handleError");
const validateIDParam = require("../middleware/validateIDParam");
const validateQuery = require("../middleware/validateQuery");

const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/:imdbID",
  authorization,
  validateIDParam,
  validateQuery(),
  async (req, res, next) => {
    const { imdbID } = req.params;
    const { email } = req.user;

    try {
      const posterResult = await imageQuery(req, email, imdbID);

      if (posterResult.length === 0) {
        throwError(500, "Requested image is not found");
      }

      const poster = posterResult[0].image;

      // // define path for file upload
      const savePath = path.join(process.cwd(), "uploads", `${imdbID}.png`);

      // // save file to path
      await fs.writeFile(savePath, poster);

      res.set({
        "Content-Type": "image/png",

        // Trigger "Save As" dialog in browser
        "Content-Disposition": `attachment; filename="${imdbID}.png"`,
      });

      // Show image
      res.sendFile(savePath);
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
    const { email } = req.user;

    try {
      if (!req.file) {
        throwError(400, "File is missing from the request");
      }

      // Get image buffer and file type from request
      const { buffer, mimetype } = req.file;

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
