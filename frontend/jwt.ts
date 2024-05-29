export const getTokens = async (email: string, password: string) => {
    const res = await fetch("/api/token/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            password: password,
        }),
    });
    return await res.json();
};

// обновить jwt токены
export const refreshTokens: any = async (refresh: string) => {
    const res = await fetch("/api/token/refresh/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            refresh: refresh,
        }),
    });
    // если code = token_not_valid, то перенаправить на страницу авторизации
    if (res.status === 401) {
        window.location.href = "/auth";
        return;
    } else {
        return await res.json();
    }

};

// отправить запрос с jwt авторизацией
export const sendRequest = async (url: string, method: string, body: any) => {
    const res = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify(body),
    });
    if (res.status == 204) {
        return;
    }
    const data = await res.json();
    if (data.code === "token_not_valid") {
        const refresh = localStorage.getItem("refresh");
        // если токена нет, то перенаправить на страницу авторизации
        if (!refresh) {
            window.location.href = "/auth";
            return;
        }
        const tokens = await refreshTokens(refresh);
        localStorage.setItem("access", tokens.access);
        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
            body: JSON.stringify(body),
        });
        if (res.status == 204) {
            return;
        }
        return await res.json();
    }
    return data;
};

// отправить изображение на сервер
export const sendImage = async (url: string, method: string, body: any) => {
    const res = await fetch(url, {
        method: method,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: body,
    });
    const data = await res.json();
    if (data.code === "token_not_valid") {
        const refresh = localStorage.getItem("refresh");
        // если токена нет, то перенаправить на страницу авторизации
        if (!refresh) {
            window.location.href = "/auth";
            return;
        }
        const tokens = await refreshTokens(refresh);
        localStorage.setItem("access", tokens.access);
        const res = await fetch(url, {
            method: method,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
            body: body,
        });
        return await res.json();
    }
    return data;
};