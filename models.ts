interface HasId {
    id: string;
}

type Id = string;

// ---

// this is in the database
// accessible by: Administrator
interface HotelBase {
    hotels: Hotel[];
}

// the request will load one of these, and all below.
// accessible by: Administrator, Manager, Receptionist (of this hotel)
interface Hotel extends HasId {
    id: Id;

    name: string;
    groups: ApartmentGroup[];
}

interface ApartmentGroup {
    name: string;
    apartments: Apartment[];
}

interface Apartment {
    guests: Guest[]; // TODO: store the id to access it by reference
}

// ---

interface Guest extends HasId {
    id: Id;

    
}

// ---

interface User extends HasId {
    id: Id;
    hotel_id: Id;

    name: string;
    email: string;
    password: string;
    role: Role;
}

enum Role {
    Receptionist,
    Manager,
    Administrator,
}
