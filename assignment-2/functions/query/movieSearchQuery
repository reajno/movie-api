module.exports = async (req, title, year, page, perPage, offset) => {
  const movies = await req.db
    .from("basics")
    .select("*")
    .where("primaryTitle", "like", `%${title}%`)
    .modify((query) => {
      if (year) query.andWhere("startYear", year);
    })
    .limit(perPage)
    .modify((query) => {
      if (page) query.offset(offset);
    });

  const result = movies.map((movie) => {
    return {
      Title: movie.primaryTitle,
      Year: movie.startYear,
      imdbID: movie.tconst,
      Type: movie.titleType,
    };
  });

  return result;
};
