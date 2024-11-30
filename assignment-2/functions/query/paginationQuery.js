module.exports = async (req, title, year, currentPage, perPage) => {
  const countTotal = await req.db
    .from("basics")
    .where("primaryTitle", "like", `%${title}%`)
    .modify((initQuery) => {
      if (year) initQuery.andWhere("startYear", year);
    })
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

  if (currentPage > 1) {
    const { total, lastPage, ...pageResult } = result;
    return pageResult;
  }

  return result;
};
