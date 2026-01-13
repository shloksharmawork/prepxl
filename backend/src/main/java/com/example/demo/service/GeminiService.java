package com.example.demo.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import java.time.Duration;

@Service
public class GeminiService {

    /**
     * Mock implementation of the Gemini transcription stream.
     * This bypasses the actual Gemini API call due to quota limits
     * while maintaining the same architecture for demonstration.
     */
    public Flux<String> streamAudio(Flux<byte[]> audioStream) {
        System.out.println("DEBUG: Starting MOCK transcription stream...");

        // We simulate a growing partial transcription result
        String[] phrases = {
                "Hello",
                "Hello this",
                "Hello this is",
                "Hello this is a",
                "Hello this is a real-time",
                "Hello this is a real-time transcription",
                "Hello this is a real-time transcription mock",
                "Hello this is a real-time transcription mock demonstration."
        };

        // Every 1.5 seconds, we emit the next partial phrase
        // This simulates the 'streaming' behavior the frontend expects
        return Flux.interval(Duration.ofMillis(1500))
                .take(phrases.length)
                .map(index -> phrases[index.intValue()])
                .doOnNext(text -> System.out.println("DEBUG: Mock Transcription emitted: " + text))
                .concatWith(Flux.never()); // Keep it alive so the connection doesn't just 'end'
    }
}
