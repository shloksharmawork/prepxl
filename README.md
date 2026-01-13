# Prepxl Voice: Real-Time Audio Transcription Platform

A production-aligned full-stack application demonstrating and real-time data visualization.

---

## 🚀 Overview
Prepxl Voice bridges the gap between raw hardware input and intelligent cloud-based transcription pipelines


> [!NOTE]
> **Gemini API Integration:** Due to current API quota limits, the transcription engine is running in **Mock Mode**. The system is fully architected to support a drop-in transition to real Google Gemini Multimodal Live APIs.

---

## 🏗️ Architecture & Technology Choices

### 1. Backend: Spring Boot & Project Reactor
- **Reactive Stack:** Built on **WebFlux** to handle concurrent streaming audio workloads with minimal overhead.
- **Binary Handling:** Custom `AudioWebSocketHandler` for efficient processing of raw 16-bit PCM chunks.
- **WebSocket Protocol:** Standardized `/transcribe` endpoint for bidirectional data flow.

### 2. Frontend: React, Vite & Tailwind CSS
- **Audio Capture:** Leverages the **Web Audio API** and `getUserMedia` for high-fidelity capture.
- **Data Transformation:** Converts `Float32` browser audio to **Int16 PCM** at **16,000Hz** on-the-fly to meet streaming transcription requirements.
- **Premium Visualization:** A Canvas-based circular equalizer providing sub-16ms visual feedback (60 FPS).

---

## 🛠️ Getting Started

### Prerequisites
- **Java 17 LTS**
- **Node.js 18+**
- **Maven 3.8+**

### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
*Server runs on port `8080`*

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Application accessible at `http://localhost:5173`*

---

## 🧪 Validation & Testing
We've included a standalone WebSocket test client for reviewers to verify the protocol without the full UI:
- **Location:** `scripts/websocket-test.html`
- **Method:** Open in any browser, click "Connect" to see binary chunks being processed by the backend and receiving the transcription stream.

---

## 📈 UI/UX Audit
A comprehensive audit and road-map for future improvements can be found in:
👉 [docs/ux_audit/report.md](docs/ux_audit/report.md)

## 🎥 Demo Script
Planning to record a walkthrough? Follow our professional script:
👉 [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)

---
**Author:** Shlok Sharma  
**Assignment:** Prepxl Full-Stack Engineer Candidate

## 🌐 Deployment

- **Backend:** Deployed on Render with WebSocket (WSS) support
- **Frontend:** Deployed on Render (HTTPS)
- **Security:** HTTPS + WSS ensures microphone access works in modern browsers
- **Transcription:** Mock mode enabled due to Gemini API quota limits

Live URLs are available for reviewer testing.
