function setupRoutes(app) {
    app.get("/hello", (_, res) => {
        res.render("hello.ejs");
    });
}

module.exports = setupRoutes;
