function setupServerRoutes(app) {
    /*
        GET /rooms
        Returns a page with the rooms.
    */
    app.get("/rooms", (_, res) => {
        res.render("hello.ejs");
    });

    // TODO: make endpoint to generate a list of all payments in a page to be printed
}

module.exports = setupServerRoutes;
