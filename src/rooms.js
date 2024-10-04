const hotel = {
    name: "Trajano Palace Hotel",
    rooms: [],
    cash: 0,
    // TODO: add opening time
};

const AVAILABLE = "available";
const RESERVED = "reserved";
const OCCUPIED = "occupied";

const default_check_out_days = 1;
const default_check_out_hours = [12, 0, 0, 0];

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
    "110"
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
}

function setRoomField(index, field, value) {
    hotel.rooms[index][field] = value;
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

module.exports = {
    hotel,

    default_check_out_days,
    default_check_out_hours,

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

    getRoom,
    getRoomIndex,
    getRoomByIndex,
    setRoom,

    defaultRoom,
};
