function setupServerRoutes(app) {
    /*
        GET /rooms
        Returns a page with the rooms.
    */
    app.get("/rooms", (_, res) => {
        res.render("hello.ejs");
    });
}

module.exports = setupServerRoutes;
