

async function submitReport() {

    const image = document.getElementById("image").files[0];
    const location = document.getElementById("location").value;
    const description = document.getElementById("description").value;
    const result = document.getElementById("result");

    if (image && !image.type.startsWith("image/")) {
        result.innerText = "Please select a valid image file.";
        return;
    }

    if (image && image.size > 5 * 1024 * 1024) {
        result.innerText = "Image size must be less than 5 MB.";
        return;
    }

    if (!image) {
        result.innerText = "Please select an image.";
        return;
    }
    if (!location) {
        result.innerText = "Please enter the waste location.";
        return;
    }

    const formData = new FormData();
    formData.append("image", image);

    formData.append("location", location);
    formData.append("description", description);

    result.innerText = "Uploading and detecting waste...";

    try {

        const response = await fetch(
            "http://localhost:8080/api/reports/upload",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {

            const error = await response.text();

            result.innerText =
                "Report submission failed: " + error;

            return;
        }

        const data = await response.text();

        result.innerHTML =
            "<h3>Report Submitted Successfully</h3>" +
            "<p>" + data + "</p>" +
            "<p><b>Location:</b> " + location + "</p>" +
            "<p>Save your tracking code to check the report later.</p>";

    } catch (error) {

        result.innerText =
            "Could not connect to EcoSphere server.";

        console.error(error);
    }
}

async function trackReport() {

    const hashCode = document.getElementById("hashCode").value;
    const result = document.getElementById("trackResult");

    if (!hashCode) {
        result.innerText = "Please enter your tracking code.";
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:8080/api/reports/track/" + hashCode
        );

        if (!response.ok) {
            result.innerText = "Report not found.";
            return;
        }

        const report = await response.json();
        updateProgressTracker(report.status);

        result.innerHTML =
            "<h3>Report Found</h3>" +
            "<p><b>Tracking Code:</b> " + report.hashCode + "</p>" +
            "<p><b>Status:</b> " + report.status + "</p>" +
            "<p><b>Waste Type:</b> " + report.wasteType + "</p>" +
            "<p><b>Location:</b> " + report.location + "</p>" +
            "<p><b>Description:</b> " + report.description + "</p>";

    } catch (error) {

        result.innerText = "Could not connect to EcoSphere server.";

        console.error(error);
    }
}

const imageInput = document.getElementById("image");

if (imageInput) {

    imageInput.addEventListener("change", function () {

        const file = this.files[0];
        const preview = document.getElementById("imagePreview");

        if (file) {
            preview.src = URL.createObjectURL(file);
            preview.style.display = "block";
        }

    });

}
function updateProgressTracker(status) {

    const reported = document.getElementById("stepReported");
    const progress = document.getElementById("stepProgress");
    const completed = document.getElementById("stepCompleted");

    const lines = document.querySelectorAll(".progress-line");

    reported.classList.remove("active");
    progress.classList.remove("active");
    completed.classList.remove("active");

    lines.forEach(line => line.classList.remove("active"));

    reported.classList.add("active");

    if (status === "IN_PROGRESS") {
        progress.classList.add("active");
        lines[0].classList.add("active");
    }

    if (status === "COMPLETED") {
        progress.classList.add("active");
        completed.classList.add("active");

        lines[0].classList.add("active");
        lines[1].classList.add("active");
    }
}

function openImagePicker(event) {
    const imageInput = document.getElementById("image");

    if (event.target !== imageInput) {
        imageInput.click();
    }
}