const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("./middleware");

// GET login form
router.get("/login", (req, res) => {
    res.render("users/login");
});

// POST login
router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req, res) => {
        req.flash("success", "Welcome back to Dwellio!");
        const redirectUrl = res.locals.redirectUrl || "/listings";
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
);

router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged you out!");
        res.redirect("/listings");
    });
});

module.exports = router;
