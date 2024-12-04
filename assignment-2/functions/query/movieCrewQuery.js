module.exports = async (req, imdbID) => {
  const crewData = await req.db
    .from("principals")
    .where("tconst", imdbID)
    .whereIn("category", ["writer", "director", "actor", "actress"])
    .innerJoin("names", "principals.nconst", "=", "names.nconst");

  const result = crewData.reduce(
    (crew, person) => {
      // Extract crew title and name
      const { category, primaryName } = person;

      if (category === "director") {
        crew.Director = crew.Director
          ? `${crew.Director}, ${primaryName}`
          : primaryName;
      } else if (category === "writer") {
        crew.Writer = crew.Writer
          ? `${crew.Writer}, ${primaryName}`
          : primaryName;
      } else if (category === "actor" || category === "actress") {
        crew.Actors = crew.Actors
          ? `${crew.Actors}, ${primaryName}`
          : primaryName;
      }

      // Return accumulated result
      return crew;
    },
    // Initial value of "crew"
    { Director: null, Writer: null, Actors: null }
  );

  return result;
};
