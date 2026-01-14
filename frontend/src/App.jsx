import React, { useState, useEffect, useRef } from 'react';
import CircularVisualizer from './components/CircularVisualizer';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/transcribe';

function App() {
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('disconnected');
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
    };

    ws.onmessage = (event) => {
      setTranscription(prev => prev + ' ' + event.data);
    };

    ws.onclose = () => {
      console.log('WebSocket Closed');
      setStatus('disconnected');
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
    <div className="app-container">
      {/* Background Visualizer */}
      <div className="visualizer-wrapper">
        <CircularVisualizer analyser={analyser} isListening={isListening} />
      </div>

      {/* Glassmorphism Main UI */}
      <main className="ui-main">
        <header className="header-group">
          <h1 className="title">Prepxl Voice</h1>
          <div className="status-indicator">
            <span className={`dot ${status === 'connected' ? 'connected' : ''}`} />
            <span>
              {status === 'connected' ? 'Live Transcription' :
                status === 'error' ? 'Connection Error' :
                  'Ready to stream'}
            </span>
          </div>
        </header>

        <section className="transcription-box">
          {transcription ? (
            <p className="transcription-content">
              {transcription.trim()}
            </p>
          ) : (
            <p className="transcription-content placeholder">
              {isListening ? 'Listening for audio...' : 'Click start to begin transcribing'}
            </p>
          )}
          <div ref={transcriptionEndRef} />
        </section>

        <div className="controls">
          {!isListening ? (
            <button onClick={handleStart} className="btn-primary">
              Start Session
            </button>
          ) : (
            <button onClick={handleStop} className="btn-secondary">
              End Session
            </button>
          )}

          {micError && <p style={{ color: '#ff6b6b', marginTop: '1rem', fontSize: '0.9rem' }}>{micError}</p>}
        </div>

        <footer className="footer">
          Prepxl v1.0 • Mock Engine Active
        </footer>
      </main>
    </div>
  );
}

export default App;
