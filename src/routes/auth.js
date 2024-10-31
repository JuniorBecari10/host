const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const status = require("../status");
const msg = require("./api/msg");
const users = require("../users");

function setupAuthRoutes(app) {
    /*
        POST /api/login
        Performs a log-in operation.

        Parameters:
        email: string
        password: string

        Returns: The token to be used with the rest of the API.
        Return Type: string
    */
    app.post("/api/login", (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA,
                message: msg.MSG_INCORRECT_DATA,
            });
            return;
        }

        if (typeof email !== "string" || typeof password !== "string") {
            res.status(status.BAD_REQUEST).send({
                title: msg.TITLE_INCORRECT_DATA_TYPES,
                message: msg.MSG_INCORRECT_DATA_TYPES,
            });
            return;
        }

        const user = users.users.find(u => u.email === email);

        if (user === undefined) {
            return res.status(status.UNAUTHORIZED)
                .json({
                    title: msg.TITLE_USER_NOT_FOUND,
                    message: msg.MSG_USER_NOT_FOUND,
                });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err)
                throw err;
            
            if (!isMatch)
                return res.status(status.UNAUTHORIZED)
                    .json({
                        title: msg.TITLE_INCORRECT_PASSWORD,
                        message: msg.MSG_INCORRECT_PASSWORD,
                    });
            
            const payload = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            };

            const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "2h" });
            res.json({ token });
        });
    });
}

/*
    Authorization middleware to authenticate the user.
    Required in all protected routes.
*/
function authorize(req, res, next) {
    const header = req.headers["authorization"];
    const token = header && header.split(" ")[1];

    if (!token)
        return res.status(status.BAD_REQUEST)
            .json({
                title: msg.TITLE_MISSING_AUTH_TOKEN,
                message: msg.MSG_MISSING_AUTH_TOKEN,
            });

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err)
            return res.status(status.FORBIDDEN)
                .json({
                    title: msg.TITLE_INVALID_OR_EXPIRED_AUTH_TOKEN,
                    message: msg.MSG_INVALID_OR_EXPIRED_AUTH_TOKEN,
                });
        
        req.user = decoded;
        next();
    });
}

/*
    Middleware generator function that checks the role of an authenticated user.
    If the role isn't sufficient, it returns 401 Unauthorized as status code.
    Otherwise, it proceeds with the operation.
*/
function checkRole(role) {
    return (req, res, next) => {
        const user = req.user;

        if (!user)
            return res.status(status.UNAUTHORIZED).send({
                title: "Usuário não identificado",
                message: "Faça login primeiro.",
            });

        if (users.getRoleLevel(user.role) < users.getRoleLevel(role)) {
            return res.status(status.UNAUTHORIZED).send({
                title: "Permissões insuficientes",
                message: `Esse usuário não possui permissão suficiente para realizar essa ação. É necessário um cargo de, pelo menos, ${users.formatRole(role)}. Esse usuário possui o cargo ${users.formatRole(user.role)}.`,
            });
        }

        next();
    };
}

async function hashPassword(password) {
    const SALT_ROUNDS = 10;
    return await bcrypt.hash(password, SALT_ROUNDS);
}

module.exports = {
    setupAuthRoutes,
    authorize,
    checkRole,
    hashPassword,
}
