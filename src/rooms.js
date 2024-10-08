const fs = require("fs");

let hotel = {
    name: "Antônio's Hotel",
    rooms: [],

    cash: 0,
    cash_opening_time: Date.now(),
};

const AVAILABLE = "available";
const RESERVED = "reserved";
const OCCUPIED = "occupied";

const default_check_out_days = 1;
const default_check_out_hours = [12, 0, 0, 0];

const DATABASE_LOCATION = "./database.json";

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

function getHotelRooms() {
    return hotel.rooms;
}

function getHotelCash() {
    return hotel.cash;
}

function getHotelCashOpeningTime() {
    return hotel.cash_opening_time;
}

function setHotelCash(value) {
    hotel.cash = value;
    saveData();
}

function setHotelCashOpeningTime(value) {
    hotel.cash_opening_time = value;
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
        debt: 0,
    
        check_in: 0,
        check_out: 0,
    };
}

// ---

function saveData() {
    const json = JSON.stringify(hotel);
    fs.writeFile(DATABASE_LOCATION, json, "utf8", error => {
        if (error) {
            console.log("Couldn't write database to file.");
            throw error;
        }
    });
}

function loadData() {
    fs.readFile(DATABASE_LOCATION, "utf8", (error, data) => {
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

    default_check_out_days,
    default_check_out_hours,

    DATABASE_LOCATION,

    AVAILABLE,
    RESERVED,
    OCCUPIED,

    isAvailable,
    isReserved,
    isOccupied,

    setRoomField,

    getHotelName,
    getHotelRooms,
    getHotelCash,
    getHotelCashOpeningTime,

    setHotelCash,
    setHotelCashOpeningTime,

    getRoom,
    getRoomIndex,
    getRoomByIndex,
    setRoom,

    defaultRoom,
    loadData,
};
