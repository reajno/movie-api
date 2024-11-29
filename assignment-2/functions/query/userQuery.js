module.exports = async (req, email) => {
  return await req.db.from("users").select("*").where("email", email);
};
