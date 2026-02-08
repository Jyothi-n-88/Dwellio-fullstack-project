const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const app = express();
const ejsMate=require("ejs-mate");
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 8080;
const ExpressError=require("./utils/expressError.js");
const listingrouter=require("./routes/listings.js")
const reviewrouter=require("./routes/reviews.js")

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.use("/listings",listingrouter);
app.use("/listings/:id/reviews",reviewrouter);

app.use( (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
