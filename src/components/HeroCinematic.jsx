import React, { useEffect, useMemo, useRef, useState } from 'react';
import Spline from '@splinetool/react-spline';

// Adaptive ambient audio that reacts to scroll speed
function useAmbientAudio() {
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const onWheel = (e) => {
      if (!enabled || !audioCtxRef.current || !oscRef.current || !gainRef.current) return;
      const speed = Math.min(1, Math.abs(e.deltaY) / 1000);
      const targetFreq = 120 + speed * 480;
      const targetGain = 0.02 + speed * 0.08;
      oscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.05);
      gainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.05);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [enabled]);

  const toggle = async () => {
    if (!enabled) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 220;
      gain.gain.value = 0.03;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      audioCtxRef.current = ctx;
      oscRef.current = osc;
      gainRef.current = gain;
      setEnabled(true);
    } else {
      try { oscRef.current?.stop(); audioCtxRef.current?.close(); } catch {}
      audioCtxRef.current = null; oscRef.current = null; gainRef.current = null; setEnabled(false);
    }
  };

  return { enabled, toggle };
}

export default function HeroCinematic({ onKonami }) {
  const [konamiIndex, setKonamiIndex] = useState(0);
  const { enabled, toggle } = useAmbientAudio();
  const konami = useMemo(() => ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'], []);

  useEffect(() => {
    const handler = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === konami[konamiIndex]) {
        const next = konamiIndex + 1;
        setKonamiIndex(next);
        if (next === konami.length) {
          onKonami?.();
          setKonamiIndex(0);
        }
      } else {
        setKonamiIndex(0);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [konamiIndex, konami, onKonami]);

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/EF7JOSsHLk16Tlw9/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 pointer-events-none">
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-24">
          <h1 className="pointer-events-auto text-5xl sm:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
            Apotheon Labs
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Where luxury interfaces with impossible technology. Touch the ribbon. Bend reality.
          </p>
          <div className="mt-8 flex items-center gap-4 pointer-events-auto">
            <button onClick={toggle} className="rounded-full px-5 py-2.5 bg-white/10 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-fuchsia-400 outline-none">
              {enabled ? 'Mute ambient score' : 'Enable ambient score'}
            </button>
            <span className="text-sm text-white/60">Scroll to modulate the soundtrack</span>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
