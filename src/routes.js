const rooms = require("./rooms");
const util = require("./util");

function setupRoutes(app) {
    app.get("/hello", (_, res) => {
        res.render("hello.ejs");
    });

    setupApiRoutes(app);
}

function setupApiRoutes(app) {
    app.get("/api/rooms", async (_, res) => {
        res.json(rooms.rooms);
    });

    app.get("/api/room/:number", async (req, res) => {
        const number = req.params.number;
        const room = rooms.getRoom(number);

        if (room === undefined) {
            res.status(404).send();
            return;
        }

        res.json(room);
    });

    // ---

    app.post("/api/body", async (req, res) => {
        res.json(req.body);
    });

    /*
        Body:

        number: string
        guests: Guest[]
        price: number
        check_out (day only - it's noon by default): number
    */
    app.post("/api/reserve/", async (req, res) => {
        const {
            number,
            guests,
            price,
            check_out
        } = req.body;

        if (!(number && guests && price && check_out)) {
            res.status(400).send("Incorrect parameters");
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.rooms[roomIndex];

        if (roomIndex === -1) {
            res.status(404).send();
            return;
        }

        if (!room.isAvailable()) {
            res.status(403).send("Room is not available");
            return;
        }

        const now = Date.now();
        const newRoom = {
            number: room.number,
            state: rooms.RESERVED,
        
            guests,
            price,
            debt: 0,
        
            check_in: now,
            check_out: new Date(util.addDays(now, 1)).setHours(12, 0, 0, 0),
        };

        rooms.setRoom(roomIndex, newRoom);
        res.json(newRoom);
    });
}

module.exports = setupRoutes;
