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

    /*
        GET /api/room/{number}
        Gets information about the specified room.

        Parameters:
        - number - The room number.

        Returns: The specified room.
    */
    app.get("/api/room/:number", async (req, res) => {
        const number = req.params.number;
        const room = rooms.getRoom(number);

        if (room === undefined) {
            res.status(404).send("Room not found");
            return;
        }

        res.json(room);
    });

    // ---

    /*
        POST /api/reserve/
        Reserves the specified room.

        Body:
        - number: string
        - guests: Guest[]
        - price: number
        - check_out: number? (day only - it's noon by default - it will be changed to have 12:00 as the hour
                              it's optional too - set it to -1 to indicate absence. If absent, the value will be set to
                              tomorrow at noon.
                              In milliseconds.

        Returns: the modified room.
    */
    app.post("/api/reserve/", async (req, res) => {
        const {
            number,
            guests,
            price,
            check_out
        } = req.body;

        // TODO: check the types of the input variables
        // TODO: change check_out absence sentinel value to 0, instead of -1, and modify this if statement to accept it,
        //       because 0 is considered falsy
        if (!(number && guests && price && check_out)) {
            res.status(400).send("Incorrect parameters.");
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.rooms[roomIndex];

        if (roomIndex === -1) {
            res.status(404).send("Room not found.");
            return;
        }

        if (!rooms.isAvailable(room)) {
            res.status(403).send("Room is not available.");
            return;
        }

        if (guests.length === 0) {
            res.status(400).send("There must be at least one guest.");
            return;
        }

        const now = Date.now();
        const check_out_date = new Date(
            check_out == -1
                ? util.addDays(now, 1)
                : check_out
        ).setHours(12, 0, 0, 0);

        if (check_out_date <= new Date(now).setHours(12, 0, 0, 0)) {
            res.status(400).send("Check-out date cannot be earlier or in the same day than the check-in date.");
            return;
        }

        const newRoom = {
            number: room.number,
            state: rooms.RESERVED,
        
            guests,
            price,
            debt: price,
        
            check_in: now,
            check_out: check_out_date,
        };

        rooms.setRoom(roomIndex, newRoom);
        res.json(newRoom);
    });

    /*
        POST /api/cancel
        Cancels the reservation of the specified room.
        It must be in the reserved state.

        Body:

        number: string

        Returns: the modified room.
    */
    app.post("/api/cancel", async (req, res) => {
        const { number } = req.body;

        if (!number) {
            res.status(400).send("Incorrect parameters.");
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.rooms[roomIndex];

        if (roomIndex === -1) {
            res.status(404).send("Room not found.");
            return;
        }
        
        if (rooms.isAvailable(room)) {
            res.status(403).send("Room is already available.");
            return;
        }

        if (rooms.isOccupied(room)) {
            res.status(403).send("Room is occupied - cannot cancel. Try checking out.");
            return;
        }

        const newRoom = rooms.defaultRoom(number);

        rooms.setRoom(roomIndex, newRoom);
        res.json(newRoom);
    });

    /*
        POST /api/checkin
        Performs the check-in of the specified room.
        It must be in the reserved state.

        Body:

        number: string

        Returns: the modified room.
    */
        app.post("/api/checkin", async (req, res) => {
            const { number } = req.body;
    
            if (!number) {
                res.status(400).send("Incorrect parameters.");
                return;
            }
    
            const roomIndex = rooms.getRoomIndex(number);
            const room = rooms.rooms[roomIndex];
    
            if (roomIndex === -1) {
                res.status(404).send("Room not found");
                return;
            }
            
            if (rooms.isOccupied(room)) {
                res.status(403).send("Room is already occupied.");
                return;
            }
    
            if (rooms.isAvailable(room)) {
                res.status(403).send("Room is available. Try reserving it first.");
                return;
            }
            
            rooms.setRoomField(roomIndex, "state", rooms.OCCUPIED);
            res.json(rooms.rooms[roomIndex]);
        });
}

module.exports = setupRoutes;
