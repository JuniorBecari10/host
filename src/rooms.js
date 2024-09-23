const rooms = [];

const AVAILABLE = "available";
const RESERVED = "reserved";
const OCCUPIED = "occupied";

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
].forEach(number => rooms.push(defaultRoom(number)));

// ---

function getRoom(number) {
    return rooms.find(r => r.number.toLowerCase() === number.toLowerCase());
}

function getRoomIndex(number) {
    return rooms.indexOf(rooms.find(r => r.number.toLowerCase() === number.toLowerCase()));
}

function setRoom(index, room) {
    rooms[index] = room;
}

function setRoomField(index, field, value) {
    rooms[index][field] = value;
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
    rooms,

    AVAILABLE,
    RESERVED,
    OCCUPIED,

    isAvailable,
    isReserved,
    isOccupied,

    setRoomField,

    getRoom,
    getRoomIndex,
    setRoom,

    defaultRoom,
};
