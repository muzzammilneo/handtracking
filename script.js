const videoElement = document.getElementById('input-video');
const canvasElement = document.getElementById('output-canvas');
const canvasCtx = canvasElement.getContext('2d');
const loadingScreen = document.getElementById('loading-screen');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const glowSlider = document.getElementById('glow-intensity');
const widthSlider = document.getElementById('line-width');
const noiseSlider = document.getElementById('particle-density');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Configuration
let settings = {
    glowIntensity: 25,
    lineWidth: 3,
    noiseDensity: 30
};

// Fullscreen logic
fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
};

// Update settings from UI
glowSlider.oninput = (e) => settings.glowIntensity = parseInt(e.target.value);
widthSlider.oninput = (e) => settings.lineWidth = parseInt(e.target.value);
noiseSlider.oninput = (e) => settings.noiseDensity = parseInt(e.target.value);

let firstResult = true;

function onResults(results) {
    // Hide loading screen and setup canvas on first results
    if (firstResult && results.image) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.style.display = 'none', 500);
        statusDot.classList.add('active');
        statusText.innerText = 'Neural Link Active';
        
        canvasElement.width = results.image.width;
        canvasElement.height = results.image.height;
        firstResult = false;
    }

    if (!results.image) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw the video frame
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // Darken the video slightly for better glow visibility
    canvasCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const hands = results.multiHandLandmarks;
        const handedness = results.multiHandedness;

        // Separate hands by label
        let leftHand = null;
        let rightHand = null;

        // MediaPipe might detect multiple hands, we take the first left and first right
        for (let i = 0; i < hands.length; i++) {
            if (handedness[i].label === 'Left' && !leftHand) leftHand = hands[i];
            if (handedness[i].label === 'Right' && !rightHand) rightHand = hands[i];
        }

        // Draw individual hand landmarks and skeletons
        hands.forEach((landmarks, index) => {
            const color = '#FFFFFF';
            
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: color,
                lineWidth: 2
            });
            drawLandmarks(canvasCtx, landmarks, {
                color: color,
                lineWidth: 1,
                radius: 3
            });
        });

        // Link corresponding fingers if both hands are present
        if (leftHand && rightHand) {
            const fingerLinks = [
                { idx: 4, color: '#FFD700' }, // Thumb: Gold
                { idx: 8, color: '#00f2ff' }, // Index: Cyan
                { idx: 12, color: '#39FF14' }, // Middle: Neon Green
                { idx: 16, color: '#FF5F1F' }, // Ring: Neon Orange
                { idx: 20, color: '#ff00ea' }  // Pinky: Neon Pink
            ];
            
            fingerLinks.forEach((link) => {
                const p1 = leftHand[link.idx];
                const p2 = rightHand[link.idx];

                drawNeuralLink(
                    p1.x * canvasElement.width, p1.y * canvasElement.height,
                    p2.x * canvasElement.width, p2.y * canvasElement.height,
                    link.color
                );
            });
        }
    }

    canvasCtx.restore();
}

function drawNeuralLink(x1, y1, x2, y2, color) {
    const intensity = settings.glowIntensity;
    const width = settings.lineWidth;
    
    // 1. Draw the Outer Glow
    canvasCtx.shadowBlur = intensity;
    canvasCtx.shadowColor = color;
    
    canvasCtx.beginPath();
    canvasCtx.moveTo(x1, y1);
    canvasCtx.lineTo(x2, y2);
    canvasCtx.strokeStyle = color;
    canvasCtx.lineWidth = width;
    canvasCtx.lineCap = 'round';
    canvasCtx.stroke();

    // 2. Draw the core "bright" line (White center for extra glow effect)
    canvasCtx.shadowBlur = 0;
    canvasCtx.strokeStyle = 'white';
    canvasCtx.lineWidth = width / 3;
    canvasCtx.stroke();

    // 3. Neural Particles (Noise/Light effects matching finger color)
    if (settings.noiseDensity > 0) {
        const particleCount = Math.floor(settings.noiseDensity / 10);
        for (let i = 0; i < particleCount; i++) {
            const t = Math.random();
            const px = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
            const py = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
            
            canvasCtx.fillStyle = color;
            canvasCtx.beginPath();
            canvasCtx.arc(px, py, Math.random() * 2, 0, Math.PI * 2);
            canvasCtx.fill();
        }
    }
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});

camera.start().catch(err => {
    console.error("Camera access denied:", err);
    statusText.innerText = "Camera Error";
    statusDot.style.background = "#ff3b30";
    alert("Please enable camera access to use GlowLink.");
});
