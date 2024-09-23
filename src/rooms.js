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
].forEach(number => rooms.push({
    number: number,
    state: AVAILABLE,

    // Optional - only when it's occupied
    guests: [],
    price: 0,
    debt: 0,

    check_in: 0,
    check_out: 0,

    isAvailable: function () {
        return this.state == AVAILABLE;
    },
}));

function getRoom(number) {
    return rooms.find(r => r.number.toLowerCase() === number.toLowerCase());
}

function getRoomIndex(number) {
    return rooms.indexOf(rooms.find(r => r.number.toLowerCase() === number.toLowerCase()));
}

function setRoom(index, room) {
    rooms[index] = room;
}

module.exports = {
    rooms,

    AVAILABLE,
    RESERVED,
    OCCUPIED,

    getRoom,
    getRoomIndex,
    setRoom,
};
