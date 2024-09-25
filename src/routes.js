const rooms = require("./rooms");
const util = require("./util");
const status = require("./status");

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

function setupApiRoutes(app) {
    app.get("/api/rooms", async (_, res) => {
        res.json(rooms.rooms);
    });

    /*
        GET /api/room/{number}
        Gets information about the specified room.

        Parameters:
        - number - The room number.

        Returns: The specified room.r
    */
    app.get("/api/room/:number", async (req, res) => {
        const number = req.params.number;
        const room = rooms.getRoom(number);

        if (typeof number !== "string") {
            res.status(status.BAD_REQUEST).send("Incorrect parameter type.");
            return;
        }

        if (room === undefined) {
            res.status(status.NOT_FOUND).send("Room not found");
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
            res.status(status.BAD_REQUEST).send("Incorrect parameters.");
            return;
        }

        if (!(
            typeof number === "string" &&
            guests instanceof Array &&
            typeof price === "number" &&
            typeof check_out === "number"
        )) {
            res.status(status.BAD_REQUEST).send("Incorrect parameter types.");
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send("Room not found.");
            return;
        }

        if (rooms.isReserved(room)) {
            res.status(status.FORBIDDEN).send("Room is already reserved.");
            return;
        }

        if (rooms.isOccupied(room)) {
            res.status(status.FORBIDDEN).send("Room is occupied.");
            return;
        }

        if (guests.length === 0) {
            res.status(status.BAD_REQUEST).send("There must be at least one guest.");
            return;
        }

        // TODO check if all guests are of the same type

        const now = Date.now();
        const check_out_date = new Date(
            check_out == -1
                ? util.addDays(now, rooms.default_check_out_days)
                : check_out
        ).setHours(...rooms.default_check_out_hours);

        if (check_out_date <= new Date(now).setHours(...rooms.default_check_out_hours)) {
            res.status(status.BAD_REQUEST).send("Check-out date cannot be earlier or in the same day than the check-in date.");
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
            res.status(status.BAD_REQUEST).send("Incorrect parameters.");
            return;
        }

        if (typeof number !== "string") {
            res.status(status.BAD_REQUEST).send("Incorrect parameter type.");
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send("Room not found.");
            return;
        }
        
        if (rooms.isAvailable(room)) {
            res.status(status.FORBIDDEN).send("Room is already available.");
            return;
        }

        if (rooms.isOccupied(room)) {
            res.status(status.FORBIDDEN).send("Room is occupied. Try checking out.");
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
            res.status(status.BAD_REQUEST).send("Incorrect parameters.");
            return;
        }

        if (typeof number !== "string") {
            res.status(status.BAD_REQUEST).send("Incorrect parameter type.");
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send("Room not found.");
            return;
        }
        
        if (rooms.isOccupied(room)) {
            res.status(status.FORBIDDEN).send("Room is already occupied.");
            return;
        }

        if (rooms.isAvailable(room)) {
            res.status(status.FORBIDDEN).send("Room is available. Try reserving it first.");
            return;
        }
        
        rooms.setRoomField(roomIndex, "state", rooms.OCCUPIED);
        res.json(rooms.getRoomByIndex(roomIndex));
    });

    /*
        POST /api/checkout
        Performs the check-out of the specified room.
        It must be in the occupied state.

        Body:

        number: string

        Returns: the modified room.
    */
    app.post("/api/checkout", async (req, res) => {
        const { number } = req.body;

        if (!number) {
            res.status(status.BAD_REQUEST).send("Incorrect parameters.");
            return;
        }

        if (typeof number !== "string") {
            res.status(status.BAD_REQUEST).send("Incorrect parameter type.");
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send("Room not found.");
            return;
        }
        
        if (rooms.isAvailable(room)) {
            res.status(status.FORBIDDEN).send("Room is already available.");
            return;
        }

        if (rooms.isReserved(room)) {
            res.status(status.FORBIDDEN).send("Room is reserved. Try cancelling the reservation.");
            return;
        }

        // TODO: handle if the debt is less than 0
        // maybe ask for devolution or keep it
        if (room.debt !== 0) {
            res.status(status.FORBIDDEN).send("Room is in debt. Pay it first.");
            return;
        }

        if (new Date(Date.now()).setHours(...rooms.default_check_out_hours) !== room.check_out) {
            res.status(status.FORBIDDEN).send("Room's check-out is not today.");
            return;
        }
        
        const newRoom = rooms.defaultRoom(number);

        rooms.setRoom(roomIndex, newRoom);
        res.json(newRoom);
    });
}

module.exports = setupRoutes;
