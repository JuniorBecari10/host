const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ENV_PATH = path.join(__dirname, "..", ".env");

function setupEnv() {
    if (!fs.existsSync(ENV_PATH)) {
        const envContent = `SECRET_KEY=${generateSecretKey()}\nPORT=8080\n`;
      
        fs.writeFileSync(ENV_PATH, envContent, 'utf8');
        console.log("'.env' file created successfully!");
      }
      
      else
        console.log("'.env' file already exists.");

    console.log();
}

function generateSecretKey() {
    return crypto.randomBytes(32).toString("hex");
}

module.exports = {
    setupEnv
};
