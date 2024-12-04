const throwError = require("../utils/throwError");

module.exports = async (req, email, imdbID, buffer) => {
  try {
    await req.db.from("user_images").insert({
      email: email,
      tconst: imdbID,
      image: buffer,
    });
  } catch (error) {
    // Check if image already exists in DB
    if (error.code === "ER_DUP_ENTRY") {
      // Throw custom message
      throwError(409, "Duplicate Entry. Poster already exists.");
    } else {
      // Throw custom message
      throwError(500, "Database operation failed. Image not uploaded");
    }
  }
};
