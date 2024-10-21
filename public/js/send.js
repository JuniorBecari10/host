const API_URL = "localhost:8080";

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
