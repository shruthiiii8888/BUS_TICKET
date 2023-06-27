if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}
const express = require("express");
const app = express();
const path = require('path');
const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const User = require("./user");

initializePassport(passport);

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.redirect("/register");
  }
});

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});
app.get("/about-form", (req, res) => {
  res.render("about-form.ejs");
});
// ...existing code...

app.get("/element1", checkAuthenticated, (req, res) => {
  res.render("element1.ejs"); // Render the "element1.ejs" template when accessing /element1
});

app.get("/element2", checkAuthenticated, (req, res) => {
  res.render("element2.ejs"); // Render the "element2.ejs" template when accessing /element2
});
app.set('view engine', 'ejs');
app.get("/element3", checkAuthenticated, (req, res) => {
    res.render("element3.ejs");
});

app.get("/element4", checkAuthenticated, (req, res) => {
  res.render("element4.ejs"); // Render the "element4.ejs" template when accessing /element4
});

// ...existing code...

app.delete("/logout", function(req, res) {
  req.logout();
  res.redirect("/login");
});

const http = require('http');

// ...existing code...

// ...existing code...

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
// Assuming you have the necessary dependencies and server setup

// Set the views directory and template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Define a route for element.ejs
app.get('/element', function(req, res) {
  res.render('element2.ejs');
});

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(3001);

