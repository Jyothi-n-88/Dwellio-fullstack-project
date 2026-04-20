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
const PORT = process.env.PORT || 8080;
const ExpressError=require("./utils/expressError.js");
const listingrouter=require("./routes/listings.js")
const reviewrouter=require("./routes/reviews.js")
const session = require('express-session');
const MongoStore = require("connect-mongo").default;
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const signuprouter = require("./routes/signup");
const loginrouter = require("./routes/login");
const multer = require("multer");
const { storage } = require("./cloudConfig");
const upload = multer({ storage });
app.locals.mapToken = process.env.MAP_TOKEN;
const userrouter = require("./routes/users");
const reservationRoutes = require("./routes/reservation");
const dburl=process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dburl);
}

main()
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const store =MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter: 24 * 3600 
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});
const sessionOptions={
   store,
  secret:  process.env.SECRET,
  resave: false,
  saveUninitialized: true,
 cookie:{
  expires:Date.now()+7*24*60*60*1000,
  maxAge:7*24*60*60*1000,
  httpOnly:true
 }};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(async (req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  if (req.user) {
    const user = await User.findById(req.user._id);
    res.locals.currentUser = user;
  } else {
    res.locals.currentUser = null;
  }

  next();
});
app.use("/listings",listingrouter);
app.use("/listings/:id/reviews",reviewrouter);
app.use(signuprouter);
app.use(loginrouter);
app.use("/", userrouter);
app.use("/reservations", reservationRoutes);
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