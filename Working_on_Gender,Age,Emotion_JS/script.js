const video = document.getElementById("video");
const terminal = document.getElementById("terminal");
const saveCsvButton = document.getElementById("saveCsv");
const canvas = document.getElementById("canvas");
const toggleAutoSaveButton = document.getElementById("toggleAutoSave");

let detectionData = []; // This holds all detection results
const THREE_SECONDS = 3000;
const AUTO_SAVE_INTERVAL = 15 * 60 * 1000; // 15 minutes
const SAVE_INTERVAL = 60 * 1000; // 1 minute
let lastDetectionTime = 0;
let autoSaveIntervalId = null;

// Load models and start webcam
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(startWebcam);

function startWebcam() {
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                faceapi.matchDimensions(canvas, { width: video.videoWidth, height: video.videoHeight });
            };
        })
        .catch(console.error);
}

// Face detection loop
video.addEventListener("play", () => {
    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();

        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        const resizedDetections = faceapi.resizeResults(detections, {
            width: video.videoWidth,
            height: video.videoHeight,
        });

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        let terminalOutput = "";
        const currentTime = Date.now();

        resizedDetections.forEach((detection, index) => {
            const { age, gender, expressions } = detection;
            const box = detection.detection.box;
            new faceapi.draw.DrawBox(box, {
                label: `${Math.round(age)} years old ${gender}`,
            }).draw(canvas);

            terminalOutput += `Face ${index + 1}: ${Math.round(age)} years old, ${gender}, ` +
                `Expression: ${getDominantExpression(expressions)}\n`;

            if (currentTime - lastDetectionTime >= THREE_SECONDS) {
                detectionData.push({
                    age: Math.round(age),
                    gender,
                    expression: getDominantExpression(expressions),
                });
                lastDetectionTime = currentTime;
            }
        });

        terminal.textContent = terminalOutput;
    }, 100);
});

// Get dominant expression
function getDominantExpression(expressions) {
    return Object.keys(expressions).reduce((a, b) => (expressions[a] > expressions[b] ? a : b));
}

// Function to send data to the backend
async function saveToServer(data) {
    try {
        const response = await fetch("http://127.0.0.1:5000/save-detection", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ detections: data }),
        });
        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.error("Error saving to server:", error);
    }
}

// Start the auto-save function (1-minute interval)
setInterval(() => {
    if (detectionData.length > 0) {
        saveToServer(detectionData);
        detectionData = []; // Clear the array after saving
    }
}, SAVE_INTERVAL);

// Save CSV manually
function saveCSV() {
    let csvContent = "Age,Gender,Expression\n";
    detectionData.forEach(({ age, gender, expression }) => {
        csvContent += `${age},${gender},${expression}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "detection_data.csv");
}

// Auto-save toggle
function toggleAutoSave(enable) {
    if (enable) {
        autoSaveIntervalId = setInterval(() => {
            saveCSV();
            console.log("Data auto-saved!");
        }, AUTO_SAVE_INTERVAL);
    } else {
        clearInterval(autoSaveIntervalId);
        autoSaveIntervalId = null;
    }
}

toggleAutoSaveButton.addEventListener("click", () => {
    const isAutoSaveEnabled = autoSaveIntervalId !== null;
    toggleAutoSave(!isAutoSaveEnabled);
    alert(`Auto-save ${isAutoSaveEnabled ? "disabled" : "enabled"}`);
});

// Manual save button
saveCsvButton.addEventListener("click", saveCSV);

// Enable auto-save on page load
toggleAutoSave(true);
