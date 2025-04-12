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