const one_day = 24 * 60 * 60 * 1000;

function diffDays(date_a, date_b) {
    const diff_millis = date_b - date_a;
    return Math.ceil(diff_millis / one_day);
}

function addDays(date, numDays) {
    date += one_day * numDays;
    return date;
}

module.exports = {
    diffDays,
    addDays,
}
