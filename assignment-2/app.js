require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const options = require("./knexfile");
const knex = require("knex")(options);
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); //

app.use(function (req, res, next) {
  req.db = knex;
  next();
});

app.use("/", require("./routes/index"));
app.use("/user", require("./routes/user"));
app.use("/movies", require("./routes/movies"));
app.use("/posters", require("./routes/posters"));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
