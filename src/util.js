const rooms = require("./rooms");
const status = require("./status");
const msg = require("./routes/api/msg");

const oneDay = 24 * 60 * 60 * 1000;

function diffDays(date_a, date_b) {
    const diffMillis = date_b - date_a;
    return Math.ceil(diffMillis / oneDay);
}

function addDays(date, numDays) {
    date += oneDay * numDays;
    return date;
}

function logMiddleware(req, _, next) {
    console.log(logMessage(req));
    next();
}

function formatCheckOutHour(checkOut) {
    const hours = checkOut[0].toString().padStart(2, "0");
    const minutes = checkOut[1].toString().padStart(2, "0");
    return `${hours}:${minutes}`
}

function logMessage(req) {
    // Message structure:
    // [00/00/00 - 00:00:00] METHOD /path
    
    const now = new Date(Date.now());
        
    const day = [
        now.getDay() < 10 ? "0" + now.getDay() : now.getDay(),
        now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1,
        now.getFullYear(),
    ];

    const time = [
        now.getHours() < 10 ? "0" + now.getHours() : now.getHours(),
        now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes(),
        now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds(),
    ];

    return `[${day.join("/")} - ${time.join(":")}] ${req.method} ${req.originalUrl}`;
}


function reserve(res, number, guests, price, checkOut) {
    const roomIndex = rooms.getRoomIndex(number);
    const room = rooms.getRoomByIndex(roomIndex);

    if (roomIndex === -1) {
        res.status(status.NOT_FOUND).send({
            title: msg.TITLE_ROOM_NOT_FOUND,
            message: msg.MSG_ROOM_NOT_FOUND,
        });
        return;
    }

    if (rooms.isReserved(room)) {
        res.status(status.FORBIDDEN).send({
            title: msg.TITLE_ROOM_IS_ALREADY_RESERVED,
            message: msg.MSG_ROOM_IS_ALREADY_RESERVED,
        });
        return;
    }

    return makeReservation(res, number, guests, price, checkOut);
}

function editReservation(res, number, guests, price, checkOut) {
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
            message: msg.MSG_ROOM_IS_AVAILABLE,
        });
        return;
    }

    return makeReservation(res, number, guests, price, checkOut);
}

function makeReservation(res, number, guests, price, checkOut) {
    if (!(number && guests && (price || price !== "0") && checkOut)) {
        res.status(status.BAD_REQUEST).send({
            title: msg.TITLE_INCORRECT_DATA,
            message: msg.MSG_INCORRECT_DATA,
        });
        return;
    }

    if (!(
        typeof number === "string" &&
        guests instanceof Array &&
        typeof price === "number" &&
        typeof checkOut === "number"
    )) {
        res.status(status.BAD_REQUEST).send({
            title: msg.TITLE_INCORRECT_DATA_TYPES,
            message: msg.MSG_INCORRECT_DATA_TYPES,
        });
        return;
    }

    if (guests.length === 0) {
        res.status(status.BAD_REQUEST).send({
            title: msg.TITLE_THERE_MUST_BE_AT_LEAST_ONE_GUEST,
            message: msg.MSG_THERE_MUST_BE_AT_LEAST_ONE_GUEST,
        });
        return;
    }

    const formattedGuests = [];

    for (let guest of guests) {
        if (!(guest.name && guest.cpf && guest.phone)) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA,
                message: msg.MSG_INCORRECT_DATA_GUESTS,
            });
            return;
        }

        if (!(
            typeof guest.name === "string" &&
            typeof guest.cpf === "string" &&
            typeof guest.phone === "string"
        )) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA_TYPES,
                message: msg.MSG_INCORRECT_DATA_TYPES_GUESTS,
            });
            return;
        }

        if (!(
            guest.name.length > 0 &&
            !/\d/.test(guest.name) &&
            guest.cpf.length === 11 &&
            [10, 11].includes(guest.phone.length)
        )) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA,
                message: msg.MSG_INCORRECT_DATA_GUESTS,
            });
            return;
        }

        // check if name only has letters and spaces
        // check if cpf has 11 digits and only numbers
        // check if phone has 10 or 11 digits and only numbers

        formattedGuests.push({
            name: guest.name,
            cpf: guest.cpf,
            phone: guest.phone,
        });
    }

    guests = formattedGuests;

    const roomIndex = rooms.getRoomIndex(number);
    const room = rooms.getRoomByIndex(roomIndex);

    if (roomIndex === -1) {
        res.status(status.NOT_FOUND).send({
            title: msg.TITLE_ROOM_NOT_FOUND,
            message: msg.MSG_ROOM_NOT_FOUND,
        });
        return;
    }

    if (rooms.isOccupied(room)) {
        res.status(status.FORBIDDEN).send({
            title: msg.TITLE_ROOM_IS_OCCUPIED,
            message: msg.MSG_ROOM_IS_OCCUPIED_RESERVATION
        });
        return;
    }

    const now = Date.now();
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
        state: rooms.RESERVED,
    
        guests,
        price,
        debt: 0,
    
        check_in: 0,
        check_out: checkOutDate,
    };

    rooms.setRoom(roomIndex, newRoom);
    return newRoom;
}

module.exports = {
    diffDays,
    addDays,
    logMiddleware,
    formatCheckOutHour,

    reserve,
    editReservation,
}
