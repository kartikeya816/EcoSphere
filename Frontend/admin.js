async function loadReports() {

    const reportsDiv = document.getElementById("reports");
    const reportSelect = document.getElementById("reportId");

    if (!reportsDiv) {
        console.error("Element with id='reports' not found.");
        return;
    }

    if (!reportSelect) {
        console.error("Element with id='reportId' not found.");
        return;
    }

    reportsDiv.innerText = "Loading reports...";

    try {

        const response = await fetch(
            "http://localhost:8080/api/reports"
        );

        if (!response.ok) {
            throw new Error("Failed to load reports");
        }

        const reports = await response.json();

        const activeReports = reports.filter(
            report => report.status !== "COMPLETED"
        );

        // Clear old reports
        reportsDiv.innerHTML = "";

        // Reset report dropdown
        reportSelect.innerHTML =
            "<option value=''>Select Report</option>";

        if (activeReports.length === 0) {

            reportsDiv.innerText = "No active reports.";

        } else {

            activeReports.forEach(report => {

                const status =
                    report.status || "REPORTED";

                // Add report to dropdown
                reportSelect.innerHTML +=
                    "<option value='" +
                    report.id +
                    "'>" +
                    "Report #" +
                    report.id +
                    " - " +
                    (report.wasteType || "Unknown Waste") +
                    "</option>";

                // Duplicate information
                let duplicateInfo = "";

                if (report.status === "POSSIBLE_DUPLICATE") {

                    duplicateInfo =
                        "<p><b>⚠ Duplicate Confidence:</b> " +
                        report.duplicateConfidence +
                        "%</p>" +

                        "<p><b>Similar Report:</b> #" +
                        report.duplicateOfReportId +
                        "</p>";
                }

                // Report card
                reportsDiv.innerHTML +=

                    "<div class='card'>" +

                    "<h3>Report #" +
                    report.id +
                    "</h3>" +

                    "<p><b>Tracking Code:</b> " +
                    (report.hashCode || "N/A") +
                    "</p>" +

                    "<p><b>Waste Type:</b> " +
                    (report.wasteType || "Unknown") +
                    "</p>" +

                    "<p><b>Location:</b> " +
                    (report.location || "Unknown") +
                    "</p>" +

                    "<p><b>Status:</b> " +

                    "<span class='status-badge " +
                    status.toLowerCase() +
                    "'>" +

                    status +

                    "</span>" +

                    "</p>" +

                    duplicateInfo +

                    "<p><b>Description:</b> " +
                    (report.description || "No description") +
                    "</p>" +

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

    const workersDiv =
        document.getElementById("workers");

    const workerSelect =
        document.getElementById("workerId");

    if (!workersDiv) {
        console.error("Element with id='workers' not found.");
        return;
    }

    if (!workerSelect) {
        console.error("Element with id='workerId' not found.");
        return;
    }

    workersDiv.innerText = "Loading workers...";

    try {

        const response = await fetch(
            "http://localhost:8080/api/workers"
        );

        if (!response.ok) {
            throw new Error("Failed to load workers");
        }

        const workers = await response.json();

        workersDiv.innerHTML = "";

        workerSelect.innerHTML =
            "<option value=''>Select Worker</option>";

        if (workers.length === 0) {

            workersDiv.innerText =
                "No workers available.";

            return;
        }

        workers.forEach(worker => {

            workerSelect.innerHTML +=

                "<option value='" +
                worker.id +
                "'>" +

                worker.name +

                " (ID: " +
                worker.id +
                ")" +

                "</option>";

            workersDiv.innerHTML +=

                "<div class='card'>" +

                "<h3>" +
                worker.name +
                "</h3>" +

                "<p><b>Email:</b> " +
                worker.email +
                "</p>" +

                "<p><b>Phone:</b> " +
                (worker.phone || "N/A") +
                "</p>" +

                "<p><b>Status:</b> " +
                (worker.status || "UNKNOWN") +
                "</p>" +

                "</div>";
        });

    } catch (error) {

        workersDiv.innerText =
            "Could not connect to EcoSphere server.";

        console.error(error);
    }
}


async function assignReport() {

    const reportIdElement =
        document.getElementById("reportId");

    const workerIdElement =
        document.getElementById("workerId");

    const result =
        document.getElementById("assignResult");

    if (!reportIdElement ||
        !workerIdElement ||
        !result) {

        console.error(
            "Assignment form elements are missing."
        );

        return;
    }

    const reportId =
        reportIdElement.value;

    const workerId =
        workerIdElement.value;

    if (!reportId || !workerId) {

        result.innerText =
            "Select a report and worker.";

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

            const errorText =
                await response.text();

            result.innerText =
                "Assignment failed: " +
                errorText;

            return;
        }

        const assignment =
            await response.json();

        result.innerText =
            "Report assigned successfully. Assignment ID: " +
            assignment.id;

        // Refresh dashboard
        await loadReports();
        await loadStats();

    } catch (error) {

        result.innerText =
            "Could not connect to EcoSphere server.";

        console.error(error);
    }
}


async function loadStats() {

    try {

        const reportsResponse =
            await fetch(
                "http://localhost:8080/api/reports"
            );

        const workersResponse =
            await fetch(
                "http://localhost:8080/api/workers"
            );

        if (!reportsResponse.ok ||
            !workersResponse.ok) {

            throw new Error(
                "Failed to load dashboard statistics"
            );
        }

        const reports =
            await reportsResponse.json();

        const workers =
            await workersResponse.json();

        const completed =
            reports.filter(
                report =>
                    report.status === "COMPLETED"
            ).length;

        const pending =
            reports.length - completed;

        const totalReports =
            document.getElementById(
                "totalReports"
            );

        const totalWorkers =
            document.getElementById(
                "totalWorkers"
            );

        const pendingReports =
            document.getElementById(
                "pendingReports"
            );

        const completedReports =
            document.getElementById(
                "completedReports"
            );

        if (totalReports) {

            totalReports.innerText =
                reports.length;
        }

        if (totalWorkers) {

            totalWorkers.innerText =
                workers.length;
        }

        if (pendingReports) {

            pendingReports.innerText =
                pending;
        }

        if (completedReports) {

            completedReports.innerText =
                completed;
        }

    } catch (error) {

        console.error(
            "Could not load statistics:",
            error
        );
    }
}


// Initial dashboard loading

loadStats();

loadReports();

loadWorkers();


// Refresh statistics every 10 seconds

setInterval(
    loadStats,
    10000
);