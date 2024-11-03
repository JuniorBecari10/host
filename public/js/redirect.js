function check(alert) {
    if (alert) {
        // if the token is missing or is invalid, redirect to login, since this request will fail if that happens
        getUser()
            .catch((e) => {
                if (alert) {
                    swal({
                        title: 'Token de acesso expirado ou excluído',
                        text: 'Você será redirecionado para a tela de login.',
                        icon: 'warning',
                        dangerMode: 'true',
                    })
                        .then(async (_) => {
                            window.location.href = `http://${API_URL}/login`;
                        });
                }
                else
                    window.location.href = `http://${API_URL}/login`;
            });
    }

    // fallback to redirect to login if the token is missing
    if (!localStorage.getItem("token")) {
        if (alert) {
            swal({
                title: 'Token de acesso expirado ou excluído',
                text: 'Você será redirecionado para a tela de login.',
                icon: 'information',
                dangerMode: 'true',
            })
                .then(async (_) => {
                    window.location.href = `http://${API_URL}/login`;
            });
        }
        else
            window.location.href = `http://${API_URL}/login`;
    }
}

setInterval(() => check(true), 10000); // run every 10 seconds
check(false); // run once now