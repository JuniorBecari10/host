const API_URL = "localhost:8080";

function formatCurrency(number) {
    return (number / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatMoney(e) {
    let value = e.target.value;
    value = value.replace(/\D/g, "");

    value = formatCurrency(value);
    e.target.value = value;
}

function formatCPF(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 11)
        value = value.slice(0, 11);

    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    e.target.value = value;
}

function formatPhone(e) {
    let value = e.target.value;
    value = value.replace(/\D/g, '');

    if (value.length > 11)
        value = value.slice(0, 11);

    if (value.length == 10)
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2' + (value.length > 6 ? '-$3' : '$3'));
    else if (value.length > 7)
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2' + (value.length > 6 ? '-$3' : '$3'));
    else if (value.length > 2)
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    else if (value.length > 0)
        value = value.replace(/^(\d{0,2})/, '($1');

    e.target.value = value;
}

// ---

function formatStrCPF(value) {
    if (value.length > 11)
        value = value.slice(0, 11);

    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    return value;
}

function formatStrPhone(value) {
    value = value.replace(/\D/g, '');

    if (value.length > 11)
        value = value.slice(0, 11);

    if (value.length > 7)
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2' + (value.length > 6 ? '-$3' : '$3'));
    else if (value.length > 2)
        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    else if (value.length > 0)
        value = value.replace(/^(\d{0,2})/, '($1');

    return value;
}


// ---

function dateToUnix(date_str) {
    const date = new Date(date_str);
    date.setHours(date.getHours() + 3); // Para ajustar o fuso horário (GMT-03:00)

    return date.getTime();
}

function unixToDate(date) {
    return new Date(date).toISOString().split("T")[0];
}

function unixToDateTime(date) {
    return new Date(date).toISOString().split("T")[0];
}

function formatPaymentMethod(method) {
    switch (method) {
        case "cash": return "Dinheiro";
        case "card": return "Cartão";
        case "pix": return "Pix";
        case "billed": return "Faturado";

        case "chargeback": return "Estorno";

        default:
            console.error(`Método de pagamento desconhecido: ${method}`);
            break;
    }
}

function unixToDateTime(epoch) {
    const date = new Date(epoch);

    // Obtém os componentes da data
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function currencyToFloat(str) {
    return parseFloat(str.replace("R$", "")
        .replace(".", "")
        .replace(",", ".")
        .trim());
}

async function getName() {
    return axios.get(`http://${API_URL}/api/name`)
        .then(res => res.data.name)
        .catch(e => console.error(JSON.parse(e.request.responseText).message));
}

async function getCash() {
    return axios.get(`http://${API_URL}/api/cash`)
        .then(res => res.data.cash)
        .catch(e => console.error(JSON.parse(e.request.responseText).message));
}

async function getCashOpeningTime() {
    return axios.get(`http://${API_URL}/api/cash-opening-time`)
        .then(res => res.data.time)
        .catch(e => console.error(JSON.parse(e.request.responseText).message));
}

async function getPayments() {
    return axios.get(`http://${API_URL}/api/payments`)
        .then(res => res.data.payments)
        .catch(e => console.error(JSON.parse(e.request.responseText).message));
}

async function getRooms() {
    return axios.get(`http://${API_URL}/api/rooms`)
        .then(res => res.data.rooms)
        .catch(e => console.error(JSON.parse(e.request.responseText).message));
}

async function getRoomDebt(number) {
    return axios.get(`http://${API_URL}/api/debt/${number}`)
        .then(res => res.data.debt)
        .catch(e => console.error(JSON.parse(e.request.responseText).message));
}

async function getCheckOutHour() {
    return axios.get(`http://${API_URL}/api/check-out-hour`)
        .then(res => res.data)
        .catch(e => console.error(JSON.parse(e.request.responseText).message));
}

async function getRoom(number) {
    return axios.get(`http://${API_URL}/api/name`,
        {
            number
        },
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
        .then(res => res.data.name)
        .catch(e => console.error(JSON.parse(e.request.responseText).message));
}

// ---

async function sendApiRequest(endpoint, data = {}) {
    try {
        const response = await axios.post(`http://${API_URL}/api/${endpoint}`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return { success: true, data: response.data };
    } catch (e) {
        try {
            const { title, message } = JSON.parse(e.request.responseText);
            swal(title, message, "error");
        } catch (parseError) {
            swal("Erro", "Um erro inesperado ocorreu. O servidor pode estar desligado.", "error");
        }
        return { success: false, error: e.message };
    }
}

async function reserve(number, guests, price, check_out) {
    price = currencyToFloat(price);
    check_out = check_out ? dateToUnix(check_out) : -1;
    guests = guests.map(guest => ({
        name: guest.name,
        cpf: guest.cpf.replace(/\D/g, ''),
        phone: guest.phone.replace(/\D/g, '')
    }));

    return sendApiRequest('reserve', { number, guests, price, check_out });
}

async function editReservation(number, guests, price, check_out) {
    price = currencyToFloat(price);
    check_out = check_out ? dateToUnix(check_out) : -1;
    guests = guests.map(guest => ({
        name: guest.name,
        cpf: guest.cpf.replace(/\D/g, ''),
        phone: guest.phone.replace(/\D/g, '')
    }));
    
    return sendApiRequest('edit-reservation', { number, guests, price, check_out });
}

async function changeCheckOut(number, check_out) {
    check_out = check_out ? dateToUnix(check_out) : -1;
    return sendApiRequest('change-check-out', { number, check_out });
}

async function cancel(number) {
    return sendApiRequest('cancel', { number });
}

async function checkIn(number) {
    return sendApiRequest('checkin', { number });
}

async function checkOut(number, chargeback_mode) {
    return sendApiRequest('checkout', { number, chargeback_mode });
}

async function pay(number, amount, method) {
    amount = currencyToFloat(amount);
    return sendApiRequest('pay', { number, amount, method });
}

async function closeCash() {
    return sendApiRequest('close-cash');
}

