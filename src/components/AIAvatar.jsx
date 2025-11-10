import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sun, Moon, CloudRain, Smile, Loader2 } from 'lucide-react';

// Very lightweight avatar: uses speech synthesis + mood by time and mock weather
export default function AIAvatar() {
  const [input, setInput] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [weather, setWeather] = useState('clear'); // clear | rain | night

  const mood = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 20 || hour < 6) return 'night';
    if (weather === 'rain') return 'serene';
    return 'radiant';
  }, [weather]);

  useEffect(() => {
    // Mock weather via geolocation + randomization fallback
    const t = setTimeout(() => {
      const rand = Math.random();
      setWeather(rand < 0.2 ? 'rain' : (new Date().getHours() >= 20 || new Date().getHours() < 6) ? 'night' : 'clear');
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const speak = (text) => {
    const s = window.speechSynthesis;
    if (!s) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.pitch = mood === 'serene' ? 0.9 : 1.1;
    utter.rate = 0.95;
    s.cancel();
    s.speak(utter);
  };

  const greet = () => speak(`Welcome to Apotheon Labs. My mood is ${mood}. Ask me anything.`);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    speak(input);
    setInput('');
  };

  return (
    <section className="relative bg-neutral-950 text-white py-16">
      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold">Your private concierge AI</h2>
          <p className="mt-3 text-white/70">It listens, speaks, and adapts to your world. Outfit and aura shift with time and weather.</p>
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              {mood === 'radiant' && <Sun className="text-yellow-300" aria-hidden="true" />}
              {mood === 'serene' && <CloudRain className="text-sky-300" aria-hidden="true" />}
              {mood === 'night' && <Moon className="text-indigo-300" aria-hidden="true" />}
              <span className="text-sm capitalize">{mood}</span>
            </span>
            <button onClick={greet} className="rounded-md bg-fuchsia-500/20 hover:bg-fuchsia-500/30 px-4 py-2 focus-visible:ring-2 focus-visible:ring-fuchsia-400">Speak greeting</button>
          </div>
        </div>
        <div className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-white/10 bg-gradient-to-br from-fuchsia-900 via-purple-900 to-indigo-900">
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative size-48 rounded-full shadow-2xl" aria-label="AI Avatar" role="img">
              <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${mood === 'radiant' ? 'bg-yellow-400/30' : mood === 'serene' ? 'bg-sky-400/30' : 'bg-indigo-400/30'}`} />
              <div className="relative z-10 size-full rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 grid place-items-center">
                {speaking ? <Loader2 className="animate-spin" /> : <Smile />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mx-auto max-w-2xl mt-10 px-6">
        <label htmlFor="avatar-input" className="sr-only">Type a prompt</label>
        <div className="flex gap-2">
          <input
            id="avatar-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the avatar anything…"
            className="flex-1 rounded-md bg-white/5 border border-white/10 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400"
          />
          <button type="submit" className="rounded-md px-4 py-3 bg-white/10 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-fuchsia-400">Speak</button>
        </div>
      </form>
    </section>
  );
}
