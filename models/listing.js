const mongoose = require("mongoose");
const reviews = require("./reviews");
const Schema= mongoose.Schema;
const listingSchema= new Schema(
    {
        title:{
            type:String,
            required:true
        },
        description:String,
        image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default:
        "https://q-xx.bstatic.com/xdata/images/hotel/max500/672628389.jpg?k=b9f96eace672d7a33805c208c2a08e9cc356435ac055b435c979ef68d773259e&o=",
      set: (v) =>
        v === ""
          ? "https://q-xx.bstatic.com/xdata/images/hotel/max500/672628389.jpg?k=b9f96eace672d7a33805c208c2a08e9cc356435ac055b435c979ef68d773259e&o="
          : v,
    },
  },
        price:Number,
        location:String,
        country:String,
        reviews:[
          {type:Schema.Types.ObjectId,
          ref:"Review"}
        ]
    }
);
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;