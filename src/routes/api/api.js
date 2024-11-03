const rooms = require("../../rooms");
const util = require("../../util");
const status = require("../../status");
const msg = require("./msg");
const users = require("../../users");
const auth = require("../auth");

function setupApiRoutes(app) {
    /*
        GET /api/user
        Gets the logged user's data.

        Returns: The logged user's data.
        Return Type: User
    */
    app.get("/api/user", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (req, res) => {
        res.json({
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            }
        });
    });

    /*
        GET /api/users
        Gets all the users.

        Returns: All the users
        Return Type: User[]
        Required Role: Manager
    */
    app.get("/api/users", auth.authorize, auth.checkRole(users.ROLE_MANAGER), async (_, res) => {
        res.json({
            users: users.users.map(
                u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    password: "", // we won't send the hash, but make the field present
                })
            ),
        });
    });

    /*
        POST /api/users
        Sets the database users.

        Parameters:
            users: [
                id: number
                name: string
                email: string
                password: string (leave blank if you don't want to change)
                role: string
            ]

        Returns: All the users, modified
        Return Type: User[]
        Required Role: Manager
    */
    app.post("/api/users", auth.authorize, auth.checkRole(users.ROLE_MANAGER), async (req, res) => {
        const { users: sentUsers } = req.body;

        if (!sentUsers) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA,
                message: msg.MSG_INCORRECT_DATA,
            });
            return;
        }

        if (!(sentUsers instanceof Array)) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA_TYPES,
                message: msg.MSG_INCORRECT_DATA_TYPES,
            });
            return;
        }

        // check for one admin user
        let hasAdmin = false;

        for (const user of sentUsers) {
            if (!(user.name && user.email && (user.password !== undefined && user.password !== null) && user.role)) {
                res.status(status.BAD_REQUEST).send({
                    title: msg.TITLE_INCORRECT_DATA,
                    message: msg.MSG_INCORRECT_DATA,
                });
                return;
            }

            if (!(
                typeof user.name === "string" &&
                typeof user.email === "string" &&
                typeof user.password === "string" &&
                typeof user.role === "string"
            )) {
                res.status(status.BAD_REQUEST).send({
                    title: msg.TITLE_INCORRECT_DATA_TYPES,
                    message: msg.MSG_INCORRECT_DATA_TYPES,
                });
                return;
            }

            if (user.role === users.ROLE_ADMINISTRATOR)
                hasAdmin = true;
        
            user.email = user.email.toLowerCase();

            if (!util.isValidEmail(user.email)) {
                res.status(status.BAD_REQUEST).send({
                    title: msg.TITLE_INVALID_EMAIL,
                    message: msg.MSG_INVALID_EMAIL,
                });
                return;
            }
        }

        if (!hasAdmin) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_THERE_MUST_BE_ONE_ADMIN,
                message: msg.MSG_THERE_MUST_BE_ONE_ADMIN,
            });
            return;
        }

        // check for unique e-mails, using a Set
        const emailSet = new Set();

        for (const user of sentUsers) {
            if (emailSet.has(user.email)) {
                res.status(status.FORBIDDEN).send({
                    title: msg.TITLE_EMAILS_MUST_BE_UNIQUE,
                    message: msg.MSG_EMAILS_MUST_BE_UNIQUE,
                });
                return;
            }
            emailSet.add(user.email);
        }

        for (const sentUser of sentUsers) {
            const dbUser = users.users.find(u => u.email === sentUser.email);

            if (dbUser === undefined) {
                if (sentUser.password.trim() === "") {
                    return res.status(status.BAD_REQUEST).send({
                        title: msg.TITLE_PASSWORD_REQUIRED,
                        message: `Novo usuário com o e-mail '${sentUser.email}' precisa de uma senha.`,
                    });
                }

                const hashedPassword = await auth.hashPassword(sentUser.password);

                users.users.push({
                    id: sentUser.id,
                    name: sentUser.name,
                    email: sentUser.email,
                    password: hashedPassword,
                    role: sentUser.role,
                });
            }
            
            else {
                if (req.user.email === dbUser.email) {
                    if (dbUser.role !== sentUser.role) {
                        return res.status(status.FORBIDDEN).send({
                            title: msg.TITLE_CANNOT_CHANGE_OWN_ROLE,
                            message: msg.MSG_CANNOT_CHANGE_OWN_ROLE,
                        });
                    }
                }

                // Update existing user details
                dbUser.name = sentUser.name;

                // Check if the logged-in user is the one being updated
                if (req.user.email === dbUser.email) {
                    // Check if the password is changed
                    if (sentUser.password.trim() !== "") {
                        dbUser.password = await auth.hashPassword(sentUser.password);
                    }
                } else {
                    // Only hash and update password if a new one is provided
                    if (sentUser.password.trim() !== "") {
                        dbUser.password = await auth.hashPassword(sentUser.password);
                    }
                }
            }
        }

        // Delete users that are in the database but not in sentUsers, that means it got deleted
        users.users = users.users.filter(dbUser => 
            sentUsers.some(sentUser => sentUser.email === dbUser.email)
        );

        users.saveData();
        res.status(200).json({ users: users.users });
    });

    /*
        GET /api/name
        Gets the name of the hotel.

        Returns: The name of the hotel.
        Return Type: string
    */
    app.get("/api/name", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (_, res) => {
        res.json({ name: rooms.getHotelName() });
    });

    /*
        GET /api/rooms
        Gets all the rooms of the hotel.

        Returns: All the rooms, in an array.
        Return Type: Room[]
    */
    app.get("/api/rooms", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (_, res) => {
        res.json({ rooms: rooms.getHotelRooms() });
    });

    /*
        GET /api/rooms/available
        Gets all available rooms of the hotel.

        Returns: All the available rooms, in an array.
        Return Type: Room[]
    */
    app.get("/api/rooms/available", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (_, res) => {
        res.json({ rooms: rooms.getHotelRooms().filter(r => rooms.isAvailable(r)) });
    });
    
    /*
        GET /api/rooms/reserved
        Gets all reserved rooms of the hotel.

        Returns: All the reserved rooms, in an array.
        Return Type: Room[]
    */
    app.get("/api/rooms/reserved", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (_, res) => {
        res.json({ rooms: rooms.getHotelRooms().filter(r => rooms.isReserved(r)) });
    });
    
    /*
        GET /api/rooms/occupied
        Gets all occupied rooms of the hotel.

        Returns: All the occupied rooms, in an array.
        Return Type: Room[]
    */
    app.get("/api/rooms/occupied", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (_, res) => {
        res.json({ rooms: rooms.getHotelRooms().filter(r => rooms.isOccupied(r)) });
    });

    /*
        GET /api/cash
        Gets the current value of the cash.

        Returns: The current value of the cash.
        Return Type: number
    */
    app.get("/api/cash", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (_, res) => {
        res.json({ cash: rooms.getHotelCash() });
    });

    /*
        GET /api/cash-opening-time
        Gets the time the cash has been opened.

        Returns: The time the cash has been opened.
        Return Type: number
    */
    app.get("/api/cash-opening-time", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (_, res) => {
        res.json({ time: rooms.getHotelCashOpeningTime() });
    });

    /*
        GET /api/payments
        Gets the currently listed payments.

        Returns: The currently listed payments.
        Return Type: Array
    */
    app.get("/api/payments", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (_, res) => {
        res.json({ payments: rooms.getHotelPayments() });
    });

    /*
        GET /api/payments/:room
        Gets the currently listed payments for the specified room

        Returns: The currently listed payments for the specified room.
        Return Type: Array
    */
        app.get("/api/payments/:number", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (_, res) => {
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
        
            res.json({ payments: room.payments });
        });

    /*
        GET /api/check-out-hour
        Gets the check_out hour (the default is 12:00 - noon)

        Returns: The check_out hour
        Return Type: { raw: array, formatted: string }
    */
    app.get("/api/check-out-hour", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (_, res) => {
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
    app.get("/api/room/:number", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (req, res) => {
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

    /*
        GET /api/debt/{number}
        Gets the debt of the specified room.

        Parameters:
        - number - The room number.

        Returns: The debt of the specified room.
        Return Type: number
    */
    app.get("/api/debt/:number", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (req, res) => {
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

        if (rooms.isAvailable(room)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_AVAILABLE,
                message: msg.MSG_ROOM_IS_AVAILABLE_DEBT,
            });
            return;
        }

        if (rooms.isReserved(room)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_RESERVED,
                message: msg.MSG_ROOM_IS_RESERVED_DEBT,
            });
            return;
        }

        res.json({ debt: util.getDebt(room) });
    });

    // ---

    /*
        POST /api/close-cash
        Closes the current cash and opens a new one.

        Returns: The new cash value and opening time.
        Return Type: { cash: number, time: number }
    */
    app.post("/api/close-cash/", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (_, res) => {
        rooms.setHotelCashOpeningTime(Date.now());
        rooms.resetHotelPayments();

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
    app.post("/api/reserve/", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (req, res) => {
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
        app.post("/api/edit-reservation/", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (req, res) => {
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
        - number: string

        Returns: the modified room.
        Return Type: Room (object)
    */
    app.post("/api/cancel", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (req, res) => {
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
        - number: string

        Returns: the modified room.
        Return Type: Room (object)
    */
    app.post("/api/checkin", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (req, res) => {
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
                title: msg.TITLE_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY_IN,
                message: msg.MSG_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY,
            });
            return;
        }

        const newRoom = {
            number: room.number,
            state: rooms.OCCUPIED,
        
            guests: room.guests,
            price: room.price,
            payments: [],
        
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
        - number: string
        - amount: number
        - method: string - must be one of the allowed methods

        Returns: the modified room.
        Return Type: Room (object)
    */
    app.post("/api/pay", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (req, res) => {
        const { number, amount, method } = req.body;

        if (!(number && (amount || amount === 0) && method)) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA,
                message: msg.MSG_INCORRECT_DATA,
            });
            return;
        }

        if (
            typeof number !== "string" ||
            typeof amount !== "number" ||
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

        const payment = {
            amount,
            method,
            room: number,
            time: Date.now(),
        };

        rooms.addHotelPayment(payment);
        rooms.setRoomField(roomIndex, "payments", room.payments.concat(payment));
        rooms.saveData();

        return res.json(rooms.getRoomByIndex(roomIndex));
    });

    /*
        POST /api/change-check-out
        Changes the check-out date of the specified room.
        It must be in the occupied state.

        Body:
        - number: string
        - check_out?: number - set it to -1 to increase one day

        Returns: the modified room.
        Return Type: Room (object)
    */
    app.post("/api/change-check-out", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (req, res) => {
        const { number, check_out } = req.body;

        if (!(number && check_out)) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA,
                message: msg.MSG_INCORRECT_DATA,
            });
            return;
        }

        if (
            typeof number !== "string" ||
            typeof check_out !== "number"
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
                message: msg.MSG_ROOM_IS_AVAILABLE_DEF_CHECK_OUT,
            });
            return;
        }

        if (rooms.isReserved(room)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_RESERVED,
                message: msg.MSG_ROOM_IS_RESERVED_DEF_CHECK_OUT,
            });
            return;
        }

        const now = Date.now();
        const checkOutDate = new Date(
            check_out == -1
                ? util.addDays(room.check_out, rooms.defaultCheckOutDays)
                : check_out
        ).setHours(...rooms.defaultCheckOutHours);

        if (checkOutDate <= new Date(now).setHours(...rooms.defaultCheckOutHours)) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY_TODAY,
                message: msg.MSG_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY,
            });
            return;
        }

        if (checkOutDate <= new Date(room.check_out).setHours(...rooms.defaultCheckOutHours)) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY_OTHER,
                message: msg.MSG_CHECK_OUT_CANNOT_BE_EARLIER_OR_SAME_DAY_OTHER,
            });
            return;
        }

        rooms.setRoomField(roomIndex, "check_out", checkOutDate);
        return res.json(rooms.getRoomByIndex(roomIndex));
    });

    /*
        POST /api/change-price
        Changes the price of the specified room.
        It must be in the occupied state.

        Body:
        - number: string
        - price: number

        Returns: the modified room.
        Return Type: Room (object)
        Required Role: Manager
    */
        app.post("/api/change-price", auth.authorize, auth.checkRole(users.ROLE_MANAGER), async (req, res) => {
            const { number, price } = req.body;
    
            if (!(number && (price || price !== "0"))) {
                res.status(status.BAD_REQUEST).send({
                    title: msg.TITLE_INCORRECT_DATA,
                    message: msg.MSG_INCORRECT_DATA,
                });
                return;
            }
    
            if (
                typeof number !== "string" ||
                typeof price !== "number"
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
                    message: msg.MSG_ROOM_IS_AVAILABLE_DEF_PRICE,
                });
                return;
            }
    
            if (rooms.isReserved(room)) {
                res.status(status.FORBIDDEN).send({
                    title: msg.TITLE_ROOM_IS_RESERVED,
                    message: msg.MSG_ROOM_IS_RESERVED_DEF_PRICE,
                });
                return;
            }
    
            rooms.setRoomField(roomIndex, "price", price);
            return res.json(rooms.getRoomByIndex(roomIndex));
        });

    /*
        POST /api/checkout
        Performs the check-out of the specified room.
        It must be in the occupied state.

        Body:

        - number: string
        - chargeback_mode?: string - only used when the debt is less than zero.
                                If the room's debt is zero and this mode is not set, the operation will be cancelled.
                                Accepted modes: 'keep' and 'reverse'.
                                
                                'keep' - will perform the operation and the leftover will be kept on the cash.
                                'reverse' - will perform the operation and reverse the leftover, removing it from the cash.

                                Use 'none' when you don't want to set this.

        Returns: the modified room.
        Return Type: Room (object)
    */
    app.post("/api/checkout", auth.authorize, auth.checkRole(users.ROLE_RECEPTIONIST), async (req, res) => {
        const { number, chargeback_mode } = req.body;

        if (!number) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA,
                message: msg.MSG_INCORRECT_DATA,
            });
            return;
        }

        if (typeof number !== "string" ||
            typeof chargeback_mode !== "string") {
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

        const debt = util.getDebt(room);
        let performReverse = false;

        if (debt > 0) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOM_IS_IN_DEBT,
                message: msg.MSG_ROOM_IS_IN_DEBT,
            });
            return;
        }

        else if (debt < 0) {
            switch (chargeback_mode) {
                case "keep":
                    // ok, keep the cash and proceed with the operation.
                    break;
                
                case "reverse":
                    // The user must have a role that is equal or above Manager to perform a chargeback.
                    if (users.getRoleLevel(req.user.role) < users.getRoleLevel(users.ROLE_MANAGER)) {
                        res.status(status.UNAUTHORIZED).send({
                            title: "Permissões insuficientes",
                            message: `Esse usuário não possui permissão suficiente para realizar essa ação. É necessário um cargo de, pelo menos, ${users.formatRole(users.ROLE_MANAGER)}. Esse usuário possui o cargo ${users.formatRole(req.user.role)}.`,
                        });

                        return;
                    }

                    performReverse = true;
                    break;
                
                default:
                    res.status(status.FORBIDDEN).send({
                        title: msg.TITLE_CHARGEBACK_NOT_SET,
                        message: msg.MSG_CHARGEBACK_NOT_SET,
                    });
                    return;
            }
        }

        if (new Date(Date.now()).setHours(...rooms.defaultCheckOutHours) !== new Date(room.check_out).setHours(...rooms.defaultCheckOutHours)) {
            res.status(status.FORBIDDEN).send({
                title: msg.TITLE_ROOMS_CHECK_OUT_IS_NOT_TODAY,
                message: msg.MSG_ROOMS_CHECK_OUT_IS_NOT_TODAY,
            });
            return;
        }

        if (performReverse) {
            rooms.addHotelPayment({
                amount: debt,
                method: "chargeback",
                room: room.number,
                time: Date.now(),
            });
        }
        
        const newRoom = rooms.defaultRoom(number);

        rooms.setRoom(roomIndex, newRoom);
        res.json(newRoom);
    });
}

module.exports = setupApiRoutes;
