const rooms = require("../../rooms");
const util = require("../../util");
const status = require("../../status");
const msg = require("./msg");

function setupApiRoutes(app) {
    /*
        GET /api/name
        Gets the name of the hotel.

        Returns: The name of the hotel.
        Return Type: string
    */
        app.get("/api/name", async (_, res) => {
            res.json({ name: rooms.getHotelName() });
        });

    /*
        GET /api/rooms
        Gets all the rooms of the hotel.

        Returns: All the rooms, in an array.
        Return Type: number
    */
    app.get("/api/rooms", async (_, res) => {
        res.json({ rooms: rooms.getHotelRooms() });
    });

    /*
        GET /api/cash
        Gets the current value of the cash.

        Returns: The current value of the cash.
        Return Type: number
    */
        app.get("/api/cash", async (_, res) => {
            res.json({ cash: rooms.getHotelCash() });
        });

    /*
        GET /api/room/{number}
        Gets information about the specified room.

        Parameters:
        - number - The room number.

        Returns: The specified room.
        Return Type: Room (object)
    */
    app.get("/api/room/:number", async (req, res) => {
        const number = req.params.number;
        const room = rooms.getRoom(number);

        if (typeof number !== "string") {
            res.status(status.BAD_REQUEST).send({ message: msg.INCORRECT_PARAMETER_TYPES });
            return;
        }

        if (room === undefined) {
            res.status(status.NOT_FOUND).send({ message: msg.ROOM_NOT_FOUND });
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
                              tomorrow at noon. It is defined in milliseconds.

        Returns: the modified room.
        Return Type: Room (object)
    */
    app.post("/api/reserve/", async (req, res) => {
        const {
            number,
            guests,
            price,
            check_out
        } = req.body;

        if (!(number && guests && price && check_out)) {
            res.status(status.BAD_REQUEST).send({ message: msg.INCORRECT_PARAMETERS });
            return;
        }

        if (!(
            typeof number === "string" &&
            guests instanceof Array &&
            typeof price === "number" &&
            typeof check_out === "number"
        )) {
            res.status(status.BAD_REQUEST).send({ message: msg.INCORRECT_PARAMETER_TYPES });
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send({ message: msg.ROOM_NOT_FOUND });
            return;
        }

        if (rooms.isReserved(room)) {
            res.status(status.FORBIDDEN).send({ message: msg.ROOM_IS_ALREADY_RESERVED });
            return;
        }

        if (rooms.isOccupied(room)) {
            res.status(status.FORBIDDEN).send({ message: msg.ROOM_IS_OCCUPIED });
            return;
        }

        if (guests.length === 0) {
            res.status(status.BAD_REQUEST).send({ message: msg.THERE_MUST_BE_AT_LEAST_ONE_GUEST });
            return;
        }

        const now = Date.now();
        const check_out_date = new Date(
            check_out == -1
                ? util.addDays(now, rooms.default_check_out_days)
                : check_out
        ).setHours(...rooms.default_check_out_hours);

        if (check_out_date <= new Date(now).setHours(...rooms.default_check_out_hours)) {
            res.status(status.BAD_REQUEST).send({ message: msg.CHECK_OUT_CANNOT_BE_EARLIER });
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
        Return Type: Room (object)
    */
    app.post("/api/cancel", async (req, res) => {
        const { number } = req.body;

        if (!number) {
            res.status(status.BAD_REQUEST).send({ message: msg.INCORRECT_PARAMETERS });
            return;
        }

        if (typeof number !== "string") {
            res.status(status.BAD_REQUEST).send({ message: msg.INCORRECT_PARAMETER_TYPE });
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send({ message: msg.ROOM_NOT_FOUND });
            return;
        }
        
        if (rooms.isAvailable(room)) {
            res.status(status.FORBIDDEN).send({ message: msg.ROOM_IS_ALREADY_AVAILABLE });
            return;
        }

        if (rooms.isOccupied(room)) {
            res.status(status.FORBIDDEN).send({ message: msg.ROOM_IS_OCCUPIED }); // TODO: Try checking out
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
        Return Type: Room (object)
    */
    app.post("/api/checkin", async (req, res) => {
        const { number } = req.body;

        if (!number) {
            res.status(status.BAD_REQUEST).send({ message: msg.INCORRECT_PARAMETERS });
            return;
        }

        if (typeof number !== "string") {
            res.status(status.BAD_REQUEST).send({ message: msg.INCORRECT_PARAMETER_TYPE });
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send({ message: msg.ROOM_NOT_FOUND });
            return;
        }
        
        if (rooms.isOccupied(room)) {
            res.status(status.FORBIDDEN).send({ message: msg.ROOM_IS_ALREADY_OCCUPIED });
            return;
        }

        if (rooms.isAvailable(room)) {
            res.status(status.FORBIDDEN).send({ message: msg.ROOM_IS_AVAILABLE }); // TODO: Try reserving it first
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
        Return Type: Room (object)
    */
    app.post("/api/checkout", async (req, res) => {
        const { number } = req.body;

        if (!number) {
            res.status(status.BAD_REQUEST).send({ message: msg.INCORRECT_PARAMETERS });
            return;
        }

        if (typeof number !== "string") {
            res.status(status.BAD_REQUEST).send({ message: msg.INCORRECT_PARAMETER_TYPE });
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send({ message: msg.ROOM_NOT_FOUND});
            return;
        }
        
        if (rooms.isAvailable(room)) {
            res.status(status.FORBIDDEN).send({ message: msg.ROOM_IS_ALREADY_AVAILABLE });
            return;
        }

        if (rooms.isReserved(room)) {
            res.status(status.FORBIDDEN).send({ message: msg.ROOM_IS_RESERVED }); // TODO: Try cancelling the reservation.
            return;
        }

        if (room.debt !== 0) {
            res.status(status.FORBIDDEN).send({ message: msg.ROOM_IS_IN_DEBT }); // TODO: Pay it first
            return;
        }

        if (new Date(Date.now()).setHours(...rooms.default_check_out_hours) !== room.check_out) {
            res.status(status.FORBIDDEN).send({ message: msg.ROOMS_CHECK_OUT_NOT_TODAY });
            return;
        }
        
        const newRoom = rooms.defaultRoom(number);

        rooms.setRoom(roomIndex, newRoom);
        res.json(newRoom);
    });
}

module.exports = setupApiRoutes;
