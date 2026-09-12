async function login(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const result = document.getElementById("loginResult");

    if (!email || !password) {
        result.innerText = "Please enter email and password.";
        return;
    }

    const body = {
        email: email,
        password: password
    };

    try {

        // Try Admin Login

        let response = await fetch(
            "http://localhost:8080/api/users/admin/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        if (response.ok) {

            const user = await response.json();

            if (user.role === "ADMIN") {

                localStorage.setItem("adminLoggedIn", "true");

                window.location.href = "admin.html";
                return;
            }
        }


        // Try Worker Login

        response = await fetch(
            "http://localhost:8080/api/workers/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        if (response.ok) {

            const worker = await response.json();

            localStorage.setItem(
                "workerId",
                worker.id
            );

            window.location.href = "worker.html";
            return;
        }


        result.innerText =
            "Invalid email or password.";

    } catch (error) {

        result.innerText =
            "Could not connect to EcoSphere server.";

        console.error(error);
    }
}