const fs = require("fs");

let hotel = {
    name: "Antônio's Hotel",
    rooms: [],

    cashOpeningTime: Date.now(),
    payments: [],
};

const AVAILABLE = "available";
const RESERVED = "reserved";
const OCCUPIED = "occupied";

const defaultCheckOutDays = 1;
const defaultCheckOutHours = [12, 0, 0, 0];
const allowedPaymentMethods = [
    "card",
    "cash",
    "pix",
    "billed",

    // "chargeback" - for internal use, won't be checked
];

const HOTEL_DATABASE_FILE_NAME = "./hotel_database.json";

[
    "101",
    "102",
    "103",
    "104",
    "105A",
    "105B",
    "106A",
    "106B",
    "107",
    "108",
    "109",
    "110",
    "111",
    "112",
    "113",
    "114",
    "115",
    "116",
    "117A",
    "117B",
    "118",
].forEach(number => hotel.rooms.push(defaultRoom(number)));

// ---

function getHotelName() {
    return hotel.name;
}

function setHotelName(name) {
    hotel.name = name;
}

function getHotelRooms() {
    return hotel.rooms;
}

function getHotelCash() {
    return hotel.payments
        .map(x => x.amount)
        .reduce((acc, x) => acc + x, 0);
}

function getHotelCashOpeningTime() {
    return hotel.cashOpeningTime;
}

function getHotelPayments() {
    return hotel.payments;
}

function addHotelPayment(payment) {
    hotel.payments.push(payment);
}

function resetHotelPayments() {
    hotel.payments = [];
    saveData();
}

function setHotelCashOpeningTime(value) {
    hotel.cashOpeningTime = value;
    saveData();
}

// ---

function getRoom(number) {
    return hotel.rooms.find(r => r.number.toLowerCase() === number.toLowerCase());
}

function getRoomIndex(number) {
    return hotel.rooms.indexOf(hotel.rooms.find(r => r.number.toLowerCase() === number.toLowerCase()));
}

function getRoomByIndex(index) {
    if (index < 0 || index >= hotel.rooms.length)
        return null;

    return hotel.rooms[index];
}

function setRoom(index, room) {
    hotel.rooms[index] = room;
    saveData();
}

function setRoomField(index, field, value) {
    hotel.rooms[index][field] = value;
    saveData();
}

// ---

function isAvailable(room) {
    return room.state == AVAILABLE;
}

function isReserved(room) {
    return room.state == RESERVED;
}

function isOccupied(room) {
    return room.state == OCCUPIED;
}

// ---

function defaultRoom(number) {
    return {
        number,
        state: AVAILABLE,
    
        // Optional - only when it's occupied
        guests: [],
        price: 0,
        payments: [],
    
        check_in: 0,
        check_out: 0,
    };
}

// ---

// TODO: the payments aren't being saved
function saveData() {
    const json = JSON.stringify(hotel);
    fs.writeFile(HOTEL_DATABASE_FILE_NAME, json, "utf8", error => {
        if (error) {
            console.log("Couldn't write database to file.");
            throw error;
        }
    });
}

function loadData() {
    fs.readFile(HOTEL_DATABASE_FILE_NAME, "utf8", (error, data) => {
        if (error) {
            console.log("Couldn't read database.");
            throw error;
        }

        hotel = JSON.parse(data);
    });
}

// ---

module.exports = {
    hotel,

    defaultCheckOutDays,
    defaultCheckOutHours,
    allowedPaymentMethods,

    HOTEL_DATABASE_FILE_NAME,

    AVAILABLE,
    RESERVED,
    OCCUPIED,

    isAvailable,
    isReserved,
    isOccupied,

    setRoomField,
    saveData,

    getHotelName,
    setHotelName,
    getHotelRooms,
    getHotelCash,
    getHotelCashOpeningTime,
    getHotelPayments,
    addHotelPayment,
    resetHotelPayments,

    setHotelCashOpeningTime,

    getRoom,
    getRoomIndex,
    getRoomByIndex,
    setRoom,

    defaultRoom,
    loadData,
};
