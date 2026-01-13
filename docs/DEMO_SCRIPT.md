# Prepxl Full-Stack Assignment: Demo Script

**Host:** Senior Full-Stack Engineer  
**Duration:** ~5–7 Minutes  

---

## 1. Introduction (0:30)
"Hello! I'm [Your Name], and today I’m demonstrating the real-time audio transcription and visualization platform built for the Prepxl assignment. The goal was to build a low-latency, streaming-first architecture that bridges a React frontend with a Spring Boot reactive backend."

## 2. Architecture Overview (1:00)
"Before diving in, let's look at the tech stack:
- **Backend:** Spring Boot 3.2 using **Project Reactor (WebFlux)** for non-blocking I/O.
- **WebSocket Protocol:** We use raw WebSockets for minimal overhead.
- **Audio Processing:** The frontend captures audio at **16kHz**, converts it to **16-bit PCM** (signed short), and streams binary chunks to the backend.
- **Transcription:** While integrated with an architecture compatible with industry-standard streaming transcription engines, we are running in **Mock Mode** for this demo due to API quota limits, ensuring a stable and reliable review process."

## 3. Frontend Walkthrough (1:30)
"The UI is built with React and Vite. I've focused on a clean, dark aesthetic using Tailwind CSS. 
- **Microphone Integration:** Using the Web Audio API, we capture microphone input via a `ScriptProcessorNode`.
- **Canvas Visualization:** We have a custom-built **Circular Equalizer**. It doesn't just look pretty—it's reactive to real-time `AnalyserNode` frequency data, providing immediate visual feedback to the user's voice."

## 4. Live Demonstration (2:00)
"Let's start the visualizer. [Click Start]
- Notice the smooth animation and the 'Live' indicator. 
- As I speak, the circular bars react instantly.
- Look at the transcription box. You see the text appearing incrementally. This demonstrates the **streaming response** logic where the backend pushes partial results as soon as they are 'processed' by our mock Gemini service."

## 5. Backend Logic (1:00)
"Switching to the backend code:
- The `AudioWebSocketHandler` efficiently handles incoming binary payloads. 
- We avoided common pitfalls like double-reading the stream, ensuring zero data loss before it reaches the `GeminiService`.
- The `GeminiService` is architected as a `Flux` pipeline, making it trivial to swap the mock emitter for the real Google AI WebSocket once quota is restored."

## 6. Conclusion (0:30)
"This assignment demonstrates a complete end-to-end streaming solution. We’ve covered binary audio handling, reactive programming, real-time visualization, and robust error handling. Thank you for your time!"
