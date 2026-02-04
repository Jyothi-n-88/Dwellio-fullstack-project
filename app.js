const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Listing=require("./models/listing.js");
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
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/expressError.js");

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
// app.get("/testingModel",async(req,res)=>
// {
//   let sampleListing=new Listing({
//     title:"Villa in Mysore",
//     description:"Casa Luxora 2BHK|Premium|Ideal",
//     price:1800,
//     location:"Mysore Circle",
//     country:"India",
//     image:""
//   });
//   await sampleListing.save();
//   console.log(sampleListing);
//   res.send("Successful Test");
// });
app.get("/listings",wrapAsync( async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", wrapAsync(async(req, res) => {
  res.render("listings/new.ejs");
}));

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings", wrapAsync(async (req, res) => {
  if(!req.body.listing)
  {
    throw new ExpressError(400,"Send Valid Data for Listing");
  };
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
  if(!req.body.listing)
  {
    throw new ExpressError(400,"Send Valid Data for Listing");
  };
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id",wrapAsync( async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

// app.all("*",(req,res,next)=>{
// next(new ExpressError(404,"Page Not Found!"))});

// app.use((err, req, res, next) => {
//   let { statusCode, message } = err;
//   res.status(statusCode).send(message);
// });
app.use( (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  res.render("error.ejs",{message});
  // res.status(statusCode).send(message);
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
