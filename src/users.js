const fs = require("fs");

const ROLE_RECEPTIONIST = "receptionist";
const ROLE_MANAGER = "manager";
const ROLE_ADMINISTRATOR = "administrator";

const USERS_DATABASE_FILE_NAME = "users_database.json";

// By default, there's a system administrator account.
let users = [
    {
        name: "Administrador",
        email: "admin@admin.adm",
        password: "$2b$10$VJ6UICGNvXn6QhfaIrWK9OQ0O/32OO/bK0o4KCgcDgCxzFcvEB8Ea",
        role: ROLE_ADMINISTRATOR,
    }
];

function saveData() {
    const json = JSON.stringify(users);
    fs.writeFile(USERS_DATABASE_FILE_NAME, json, "utf8", error => {
        if (error) {
            console.log("Couldn't write database to file.");
            throw error;
        }
    });
}

function loadData() {
    fs.readFile(USERS_DATABASE_FILE_NAME, "utf8", (error, data) => {
        if (error) {
            console.log("Couldn't read database.");
            throw error;
        }

        Object.assign(users, JSON.parse(data));
    });
}

function getRoleLevel(role) {
    switch (role) {
        case ROLE_RECEPTIONIST: return 0;
        case ROLE_MANAGER: return 1;
        case ROLE_ADMINISTRATOR: return 2;

        default: return -1;
    }
}

function formatRole(role) {
    switch (role) {
        case ROLE_RECEPTIONIST: return "Recepcionista";
        case ROLE_MANAGER: return "Gerente";
        case ROLE_ADMINISTRATOR: return "Administrador";

        default: return -1;
    }
}

module.exports = {
    ROLE_RECEPTIONIST,
    ROLE_MANAGER,
    ROLE_ADMINISTRATOR,

    USERS_DATABASE_FILE_NAME,

    loadData,
    saveData,

    users,
    getRoleLevel,
    formatRole,
};
