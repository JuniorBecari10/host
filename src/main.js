if (process.env.NODE_ENV !== "production")
    require("dotenv").config();

const express = require("express");
const init = require("./init");
const setupRoutes = require("./routes");

const PORT = process.env.PORT || 3000;
const app = express();

init(app);
setupRoutes(app);

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
