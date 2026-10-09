import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  barCount?: number;
  height?: number;
  color?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  barCount = 28,
  height = 36,
  color = '#22c55e',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isActive) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const barWidth = width / barCount - 2;
      for (let i = 0; i < barCount; i++) {
        const barHeight = 4;
        const x = i * (barWidth + 2);
        const y = (canvas.height - barHeight) / 2;
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 2, 2]);
        ctx.fill();
      }
      return;
    }

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const sinVal = Math.sin(phase + i * 0.35) * 0.5 + 0.5;
        const cosVal = Math.cos(phase * 0.8 + i * 0.2) * 0.3 + 0.3;
        const barHeight = Math.max(4, (sinVal * 0.7 + cosVal * 0.3) * (canvas.height - 6));

        const x = i * (barWidth + 2);
        const y = (canvas.height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#4ade80');
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, '#06b6d4');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 2, 2]);
        ctx.fill();
      }

      phase += 0.12;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, barCount, color]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={180}
        height={height}
        className="w-full h-full max-w-[200px]"
      />
    </div>
  );
};
