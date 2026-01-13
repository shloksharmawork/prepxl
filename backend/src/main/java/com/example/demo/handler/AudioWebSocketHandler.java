package com.example.demo.handler;

import com.example.demo.service.TranscriptionService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;

import org.springframework.web.reactive.socket.WebSocketSession;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class AudioWebSocketHandler implements WebSocketHandler {

    private final TranscriptionService transcriptionService;

    public AudioWebSocketHandler(TranscriptionService transcriptionService) {
        this.transcriptionService = transcriptionService;
    }

    @SuppressWarnings("null")
    @Override
    @NonNull
    public Mono<Void> handle(@NonNull WebSocketSession session) {
        // 1. Receive Audio Stream
        Flux<byte[]> audioInput = session.receive()
                .map(msg -> {
                    try {
                        byte[] bytes = new byte[msg.getPayload().readableByteCount()];
                        msg.getPayload().read(bytes);
                        // System.out.println("DEBUG: Received audio bytes from frontend: " +
                        // bytes.length);
                        return bytes;
                    } catch (Exception e) {
                        System.err.println("Error reading WebSocket payload: " + e.getMessage());
                        return new byte[0];
                    }
                });

        // 2. Generate Transcription Stream
        Flux<String> transcriptionUpdates = transcriptionService.transcribe(audioInput);

        // 3. Send Responses
        return session.send(transcriptionUpdates.map(session::textMessage)).then();
    }
}
