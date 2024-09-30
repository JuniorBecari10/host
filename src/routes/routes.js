const setupApiRoutes = require("./api/api");

// DEBUG
Object.prototype.getName = function() { 
    const funcNameRegex = /function (.{1,})\(/;
    const results = funcNameRegex.exec(this.constructor.toString());

    return (results && results.length > 1) ? results[1] : "";
};

function setupRoutes(app) {
    app.get("/hello", (_, res) => {
        res.render("hello.ejs");
    });

    setupApiRoutes(app);
}

module.exports = setupRoutes;
