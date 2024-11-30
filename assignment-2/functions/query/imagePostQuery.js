module.exports = async (req, email, imdbID, buffer) => {
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
        message: "Duplicate Entry. Poster already exists.",
      };
    } else {
      throw {
        statusCode: 500,
        message: "Database operation failed. Image not uploaded",
      };
    }
  }
};
