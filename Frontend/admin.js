async function loadReports() {

    const reportsDiv = document.getElementById("reports");
    const historyDiv = document.getElementById("history");
    const reportSelect = document.getElementById("reportId");

    reportsDiv.innerText = "Loading reports...";

    try {

        const response = await fetch(
            "http://localhost:8080/api/reports"
        );

        const reports = await response.json();

        const activeReports = reports.filter(
            report => report.status !== "COMPLETED"
        );

        const completedReports = reports.filter(
            report => report.status === "COMPLETED"
        );

        // Active Reports

        reportsDiv.innerHTML = "";

        reportSelect.innerHTML =
            "<option value=''>Select Report</option>";

        if (activeReports.length === 0) {

            reportsDiv.innerText = "No active reports.";

        } else {

            activeReports.forEach(report => {

                reportSelect.innerHTML +=
                    "<option value='" + report.id + "'>" +
                    "Report #" + report.id +
                    " - " + report.wasteType +
                    "</option>";

                reportsDiv.innerHTML +=
                    "<div class='card'>" +
                    "<h3>Report #" + report.id + "</h3>" +
                    "<p><b>Tracking Code:</b> " +
                    report.hashCode + "</p>" +
                    "<p><b>Waste Type:</b> " +
                    report.wasteType + "</p>" +
                    "<p><b>Location:</b> " +
                    report.location + "</p>" +
                    "<p><b>Status:</b> <span class='status-badge " +
                    report.status.toLowerCase() +
                    "'>" +
                    report.status +
                    "</span></p>" +
                    "<p><b>Description:</b> " +
                    report.description +
                    "</p>" +
                    "</div>";

            });

        }

        // Completed History

        historyDiv.innerHTML = "";

        if (completedReports.length === 0) {

            historyDiv.innerText = "No completed work yet.";

        } else {

            completedReports.forEach(report => {

                historyDiv.innerHTML +=
                    "<div class='card'>" +
                    "<h3>✓ Report #" + report.id + "</h3>" +
                    "<p><b>Tracking Code:</b> " +
                    report.hashCode + "</p>" +
                    "<p><b>Waste Type:</b> " +
                    report.wasteType + "</p>" +
                    "<p><b>Location:</b> " +
                    report.location + "</p>" +
                    "<p><b>Status:</b> COMPLETED</p>" +
                    "<p><b>Description:</b> " +
                    report.description +
                    "</p>" +
                    "<p><b>Completed Work:</b> Waste collection completed successfully.</p>" +
                    "</div>";

            });

        }

    } catch (error) {

        reportsDiv.innerText =
            "Could not connect to EcoSphere server.";

        console.error(error);

    }
}


async function loadWorkers() {

    const workersDiv = document.getElementById("workers");
    const workerSelect = document.getElementById("workerId");

    workersDiv.innerText = "Loading workers...";

    try {

        const response = await fetch(
            "http://localhost:8080/api/workers"
        );

        const workers = await response.json();

        workersDiv.innerHTML = "";

        workerSelect.innerHTML =
            "<option value=''>Select Worker</option>";

        workers.forEach(worker => {

            workerSelect.innerHTML +=
                "<option value='" + worker.id + "'>" +
                worker.name +
                " (ID: " + worker.id + ")" +
                "</option>";

            workersDiv.innerHTML +=
                "<div class='card'>" +
                "<h3>" + worker.name + "</h3>" +
                "<p><b>Email:</b> " +
                worker.email + "</p>" +
                "<p><b>Phone:</b> " +
                worker.phone + "</p>" +
                "<p><b>Status:</b> " +
                worker.status + "</p>" +
                "</div>";

        });

    } catch (error) {

        workersDiv.innerText =
            "Could not connect to EcoSphere server.";

        console.error(error);

    }
}


async function assignReport() {

    const reportId =
        document.getElementById("reportId").value;

    const workerId =
        document.getElementById("workerId").value;

    const result =
        document.getElementById("assignResult");

    if (!reportId || !workerId) {

        result.innerText =
            "Enter report ID and worker ID.";

        return;
    }

    const body = {
        reportId: parseInt(reportId),
        workerId: parseInt(workerId),
        status: "ASSIGNED"
    };

    try {

        const response = await fetch(
            "http://localhost:8080/api/assignments",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        if (!response.ok) {

            result.innerText =
                "Assignment failed.";

            return;
        }

        const assignment = await response.json();

        result.innerText =
            "Report assigned successfully. Assignment ID: "
            + assignment.id;

        // Refresh dashboard

        loadReports();
        loadStats();

    } catch (error) {

        result.innerText =
            "Could not connect to EcoSphere server.";

        console.error(error);

    }
}


async function loadStats() {

    try {

        const reportsResponse = await fetch(
            "http://localhost:8080/api/reports"
        );

        const workersResponse = await fetch(
            "http://localhost:8080/api/workers"
        );

        const reports = await reportsResponse.json();
        const workers = await workersResponse.json();

        const completed = reports.filter(
            report => report.status === "COMPLETED"
        ).length;

        const pending =
            reports.length - completed;

        document.getElementById("totalReports").innerText =
            reports.length;

        document.getElementById("totalWorkers").innerText =
            workers.length;

        document.getElementById("pendingReports").innerText =
            pending;

        document.getElementById("completedReports").innerText =
            completed;

    } catch (error) {

        console.error(error);

    }
}


loadStats();

setInterval(loadStats, 10000);

loadReports();

loadWorkers();