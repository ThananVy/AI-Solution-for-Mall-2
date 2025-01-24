const video = document.getElementById("video");
const terminal = document.getElementById("terminal");
let detectionData = [];
let lastDetectionTime = 0;

const THREE_SECONDS = 3000;

// Load the face-api models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(webCam);

function webCam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.log(error);
    });
}

// Function to send data to the PHP script for database storage
function sendToDatabase(data) {
  fetch("upload_csv.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `age=${data.age}&gender=${data.gender}&expression=${data.expression}`
  })
    .then(response => response.text())
    .then(responseText => console.log("Server response:", responseText))
    .catch(error => console.error("Error:", error));
}

// Function to get the dominant expression from face-api expressions
function getDominantExpression(expressions) {
  return Object.keys(expressions).reduce((a, b) =>
    expressions[a] > expressions[b] ? a : b
  );
}

// Detect faces and push data to the database every 3 seconds
video.addEventListener("play", () => {
  const canvas = document.getElementById("canvas"); 
  faceapi.matchDimensions(canvas, { height: video.height, width: video.width });

  setInterval(async () => {
    const detection = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    const resizedWindow = faceapi.resizeResults(detection, {
      height: video.height,
      width: video.width,
    });

    faceapi.draw.drawDetections(canvas, resizedWindow);
    faceapi.draw.drawFaceLandmarks(canvas, resizedWindow);
    faceapi.draw.drawFaceExpressions(canvas, resizedWindow);

    let terminalOutput = "";
    const currentTime = Date.now();

    resizedWindow.forEach((detection, index) => {
      const { age, gender, expressions } = detection;
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: Math.round(age) + " year old " + gender,
      });
      drawBox.draw(canvas);

      // Display data in terminal form
      terminalOutput += `Face ${index + 1}: ${Math.round(age)} years old, ${gender}, ` +
        `Expression: ${getDominantExpression(expressions)}\n`;

      // Push data to database every 3 seconds
      if (currentTime - lastDetectionTime >= THREE_SECONDS) {
        const data = {
          age: Math.round(age),
          gender: gender,
          expression: getDominantExpression(expressions),
        };
        sendToDatabase(data);
        lastDetectionTime = currentTime;
      }
    });

    terminal.textContent = terminalOutput;
  }, 100);
});
