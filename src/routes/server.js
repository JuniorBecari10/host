const path = require("path");

function setupServerRoutes(app) {
    /*
        GET /login
        Returns a login page.
    */
        app.get("/login", (_, res) => {
            res.sendFile(path.join(__dirname, "..", "..", "views", "login.html"));
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
