const express = require("express");

function init(app) {
    app.set("view engine", "ejs");

    app.use(express.static("./public"));
    app.use(logMiddleware);
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
}

function logMiddleware(req, res, next) {
    // [00/00/00 - 00:00:00] GET /path
    const now = new Date(Date.now());
    
    const day = [
        now.getDay() < 10 ? "0" + now.getDay() : now.getDay(),
        now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1,
        now.getFullYear(),
    ];

    const time = [
        now.getHours() < 10 ? "0" + now.getHours() : now.getHours(),
        now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes(),
        now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds(),
    ];

    console.log(`[${day.join("/")} - ${time.join(":")}] ${req.method} ${req.originalUrl}`)
    next();
}

module.exports = init;
