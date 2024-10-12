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
        Return Type: Room[]
    */
    app.get("/api/rooms", async (_, res) => {
        res.json({ rooms: rooms.getHotelRooms() });
    });

    /*
        GET /api/rooms/available
        Gets all available rooms of the hotel.

        Returns: All the available rooms, in an array.
        Return Type: Room[]
    */
        app.get("/api/rooms/available", async (_, res) => {
            res.json({ rooms: rooms.getHotelRooms().filter(r => rooms.isAvailable(r)) });
        });
    
    /*
        GET /api/rooms/reserved
        Gets all reserved rooms of the hotel.

        Returns: All the reserved rooms, in an array.
        Return Type: Room[]
    */
        app.get("/api/rooms/reserved", async (_, res) => {
            res.json({ rooms: rooms.getHotelRooms().filter(r => rooms.isReserved(r)) });
        });
    
    /*
        GET /api/rooms/occupied
        Gets all occupied rooms of the hotel.

        Returns: All the occupied rooms, in an array.
        Return Type: Room[]
    */
        app.get("/api/rooms/occupied", async (_, res) => {
            res.json({ rooms: rooms.getHotelRooms().filter(r => rooms.isOccupied(r)) });
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
        GET /api/cash-opening-time
        Gets the time the cash has been opened.

        Returns: The time the cash has been opened.
        Return Type: number
    */
        app.get("/api/cash-opening-time", async (_, res) => {
            res.json({ time: rooms.getHotelCashOpeningTime() });
        });

    /*
        GET /api/check-out-hour
        Gets the check_out hour (the default is 12:00 - noon)

        Returns: The check_out hour
        Return Type: { raw: array, formatted: string }
    */
        app.get("/api/check-out-hour", async (_, res) => {
            res.json({
                raw: rooms.defaultCheckOutHours,
                formatted: util.formatCheckOutHour(rooms.defaultCheckOutHours)
            });
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
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA_TYPES,
                message: msg.MSG_INCORRECT_DATA_TYPES,
            });
            return;
        }

        if (room === undefined) {
            res.status(status.NOT_FOUND).send({
                title: msg.TITLE_ROOM_NOT_FOUND,
                message: msg.MSG_ROOM_NOT_FOUND,
            });
            return;
        }

        res.json(room);
    });

    // ---

    /*
        POST /api/close-cash
        Closes the current cash and opens a new one.

        Returns: The new cash value and opening time.
        Return Type: { cash: number, time: number }
    */
    app.post("/api/close-cash/", async (_, res) => {
        rooms.setHotelCash(0);
        rooms.setHotelCashOpeningTime(Date.now());
        // TODO: remove all payments (and call the server endpoint to show them all?)

        res.json({
            cash: rooms.getHotelCash(),
            time: rooms.getHotelCashOpeningTime(),
        });
    });

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

        const newRoom = util.reserve(res, number, guests, price, check_out);
        res.json(newRoom);
    });

    /*
        POST /api/edit-reservation/
        Edits the reservation of the specified room.

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
        app.post("/api/edit-reservation/", async (req, res) => {
            const {
                number,
                guests,
                price,
                check_out
            } = req.body;
    
            const newRoom = util.editReservation(res, number, guests, price, check_out);
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
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA,
                message: msg.MSG_INCORRECT_DATA,
            });
            return;
        }

        if (typeof number !== "string") {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA_TYPES,
                message: msg.MSG_INCORRECT_DATA_TYPES,
            });
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send({
                title: msg.TITLE_ROOM_NOT_FOUND,
                message: msg.MSG_ROOM_NOT_FOUND,
            });
            return;
        }
        
        if (rooms.isAvailable(room)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_ALREADY_AVAILABLE,
                message: msg.MSG_ROOM_IS_ALREADY_AVAILABLE_CANCEL,
            });
            return;
        }

        if (rooms.isOccupied(room)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_OCCUPIED,
                message: msg.MSG_ROOM_IS_OCCUPIED_CANCEL,
            });
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
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA,
                message: msg.MSG_INCORRECT_DATA,
            });
            return;
        }

        if (typeof number !== "string") {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA_TYPES,
                message: msg.MSG_INCORRECT_DATA_TYPES,
            });
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send({
                title: msg.TITLE_ROOM_NOT_FOUND,
                message: msg.MSG_ROOM_NOT_FOUND,
            });
            return;
        }
        
        if (rooms.isAvailable(room)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_ALREADY_AVAILABLE,
                message: msg.MSG_ROOM_IS_ALREADY_AVAILABLE_CHECK_IN,
            });
            return;
        }

        if (rooms.isOccupied(room)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_ALREADY_OCCUPIED,
                message: msg.MSG_ROOM_IS_ALREADY_OCCUPIED_CHECK_IN,
            });
            return;
        }

        const now = Date.now();
        const checkOut = room.check_out;

        const checkOutDate = new Date(
            checkOut == -1
                ? addDays(now, rooms.defaultCheckOutDays)
                : checkOut
        ).setHours(...rooms.defaultCheckOutHours);
    
        if (checkOutDate <= new Date(now).setHours(...rooms.defaultCheckOutHours)) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY,
                message: msg.MSG_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY,
            });
            return;
        }

        const newRoom = {
            number: room.number,
            state: rooms.OCCUPIED,
        
            guests: room.guests,
            price: room.price,
            debt: room.price * util.diffDays(now, room.check_out),
        
            check_in: now,
            check_out: room.check_out,
        };
        
        rooms.setRoom(roomIndex, newRoom);
        res.json(rooms.getRoomByIndex(roomIndex));
    });

    /*
        POST /api/pay
        Performs a payment operation in the specified room.
        It must be in the occupied state.

        Body:

        number: string
        amount: number
        method: string - must be one of the allowed methods

        Returns: the modified room.
        Return Type: Room (object)
    */
    app.post("/api/pay", async (req, res) => {
        const { number, amount, method } = req.body;

        if (!(number && amount && method)) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA,
                message: msg.MSG_INCORRECT_DATA,
            });
            return;
        }

        if (
            typeof number !== "string" &&
            typeof amount !== "number" &&
            typeof method !== "string"
        ) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA_TYPES,
                message: msg.MSG_INCORRECT_DATA_TYPES,
            });
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send({
                title: msg.TITLE_ROOM_NOT_FOUND,
                message: msg.MSG_ROOM_NOT_FOUND,
            });
            return;
        }

        if (rooms.isAvailable(room)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_AVAILABLE,
                message: msg.MSG_ROOM_IS_AVAILABLE_PAY,
            });
            return;
        }

        if (rooms.isReserved(room)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_RESERVED,
                message: msg.MSG_ROOM_IS_RESERVED_PAY,
            });
            return;
        }

        if (amount <= 0) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_AMOUNT_MUST_BE_GREATER_THAN_ZERO,
                message: msg.MSG_AMOUNT_MUST_BE_GREATER_THAN_ZERO,
            });
            return;
        }

        if (!rooms.allowedPaymentMethods.includes(method)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_INVALID_PAYMENT_METHOD,
                message: msg.MSG_INVALID_PAYMENT_METHOD,
            });
            return;
        }

        rooms.setRoomField(roomIndex, debt, room.debt - amount);
        rooms.addHotelPayment({
            amount,
            method,
            room: number,
        });

        // TODO: change cash here and in close-cash close the cash through a function

        return rooms.getRoomByIndex(roomIndex);
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
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA,
                message: msg.MSG_INCORRECT_DATA,
            });
            return;
        }

        if (typeof number !== "string") {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA_TYPES,
                message: msg.MSG_INCORRECT_DATA_TYPES,
            });
            return;
        }

        const roomIndex = rooms.getRoomIndex(number);
        const room = rooms.getRoomByIndex(roomIndex);

        if (roomIndex === -1) {
            res.status(status.NOT_FOUND).send({
                title: msg.TITLE_ROOM_NOT_FOUND,
                message: msg.MSG_ROOM_NOT_FOUND,
            });
            return;
        }
        
        if (rooms.isAvailable(room)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_ALREADY_AVAILABLE,
                message: msg.MSG_ROOM_IS_ALREADY_AVAILABLE_CHECK_OUT,
            });
            return;
        }

        if (rooms.isReserved(room)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_RESERVED,
                message: msg.MSG_ROOM_IS_RESERVED_CHECK_OUT,
            });
            return;
        }

        if (room.debt !== 0) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_IN_DEBT,
                message: msg.MSG_ROOM_IS_IN_DEBT,
            });
            return;
        }

        if (new Date(Date.now()).setHours(...rooms.defaultCheckOutHours) !== new Date(room.check_out).setHours(...rooms.defaultCheckOutHours)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOMS_CHECK_OUT_IS_NOT_TODAY,
                message: msg.MSG_ROOMS_CHECK_OUT_IS_NOT_TODAY,
            });
            return;
        }
        
        const newRoom = rooms.defaultRoom(number);

        rooms.setRoom(roomIndex, newRoom);
        res.json(newRoom);
    });
}

module.exports = setupApiRoutes;
