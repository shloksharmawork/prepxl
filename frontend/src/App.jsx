import React, { useState, useEffect, useRef } from 'react';
import CircularVisualizer from './components/CircularVisualizer';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/transcribe';

function App() {
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('disconnected');
  const [reconnectCount, setReconnectCount] = useState(0);
  const websocketRef = useRef(null);
  const transcriptionEndRef = useRef(null);

  // Auto-scroll to latest transcription
  useEffect(() => {
    transcriptionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcription]);

  const connectWebSocket = () => {
    console.log('Connecting to WebSocket...');
    const ws = new WebSocket(WS_URL);
    websocketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setStatus('connected');
      setReconnectCount(0);
    };

    ws.onmessage = (event) => {
      // Append incremental text
      setTranscription(prev => prev + ' ' + event.data);
    };

    ws.onclose = () => {
      console.log('WebSocket Closed');
      setStatus('disconnected');
      // Simple exponential backoff or retry logic could go here
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      setStatus('error');
    };
  };

  const disconnectWebSocket = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  const onAudioData = (audioData) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(audioData);
    }
  };

  const { startListening, stopListening, isListening, analyser, error: micError } = useAudioAnalyzer(onAudioData);

  const handleStart = async () => {
    await startListening();
    connectWebSocket();
  };

  const handleStop = () => {
    stopListening();
    disconnectWebSocket();
  };

  return (
    <div className="relative min-h-screen text-white font-sans flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Premium Background Visualizer */}
      <CircularVisualizer analyser={analyser} isListening={isListening} />

      {/* Main UI Overlay */}
      <main className="z-10 w-full max-w-2xl flex flex-col items-center gap-12">
        <header className="text-center">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
            Prepxl Voice
          </h1>
          <p className="text-slate-400 flex items-center justify-center gap-2">
            {status === 'connected' ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Transcription
              </span>
            ) : status === 'error' ? (
              <span className="text-rose-400">Connection Error</span>
            ) : (
              'Ready to transcribe'
            )}
          </p>
        </header>

        {/* Transcription Display */}
        <div className="w-full h-48 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 p-6 overflow-y-auto shadow-2xl custom-scrollbar">
          {transcription ? (
            <p className="text-lg leading-relaxed text-slate-100 italic transition-all duration-300">
              "{transcription.trim()}"
            </p>
          ) : (
            <p className="text-slate-500 text-center mt-12">
              {isListening ? 'Listening for audio...' : 'Start visualizer to see transcription'}
            </p>
          )}
          <div ref={transcriptionEndRef} />
        </div>

        {/* Control Button */}
        <div className="flex flex-col items-center gap-4">
          {!isListening ? (
            <button
              onClick={handleStart}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-bold text-lg shadow-lg hover:scale-105 hover:shadow-cyan-500/25 transition-all active:scale-95"
            >
              Start Visualizer
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-10 py-4 bg-slate-800 rounded-full font-bold text-lg border border-white/10 hover:bg-slate-700 transition-all active:scale-95"
            >
              Stop Visualizer
            </button>
          )}

          {micError && <p className="text-rose-400 text-sm mt-2">Mic Error: {micError}</p>}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="absolute bottom-8 text-slate-600 text-xs uppercase tracking-widest">
        Powered by Prepxl Architecture • Gemini Mock Stream Active
      </footer>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default App;
