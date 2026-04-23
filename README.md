# HandTracking | Neural Hand Tracking

HandTracking is a real-time, browser-based hand tracking application that visualizes a "neural connection" between corresponding fingers of your left and right hands. It leverages state-of-the-art computer vision to establish high-fidelity links with immersive light effects.

## ✨ Features

- **Dual-Hand Synapse**: Detects both left and right hands and links corresponding finger tips (Thumb, Index, Middle, Ring, and Pinky).
- **Unique Finger Colors**: Each finger connection has its own vibrant neon color identity.
- **Dynamic Glow Engine**: Utilizes Canvas 2D effects to create multi-layered light glows and "neural noise" particles.
- **Glassmorphism UI**: A sleek, modern control panel to adjust glow intensity, line width, and particle density in real-time.
- **X-Ray Hand Aesthetic**: Hand landmarks and skeletons are rendered in clean white for high contrast against the colored links.

## 🛠️ How It Works

### 1. Vision Engine (MediaPipe)
The application uses **MediaPipe Hands**, a high-fidelity hand and finger tracking solution. It employs machine learning to infer 21 3D landmarks of a hand from just a single frame.

### 2. Handedness Identification
The system distinguishes between "Left" and "Right" hands. When both are present, it maps the coordinates of matching landmarks (e.g., Left Index Tip to Right Index Tip).

### 3. Rendering Pipeline
- **Video Capture**: The webcam stream is captured via `camera_utils.js`.
- **Canvas Overlay**: A high-performance `<canvas>` element is layered over the video. 
- **Mirroring**: The output is mirrored horizontally to provide a natural, mirror-like interaction for the user.
- **Glow Effects**: Lines are drawn using `shadowBlur` and `shadowColor` properties to simulate light emission.
- **Neural Noise**: A custom particle system generates random "energy" dots along the connection paths to simulate neural activity.

## 🚀 Getting Started

1.  Clone or download this repository.
2.  Open `index.html` in any modern web browser (Chrome, Edge, or Brave recommended).
3.  Allow camera permissions when prompted.
4.  Position both hands in the frame to establish the neural link.

## 📦 Technologies Used

- **HTML5 & CSS3**: Core structure and premium glassmorphism styling.
- **JavaScript (ES6+)**: Application logic and rendering.
- **MediaPipe Hands**: ML-based hand tracking.
- **Google Fonts**: 'Outfit' for modern typography.

---

*Developed with ❤️ for interactive web experiences.*
