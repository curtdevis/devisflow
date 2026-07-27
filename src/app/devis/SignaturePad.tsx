"use client";

import { useRef, useState } from "react";

export function SignaturePad({ onSign }: { onSign: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signed, setSigned] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current; if (!canvas) return;
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
  }

  function endDraw() {
    setIsDrawing(false);
    lastPos.current = null;
  }

  function clear() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  }

  function confirm() {
    const canvas = canvasRef.current; if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSigned(true);
    onSign(dataUrl);
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden" style={{ touchAction: "none" }}>
      <canvas ref={canvasRef} width={600} height={150} className="w-full cursor-crosshair bg-white"
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
      <div className="flex gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
        <button type="button" onClick={clear} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          Effacer
        </button>
        <div className="flex-1" />
        {!signed ? (
          <button type="button" onClick={confirm}
            className="text-xs font-bold text-white px-4 py-1.5 rounded-lg"
            style={{ backgroundColor: "var(--navy)" }}>
            Valider la signature
          </button>
        ) : (
          <span className="text-xs font-bold text-green-600">✓ Signé</span>
        )}
      </div>
    </div>
  );
}
