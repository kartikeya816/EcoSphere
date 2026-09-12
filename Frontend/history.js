async function loadHistory() {

    const historyDiv = document.getElementById("history");

    try {

        const response = await fetch(
            "http://localhost:8080/api/reports"
        );

        const reports = await response.json();

        const completedReports = reports.filter(
            report => report.status === "COMPLETED"
        );

        historyDiv.innerHTML = "";

        if (completedReports.length === 0) {

            historyDiv.innerText = "No completed reports yet.";

            return;
        }

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
                report.description + "</p>" +
                "<p><b>Completed Work:</b> Waste collection completed successfully.</p>" +
                "</div>";

        });

    } catch (error) {

        historyDiv.innerText =
            "Could not connect to EcoSphere server.";

        console.error(error);
    }
}

loadHistory();