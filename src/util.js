const rooms = require("./rooms");
const status = require("./status");
const msg = require("./routes/api/msg");

const one_day = 24 * 60 * 60 * 1000;

function diffDays(date_a, date_b) {
    const diff_millis = date_b - date_a;
    return Math.ceil(diff_millis / one_day);
}

function addDays(date, numDays) {
    date += one_day * numDays;
    return date;
}

function logMiddleware(req, _, next) {
    console.log(logMessage(req));
    next();
}

function formatCheckOutHour(check_out) {
    const hours = check_out[0].toString().padStart(2, "0");
    const minutes = check_out[1].toString().padStart(2, "0");
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


function reserve(res, number, guests, price, check_out) {
    const roomIndex = rooms.getRoomIndex(number);
    const room = rooms.getRoomByIndex(roomIndex);

    if (rooms.isReserved(room)) {
        res.status(status.FORBIDDEN).send({ message: msg.ROOM_IS_ALREADY_RESERVED });
        return;
    }

    editReserve(res, number, guests, price, check_out);
}

function editReservation(res, number, guests, price, check_out) {
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
            ? addDays(now, rooms.default_check_out_days)
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
        debt: 0,
    
        check_in: 0,
        check_out: check_out_date,
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
