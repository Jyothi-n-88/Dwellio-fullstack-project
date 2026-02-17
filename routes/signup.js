const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const authController = require("../controllers/auth");

router.get("/signup", authController.renderSignupForm);

// POST signup
router.post(
  "/signup",
  wrapAsync(authController.signup)
);
module.exports = router;
