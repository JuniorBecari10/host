if (process.env.NODE_ENV !== "production")
    require("dotenv").config();

const express = require("express");
const init = require("./init");
const setupRoutes = require("./routes/routes");

const PORT = process.env.PORT || 3000;
const app = express();

init(app);
setupRoutes(app);

console.log(`URL: http://localhost:${PORT}`);
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
