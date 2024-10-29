const ROLE_RECEPTIONIST = "receptionist";
const ROLE_MANAGER = "manager";
const ROLE_ADMINISTRATOR = "administrator";

const USERS_DATABASE_FILE_NAME = "users_database.json";

// By default, there's a system administrator account.
let users = [
    {
        id: 0,
        name: "Administrador",
        email: "admin@admin.adm",
        password: "$2b$10$VJ6UICGNvXn6QhfaIrWK9OQ0O/32OO/bK0o4KCgcDgCxzFcvEB8Ea",
        role: ROLE_ADMINISTRATOR,
    }
];

function loadDataUsers() {
    fs.readFile(USERS_DATABASE_FILE_NAME, "utf8", (error, data) => {
        if (error) {
            console.log("Couldn't read database.");
            throw error;
        }

        users = JSON.parse(data);
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

    users,
    loadDataUsers,
    getRoleLevel,
    formatRole,
};
