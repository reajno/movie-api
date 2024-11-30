module.exports = async (req, email, imdbID) => {
  const posterData = await req.db
    .from("user_images")
    .where("email", email)
    .andWhere("tconst", imdbID)
    .limit(1);

  return posterData;
};
