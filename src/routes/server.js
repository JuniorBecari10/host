const path = require("path");

function setupServerRoutes(app) {
    /*
        GET /
        Returns the main page.
    */
        app.get("/", (_, res) => {
            res.sendFile(path.join(__dirname, "..", "..", "views", "index.html"));
        });

    /*
        GET /login
        Returns the login page.
    */
    app.get("/login", (_, res) => {
        res.sendFile(path.join(__dirname, "..", "..", "views", "login.html"));
    });

    /*
        GET /login
        Returns the contact page.
    */
        app.get("/contact", (_, res) => {
            res.sendFile(path.join(__dirname, "..", "..", "views", "contact.html"));
        });
    

    /*
        GET /rooms
        Returns a page with the rooms.
        It's the main page of the system.
    */
    app.get("/rooms", (_, res) => {
        res.sendFile(path.join(__dirname, "..", "..", "views", "rooms.html"));
    });

    // TODO: make endpoint to generate a list of all payments in a page to be printed
}

module.exports = setupServerRoutes;
