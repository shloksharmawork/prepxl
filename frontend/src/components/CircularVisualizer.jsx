import React, { useRef, useEffect } from 'react';

const CircularVisualizer = ({ analyser, isListening }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let dataArray;
        let bufferLength;

        const handleResize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        const renderFrame = () => {
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);

            ctx.clearRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;
            const baseRadius = Math.min(width, height) * 0.2;

            if (!isListening || !analyser) {
                // Idle pulse
                const pulse = Math.sin(Date.now() / 500) * 5;
                ctx.beginPath();
                ctx.arc(centerX, centerY, baseRadius + pulse, 0, 2 * Math.PI);
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
                ctx.lineWidth = 2;
                ctx.stroke();
                animationRef.current = requestAnimationFrame(renderFrame);
                return;
            }

            if (!dataArray) {
                bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);
            }

            analyser.getByteFrequencyData(dataArray);

            // Calculate overall volume for pulsing effect
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;
            const pulseRadius = baseRadius + (average * 0.5);

            // Background glow
            const gradient = ctx.createRadialGradient(centerX, centerY, pulseRadius * 0.8, centerX, centerY, pulseRadius * 1.5);
            gradient.addColorStop(0, 'rgba(6, 182, 212, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw bars
            const bars = 80;
            const barWidth = (2 * Math.PI * pulseRadius) / bars * 0.8;

            ctx.save();
            ctx.translate(centerX, centerY);

            for (let i = 0; i < bars; i++) {
                const index = Math.floor((i / bars) * (bufferLength * 0.5));
                const value = dataArray[index];
                const barHeight = (value / 255) * 60 + 5;

                const angle = (i / bars) * 2 * Math.PI;
                ctx.rotate(angle);

                // Gradient for each bar
                const barGradient = ctx.createLinearGradient(0, pulseRadius, 0, pulseRadius + barHeight);
                barGradient.addColorStop(0, '#06b6d4');
                barGradient.addColorStop(1, '#3b82f6');

                ctx.fillStyle = barGradient;
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';

                // Rounded bars
                this.roundRect(ctx, -barWidth / 2, pulseRadius, barWidth, barHeight, 2);
                ctx.fill();

                ctx.rotate(-angle);
            }
            ctx.restore();

            animationRef.current = requestAnimationFrame(renderFrame);
        };

        // Helper for rounded rectangles on canvas
        renderFrame.roundRect = (ctx, x, y, width, height, radius) => {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
        };

        renderFrame();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [analyser, isListening]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full -z-10 bg-slate-950"
        />
    );
};

export default CircularVisualizer;
