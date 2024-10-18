const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const rooms = require("./rooms");
const users = require("./users");
const util = require("./util");

// TODO: prevent crashes when an error occurs inside a handler
function init(app) {
    app.set("view engine", "ejs");

    app.use(express.static(path.join(__dirname, "..", "public")));

    app.use(util.logMiddleware);
    app.use(express.urlencoded({ extended: false }));
    app.use(cors());
    app.use(express.json());

    readDatabase();
}

function readDatabase() {
    console.log("Reading database...\n");

    if (fs.existsSync(rooms.HOTEL_DATABASE_FILE_NAME)) {
        rooms.loadDataHotel();
        console.log("Hotel database loaded successfully.");
    }
    else
        console.log("Hotel database file doesn't exist, starting a new one...");

    // ---

    if (fs.existsSync(users.USERS_DATABASE_FILE_NAME)) {
        users.loadDataUsers();
        console.log("Users database loaded successfully.");
    }
    else
        console.log("Users database file doesn't exist, starting a new one...");

    console.log();
}

module.exports = init;
