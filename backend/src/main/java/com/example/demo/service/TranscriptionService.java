package com.example.demo.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class TranscriptionService {

    private final GeminiService geminiService;

    public TranscriptionService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * Proxies the audio stream to Gemini's WebSocket API.
     */
    public Flux<String> transcribe(Flux<byte[]> audioStream) {
        return geminiService.streamAudio(audioStream);
    }
}
