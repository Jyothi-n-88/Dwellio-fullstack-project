const User = require("../models/user");

// RENDER LOGIN FORM
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

// LOGIN SUCCESS
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");

  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// LOGOUT
module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    req.flash("success", "Logged you out!");
    res.redirect("/listings");
  });
};

// RENDER SIGNUP FORM
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup");
};

// SIGNUP
module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    // Auto login after signup
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

    res.redirect("/signup");
  }
};
