const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Listing=require("./models/listing.js");
const methodOverride = require("method-override");
const app = express();
require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 8080;

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
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

//Create Route
app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
