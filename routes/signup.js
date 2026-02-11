const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync"); // adjust path if needed

// GET signup form
router.get("/signup", (req, res) => {
    res.render("users/signup");
});

// POST signup
router.post(
    "/signup",
    wrapAsync(async (req, res) => {
        try {
            const { username, email, password } = req.body;

            const newUser = new User({ username, email });
            await User.register(newUser, password);

            req.flash("success", "Welcome to Dwellio!");
            res.redirect("/listings");

        } catch (err) {
            // User-related / expected errors
            if (err.name === "UserExistsError") {
                req.flash("error", "Username already exists. Please choose another one.");
            } else {
                req.flash("error", err.message || "Something went wrong. Please try again.");
            }

            return res.redirect("/signup");
        }
    })
);

module.exports = router;
