module.exports = async (req, imdbID) => {
  const movieInfo = await req.db
    .from("basics")
    .select("*")
    .where("tconst", imdbID);

  const movie = movieInfo[0];
  const result = {
    Title: movie.primaryTitle,
    Year: movie.startYear,
    Runtime: `${movie.runtimeMinutes} min`,
    Genre: movie.genres,
  };

  return result;
};
