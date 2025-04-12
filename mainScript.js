// ! Current Location
const locIcon = document.getElementById("Locationicon");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showLoc, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showLoc(pos) {
  document.getElementById("latitude").value = pos.coords.latitude;
  document.getElementById("longitude").value = pos.coords.longitude;
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}

// Add event listener to the location icon to trigger geolocation
locIcon.addEventListener("click", getLocation);

// // ! Real time Video Capturing
// // Elements from the DOM
// const videoElement = document.getElementById("videoElement");
// const startButton = document.getElementById("startRecordingButton");
// const stopButton = document.getElementById("stopRecordingButton");
// const recordedVideo = document.getElementById("recordedVideo");

// let mediaRecorder; // To record the video
// let recordedChunks = []; // To store video data chunks
// let stream; // Video stream

// // Check if browser supports required APIs
// if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//   alert("Your browser does not support video capture or recording.");
// } else {
//   // Function to initialize video capture
//   function startVideoCapture() {
//     const constraints = {
//       video: { 
//         facingMode: { ideal: "environment" } // Use the rear camera if available
//       }
//     };

//     navigator.mediaDevices
//       .getUserMedia(constraints)
//       .then((userStream) => {
//         stream = userStream; // Save the video stream
//         videoElement.srcObject = stream; // Assign stream to video element
//       })
//       .catch((error) => {
//         console.error("Error accessing the camera: ", error.name, error.message);
//         alert("Camera access failed: " + error.message);
//       });
//   }

//   // Function to start recording
//   function startRecording() {
//     if (!stream) {
//       alert("Camera stream not initialized. Refresh and allow camera access.");
//       return;
//     }

//     recordedChunks = []; // Clear previous recordings
//     mediaRecorder = new MediaRecorder(stream);

//     mediaRecorder.ondataavailable = (event) => {
//       if (event.data.size > 0) {
//         recordedChunks.push(event.data);
//       }
//     };

//     mediaRecorder.onstop = () => {
//       const videoBlob = new Blob(recordedChunks, { type: "video/webm" });
//       const videoUrl = URL.createObjectURL(videoBlob);
//       recordedVideo.src = videoUrl; // Set the recorded video URL
//     };

//     mediaRecorder.start(); // Start recording
//     startButton.disabled = true;
//     stopButton.disabled = false;
//   }

//   // Function to stop recording
//   function stopRecording() {
//     if (mediaRecorder) {
//       mediaRecorder.stop(); // Stop the recorder
//       startButton.disabled = false;
//       stopButton.disabled = true;
//     }
//   }

//   // Initialize video capture when the window loads
//   window.onload = startVideoCapture;

//   // Event listeners for buttons
//   startButton.addEventListener("click", startRecording);
//   stopButton.addEventListener("click", stopRecording);
// }

// // Function to handle page unload (cleanup)
// window.onbeforeunload = () => {
//   if (stream) {
//     stream.getTracks().forEach((track) => track.stop()); // Stop all tracks
//   }
// };
let mediaRecorder;
let recordedChunks = [];
const preview = document.getElementById('preview');
const startRecord = document.getElementById('startRecord');
const stopRecord = document.getElementById('stopRecord');
const downloadLink = document.getElementById('downloadLink');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const recordedPreview = document.getElementById('recordedPreview');
const tabs = document.querySelectorAll('.tab');
const windows = document.querySelectorAll('.window');
let stream;

// Tab switching functionality
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        windows.forEach(w => w.classList.remove('active'));
        
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}Window`).classList.add('active');
        
        // Initialize camera when recording tab is selected
        if (tabId === 'record' && !stream) {
            initCamera();
        }
    });
});

// Initialize camera for recording
function initCamera() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(userStream => {
        stream = userStream;
        preview.srcObject = stream;
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            
            recordedPreview.src = url;
            recordedPreview.style.display = 'block';
            
            downloadLink.href = url;
            downloadLink.style.display = 'block';
            recordedChunks = [];
        };
    }).catch(error => {
        console.error('Error accessing camera:', error);
        alert('Could not access camera. Please check permissions.');
    });
}

startRecord.addEventListener('click', () => {
    mediaRecorder.start();
    startRecord.disabled = true;
    stopRecord.disabled = false;
});

stopRecord.addEventListener('click', () => {
    mediaRecorder.stop();
    startRecord.disabled = false;
    stopRecord.disabled = true;
});

fileInput.addEventListener('change', event => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File size exceeds 10MB');
            fileInput.value = '';
            return;
        }
        const url = URL.createObjectURL(file);
        filePreview.innerHTML = file.type.startsWith('image')
            ? `<img src="${url}" alt="Uploaded Image">`
            : `<video controls src="${url}"></video>`;
    }
});

// Clean up camera stream when switching away from recording tab
document.getElementById('tabContainer').addEventListener('click', (e) => {
    if (e.target.getAttribute('data-tab') !== 'record' && stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
});

const submitBtn = document.getElementById("btn-send");
const mobileInput = document.getElementById("mob");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");

function checkInputs() {
  const isMobileFilled = mobileInput.value.trim() !== "";
  const isLatitudeFilled = latitudeInput.value.trim() !== "";
  const isLongitudeFilled = longitudeInput.value.trim() !== "";

  submitBtn.disabled = !(isMobileFilled && isLatitudeFilled && isLongitudeFilled);
}

mobileInput.addEventListener("input", checkInputs);
latitudeInput.addEventListener("input", checkInputs);
longitudeInput.addEventListener("input", checkInputs);

submitBtn.addEventListener("click", () => {
  const isMobileFilled = mobileInput.value.trim() !== "";
  const isLatitudeFilled = latitudeInput.value.trim() !== "";
  const isLongitudeFilled = longitudeInput.value.trim() !== "";

  if (!isMobileFilled || !isLatitudeFilled || !isLongitudeFilled) {
    alert("Please fill in your mobile number and location (latitude and longitude) before submitting.");
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  localStorage.setItem("lastSubmissionDate", today);
  alert("Submission successful!");
  submitBtn.disabled = true;
});
