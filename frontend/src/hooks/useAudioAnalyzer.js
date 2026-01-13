import { useRef, useEffect, useState } from 'react';

/**
 * Hook to manage audio capture and analysis
 * Converts audio to 16-bit PCM at 16000Hz for Gemini compatibility
 */
export const useAudioAnalyzer = (onAudioData) => {
    const audioContextRef = useRef(null);
    const streamRef = useRef(null);
    const processorRef = useRef(null);
    const analyserRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);

    const startListening = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // AudioContext set to 16000Hz (Gemini requirement)
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000,
            });

            const source = audioContextRef.current.createMediaStreamSource(stream);
            const analyser = audioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;

            // ScriptProcessor for chunking (using 4096 for stable performance)
            const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0); // Float32Array

                // Convert Float32 to Int16 PCM
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Send 16-bit binary data
                if (onAudioData) {
                    onAudioData(new Uint8Array(pcmData.buffer));
                }
            };

            source.connect(analyser);
            analyser.connect(processor);
            processor.connect(audioContextRef.current.destination);

            setIsListening(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError(err.message);
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsListening(false);
    };

    return {
        startListening,
        stopListening,
        isListening,
        analyser: analyserRef.current,
        error
    };
};
