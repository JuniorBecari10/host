const setupServerRoutes = require("./server");
const setupApiRoutes = require("./api/api");

function setupRoutes(app) {
    setupServerRoutes(app);
    setupApiRoutes(app);
}

module.exports = setupRoutes;
