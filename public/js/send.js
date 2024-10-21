const API_URL = "localhost:8080";

async function sendGet(endpoint) {
    const token = localStorage.getItem("token") || "";
    try {
        const response = await axios.get(`http://${API_URL}/api/${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (e) {
        console.error(JSON.parse(e.request.responseText).message);
    }
}

async function sendPost(endpoint, data = {}) {
    try {
        const token = localStorage.getItem("token") || "";
        const response = await axios.post(`http://${API_URL}/api/${endpoint}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
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
