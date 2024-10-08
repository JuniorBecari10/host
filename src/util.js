const one_day = 24 * 60 * 60 * 1000;

function diffDays(date_a, date_b) {
    const diff_millis = date_b - date_a;
    return Math.ceil(diff_millis / one_day);
}

function addDays(date, numDays) {
    date += one_day * numDays;
    return date;
}

function logMiddleware(req, _, next) {
    console.log(logMessage(req));
    next();
}

function formatCheckOutHour(check_out) {
    const hours = check_out[0].toString().padStart(2, "0");
    const minutes = check_out[1].toString().padStart(2, "0");
    return `${hours}:${minutes}`
}

function logMessage(req) {
    // Message structure:
    // [00/00/00 - 00:00:00] METHOD /path
    
    const now = new Date(Date.now());
        
    const day = [
        now.getDay() < 10 ? "0" + now.getDay() : now.getDay(),
        now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1,
        now.getFullYear(),
    ];

    const time = [
        now.getHours() < 10 ? "0" + now.getHours() : now.getHours(),
        now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes(),
        now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds(),
    ];

    return `[${day.join("/")} - ${time.join(":")}] ${req.method} ${req.originalUrl}`;
}

module.exports = {
    diffDays,
    addDays,
    logMiddleware,
    formatCheckOutHour,
}
