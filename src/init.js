const express = require("express");

function init(app) {
    app.set("view engine", "ejs");
    
    app.use(express.static("./public"));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
}

module.exports = init;
