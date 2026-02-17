const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("./middleware");
const authController = require("../controllers/auth");

router.route("/login")
.get(authController.renderLoginForm)
.post(
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true
  }),
  authController.login
);

// LOGOUT
router.get("/logout", authController.logout);

module.exports = router;
