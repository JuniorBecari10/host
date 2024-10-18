const { setupAuthRoutes } = require("./auth");
const setupServerRoutes = require("./server");
const setupApiRoutes = require("./api/api");

function setupRoutes(app) {
    setupAuthRoutes(app);
    setupServerRoutes(app);
    setupApiRoutes(app);
}

module.exports = setupRoutes;
