const express = require("express");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");

const initPassport = require("./passport-config");

function init(app) {
    initPassport(passport);

    app.set("view engine", "ejs");
    app.use(express.urlencoded({ extended: false }));
    app.use(flash());

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    }));

    app.use(passport.initialize());
    app.use(passport.session());
}

module.exports = init;
