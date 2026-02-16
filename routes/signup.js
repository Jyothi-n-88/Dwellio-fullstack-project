const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");

// GET signup form
router.get("/signup", (req, res) => {
    res.render("users/signup");
});

// POST signup
router.post(
    "/signup",
    wrapAsync(async (req, res, next) => {
        try {
            const { username, email, password } = req.body;

            const newUser = new User({ username, email });
            const registeredUser = await User.register(newUser, password);

            // Auto login after successful signup
            req.login(registeredUser, (err) => {
                if (err) return next(err);

                req.flash("success", "Welcome to Dwellio!");
                res.redirect("/listings");
            });

        } catch (err) {
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
