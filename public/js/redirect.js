// if the token is missing or is invalid, redirect to login, since this request will fail if that happens
getUser().catch((_) => {
    window.location.href = `http://${API_URL}/login`;
});

// fallback to redirect to login if the token is missing
if (!localStorage.getItem("token"))
    window.location.href = `http://${API_URL}/login`;
