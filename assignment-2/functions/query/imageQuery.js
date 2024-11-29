module.exports = async (req, email, imdbID) => {
  const poster = await req.db
    .from("user_images")
    .where("email", email)
    .andWhere("tconst", imdbID)
    .limit(1);

  if (poster.length === 0) {
    throw {
      statusCode: 500,
      message: "Requested image is not found",
    };
  }

  return poster[0].image;
};
