const express = require("express");
const fs = require("fs");
const rooms = require("./rooms");
const cors = require("cors");
const util = require("./util");

// TODO: prevent crashes when an error occurs inside a handler
function init(app) {
    app.set("view engine", "ejs");

    app.use(express.static("./public"));
    app.use(util.logMiddleware);
    app.use(express.urlencoded({ extended: false }));
    app.use(cors());
    app.use(express.json());

    readDatabase();
}

function readDatabase() {
    console.log("Reading database...");

    if (fs.existsSync(rooms.DATABASE_LOCATION)) {
        rooms.loadData();
        console.log("Database loaded successfully.");
    }
    else
        console.log("Database file doesn't exist, starting a new one...");

    console.log();
}

module.exports = init;
