module.exports = async (req, imdbID) => {
  const movieRating = await req.db
    .from("ratings")
    .select("*")
    .where("tconst", imdbID);

  const rating = movieRating[0].averageRating;

  return {
    Ratings: [
      {
        Source: "Internet Movie Database",
        Value: `${rating}/10`,
      },
    ],
  };
};
