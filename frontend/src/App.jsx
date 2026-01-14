import React, { useState, useEffect, useRef } from 'react';
import CircularVisualizer from './components/CircularVisualizer';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';

const getWsUrl = () => {
  const envUrl = import.meta.env.VITE_WS_URL;
  if (envUrl) return envUrl;

  // Auto-construct from window location or fallback to localhost
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//localhost:8080/transcribe`;
};

const WS_URL = getWsUrl();

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
    console.log(`Connecting to WebSocket: ${WS_URL}`);
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
    try {
      await startListening();
      connectWebSocket();
    } catch (e) {
      console.error('Start failed', e);
    }
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

          {micError && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                ⚠️ {micError}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                Please allow microphone access in your browser settings.
              </p>
            </div>
          )}
        </div>

        <footer className="footer">
          Prepxl v1.0 • Mock Engine Active
        </footer>
      </main>
    </div>
  );
}

export default App;
