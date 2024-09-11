const express = require("express");

const PORT = 3000;

const app = express();

const users = [];

/*
struct User:

id: string
name: string
email: string
password: string
role: Role

enum Role:

Receptionist
Manager
Administrator

*/

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

// Routes

app.get("/hello", (_, res) => {
    res.render("hello.ejs");
});

app.post("/register", (req, res) => {
    console.log(req.body);
    return res.json({"ok": "ok"});
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`))
