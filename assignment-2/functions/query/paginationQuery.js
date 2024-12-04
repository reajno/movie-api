module.exports = async (req, title, year, currentPage, perPage) => {
  const countTotal = await req.db
    .from("basics")
    // "title" string to match anywhere within "primaryTitle"
    .where("primaryTitle", "like", `%${title}%`)
    // Add year query if "year" is provided
    .modify((query) => {
      if (year) query.andWhere("startYear", year);
    })
    // Return total amount of rows
    .count("* as total");

  const total = countTotal[0].total;
  const lastPage = Math.ceil(total / perPage);

  const result = {
    total: total,
    lastPage: lastPage,
    perPage: perPage,
    currentPage: currentPage,
    from: (currentPage - 1) * perPage,
    to: currentPage * perPage > total ? total : currentPage * perPage,
  };

  // Return modified result if page is not the first page
  if (currentPage > 1) {
    const { total, lastPage, ...pageResult } = result;
    return pageResult;
  }

  return result;
};
