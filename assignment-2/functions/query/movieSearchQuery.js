module.exports = async (req, title, year, page, perPage, offset) => {
  const movies = await req.db
    .from("basics")
    .select("*")
    // "title" string to match anywhere within "primaryTitle"
    .where("primaryTitle", "like", `%${title}%`)
    // Add year query if "year" is provided
    .modify((query) => {
      if (year) query.andWhere("startYear", year);
    })
    // Limit to 100 results
    .limit(perPage)
    // Add offset if "page" is provided
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
