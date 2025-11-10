import React, { useEffect, useRef, useState } from 'react';
import { Video, Camera, Share2 } from 'lucide-react';

export default function ARTryOn() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      videoRef.current?.srcObject && (videoRef.current.srcObject.getTracks().forEach(t => t.stop()));
    };
  }, []);

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
        animate();
      }
    } catch (e) {
      alert('Camera permission denied or unavailable. Showing fallback.');
      setStreamActive(false);
    }
  };

  const stopCam = () => {
    const tracks = videoRef.current?.srcObject?.getTracks();
    tracks?.forEach(t => t.stop());
    setStreamActive(false);
  };

  const animate = () => {
    const canvas = canvasRef.current; const video = videoRef.current; if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.clientWidth * devicePixelRatio;
    const h = canvas.height = canvas.clientHeight * devicePixelRatio;
    const render = () => {
      if (streamActive) {
        ctx.clearRect(0,0,w,h);
        ctx.drawImage(video, 0, 0, w, h);
        // simple hologram overlay
        const time = performance.now() / 1000;
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 5; i++) {
          ctx.strokeStyle = `hsla(${(time*40 + i*60)%360}, 100%, 60%, 0.35)`;
          ctx.lineWidth = 2 * devicePixelRatio;
          ctx.beginPath();
          const cx = w/2 + Math.sin(time + i) * 80 * devicePixelRatio;
          const cy = h*0.6 + Math.cos(time*1.3 + i) * 40 * devicePixelRatio;
          const r = 120 * devicePixelRatio + Math.sin(time*1.7 + i) * 20 * devicePixelRatio;
          for (let a = 0; a <= Math.PI*2; a += 0.2) {
            const x = cx + Math.cos(a) * r * (1 + Math.sin(time*2 + a) * 0.05);
            const y = cy + Math.sin(a) * r * (1 + Math.cos(time*2 - a) * 0.05);
            if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  };

  const startRecording = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const stream = canvas.captureStream(30);
    const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'apotheon-ar.webm'; a.click();
      URL.revokeObjectURL(url);
      setRecording(false);
    };
    mr.start();
    setRecording(true);
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();

  return (
    <section className="bg-black text-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl sm:text-4xl font-bold">AR Try‑On</h2>
          {!streamActive ? (
            <button onClick={startCam} className="rounded-md bg-white/10 hover:bg-white/20 px-4 py-2 focus-visible:ring-2 focus-visible:ring-fuchsia-400 inline-flex items-center gap-2"><Camera size={18}/> Enable Camera</button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={stopCam} className="rounded-md bg-white/10 hover:bg-white/20 px-3 py-2 focus-visible:ring-2 focus-visible:ring-fuchsia-400">Stop</button>
              {!recording ? (
                <button onClick={startRecording} className="rounded-md bg-fuchsia-500/20 hover:bg-fuchsia-500/30 px-3 py-2 inline-flex items-center gap-2"><Video size={18}/> Record</button>
              ) : (
                <button onClick={stopRecording} className="rounded-md bg-red-500/20 hover:bg-red-500/30 px-3 py-2">Stop</button>
              )}
            </div>
          )}
        </div>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="aspect-video rounded-xl overflow-hidden ring-1 ring-white/10 bg-neutral-900">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          </div>
          <div className="aspect-video rounded-xl overflow-hidden ring-1 ring-white/10 bg-neutral-900">
            <canvas ref={canvasRef} className="w-full h-full" aria-label="AR canvas" role="img" />
          </div>
        </div>
        <p className="text-white/60 text-sm mt-3">Grant camera access to see the holographic overlay. If denied, a graceful fallback is shown.</p>
      </div>
    </section>
  );
}
