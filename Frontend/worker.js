async function loadAssignments() {

    const workerId = localStorage.getItem("workerId");
    const assignmentsDiv = document.getElementById("assignments");



    assignmentsDiv.innerText = "Loading assignments...";

    try {

        const response = await fetch(
            "http://localhost:8080/api/assignments/worker/" + workerId
        );

        const assignments = await response.json();

        assignmentsDiv.innerHTML = "";

        if (assignments.length === 0) {
            assignmentsDiv.innerText = "No assignments found.";
            return;
        }

        for (const assignment of assignments) {

            const reportResponse = await fetch(
                "http://localhost:8080/api/assignments/"
                + assignment.id
                + "/report"
            );

            const report = await reportResponse.json();

            assignmentsDiv.innerHTML +=
                "<div class='card'>" +

                "<img src='http://localhost:8080/api/reports/image/"
                + report.imagePath.split("\\").pop()
                + "' class='worker-report-image'>" +

                "<h3>Assignment #" + assignment.id + "</h3>" +

                "<p><b>Report ID:</b> " + report.id + "</p>" +

                "<p><b>Tracking Code:</b> " + report.hashCode + "</p>" +

                "<p><b>Waste Type:</b> " + report.wasteType + "</p>" +

                "<p><b>Location:</b> " + report.location + "</p>" +

                "<p><b>Description:</b> " + report.description + "</p>" +

                "<p><b>Status:</b> " + assignment.status + "</p>" +

                "<button onclick=\"updateStatus("
                + assignment.id
                + ", 'IN_PROGRESS')\">Start Work</button>" +

                "<button onclick=\"updateStatus("
                + assignment.id
                + ", 'COMPLETED')\">Complete</button>" +

                "</div>";
        }

    } catch (error) {

        assignmentsDiv.innerText =
            "Could not connect to EcoSphere server.";

        console.error(error);
    }
}


async function updateStatus(assignmentId, status) {

    try {

        const response = await fetch(
            "http://localhost:8080/api/assignments/" +
            assignmentId +
            "/status?status=" +
            status,
            {
                method: "PUT"
            }
        );

        if (response.ok) {
            loadAssignments();
        } else {
            alert("Could not update status.");
        }

    } catch (error) {

        console.error(error);
        alert("Could not connect to EcoSphere server.");
    }
}
function logout() {
    localStorage.removeItem("workerId");
}
const workerId = localStorage.getItem("workerId");

if (workerId) {
    loadAssignments();
}